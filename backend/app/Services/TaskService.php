<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskDeadlineReminderNotification;
use App\Repositories\TaskRepository;
use Illuminate\Support\Facades\Cache;
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
        $cacheKey = sprintf(
            'user:%d:tasks:v%d:%s',
            $userId,
            $this->getTaskCacheVersion($userId),
            md5(json_encode($filters))
        );

        $cached = Cache::get($cacheKey);

        if ($cached instanceof \Illuminate\Database\Eloquent\Collection) {
            return $cached;
        }

        if ($cached !== null) {
            Cache::forget($cacheKey);
        }

        $tasks = $this->taskRepository->getUserTasks($userId, $filters);
        Cache::put($cacheKey, $tasks, now()->addMinutes(5));

        return $tasks;
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
        $cacheKey = sprintf('user:%d:task-stats:v%d', $userId, $this->getTaskCacheVersion($userId));

        $cached = Cache::get($cacheKey);

        if (is_array($cached)) {
            return $cached;
        }

        if ($cached !== null) {
            Cache::forget($cacheKey);
        }

        $stats = [
            'total' => Task::where('user_id', $userId)->count(),
            'completed' => Task::where('user_id', $userId)->completed()->count(),
            'pending' => Task::where('user_id', $userId)
                ->whereIn('status', ['pending', 'in_progress'])
                ->where(function ($query) {
                    $query
                        ->whereDate('due_date', '>', today())
                        ->orWhereNull('due_date')
                        ->orWhere(function ($todayQuery) {
                            $todayQuery
                                ->whereDate('due_date', today())
                                ->where(function ($timeQuery) {
                                    $timeQuery
                                        ->whereNull('due_time')
                                        ->orWhereTime('due_time', '>=', now()->format('H:i:s'));
                                });
                        });
                })
                ->count(),
            'overdue' => Task::where('user_id', $userId)->overdue()->count(),
            'today' => Task::where('user_id', $userId)
                ->today()
                ->whereIn('status', ['pending', 'in_progress'])
                ->where(function ($query) {
                    $query
                        ->whereNull('due_time')
                        ->orWhereTime('due_time', '>=', now()->format('H:i:s'));
                })
                ->count(),
        ];

        Cache::put($cacheKey, $stats, now()->addMinutes(5));

        return $stats;
    }

    protected function clearUserTaskCache($userId)
    {
        Cache::increment($this->taskVersionKey($userId));
        Cache::increment("user:{$userId}:dashboard:version");
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

    protected function getTaskCacheVersion(int $userId): int
    {
        return (int) Cache::rememberForever($this->taskVersionKey($userId), fn () => 1);
    }

    protected function taskVersionKey(int $userId): string
    {
        return "user:{$userId}:tasks:version";
    }
}
