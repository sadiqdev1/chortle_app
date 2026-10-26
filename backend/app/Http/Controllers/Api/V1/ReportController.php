<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // fix #5 — allowlist of reportable types; prevents morphTo abuse
    private const REPORTABLE_TYPES = [
        'post'    => Post::class,
        'comment' => Comment::class,
        'user'    => User::class,
    ];

    private const REASONS = [
        'spam', 'harassment', 'misinformation', 'hate_speech',
        'violence', 'copyright', 'inappropriate', 'other',
    ];

    /**
     * POST /reports
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'        => ['required', 'string', 'in:' . implode(',', array_keys(self::REPORTABLE_TYPES))],
            'reason'      => ['required', 'string', 'in:' . implode(',', self::REASONS)],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        $modelClass = self::REPORTABLE_TYPES[$validated['type']];
        $model      = $modelClass::findOrFail($validated['id']);

        // Prevent duplicate pending reports from the same user for the same content
        $alreadyReported = Report::where('user_id', $request->user()->id)
            ->where('reportable_type', $modelClass)
            ->where('reportable_id', $model->id)
            ->where('status', 'pending')
            ->exists();

        if ($alreadyReported) {
            return response()->json(['message' => 'You already have a pending report for this content.'], 422);
        }

        Report::create([
            'user_id'          => $request->user()->id,
            'reportable_type'  => $modelClass,        // use full class name, not raw user input
            'reportable_id'    => $model->id,
            'reason'           => $validated['reason'],
            'description'      => $validated['description'] ?? null,
            // status, reviewed_by, admin_note — never set by users
        ]);

        return response()->json(['message' => 'Report submitted. Our team will review it.'], 201);
    }
}
