package com.acots.api.application;

import java.time.LocalDate;

public record CreateApplicationRequest(
        String company,
        String role,
        LocalDate dateApplied,
        ApplicationStatus status
) {
}
