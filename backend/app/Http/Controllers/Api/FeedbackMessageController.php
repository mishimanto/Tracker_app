<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\FeedbackReplyMail;
use App\Models\FeedbackMessage;
use App\Notifications\AdminFeedbackReplyNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class FeedbackMessageController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $supportsScreenshot = Schema::hasColumn('feedback_messages', 'screenshot_path');

        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:5000'],
            'screenshot' => [$supportsScreenshot ? 'nullable' : 'prohibited', 'image', 'max:2048'],
        ]);

        $screenshotPath = null;
        if ($supportsScreenshot && $request->hasFile('screenshot')) {
            $screenshotPath = $request->file('screenshot')->store('feedback', 'public');
        }

        $payload = [
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'unread',
        ];

        if ($supportsScreenshot) {
            $payload['screenshot_path'] = $screenshotPath;
        }

        $feedback = FeedbackMessage::create($payload);

        return response()->json([
            'success' => true,
            'message' => 'Feedback sent successfully.',
            'data' => $feedback->load('user'),
        ], 201);
    }

    public function reply(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $feedback = FeedbackMessage::with('user')->findOrFail($id);

        abort_unless($feedback->user?->email, 422, 'The selected user does not have a valid email address.');

        Mail::to($feedback->user->email)->send(
            new FeedbackReplyMail($feedback, $validated['message'])
        );

        $feedback->user->notify(new AdminFeedbackReplyNotification($feedback, $validated['message']));

        $feedback->update(['status' => 'replied']);

        return response()->json([
            'success' => true,
            'message' => 'Reply sent to user email successfully.',
            'data' => $feedback->fresh('user'),
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => FeedbackMessage::query()
                ->with('user:id,name,email')
                ->latest()
                ->get(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $feedback = FeedbackMessage::query()
            ->with('user:id,name,email')
            ->findOrFail($id);

        if ($feedback->status === 'unread') {
            $feedback->update(['status' => 'read']);
        }

        return response()->json([
            'success' => true,
            'data' => $feedback->fresh('user:id,name,email'),
        ]);
    }
}
