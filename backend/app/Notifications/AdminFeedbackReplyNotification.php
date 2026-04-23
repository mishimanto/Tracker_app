<?php

namespace App\Notifications;

use App\Models\FeedbackMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminFeedbackReplyNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected FeedbackMessage $feedback,
        protected string $replyMessage
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Admin replied to your feedback')
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . ',')
            ->line('The admin team replied to your feedback:')
            ->line($this->replyMessage);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'feedback_reply',
            'title' => 'Admin replied',
            'message' => $this->replyMessage,
            'feedback_id' => $this->feedback->id,
            'subject' => $this->feedback->subject,
        ];
    }
}
