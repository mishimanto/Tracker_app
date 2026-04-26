<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\SiteSetting;
use App\Models\Task;
use App\Models\User;
use App\Models\Note;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function userReport(Request $request)
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:daily,weekly,monthly,yearly'],
            'format' => ['nullable', 'in:pdf,csv,excel'],
        ]);

        $period = $validated['period'] ?? 'monthly';
        $format = $validated['format'] ?? 'pdf';

        if (in_array($format, ['csv', 'excel'], true)) {
            return $this->exportUserReport($request->user(), $period, $format);
        }

        return $this->downloadUserReport($request->user(), $period);
    }

    public function adminUserReport(Request $request, int $id)
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:daily,weekly,monthly,yearly'],
        ]);

        $period = $validated['period'] ?? 'monthly';
        $user = User::findOrFail($id);

        return $this->downloadUserReport($user, $period);
    }

    public function adminReport(Request $request)
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:daily,weekly,monthly,yearly'],
            'format' => ['nullable', 'in:pdf,csv,excel'],
        ]);

        $period = $validated['period'] ?? 'monthly';
        $format = $validated['format'] ?? 'pdf';

        if (in_array($format, ['csv', 'excel'], true)) {
            return $this->exportAdminReport($period, $format);
        }

        [$startDate, $endDate, $label] = $this->resolveRange($period);

        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $inactiveUsers = User::whereIn('status', ['inactive', 'banned'])->count();
        $tasks = Task::whereBetween('created_at', [$startDate, $endDate]);
        $expenses = Expense::with(['user', 'category'])
            ->whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()]);
        $recentNotes = Note::with('user')
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->latest('updated_at')
            ->take(10)
            ->get();

        $pdf = Pdf::loadView('reports.admin', [
            'title' => 'Admin System Report',
            'period' => $label,
            'generatedAt' => now(),
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'inactiveUsers' => $inactiveUsers,
            'totalTasks' => (clone $tasks)->count(),
            'completedTasks' => (clone $tasks)->where('status', 'completed')->count(),
            'totalExpenses' => (float) (clone $expenses)->sum('amount'),
            'noteCount' => Note::count(),
            'recentExpenses' => (clone $expenses)->latest('expense_date')->take(10)->get(),
            'recentNotes' => $recentNotes,
        ])->setPaper('a4');

        return $pdf->download(sprintf('admin-report-%s.pdf', now()->format('Y-m-d')));
    }

    protected function resolveRange(string $period): array
    {
        return match ($period) {
            'daily' => [now()->startOfDay(), now()->endOfDay(), 'Today'],
            'weekly' => [now()->startOfWeek(), now()->endOfWeek(), 'This Week'],
            'yearly' => [now()->startOfYear(), now()->endOfYear(), 'This Year'],
            default => [now()->startOfMonth(), now()->endOfMonth(), 'This Month'],
        };
    }

    protected function downloadUserReport(User $user, string $period)
    {
        [$startDate, $endDate, $label] = $this->resolveRange($period);

        $tasksQuery = Task::where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate]);

        $expensesQuery = Expense::with('category')
            ->where('user_id', $user->id)
            ->whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()]);

        $totalTasks = (clone $tasksQuery)->count();
        $completedTasks = (clone $tasksQuery)->where('status', 'completed')->count();
        $totalExpenses = (float) (clone $expensesQuery)->sum('amount');
        $expenseItems = (clone $expensesQuery)->latest('expense_date')->get();
        $categoryBreakdown = $expenseItems
            ->groupBy(fn ($expense) => $expense->category?->name ?? 'Uncategorized')
            ->map(fn ($items, $name) => [
                'name' => $name,
                'total' => (float) $items->sum('amount'),
            ])
            ->values();
        $settings = SiteSetting::query()->first();

        $pdf = Pdf::loadView('reports.user', [
            'title' => 'Activity Report',
            'period' => $label,
            'user' => $user,
            'generatedAt' => now(),
            'totalTasks' => $totalTasks,
            'completedTasks' => $completedTasks,
            'pendingTasks' => max(0, $totalTasks - $completedTasks),
            'completionRate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0,
            'totalExpenses' => $totalExpenses,
            'expenseItems' => $expenseItems->take(12),
            'categoryBreakdown' => $categoryBreakdown,
            'settings' => $settings,
        ])->setPaper('a4');

        return $pdf->download(sprintf(
            'activity-report-%s-%s.pdf',
            $user->id,
            now()->format('Y-m-d')
        ));
    }

    protected function exportUserReport(User $user, string $period, string $format): StreamedResponse
    {
        [$startDate, $endDate] = $this->resolveRange($period);

        $expenses = Expense::with('category')
            ->where('user_id', $user->id)
            ->whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('expense_date')
            ->get();

        $rows = $expenses->map(fn ($expense) => [
            'Date' => $expense->expense_date?->format('Y-m-d'),
            'Category' => $expense->category?->name ?? 'Uncategorized',
            'Description' => $expense->description,
            'Amount' => (float) $expense->amount,
            'Payment Method' => $expense->payment_method,
            'Auto Generated' => $expense->is_auto_generated ? 'Yes' : 'No',
        ])->all();

        return $this->streamTabularExport(
            $rows,
            sprintf('activity-report-%s-%s.%s', $user->id, now()->format('Y-m-d'), $format === 'excel' ? 'xls' : 'csv'),
            $format
        );
    }

    protected function exportAdminReport(string $period, string $format): StreamedResponse
    {
        [$startDate, $endDate] = $this->resolveRange($period);

        $rows = Expense::with(['user', 'category'])
            ->whereBetween('expense_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->orderBy('expense_date')
            ->get()
            ->map(fn ($expense) => [
                'Date' => $expense->expense_date?->format('Y-m-d'),
                'User' => $expense->user?->name ?? 'Unknown',
                'Category' => $expense->category?->name ?? 'Uncategorized',
                'Description' => $expense->description,
                'Amount' => (float) $expense->amount,
            ])->all();

        return $this->streamTabularExport(
            $rows,
            sprintf('admin-report-%s.%s', now()->format('Y-m-d'), $format === 'excel' ? 'xls' : 'csv'),
            $format
        );
    }

    protected function streamTabularExport(array $rows, string $fileName, string $format): StreamedResponse
    {
        if ($format === 'excel') {
            return response()->streamDownload(function () use ($rows) {
                echo '<table border="1"><thead><tr>';
                foreach (array_keys($rows[0] ?? ['No data' => '']) as $heading) {
                    echo '<th>' . e($heading) . '</th>';
                }
                echo '</tr></thead><tbody>';

                foreach ($rows as $row) {
                    echo '<tr>';
                    foreach ($row as $value) {
                        echo '<td>' . e((string) $value) . '</td>';
                    }
                    echo '</tr>';
                }

                echo '</tbody></table>';
            }, $fileName, [
                'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            ]);
        }

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');

            if (!empty($rows)) {
                fputcsv($handle, array_keys($rows[0]));
                foreach ($rows as $row) {
                    fputcsv($handle, $row);
                }
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
