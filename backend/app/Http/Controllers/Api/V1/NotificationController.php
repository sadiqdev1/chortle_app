<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/v1/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'unread'   => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();

        $query = $user->notifications();

        if ($request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        $notifications = $query
            ->latest()
            ->paginate($validated['per_page'] ?? 20);

        return response()->json([
            'data' => $notifications->items(),

            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'per_page'     => $notifications->perPage(),
                'total'        => $notifications->total(),
                'has_more'     => $notifications->hasMorePages(),
            ],

            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * POST /api/v1/notifications/{id}/read
     */
    public function markRead(
        Request $request,
        string $id
    ): JsonResponse {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marked as read.',
            'unread_count' => $request->user()
                ->unreadNotifications()
                ->count(),
        ]);
    }

    /**
     * POST /api/v1/notifications/read-all
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->unreadNotifications()->update([
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
            'unread_count' => 0,
        ]);
    }
}
