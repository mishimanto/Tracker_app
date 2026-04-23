<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskDeadlineReminderNotification extends Notification
{
    use Queueable;

    public function __construct(protected Task $task)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Task deadline reminder')
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . ',')
            ->line('A task deadline is coming up soon.')
            ->line('Task: ' . $this->task->title)
            ->line('Due: ' . $this->task->due_date?->format('Y-m-d'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'task_deadline',
            'title' => 'Task deadline reminder',
            'message' => sprintf(
                '%s is due on %s%s',
                $this->task->title,
                $this->task->due_date?->format('Y-m-d') ?? 'soon',
                $this->task->due_time ? ' at ' . substr((string) $this->task->due_time, 0, 5) : ''
            ),
            'task_id' => $this->task->id,
            'due_date' => optional($this->task->due_date)->format('Y-m-d'),
            'due_time' => $this->task->due_time,
        ];
    }
}
