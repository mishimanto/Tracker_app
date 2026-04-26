<?php

namespace App\Services;

use App\Models\Expense;
use App\Repositories\ExpenseRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redis;

class ExpenseService
{
    protected $expenseRepository;
    protected $imageUploadService;
    protected $recurringExpenseService;
    protected $budgetService;
    protected $activityLogService;

    public function __construct(
        ExpenseRepository $expenseRepository,
        ImageUploadService $imageUploadService,
        RecurringExpenseService $recurringExpenseService,
        BudgetService $budgetService,
        ActivityLogService $activityLogService
    )
    {
        $this->expenseRepository = $expenseRepository;
        $this->imageUploadService = $imageUploadService;
        $this->recurringExpenseService = $recurringExpenseService;
        $this->budgetService = $budgetService;
        $this->activityLogService = $activityLogService;
    }

    public function getUserExpenses($userId, $filters = [])
    {
        $this->recurringExpenseService->generateDueExpensesForUser($userId);

        $cacheKey = sprintf(
            'user:%d:expenses:v%d:%s',
            $userId,
            $this->getExpenseCacheVersion($userId),
            md5(json_encode($filters))
        );

        return Cache::remember($cacheKey, now()->addMinutes(5), fn () => $this->expenseRepository->getUserExpenses($userId, $filters));
    }

    public function createExpense($userId, array $data)
    {
        $data['user_id'] = $userId;
        $expense = $this->expenseRepository->create($data);
        $budgetStatus = $this->budgetService->evaluateExpenseImpact($userId, $expense->category_id);
        $expense->load('category');

        $this->activityLogService->log(
            actorId: $userId,
            action: 'expense_created',
            description: sprintf('Added expense "%s" (%.2f BDT).', $expense->description, (float) $expense->amount),
            entityType: 'expense',
            entityId: $expense->id,
            targetUserId: $userId,
            metadata: [
                'amount' => (float) $expense->amount,
                'category' => $expense->category?->name,
                'expense_date' => optional($expense->expense_date)->toDateString(),
            ]
        );

        $this->clearUserExpenseCache($userId);
        Redis::publish('expense-created', json_encode($expense));

        return $expense->setAttribute('budget_status', $budgetStatus);
    }

    public function updateExpense($expenseId, $userId, array $data)
    {
        $expense = $this->expenseRepository->update($expenseId, $userId, $data);

        if ($expense) {
            $this->clearUserExpenseCache($userId);
            Redis::publish('expense-updated', json_encode($expense));
        }

        return $expense;
    }

    public function findUserExpense($expenseId, $userId)
    {
        return Expense::where('user_id', $userId)->find($expenseId);
    }

    public function deleteExpense($expenseId, $userId)
    {
        $expense = Expense::where('user_id', $userId)->find($expenseId);

        if ($expense?->receipt_image) {
            $this->imageUploadService->deleteOldFile($expense->receipt_image);
        }

        if ($expense?->attachment_path) {
            Storage::disk('public')->delete($expense->attachment_path);
        }

        $result = $this->expenseRepository->delete($expenseId, $userId);

        if ($result) {
            $this->activityLogService->log(
                actorId: $userId,
                action: 'expense_deleted',
                description: sprintf('Deleted expense "%s" (%.2f BDT).', $expense?->description ?? 'Expense', (float) ($expense?->amount ?? 0)),
                entityType: 'expense',
                entityId: $expenseId,
                targetUserId: $userId,
                metadata: [
                    'amount' => (float) ($expense?->amount ?? 0),
                    'category_id' => $expense?->category_id,
                    'expense_date' => optional($expense?->expense_date)->toDateString(),
                ]
            );
            $this->clearUserExpenseCache($userId);
            Redis::publish('expense-deleted', json_encode(['id' => $expenseId]));
        }

        return $result;
    }

    public function getExpenseStats($userId, $period = 'monthly')
    {
        $this->recurringExpenseService->generateDueExpensesForUser($userId);
        $cacheKey = sprintf('user:%d:expense-stats:v%d:%s', $userId, $this->getExpenseCacheVersion($userId), $period);

        $cached = Cache::get($cacheKey);

        if (is_array($cached)) {
            return $cached;
        }

        if ($cached !== null) {
            Cache::forget($cacheKey);
        }

        $stats = (function () use ($userId, $period) {
            $baseQuery = Expense::where('user_id', $userId);

            switch ($period) {
                case 'daily':
                    $baseQuery->whereDate('expense_date', today());
                    break;
                case 'weekly':
                    $baseQuery->whereBetween('expense_date', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'monthly':
                    $baseQuery->whereMonth('expense_date', now()->month)
                        ->whereYear('expense_date', now()->year);
                    break;
                case 'yearly':
                    $baseQuery->whereYear('expense_date', now()->year);
                    break;
            }

            $total = (clone $baseQuery)->sum('amount');

            $stats = [
                'total' => $total,
                'by_category' => (clone $baseQuery)
                    ->selectRaw('category_id, SUM(amount) as total')
                    ->with('category')
                    ->groupBy('category_id')
                    ->get(),
                'by_payment_method' => (clone $baseQuery)
                    ->selectRaw('payment_method, SUM(amount) as total')
                    ->groupBy('payment_method')
                    ->get(),
                'daily_average' => $period === 'monthly' ? $total / now()->daysInMonth : 0,
                'budgets' => $this->budgetService->getUserBudgets($userId),
            ];

            if ($period === 'monthly') {
                $stats['daily_breakdown'] = $this->getDailyBreakdown($userId);
            }

            if ($period === 'yearly') {
                $stats['monthly_breakdown'] = $this->getMonthlyBreakdown($userId);
            }

            return $stats;
        })();

        Cache::put($cacheKey, $stats, now()->addMinutes(5));

        return $stats;
    }

    protected function getDailyBreakdown($userId)
    {
        return Expense::where('user_id', $userId)
            ->whereMonth('expense_date', now()->month)
            ->whereYear('expense_date', now()->year)
            ->selectRaw('DATE(expense_date) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    protected function getMonthlyBreakdown($userId)
    {
        return Expense::where('user_id', $userId)
            ->whereYear('expense_date', now()->year)
            ->selectRaw('MONTH(expense_date) as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    protected function clearUserExpenseCache($userId)
    {
        Cache::increment($this->expenseVersionKey($userId));
        Cache::increment("user:{$userId}:budget:version");
        Cache::increment("user:{$userId}:dashboard:version");
    }

    public function storeExpenseAttachment(UploadedFile $file): array
    {
        $path = $file->store('expense-attachments', 'public');

        return [
            'attachment_path' => $path,
            'attachment_name' => $file->getClientOriginalName(),
            'attachment_mime_type' => $file->getClientMimeType(),
        ];
    }

    protected function getExpenseCacheVersion(int $userId): int
    {
        return (int) Cache::rememberForever($this->expenseVersionKey($userId), fn () => 1);
    }

    protected function expenseVersionKey(int $userId): string
    {
        return "user:{$userId}:expenses:version";
    }
}
