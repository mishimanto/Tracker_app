<?php

namespace App\Repositories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

class TaskRepository
{
    public function getUserTasks($userId, array $filters = [])
    {
        $query = Task::where('user_id', $userId);

        if (isset($filters['id'])) {
            $query->where('id', $filters['id']);
        }

        if (isset($filters['status'])) {
            if ($filters['status'] === 'overdue') {
                $query->overdue();
            } else {
                $query->where('status', $filters['status']);

                if (in_array($filters['status'], ['pending', 'in_progress'], true)) {
                    $query->where(function ($statusQuery) {
                        $statusQuery
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
                    });
                }
            }
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['date'])) {
            $query->whereDate('due_date', $filters['date']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->orderBy('due_date')->orderBy('due_time')->get();
    }

    public function create(array $data)
    {
        return Task::create($data);
    }

    public function update($taskId, $userId, array $data)
    {
        $task = Task::where('user_id', $userId)->find($taskId);

        if ($task) {
            $task->update($data);
        }

        return $task;
    }

    public function delete($taskId, $userId)
    {
        $task = Task::where('user_id', $userId)->find($taskId);

        if ($task) {
            return $task->delete();
        }

        return false;
    }
}
