import { apiClient } from "./client";
import type { LyricJob } from "../types/jobs";

export const jobApi = {
  list: async () => {
    const { data } = await apiClient.get<LyricJob[]>("/jobs");
    return data;
  },
  get: async (id: string) => {
    const { data } = await apiClient.get<LyricJob>(`/jobs/${id}`);
    return data;
  },
  create: async (payload: { title: string; artist?: string; audio: File; lyrics?: File }) => {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.artist) form.append("artist", payload.artist);
    form.append("audio", payload.audio);
    if (payload.lyrics) form.append("lyrics", payload.lyrics);
    const { data } = await apiClient.post<LyricJob>("/jobs", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },
  downloadUrl: (jobId: string) => `${apiClient.defaults.baseURL}/jobs/${jobId}/video`
};

