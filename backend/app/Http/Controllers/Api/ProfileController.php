<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function __construct(protected ImageUploadService $imageUploadService)
    {
    }

    /**
     * Update user profile information
     */
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $request->user()->id],
            'profile_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:4096'],
        ]);

        $user = $request->user();

        if ($request->hasFile('profile_photo')) {
            $validated['profile_photo_path'] = $this->imageUploadService->storeOptimizedImage(
                $request->file('profile_photo'),
                'profile-photos',
                $user->profile_photo_path,
                [
                    'max_width' => 640,
                    'max_height' => 640,
                    'quality' => 82,
                ]
            );
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'profile_photo_path' => $validated['profile_photo_path'] ?? $user->profile_photo_path,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = $request->user();

        // Check if current password is correct
        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match our records.'],
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Get user profile with full URL for photo
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        // Add photo URL if exists
        if ($user->profile_photo_path) {
            $user->profile_photo_url = asset('storage/' . $user->profile_photo_path);
        } else {
            $user->profile_photo_url = null;
        }

        return response()->json([
            'user' => $user,
        ]);
    }
}
