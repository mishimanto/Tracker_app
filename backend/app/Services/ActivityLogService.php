<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogService
{
    public function log(
        ?int $actorId,
        string $action,
        string $description,
        ?string $entityType = null,
        ?int $entityId = null,
        ?int $targetUserId = null,
        array $metadata = []
    ): ActivityLog {
        $request = request();

        return ActivityLog::create([
            'actor_id' => $actorId,
            'target_user_id' => $targetUserId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'metadata' => $metadata ?: null,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
