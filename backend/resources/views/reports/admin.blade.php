<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 12px; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
        .muted { color: #475569; }
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
