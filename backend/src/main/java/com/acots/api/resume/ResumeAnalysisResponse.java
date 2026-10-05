package com.acots.api.resume;

import java.util.List;

public record ResumeAnalysisResponse(int atsScore, List<String> improvements) {
}
