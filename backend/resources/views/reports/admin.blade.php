<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 12px; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
        .muted { color: #475569; }
        .card { width: 31%; display: inline-block; vertical-align: top; margin: 0 1% 12px 1%; border: 1px solid #cbd5e1; padding: 12px; box-sizing: border-box; }
        .value { font-size: 20px; font-weight: bold; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background: #e2e8f0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p class="muted">Period: {{ $period }} | Generated: {{ $generatedAt->format('d M Y h:i A') }}</p>
    </div>

    <div>
        <div class="card"><div>Total Users</div><div class="value">{{ $totalUsers }}</div></div>
        <div class="card"><div>Active Users</div><div class="value">{{ $activeUsers }}</div></div>
        <div class="card"><div>Inactive/Banned</div><div class="value">{{ $inactiveUsers }}</div></div>
        <div class="card"><div>Total Tasks</div><div class="value">{{ $totalTasks }}</div></div>
        <div class="card"><div>Completed Tasks</div><div class="value">{{ $completedTasks }}</div></div>
        <div class="card"><div>Total Expenses</div><div class="value">BDT {{ number_format($totalExpenses, 2) }}</div></div>
        <div class="card"><div>Total Notes</div><div class="value">{{ $noteCount }}</div></div>
    </div>

    <h3>Recent Expenses</h3>
    <table>
        <thead><tr><th>User</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
        <tbody>
            @forelse ($recentExpenses as $expense)
                <tr>
                    <td>{{ $expense->user?->name ?? 'Unknown' }}</td>
                    <td>{{ $expense->description }}</td>
                    <td>{{ $expense->category?->name ?? 'Uncategorized' }}</td>
                    <td>BDT {{ number_format((float) $expense->amount, 2) }}</td>
                </tr>
            @empty
                <tr><td colspan="4">No expense data found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h3>Recent Notes</h3>
    <table>
        <thead><tr><th>User</th><th>Title</th><th>Updated</th></tr></thead>
        <tbody>
            @forelse ($recentNotes as $note)
                <tr>
                    <td>{{ $note->user?->name ?? 'Unknown' }}</td>
                    <td>{{ $note->title }}</td>
                    <td>{{ $note->updated_at?->format('d M Y h:i A') }}</td>
                </tr>
            @empty
                <tr><td colspan="3">No notes found.</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
