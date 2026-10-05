package com.acots.api.interview;

import java.time.Instant;
import java.util.UUID;

public record InterviewQuestion(
        UUID id,
        String rolePattern,
        InterviewQuestionCategory category,
        String question,
        QuestionDifficulty difficulty,
        Instant createdAt
) {
}
