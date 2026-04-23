<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Task;
use App\Services\RecurringExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function __construct(protected RecurringExpenseService $recurringExpenseService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $month = $request->string('month', now()->format('Y-m'))->toString();
        [$year, $monthNumber] = array_pad(explode('-', $month), 2, now()->format('m'));
        $start = now()->setDate((int) $year, (int) $monthNumber, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $this->recurringExpenseService->generateDueExpensesForUser($user->id);

        $expenses = Expense::query()
            ->with('category')
            ->where('user_id', $user->id)
            ->whereBetween('expense_date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('expense_date')
            ->get();

        $tasks = Task::query()
            ->where('user_id', $user->id)
            ->whereBetween('due_date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('due_date')
            ->get();

        $calendar = collect($start->daysUntil($end->copy()->addDay()))->map(function ($date) use ($expenses, $tasks) {
            $dateString = $date->format('Y-m-d');
            $dayExpenses = $expenses
                ->filter(fn ($expense) => optional($expense->expense_date)->format('Y-m-d') === $dateString)
                ->values();
            $dayTasks = $tasks
                ->filter(fn ($task) => optional($task->due_date)->format('Y-m-d') === $dateString)
                ->values();

            return [
                'date' => $dateString,
                'expense_total' => (float) $dayExpenses->sum('amount'),
                'expense_count' => $dayExpenses->count(),
                'task_count' => $dayTasks->count(),
                'expenses' => $dayExpenses,
                'tasks' => $dayTasks,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $calendar,
        ]);
    }
}
