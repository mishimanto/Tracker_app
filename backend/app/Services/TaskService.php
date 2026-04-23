<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskDeadlineReminderNotification;
use App\Repositories\TaskRepository;
use Illuminate\Support\Facades\Redis;

class TaskService
{
    protected $taskRepository;

    public function __construct(TaskRepository $taskRepository)
    {
        $this->taskRepository = $taskRepository;
    }

    public function getUserTasks($userId, $filters = [])
    {
        return $this->taskRepository->getUserTasks($userId, $filters);
    }

    public function createTask($userId, array $data)
    {
        $data['user_id'] = $userId;
        $task = $this->taskRepository->create($data);
        $this->notifyIfDeadlineNear($task);

        $this->clearUserTaskCache($userId);
        Redis::publish('task-created', json_encode($task));

        return $task;
    }

    public function updateTask($taskId, $userId, array $data)
    {
        $task = $this->taskRepository->update($taskId, $userId, $data);

        if ($task) {
            $this->notifyIfDeadlineNear($task);
            $this->clearUserTaskCache($userId);
            Redis::publish('task-updated', json_encode($task));
        }

        return $task;
    }

    public function deleteTask($taskId, $userId)
    {
        $result = $this->taskRepository->delete($taskId, $userId);

        if ($result) {
            $this->clearUserTaskCache($userId);
            Redis::publish('task-deleted', json_encode(['id' => $taskId]));
        }

        return $result;
    }

    public function toggleTaskStatus($taskId, $userId)
    {
        $task = Task::where('user_id', $userId)->findOrFail($taskId);

        $task->status = $task->status === 'completed' ? 'pending' : 'completed';
        $task->completed_at = $task->status === 'completed' ? now() : null;
        $task->save();

        $this->clearUserTaskCache($userId);
        Redis::publish('task-status-changed', json_encode($task));

        return $task;
    }

    public function getTaskStats($userId)
    {
        return [
            'total' => Task::where('user_id', $userId)->count(),
            'completed' => Task::where('user_id', $userId)->completed()->count(),
            'pending' => Task::where('user_id', $userId)->pending()->count(),
            'overdue' => Task::where('user_id', $userId)->overdue()->count(),
            'today' => Task::where('user_id', $userId)->today()->count(),
        ];
    }

    protected function clearUserTaskCache($userId)
    {
        return;
    }

    protected function notifyIfDeadlineNear(Task $task): void
    {
        if ($task->status === 'completed' || $task->reminder_sent_at || !$task->due_date) {
            return;
        }

        if ($task->due_date->gt(now()->addDay())) {
            return;
        }

        $user = User::find($task->user_id);
        if (!$user) {
            return;
        }

        $user->notify(new TaskDeadlineReminderNotification($task));
        $task->forceFill(['reminder_sent_at' => now()])->save();
    }
}
