package com.acots.api.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record JobApplication(
        UUID id,
        String company,
        String role,
        LocalDate dateApplied,
        ApplicationStatus status,
        Integer atsScore,
        Instant createdAt,
        Instant updatedAt
) {
}
