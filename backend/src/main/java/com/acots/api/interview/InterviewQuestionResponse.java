package com.acots.api.interview;

import java.util.List;
import java.util.UUID;

public record InterviewQuestionResponse(
        UUID applicationId,
        String role,
        List<InterviewQuestion> technicalQuestions,
        List<InterviewQuestion> behavioralQuestions
) {
}
