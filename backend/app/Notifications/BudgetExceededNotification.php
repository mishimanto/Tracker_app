<?php

namespace App\Notifications;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BudgetExceededNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected Budget $budget,
        protected float $spentAmount
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Budget exceeded alert')
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . ',')
            ->line(sprintf(
                'Your %s budget has been exceeded.',
                $this->budget->category?->name ?? 'category'
            ))
            ->line(sprintf(
                'Spent: %.2f BDT | Budget: %.2f BDT',
                $this->spentAmount,
                (float) $this->budget->limit_amount
            ));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'budget_exceeded',
            'title' => 'Budget exceeded',
            'message' => sprintf(
                '%s spending reached %.2f BDT against a %.2f BDT budget.',
                $this->budget->category?->name ?? 'Category',
                $this->spentAmount,
                (float) $this->budget->limit_amount
            ),
            'category_id' => $this->budget->category_id,
            'budget_id' => $this->budget->id,
            'spent_amount' => $this->spentAmount,
            'limit_amount' => (float) $this->budget->limit_amount,
        ];
    }
}
