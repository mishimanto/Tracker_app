<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'due_time',
        'is_recurring',
        'recurrence_pattern',
        'completed_at',
        'reminder_sent_at',
    ];

    protected $casts = [
        'due_date' => 'date',
        'due_time' => 'datetime',
        'is_recurring' => 'boolean',
        'completed_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('due_date', today());
    }

    public function scopeUpcoming($query)
    {
        return $query->whereDate('due_date', '>', today());
    }

    public function scopeOverdue($query)
    {
        return $query->whereDate('due_date', '<', today())
                    ->where('status', '!=', 'completed');
    }
}
