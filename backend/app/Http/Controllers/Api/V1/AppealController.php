<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppealController extends Controller
{
    /**
     * GET /appeal — show the current user's appeal status.
     */
    public function show(Request $request): JsonResponse
    {
        // TODO: implement appeal model and logic
        return response()->json([
            'data' => null,
            'message' => 'No active appeal.',
        ]);
    }

    /**
     * POST /appeal — submit a new appeal.
     */
    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        // TODO: persist appeal to database
        return response()->json([
            'message' => 'Appeal submitted. You will be notified by email.',
        ], 201);
    }
}
