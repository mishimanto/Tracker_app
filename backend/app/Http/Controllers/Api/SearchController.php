<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Task;
use App\Services\RecurringExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(protected RecurringExpenseService $recurringExpenseService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:expense_categories,id'],
            'amount_min' => ['nullable', 'numeric', 'min:0'],
            'amount_max' => ['nullable', 'numeric', 'gte:amount_min'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'priority' => ['nullable', 'in:low,medium,high'],
        ]);

        $user = $request->user();
        $query = trim((string) ($validated['query'] ?? ''));

        $this->recurringExpenseService->generateDueExpensesForUser($user->id);

        $expenses = Expense::query()
            ->with('category')
            ->where('user_id', $user->id)
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($expenseQuery) use ($query) {
                    $expenseQuery
                        ->where('description', 'like', "%{$query}%")
                        ->orWhere('notes', 'like', "%{$query}%");
                });
            })
            ->when(array_key_exists('category_id', $validated), fn ($builder) => $builder->where('category_id', $validated['category_id']))
            ->when(array_key_exists('amount_min', $validated), fn ($builder) => $builder->where('amount', '>=', $validated['amount_min']))
            ->when(array_key_exists('amount_max', $validated), fn ($builder) => $builder->where('amount', '<=', $validated['amount_max']))
            ->when(array_key_exists('date_from', $validated), fn ($builder) => $builder->whereDate('expense_date', '>=', $validated['date_from']))
            ->when(array_key_exists('date_to', $validated), fn ($builder) => $builder->whereDate('expense_date', '<=', $validated['date_to']))
            ->latest('expense_date')
            ->limit(30)
            ->get();

        $tasks = Task::query()
            ->where('user_id', $user->id)
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where(function ($taskQuery) use ($query) {
                    $taskQuery
                        ->where('title', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                });
            })
            ->when(array_key_exists('priority', $validated), fn ($builder) => $builder->where('priority', $validated['priority']))
            ->when(array_key_exists('date_from', $validated), fn ($builder) => $builder->whereDate('due_date', '>=', $validated['date_from']))
            ->when(array_key_exists('date_to', $validated), fn ($builder) => $builder->whereDate('due_date', '<=', $validated['date_to']))
            ->latest('due_date')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'expenses' => $expenses,
                'tasks' => $tasks,
            ],
        ]);
    }
}
