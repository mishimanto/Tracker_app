<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 12px; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
        .muted { color: #475569; }
        .card { width: 48%; display: inline-block; vertical-align: top; margin: 0 1% 12px 1%; border: 1px solid #cbd5e1; padding: 12px; box-sizing: border-box; }
        .value { font-size: 22px; font-weight: bold; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background: #e2e8f0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p class="muted">User: {{ $user->name }} ({{ $user->email }})</p>
        <p class="muted">Period: {{ $period }} | Generated: {{ $generatedAt->format('d M Y h:i A') }}</p>
        @if ($settings?->site_name)
            <p class="muted">{{ $settings->site_name }}</p>
        @endif
    </div>

    <div>
        <div class="card"><div>Total Tasks</div><div class="value">{{ $totalTasks }}</div></div>
        <div class="card"><div>Completed Tasks</div><div class="value">{{ $completedTasks }}</div></div>
        <div class="card"><div>Pending Tasks</div><div class="value">{{ $pendingTasks }}</div></div>
        <div class="card"><div>Total Expenses</div><div class="value">BDT {{ number_format($totalExpenses, 2) }}</div></div>
    </div>

    <h3>Summary</h3>
    <p>Completion rate: {{ $completionRate }}%</p>

    <h3>Expense Breakdown</h3>
    <table>
        <thead><tr><th>Category</th><th>Total</th></tr></thead>
        <tbody>
            @forelse ($categoryBreakdown as $category)
                <tr>
                    <td>{{ $category['name'] }}</td>
                    <td>BDT {{ number_format($category['total'], 2) }}</td>
                </tr>
            @empty
                <tr><td colspan="2">No expense data available.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h3>Recent Expenses</h3>
    <table>
        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
        <tbody>
            @forelse ($expenseItems as $expense)
                <tr>
                    <td>{{ \Illuminate\Support\Carbon::parse($expense->expense_date)->format('d M Y') }}</td>
                    <td>{{ $expense->description }}</td>
                    <td>{{ $expense->category?->name ?? 'Uncategorized' }}</td>
                    <td>BDT {{ number_format((float) $expense->amount, 2) }}</td>
                </tr>
            @empty
                <tr><td colspan="4">No expenses found for this period.</td></tr>
            @endforelse
        </tbody>
    </table>

    @if (!empty($settings?->report_footer))
        <p class="muted" style="margin-top: 20px;">{{ $settings->report_footer }}</p>
    @endif
</body>
</html>
