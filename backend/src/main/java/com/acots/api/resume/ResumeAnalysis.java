package com.acots.api.resume;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ResumeAnalysis(
        UUID id,
        String originalFilename,
        String contentType,
        long fileSizeBytes,
        String jobDescription,
        int atsScore,
        List<String> improvements,
        Instant createdAt
) {
}
