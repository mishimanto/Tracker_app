<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecurringExpenseTemplate;
use App\Services\ExpenseService;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    protected $expenseService;
    protected $imageUploadService;

    public function __construct(ExpenseService $expenseService, ImageUploadService $imageUploadService)
    {
        $this->expenseService = $expenseService;
        $this->imageUploadService = $imageUploadService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['category_id', 'payment_method', 'date_from', 'date_to', 'search', 'amount_min', 'amount_max']);
        $expenses = $this->expenseService->getUserExpenses(auth()->id(), $filters);

        return response()->json([
            'success' => true,
            'data' => $expenses
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        \Log::info('Storing expense', [
            'user_id' => auth()->id(),
            'request_data' => $request->all(),
            'has_user' => auth()->check()
        ]);

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string|max:255',
            'expense_date' => 'required|date',
            'payment_method' => 'required|in:cash,card,bank,mobile',
            'notes' => 'nullable|string',
            'receipt_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf|max:8192',
            'is_recurring' => 'nullable|boolean',
            'recurrence_frequency' => 'nullable|in:weekly,monthly',
            'recurrence_interval' => 'nullable|integer|min:1|max:12',
            'recurrence_end_date' => 'nullable|date|after_or_equal:expense_date',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        if ($request->hasFile('receipt_image')) {
            $data['receipt_image'] = $this->imageUploadService->storeOptimizedImage(
                $request->file('receipt_image'),
                'receipts',
                null,
                [
                    'max_width' => 1800,
                    'max_height' => 1800,
                    'quality' => 80,
                ]
            );
        }

        if ($request->hasFile('attachment')) {
            $attachment = $request->file('attachment');

            if (str_starts_with((string) $attachment->getClientMimeType(), 'image/') && empty($data['receipt_image'])) {
                $data['receipt_image'] = $this->imageUploadService->storeOptimizedImage(
                    $attachment,
                    'receipts',
                    null,
                    [
                        'max_width' => 1800,
                        'max_height' => 1800,
                        'quality' => 80,
                    ]
                );
            }

            $data = array_merge($data, $this->expenseService->storeExpenseAttachment($attachment));
        }

        try {
            $expense = $this->expenseService->createExpense(auth()->id(), $data);

            if ($request->boolean('is_recurring')) {
                RecurringExpenseTemplate::create([
                    'user_id' => auth()->id(),
                    'category_id' => $expense->category_id,
                    'amount' => $expense->amount,
                    'description' => $expense->description,
                    'payment_method' => $expense->payment_method,
                    'notes' => $expense->notes,
                    'frequency' => $request->input('recurrence_frequency', 'monthly'),
                    'interval' => (int) $request->input('recurrence_interval', 1),
                    'start_date' => $expense->expense_date,
                    'next_run_date' => $request->input('recurrence_frequency', 'monthly') === 'weekly'
                        ? $expense->expense_date->copy()->addWeeks((int) $request->input('recurrence_interval', 1))
                        : $expense->expense_date->copy()->addMonthsNoOverflow((int) $request->input('recurrence_interval', 1)),
                    'end_date' => $request->input('recurrence_end_date'),
                ]);
            }

            \Log::info('Expense created successfully', ['expense_id' => $expense->id]);

            return response()->json([
                'success' => true,
                'message' => 'Expense created successfully',
                'data' => $expense
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Failed to create expense', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create expense: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|exists:expense_categories,id',
            'amount' => 'sometimes|numeric|min:0',
            'description' => 'sometimes|string|max:255',
            'expense_date' => 'sometimes|date',
            'payment_method' => 'sometimes|in:cash,card,bank,mobile',
            'notes' => 'nullable|string',
            'receipt_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf|max:8192',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $expense = $this->expenseService->findUserExpense($id, auth()->id());

        if ($request->hasFile('receipt_image')) {
            $data['receipt_image'] = $this->imageUploadService->storeOptimizedImage(
                $request->file('receipt_image'),
                'receipts',
                $expense?->receipt_image,
                [
                    'max_width' => 1800,
                    'max_height' => 1800,
                    'quality' => 80,
                ]
            );
        }

        if ($request->hasFile('attachment')) {
            if ($expense?->attachment_path) {
                Storage::disk('public')->delete($expense->attachment_path);
            }

            $attachment = $request->file('attachment');
            $data = array_merge($data, $this->expenseService->storeExpenseAttachment($attachment));
        }

        $expense = $this->expenseService->updateExpense($id, auth()->id(), $data);

        if (!$expense) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Expense updated successfully',
            'data' => $expense
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $result = $this->expenseService->deleteExpense($id, auth()->id());

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Expense not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Expense deleted successfully'
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $period = $request->get('period', 'monthly');
        $stats = $this->expenseService->getExpenseStats(auth()->id(), $period);

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = \App\Models\ExpenseCategory::where('is_default', true)
            ->orWhere('user_id', auth()->id())
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}
