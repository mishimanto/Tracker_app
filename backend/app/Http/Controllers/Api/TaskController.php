<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'priority', 'date', 'search']);
        $tasks = $this->taskService->getUserTasks(auth()->id(), $filters);

        return response()->json([
            'success' => true,
            'data' => $tasks
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'required|date',
            'due_time' => 'nullable|date_format:H:i',
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'nullable|in:daily,weekly,monthly'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $task = $this->taskService->createTask(auth()->id(), $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully',
            'data' => $task
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $task = $this->taskService->getUserTasks(auth()->id(), ['id' => $id])->first();

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $task
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'due_date' => 'sometimes|date',
            'due_time' => 'nullable|date_format:H:i',
            'is_recurring' => 'sometimes|boolean',
            'recurrence_pattern' => 'nullable|in:daily,weekly,monthly'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $task = $this->taskService->updateTask($id, auth()->id(), $request->all());

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data' => $task
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $result = $this->taskService->deleteTask($id, auth()->id());

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully'
        ]);
    }

    public function toggleStatus($id): JsonResponse
    {
        $task = $this->taskService->toggleTaskStatus($id, auth()->id());

        return response()->json([
            'success' => true,
            'message' => 'Task status updated',
            'data' => $task
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = $this->taskService->getTaskStats(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
