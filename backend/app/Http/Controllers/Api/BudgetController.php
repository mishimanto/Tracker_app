<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function __construct(protected BudgetService $budgetService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->budgetService->getUserBudgets($request->user()->id),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'budgets' => ['required', 'array', 'min:1'],
            'budgets.*.category_id' => ['required', 'exists:expense_categories,id'],
            'budgets.*.limit_amount' => ['required', 'numeric', 'min:0.01'],
            'budgets.*.period' => ['nullable', 'in:monthly'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Budgets saved successfully.',
            'data' => $this->budgetService->upsertUserBudgets($request->user()->id, $validated['budgets']),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $deleted = $this->budgetService->deleteBudget($request->user()->id, $id);

        return response()->json([
            'success' => $deleted,
            'message' => $deleted ? 'Budget deleted successfully.' : 'Budget not found.',
        ], $deleted ? 200 : 404);
    }
}
