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
        $user = $request->user();
        $query = trim((string) $request->input('query', ''));

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
            ->when($request->filled('category_id'), fn ($builder) => $builder->where('category_id', $request->integer('category_id')))
            ->when($request->filled('amount_min'), fn ($builder) => $builder->where('amount', '>=', $request->input('amount_min')))
            ->when($request->filled('amount_max'), fn ($builder) => $builder->where('amount', '<=', $request->input('amount_max')))
            ->when($request->filled('date_from'), fn ($builder) => $builder->whereDate('expense_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($builder) => $builder->whereDate('expense_date', '<=', $request->date('date_to')))
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
            ->when($request->filled('priority'), fn ($builder) => $builder->where('priority', $request->string('priority')))
            ->when($request->filled('date_from'), fn ($builder) => $builder->whereDate('due_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($builder) => $builder->whereDate('due_date', '<=', $request->date('date_to')))
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
