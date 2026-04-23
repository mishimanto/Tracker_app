<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Task;
use App\Models\Expense;
use App\Models\Note;
use App\Services\RecurringExpenseService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    protected $taskService;
    protected $expenseService;

    public function __construct(
        TaskService $taskService,
        ExpenseService $expenseService,
        protected RecurringExpenseService $recurringExpenseService
    )
    {
        $this->taskService = $taskService;
        $this->expenseService = $expenseService;
    }

    public function getUserDashboardStats($userId)
    {
        $cacheKey = "user:{$userId}:dashboard-stats";

        return Cache::remember($cacheKey, 300, function () use ($userId) {
            $this->recurringExpenseService->generateDueExpensesForUser($userId);

            return [
                'tasks' => $this->taskService->getTaskStats($userId),
                'expenses' => $this->expenseService->getExpenseStats($userId, 'monthly'),
                'recent_tasks' => Task::where('user_id', $userId)
                    ->latest()
                    ->limit(5)
                    ->get(),
                'recent_expenses' => Expense::where('user_id', $userId)
                    ->with('category')
                    ->latest()
                    ->limit(5)
                    ->get(),
            ];
        });
    }

    public function getRecentActivities($userId, $limit = 10)
    {
        $tasks = Task::where('user_id', $userId)
            ->select('id', 'title', 'status', 'created_at', DB::raw("'task' as type"))
            ->latest()
            ->limit($limit)
            ->get();

        $expenses = Expense::where('user_id', $userId)
            ->select('id', 'description as title', 'amount', 'created_at', DB::raw("'expense' as type"))
            ->latest()
            ->limit($limit)
            ->get();

        $activities = $tasks->concat($expenses)
            ->sortByDesc('created_at')
            ->take($limit)
            ->values();

        return $activities;
    }

    public function getSystemStats()
    {
        return Cache::remember('system:stats', 600, function () {
            return [
                'totalUsers' => User::count(),
                'activeUsers' => User::where('status', 'active')->count(),
                'totalTasks' => Task::count(),
                'completedTasks' => Task::completed()->count(),
                'totalExpenses' => (float) Expense::sum('amount'),
                'totalNotes' => Note::count(),
                'users_by_role' => User::select('role', DB::raw('count(*) as count'))
                    ->groupBy('role')
                    ->get(),
                'tasks_by_status' => Task::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->get(),
            ];
        });
    }

    public function getAdminAnalytics(): array
    {
        $monthRange = [now()->startOfMonth(), now()->endOfMonth()];
        $totalTasks = Task::count();
        $pendingTasks = Task::whereIn('status', ['pending', 'in_progress'])->count();

        $mostActiveUsers = User::query()
            ->where('role', 'user')
            ->withCount(['tasks', 'expenses', 'notes'])
            ->get()
            ->map(function (User $user) {
                $score = (int) $user->tasks_count + (int) $user->expenses_count + (int) $user->notes_count;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'tasks_count' => (int) $user->tasks_count,
                    'expenses_count' => (int) $user->expenses_count,
                    'notes_count' => (int) $user->notes_count,
                    'activity_score' => $score,
                ];
            })
            ->sortByDesc('activity_score')
            ->take(5)
            ->values();

        return [
            'total_monthly_expenses' => (float) Expense::whereBetween('expense_date', $monthRange)->sum('amount'),
            'top_spending_categories' => Expense::query()
                ->selectRaw('category_id, SUM(amount) as total_amount, COUNT(*) as expense_count')
                ->with('category')
                ->whereBetween('expense_date', $monthRange)
                ->groupBy('category_id')
                ->orderByDesc('total_amount')
                ->limit(5)
                ->get(),
            'most_active_users' => $mostActiveUsers,
            'pending_tasks' => [
                'count' => $pendingTasks,
                'total' => $totalTasks,
                'percentage' => $totalTasks > 0 ? round(($pendingTasks / $totalTasks) * 100, 2) : 0,
            ],
        ];
    }

    public function getRecentActivityLogs(int $limit = 10)
    {
        return ActivityLog::query()
            ->with(['actor:id,name,email', 'targetUser:id,name,email'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function generateAdminReport($period)
    {
        $cacheKey = "admin:report:{$period}";

        return Cache::remember($cacheKey, 3600, function () use ($period) {
            $dateRange = $this->getDateRange($period);
            $totalTasks = Task::whereBetween('created_at', $dateRange)->count();
            $completedTasks = Task::whereBetween('created_at', $dateRange)->completed()->count();
            $totalExpenses = (float) Expense::whereBetween('expense_date', $dateRange)->sum('amount');
            $totalUsers = User::count();

            return [
                'period' => $period,
                'date_range' => $dateRange,
                'totalUsers' => $totalUsers,
                'activeUsers' => User::where('status', 'active')->count(),
                'inactiveUsers' => User::whereIn('status', ['inactive', 'banned'])->count(),
                'totalTasks' => $totalTasks,
                'completedTasks' => $completedTasks,
                'pendingTasks' => max(0, $totalTasks - $completedTasks),
                'totalExpenses' => $totalExpenses,
                'monthlyExpenses' => $totalExpenses,
                'avgExpensePerUser' => $totalUsers > 0 ? round($totalExpenses / $totalUsers, 2) : 0,
                'totalNotes' => Note::count(),
                'user_growth' => $this->getUserGrowth($dateRange),
                'task_completion' => $this->getTaskCompletionStats($dateRange),
                'expense_summary' => $this->getExpenseSummary($dateRange),
                'top_users' => $this->getTopUsers(),
            ];
        });
    }

    protected function getDateRange($period)
    {
        switch ($period) {
            case 'daily':
                return [now()->startOfDay(), now()->endOfDay()];
            case 'weekly':
                return [now()->startOfWeek(), now()->endOfWeek()];
            case 'monthly':
                return [now()->startOfMonth(), now()->endOfMonth()];
            case 'yearly':
                return [now()->startOfYear(), now()->endOfYear()];
            default:
                return [now()->startOfMonth(), now()->endOfMonth()];
        }
    }

    protected function getUserGrowth($dateRange)
    {
        return User::whereBetween('created_at', $dateRange)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    protected function getTaskCompletionStats($dateRange)
    {
        return [
            'total' => Task::whereBetween('created_at', $dateRange)->count(),
            'completed' => Task::whereBetween('created_at', $dateRange)->completed()->count(),
            'completion_rate' => $this->calculateCompletionRate($dateRange),
        ];
    }

    protected function calculateCompletionRate($dateRange)
    {
        $total = Task::whereBetween('created_at', $dateRange)->count();
        $completed = Task::whereBetween('created_at', $dateRange)->completed()->count();

        return $total > 0 ? round(($completed / $total) * 100, 2) : 0;
    }

    protected function getExpenseSummary($dateRange)
    {
        return Expense::whereBetween('expense_date', $dateRange)
            ->select(
                DB::raw('SUM(amount) as total'),
                DB::raw('AVG(amount) as average'),
                DB::raw('COUNT(*) as count')
            )
            ->first();
    }

    protected function getTopUsers()
    {
        return User::withCount(['tasks', 'expenses'])
            ->withSum('expenses', 'amount')
            ->orderByDesc('tasks_count')
            ->limit(10)
            ->get();
    }
}
