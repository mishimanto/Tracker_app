<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskDeadlineReminderNotification;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:send-reminders', function () {
    $tasks = Task::query()
        ->whereIn('status', ['pending', 'in_progress'])
        ->whereNull('reminder_sent_at')
        ->whereDate('due_date', '<=', now()->addDay()->toDateString())
        ->get();

    foreach ($tasks as $task) {
        $user = User::find($task->user_id);
        if (!$user) {
            continue;
        }

        $user->notify(new TaskDeadlineReminderNotification($task));
        $task->forceFill(['reminder_sent_at' => now()])->save();
    }

    $this->info('Task reminders processed: ' . $tasks->count());
})->purpose('Send task deadline reminders');
