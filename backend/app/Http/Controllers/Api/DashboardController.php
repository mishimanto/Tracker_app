<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function stats(): JsonResponse
    {
        $stats = $this->dashboardService->getUserDashboardStats(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function recentActivities(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $limit = $validated['limit'] ?? 10;
        $activities = $this->dashboardService->getRecentActivities(auth()->id(), $limit);

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }
}
