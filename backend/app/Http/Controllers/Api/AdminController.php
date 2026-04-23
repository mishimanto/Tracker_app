<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Task;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\FeedbackMessage;
use App\Models\Note;
use App\Models\SiteSetting;
use App\Services\ActivityLogService;
use App\Services\DashboardService;
use App\Services\ImageUploadService;
use App\Services\RecurringExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    protected $dashboardService;
    protected $imageUploadService;
    protected $activityLogService;
    protected $recurringExpenseService;

    public function __construct(
        DashboardService $dashboardService,
        ImageUploadService $imageUploadService,
        ActivityLogService $activityLogService,
        RecurringExpenseService $recurringExpenseService
    )
    {
        $this->dashboardService = $dashboardService;
        $this->imageUploadService = $imageUploadService;
        $this->activityLogService = $activityLogService;
        $this->recurringExpenseService = $recurringExpenseService;
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query
            ->where('role', 'user')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function overview(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $this->dashboardService->getSystemStats(),
                'analytics' => $this->dashboardService->getAdminAnalytics(),
                'recent_users' => User::where('role', 'user')->latest()->limit(6)->get(),
                'recent_tasks' => Task::with('user')->latest()->limit(6)->get(),
                'recent_expenses' => Expense::with(['user', 'category'])->latest('expense_date')->limit(6)->get(),
                'recent_notes' => Note::with('user')->latest('updated_at')->limit(6)->get(),
                'recent_activity_logs' => $this->dashboardService->getRecentActivityLogs(8),
            ],
        ]);
    }

    public function userDetails($id): JsonResponse
    {
        $user = User::withCount(['tasks', 'expenses', 'notes'])
            ->with([
                'tasks' => function ($query) {
                    $query->latest()->limit(10);
                },
                'expenses' => function ($query) {
                    $query->latest()->limit(10);
                },
                'notes' => function ($query) {
                    $query->latest('updated_at')->limit(10);
                },
            ])
            ->findOrFail($id);

        $completedTasks = Task::where('user_id', $id)
            ->where('status', 'completed')
            ->count();

        $totalExpenses = Expense::where('user_id', $id)->sum('amount');

        $userData = $user->toArray();
        $userData['task_count'] = $user->tasks_count;
        $userData['expense_count'] = $user->expenses_count;
        $userData['tasks_completed'] = $completedTasks;
        $userData['total_expenses'] = $totalExpenses;
        $userData['recent_tasks'] = $user->tasks;
        $userData['recent_expenses'] = $user->expenses;
        $userData['note_count'] = $user->notes_count;
        $userData['recent_notes'] = $user->notes;

        return response()->json([
            'success' => true,
            'data' => $userData
        ]);
    }

    public function updateUserStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,inactive,banned'
        ]);

        $user = User::findOrFail($id);
        $user->status = $request->status;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }

    public function allTasks(Request $request): JsonResponse
    {
        $query = Task::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $tasks
        ]);
    }

    public function updateTask(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,in_progress,completed',
            'priority' => 'sometimes|in:low,medium,high',
        ]);

        $task = Task::with('user')->findOrFail($id);
        $task->fill($validated);

        if (array_key_exists('status', $validated)) {
            $task->completed_at = $validated['status'] === 'completed' ? now() : null;
        }

        $task->save();

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data' => $task->fresh('user'),
        ]);
    }

    public function destroyTask(int $id): JsonResponse
    {
        $task = Task::findOrFail($id);
        $actor = auth()->user();
        $snapshot = [
            'title' => $task->title,
            'user_id' => $task->user_id,
            'status' => $task->status,
        ];
        $task->delete();
        $this->activityLogService->log(
            actorId: $actor?->id,
            action: 'task_deleted',
            description: sprintf('%s deleted task "%s".', $actor?->name ?? 'Admin', $snapshot['title']),
            entityType: 'task',
            entityId: $id,
            targetUserId: $snapshot['user_id'],
            metadata: [
                'status' => $snapshot['status'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully',
        ]);
    }

    public function allExpenses(Request $request): JsonResponse
    {
        $query = Expense::with(['user', 'category']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $expenses = $query->latest('expense_date')->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $expenses
        ]);
    }

    public function destroyExpense(int $id): JsonResponse
    {
        $expense = Expense::findOrFail($id);
        $actor = auth()->user();
        $snapshot = [
            'description' => $expense->description,
            'amount' => (float) $expense->amount,
            'user_id' => $expense->user_id,
            'category_id' => $expense->category_id,
            'expense_date' => optional($expense->expense_date)->toDateString(),
        ];

        if ($expense->receipt_image) {
            $this->imageUploadService->deleteOldFile($expense->receipt_image);
        }

        if ($expense->attachment_path) {
            Storage::disk('public')->delete($expense->attachment_path);
        }

        $expense->delete();
        $this->activityLogService->log(
            actorId: $actor?->id,
            action: 'expense_deleted',
            description: sprintf(
                '%s deleted expense "%s" (%.2f BDT).',
                $actor?->name ?? 'Admin',
                $snapshot['description'],
                $snapshot['amount']
            ),
            entityType: 'expense',
            entityId: $id,
            targetUserId: $snapshot['user_id'],
            metadata: [
                'amount' => $snapshot['amount'],
                'category_id' => $snapshot['category_id'],
                'expense_date' => $snapshot['expense_date'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Expense deleted successfully',
        ]);
    }

    public function expenseCategories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => ExpenseCategory::query()
                ->withCount('expenses')
                ->where('is_default', true)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function storeExpenseCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:expense_categories,name',
            'icon' => 'nullable|string|max:50',
            'color' => ['nullable', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
        ]);

        $category = ExpenseCategory::create([
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? null,
            'color' => $validated['color'] ?? '#94a3b8',
            'is_default' => true,
            'user_id' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Expense category created successfully',
            'data' => $category->loadCount('expenses'),
        ], 201);
    }

    public function updateExpenseCategory(Request $request, int $id): JsonResponse
    {
        $category = ExpenseCategory::query()
            ->where('is_default', true)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:expense_categories,name,' . $category->id,
            'icon' => 'nullable|string|max:50',
            'color' => ['nullable', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Expense category updated successfully',
            'data' => $category->fresh()->loadCount('expenses'),
        ]);
    }

    public function destroyExpenseCategory(int $id): JsonResponse
    {
        $category = ExpenseCategory::query()
            ->where('is_default', true)
            ->withCount('expenses')
            ->findOrFail($id);

        if ($category->expenses_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'This category is already used in expenses and cannot be deleted.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Expense category deleted successfully',
        ]);
    }

    public function allNotes(Request $request): JsonResponse
    {
        $query = Note::with('user')->latest('updated_at');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate($request->get('per_page', 20))
        ]);
    }

    public function feedbackMessages(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => FeedbackMessage::query()
                ->with('user:id,name,email')
                ->latest()
                ->get(),
        ]);
    }

    public function destroyNote(int $id): JsonResponse
    {
        $note = Note::findOrFail($id);
        $actor = auth()->user();
        $snapshot = [
            'title' => $note->title,
            'user_id' => $note->user_id,
        ];
        $note->delete();
        $this->activityLogService->log(
            actorId: $actor?->id,
            action: 'note_deleted',
            description: sprintf('%s deleted note "%s".', $actor?->name ?? 'Admin', $snapshot['title']),
            entityType: 'note',
            entityId: $id,
            targetUserId: $snapshot['user_id']
        );

        return response()->json([
            'success' => true,
            'message' => 'Note deleted successfully',
        ]);
    }

    public function activityLogs(Request $request): JsonResponse
    {
        $query = ActivityLog::query()
            ->with(['actor:id,name,email', 'targetUser:id,name,email'])
            ->latest();

        if ($request->filled('action')) {
            $query->where('action', $request->string('action'));
        }

        if ($request->filled('user_id')) {
            $query->where(function ($builder) use ($request) {
                $builder
                    ->where('actor_id', $request->integer('user_id'))
                    ->orWhere('target_user_id', $request->integer('user_id'));
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate($request->integer('per_page', 25)),
        ]);
    }

    public function calendar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'month' => 'nullable|string',
        ]);

        $user = User::query()
            ->where('role', 'user')
            ->findOrFail($validated['user_id']);

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

    public function systemStats(): JsonResponse
    {
        $stats = $this->dashboardService->getSystemStats();

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        $period = $request->get('period', 'monthly');
        $reports = $this->dashboardService->generateAdminReport($period);

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    public function publicSettings(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatSettings($this->getSettingsRecord()),
        ]);
    }

    public function settings(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatSettings($this->getSettingsRecord()),
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $brandingColumnsAvailable = $this->brandingColumnsAvailable();

        $request->merge([
            'support_email' => $request->filled('support_email') ? $request->input('support_email') : null,
            'report_footer' => $request->filled('report_footer') ? $request->input('report_footer') : null,
        ]);

        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'support_email' => 'nullable|email|max:255',
            'currency_code' => 'required|string|max:10',
            'allow_registration' => 'required|boolean',
            'maintenance_mode' => 'required|boolean',
            'report_footer' => 'nullable|string|max:2000',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,svg,webp|max:4096',
            'favicon' => 'nullable|image|mimes:ico,png,svg,webp|max:2048',
        ]);

        $settings = $this->getSettingsRecord();

        if (($request->hasFile('logo') || $request->hasFile('favicon')) && !$brandingColumnsAvailable) {
            return response()->json([
                'success' => false,
                'message' => 'Branding fields are not ready yet. Please run the latest migrations and try again.',
            ], 422);
        }

        if ($request->hasFile('logo') && $brandingColumnsAvailable) {
            $validated['logo_path'] = $this->imageUploadService->storeOptimizedImage(
                $request->file('logo'),
                'branding',
                $settings->logo_path,
                [
                    'max_width' => 1200,
                    'max_height' => 1200,
                    'quality' => 84,
                ]
            );
        }

        if ($request->hasFile('favicon') && $brandingColumnsAvailable) {
            $validated['favicon_path'] = $this->imageUploadService->storeOptimizedImage(
                $request->file('favicon'),
                'branding',
                $settings->favicon_path,
                [
                    'max_width' => 256,
                    'max_height' => 256,
                    'quality' => 86,
                ]
            );
        }

        $settings->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Site settings updated successfully',
            'data' => $this->formatSettings($settings->fresh()),
        ]);
    }

    protected function getSettingsRecord(): SiteSetting
    {
        return SiteSetting::query()->firstOrCreate(
            ['id' => 1],
            [
                'site_name' => 'Task & Expense',
                'currency_code' => 'BDT',
                'allow_registration' => true,
                'maintenance_mode' => false,
            ]
        );
    }

    protected function formatSettings(SiteSetting $settings): array
    {
        $data = $settings->toArray();
        $brandingColumnsAvailable = $this->brandingColumnsAvailable();
        $data['logo_path'] = $brandingColumnsAvailable ? $settings->logo_path : null;
        $data['favicon_path'] = $brandingColumnsAvailable ? $settings->favicon_path : null;
        $data['logo_url'] = $brandingColumnsAvailable && $settings->logo_path ? \Illuminate\Support\Facades\Storage::url($settings->logo_path) : null;
        $data['favicon_url'] = $brandingColumnsAvailable && $settings->favicon_path ? \Illuminate\Support\Facades\Storage::url($settings->favicon_path) : null;

        return $data;
    }

    protected function brandingColumnsAvailable(): bool
    {
        return Schema::hasColumn('site_settings', 'logo_path')
            && Schema::hasColumn('site_settings', 'favicon_path');
    }
}
