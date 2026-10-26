<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\File;
use Throwable;

class UploadController extends Controller
{
    /**
     * POST /api/v1/upload
     *
     * Upload an image for an avatar, cover, or meme.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => [
                'required',
                File::image()
                    ->types(['jpeg', 'png', 'gif', 'webp'])
                    ->max(5 * 1024),
            ],
            'context' => ['required', 'string', 'in:avatar,cover,meme'],
        ]);

        $file = $request->file('file');
        $context = $validated['context'];
        $userId = (string) $request->user()->id;

        $extension = strtolower($file->extension() ?: '');

        if (! in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
            return response()->json([
                'message' => 'Unsupported image format.',
            ], 422);
        }

        $filename = Str::uuid() . '.' . $extension;
        $path = "uploads/{$context}/{$userId}/{$filename}";

        $disk = config('filesystems.upload_disk', 'public');

        try {
            $storedPath = Storage::disk($disk)->putFileAs(
                "uploads/{$context}/{$userId}",
                $file,
                $filename
            );

            if ($storedPath === false) {
                return response()->json([
                    'message' => 'Unable to upload file.',
                ], 500);
            }

            return response()->json([
                'message' => 'File uploaded successfully.',
                'url' => Storage::disk($disk)->url($storedPath),
                'path' => $storedPath,
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to upload file.',
            ], 500);
        }
    }

    /**
     * DELETE /api/v1/upload
     *
     * Delete an uploaded file belonging to the authenticated user.
     */
    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'path' => ['required', 'string', 'max:500'],
        ]);

        $path = $validated['path'];
        $userId = (string) $request->user()->id;

        // Reject absolute paths, traversal, and unexpected path structures.
        if (
            str_contains($path, '\\') ||
            str_contains($path, "\0") ||
            str_starts_with($path, '/') ||
            preg_match('/^[a-zA-Z]:/', $path) ||
            in_array('..', explode('/', $path), true)
        ) {
            return response()->json([
                'message' => 'Invalid file path.',
            ], 422);
        }

        $segments = explode('/', $path);

        if (
            count($segments) !== 4 ||
            $segments[0] !== 'uploads' ||
            ! in_array($segments[1], ['avatar', 'cover', 'meme'], true) ||
            $segments[2] !== $userId ||
            ! preg_match(
                '/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp)$/i',
                $segments[3]
            )
        ) {
            return response()->json([
                'message' => 'Forbidden.',
            ], 403);
        }

        $disk = config('filesystems.upload_disk', 'public');

        try {
            $storage = Storage::disk($disk);

            if (! $storage->exists($path)) {
                return response()->json([
                    'message' => 'File not found.',
                ], 404);
            }

            if (! $storage->delete($path)) {
                return response()->json([
                    'message' => 'Unable to delete file.',
                ], 500);
            }

            return response()->json([
                'message' => 'File deleted successfully.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to delete file.',
            ], 500);
        }
    }
}
