import { api, apiForm } from "@/services/api";

export type FeedbackStatus = "pending" | "processing" | "completed" | "failed";


export type FeedbackRequest = {
  id: string;
  upload_id: string;
  status: FeedbackStatus;
  feedback_focus?: string | null;
  genre?: string | null;
  created_at: string;
  updated_at?: string;
};

export type AiFeedback = {
  id: string;
  request_id: string;
  type: string;      // e.g. "overall", "audio_metrics", "insights", etc.
  score?: number | null;
  data?: any;        // backend JSON payload
  created_at?: string;
};


export const uploadService = {
  async uploadAudio(file: File) {
    const fd = new FormData();
    fd.append("audio_file", file);
    return apiForm<{ id: string; filename: string; file_path: string; size_mb?: number; status: string; created_at: string }>(
      "/audio/uploads", fd
    );
  },
  async patchUpload(uploadId: string, payload: { duration?: number; genre?: string; feedback_focus?: string }) {
    return api(`/audio/uploads/${uploadId}`, { method: "PATCH", body: payload });
  },
};

export const feedbackService = {
  async createFromUpload(payload: {
    upload_id: string;
    reference_upload_id?: string;
    genre?: string;
    feedback_focus?: string;
    user_note?: string;
  }) {
    return api<{ requestId: string; uploadId: string; referenceUploadId: string | null; status: string; progress: any }>(
      "/feedback/requests", { method: "POST", body: payload }
    );
  },
  async getStatus(requestId: string) {
    return api<{ id: string; status: string; progress: { percent: number; stage: string; status?: string }; created_at: string; updated_at: string }>(
      `/feedback/requests/${requestId}/status`
    );
  },
};
