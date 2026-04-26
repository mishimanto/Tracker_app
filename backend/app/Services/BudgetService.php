<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\User;
use App\Notifications\BudgetExceededNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class BudgetService
{
    public function getUserBudgets(int $userId): Collection
    {
        $cacheKey = sprintf('user:%d:budgets:v%d', $userId, $this->getBudgetCacheVersion($userId));

        $cached = Cache::get($cacheKey);

        if ($cached instanceof Collection) {
            return $cached;
        }

        if ($cached !== null) {
            Cache::forget($cacheKey);
        }

        $budgets = Budget::query()
            ->with('category')
            ->where('user_id', $userId)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Budget $budget) => $this->appendProgress($budget));

        Cache::put($cacheKey, $budgets, now()->addMinutes(5));

        return $budgets;
    }

    public function upsertUserBudgets(int $userId, array $budgets): Collection
    {
        foreach ($budgets as $item) {
            Budget::updateOrCreate(
                [
                    'user_id' => $userId,
                    'category_id' => $item['category_id'],
                    'period' => $item['period'] ?? 'monthly',
                ],
                [
                    'limit_amount' => $item['limit_amount'],
                ]
            );
        }

        $this->clearBudgetCache($userId);

        return $this->getUserBudgets($userId);
    }

    public function deleteBudget(int $userId, int $budgetId): bool
    {
        $deleted = (bool) Budget::query()
            ->where('user_id', $userId)
            ->whereKey($budgetId)
            ->delete();

        if ($deleted) {
            $this->clearBudgetCache($userId);
        }

        return $deleted;
    }

    public function evaluateExpenseImpact(int $userId, ?int $categoryId): ?array
    {
        if (!$categoryId) {
            return null;
        }

        $budget = Budget::query()
            ->with('category')
            ->where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('period', 'monthly')
            ->first();

        if (!$budget) {
            return null;
        }

        $budget = $this->appendProgress($budget);
        $periodKey = now()->format('Y-m');

        if (($budget->is_exceeded ?? false) && $budget->last_alerted_period !== $periodKey) {
            $user = User::find($userId);
            if ($user) {
                $user->notify(new BudgetExceededNotification($budget, (float) $budget->spent_amount));
            }

            $budget->update([
                'last_alerted_period' => $periodKey,
                'last_alert_sent_at' => now(),
            ]);
        }

        return [
            'budget' => $budget->fresh('category'),
            'warning' => $budget->is_exceeded
                ? sprintf('%s budget exceeded.', $budget->category?->name ?? 'Category')
                : null,
        ];
    }

    protected function appendProgress(Budget $budget): Budget
    {
        $spent = (float) Expense::query()
            ->where('user_id', $budget->user_id)
            ->where('category_id', $budget->category_id)
            ->whereBetween('expense_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
            ->sum('amount');

        $limit = (float) $budget->limit_amount;
        $budget->setAttribute('spent_amount', $spent);
        $budget->setAttribute('remaining_amount', max(0, $limit - $spent));
        $budget->setAttribute('usage_percentage', $limit > 0 ? round(($spent / $limit) * 100, 2) : 0);
        $budget->setAttribute('is_exceeded', $limit > 0 && $spent > $limit);

        return $budget;
    }

    protected function clearBudgetCache(int $userId): void
    {
        Cache::increment($this->budgetVersionKey($userId));
        Cache::increment("user:{$userId}:expenses:version");
        Cache::increment("user:{$userId}:dashboard:version");
    }

    protected function getBudgetCacheVersion(int $userId): int
    {
        return (int) Cache::rememberForever($this->budgetVersionKey($userId), fn () => 1);
    }

    protected function budgetVersionKey(int $userId): string
    {
        return "user:{$userId}:budget:version";
    }
}
