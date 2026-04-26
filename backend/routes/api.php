<?php

use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\FeedbackMessageController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Breeze Authentication Routes (API)
Route::post('/register', [RegisteredUserController::class, 'store'])
    ->middleware(['guest', 'throttle:auth'])
    ->name('register');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware(['guest', 'throttle:auth'])
    ->name('login');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware(['guest', 'throttle:auth'])
    ->name('password.email');

Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('guest')
    ->name('password.store');

Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth:sanctum', 'signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:6,1'])
    ->name('verification.send');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum')
    ->name('logout');

// Get current user
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/site-settings', [AdminController::class, 'publicSettings'])->middleware('throttle:public-seo');
Route::get('/public-stats', [AdminController::class, 'publicStats'])->middleware('throttle:public-seo');

// Protected routes (Breeze automatically handles auth)
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::post('/profile/update', [ProfileController::class, 'updateProfile']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // User Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-activities', [DashboardController::class, 'recentActivities']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::patch('/tasks/{id}/toggle-status', [TaskController::class, 'toggleStatus']);
    Route::get('/tasks-stats', [TaskController::class, 'stats']);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class);
    Route::get('/expenses-stats', [ExpenseController::class, 'stats']);
    Route::get('/expense-categories', [ExpenseController::class, 'categories']);

    // Notes
    Route::apiResource('notes', NoteController::class);

    // Feedback
    Route::post('/feedback-messages', [FeedbackMessageController::class, 'store'])->middleware('throttle:feedback');

    // Budgets and recurring tools
    Route::get('/budgets', [BudgetController::class, 'index']);
    Route::post('/budgets', [BudgetController::class, 'store']);
    Route::delete('/budgets/{id}', [BudgetController::class, 'destroy']);
    Route::get('/calendar', [CalendarController::class, 'index']);
    Route::get('/search', [SearchController::class, 'index'])->middleware('throttle:search');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

    // Reports
    Route::get('/reports/export', [ReportController::class, 'userReport'])->middleware('throttle:reports');

    // Admin routes
    Route::middleware(['admin', 'throttle:admin-api'])->prefix('admin')->group(function () {
        Route::get('/overview', [AdminController::class, 'overview']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/users/{id}', [AdminController::class, 'userDetails']);
        Route::put('/users/{id}/status', [AdminController::class, 'updateUserStatus']);
        Route::get('/all-tasks', [AdminController::class, 'allTasks']);
        Route::patch('/tasks/{id}', [AdminController::class, 'updateTask']);
        Route::delete('/tasks/{id}', [AdminController::class, 'destroyTask']);
        Route::get('/all-expenses', [AdminController::class, 'allExpenses']);
        Route::delete('/expenses/{id}', [AdminController::class, 'destroyExpense']);
        Route::get('/expense-categories', [AdminController::class, 'expenseCategories']);
        Route::post('/expense-categories', [AdminController::class, 'storeExpenseCategory']);
        Route::put('/expense-categories/{id}', [AdminController::class, 'updateExpenseCategory']);
        Route::delete('/expense-categories/{id}', [AdminController::class, 'destroyExpenseCategory']);
        Route::get('/all-notes', [AdminController::class, 'allNotes']);
        Route::delete('/notes/{id}', [AdminController::class, 'destroyNote']);
        Route::get('/activity-logs', [AdminController::class, 'activityLogs']);
        Route::get('/calendar', [AdminController::class, 'calendar']);
        Route::get('/feedback-messages', [FeedbackMessageController::class, 'index']);
        Route::get('/feedback-messages/{id}', [FeedbackMessageController::class, 'show']);
        Route::post('/feedback-messages/{id}/reply', [FeedbackMessageController::class, 'reply'])->middleware('throttle:feedback');
        Route::get('/system-stats', [AdminController::class, 'systemStats']);
        Route::get('/reports', [AdminController::class, 'reports']);
        Route::get('/reports/export', [ReportController::class, 'adminReport'])->middleware('throttle:reports');
        Route::get('/users/{id}/report/export', [ReportController::class, 'adminUserReport'])->middleware('throttle:reports');
        Route::get('/settings', [AdminController::class, 'settings']);
        Route::put('/settings', [AdminController::class, 'updateSettings']);
        Route::post('/settings', [AdminController::class, 'updateSettings']);
    });
});
