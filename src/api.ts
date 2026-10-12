export type ResumeAnalysis = {
  atsScore: number;
  skillGaps: string[];
  optimizationSuggestions: string[];
};

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  dateApplied: string | null;
  status: ApplicationStatus;
  interviewStage: string | null;
  nextFollowUp: string | null;
  notes: string | null;
};

export type InterviewPrep = {
  applicationId: string;
  company: string;
  role: string;
  questions: { category: 'Technical' | 'Behavioral'; question: string }[];
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, init);
  } catch {
    throw new Error('ACOTS API is unavailable. Start PostgreSQL and the FastAPI server on http://localhost:8000, then retry.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string; message?: string } | null;
    throw new Error(body?.detail ?? body?.message ?? `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  analyzeResume: (file: File, jobDescription: string) => {
    const body = new FormData(); body.append('file', file); body.append('jobDescription', jobDescription);
    return request<ResumeAnalysis>('/analyze', { method: 'POST', body });
  },
  latestResumeAnalysis: () => request<ResumeAnalysis>('/latest'),
  applications: () => request<JobApplication[]>('/applications'),
  createApplication: (application: Omit<JobApplication, 'id'>) => request<JobApplication>('/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(application),
  }),
  updateApplicationStatus: (id: string, status: ApplicationStatus) => request<JobApplication>(`/applications/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }),
  updateApplication: (id: string, update: Partial<Pick<JobApplication, 'status' | 'interviewStage' | 'nextFollowUp' | 'notes'>>) => request<JobApplication>(`/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  }),
  interviewQuestions: (applicationId: string) => request<InterviewPrep>(`/interviews/questions?applicationId=${encodeURIComponent(applicationId)}`),
};
