<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\VerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        $verificationRequest = $user->verificationRequests()
            ->latest()
            ->first();

        return response()->json([
            'is_verified' => $user->is_verified,
            'verification_status' => $user->verification_status,
            'verified_at' => $user->verified_at,
            'request' => $verificationRequest,
        ]);
    }

    public function request(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->is_verified) {
            return response()->json([
                'message' => 'Your account is already verified.',
            ], 422);
        }

        $existingRequest = $user->verificationRequests()
            ->where('status', 'pending')
            ->exists();

        if ($existingRequest) {
            return response()->json([
                'message' => 'You already have a verification request under review.',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => [
                'required',
                'string',
                'min:20',
                'max:2000',
            ],
        ]);

        $verificationRequest = VerificationRequest::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'reason' => $validated['reason'],
        ]);

        $user->update([
            'verification_status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Verification request submitted successfully.',
            'request' => $verificationRequest,
        ], 201);
    }

    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();

        $verificationRequest = $user->verificationRequests()
            ->where('status', 'pending')
            ->latest()
            ->first();

        if (! $verificationRequest) {
            return response()->json([
                'message' => 'You do not have a pending verification request.',
            ], 422);
        }

        $verificationRequest->update([
            'status' => 'cancelled',
        ]);

        $user->update([
            'verification_status' => 'none',
        ]);

        return response()->json([
            'message' => 'Verification request cancelled.',
        ]);
    }
}