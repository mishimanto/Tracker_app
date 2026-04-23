<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\RecurringExpenseTemplate;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class RecurringExpenseService
{
    public function generateDueExpensesForUser(int $userId): Collection
    {
        $templates = RecurringExpenseTemplate::query()
            ->with('category')
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->whereDate('next_run_date', '<=', today())
            ->get();

        return $templates->flatMap(function (RecurringExpenseTemplate $template) {
            return $this->generateForTemplate($template);
        });
    }

    public function generateForTemplate(RecurringExpenseTemplate $template): Collection
    {
        $generated = collect();
        $cursor = $template->next_run_date?->copy();

        while ($cursor && $cursor->lte(today())) {
            $alreadyExists = Expense::query()
                ->where('user_id', $template->user_id)
                ->where('recurring_template_id', $template->id)
                ->whereDate('expense_date', $cursor->toDateString())
                ->exists();

            if (!$alreadyExists) {
                $generated->push(Expense::create([
                    'user_id' => $template->user_id,
                    'category_id' => $template->category_id,
                    'recurring_template_id' => $template->id,
                    'amount' => $template->amount,
                    'description' => $template->description,
                    'expense_date' => $cursor->toDateString(),
                    'payment_method' => $template->payment_method,
                    'notes' => $template->notes,
                    'is_auto_generated' => true,
                ]));
            }

            $cursor = $this->nextOccurrence($cursor, $template->frequency, $template->interval);

            if ($template->end_date && $cursor->gt($template->end_date)) {
                $template->update([
                    'is_active' => false,
                    'next_run_date' => $template->end_date,
                ]);

                return $generated;
            }
        }

        if ($cursor) {
            $template->update(['next_run_date' => $cursor->toDateString()]);
        }

        return $generated;
    }

    public function nextOccurrence(Carbon $date, string $frequency, int $interval): Carbon
    {
        return match ($frequency) {
            'weekly' => $date->copy()->addWeeks($interval),
            default => $date->copy()->addMonthsNoOverflow($interval),
        };
    }
}
