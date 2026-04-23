<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Notifications\TaskDeadlineReminderNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->sendPendingTaskReminders($user);

        return response()->json([
            'success' => true,
            'data' => $user->notifications()->latest()->limit(20)->get(),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'count' => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notifications marked as read.',
        ]);
    }

    protected function sendPendingTaskReminders($user): void
    {
        $tasks = Task::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereNull('reminder_sent_at')
            ->whereDate('due_date', '<=', now()->addDay()->toDateString())
            ->get();

        foreach ($tasks as $task) {
            $user->notify(new TaskDeadlineReminderNotification($task));
            $task->forceFill(['reminder_sent_at' => now()])->save();
        }
    }
}
