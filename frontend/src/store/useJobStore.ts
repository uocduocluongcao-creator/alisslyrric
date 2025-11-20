import { create } from "zustand";
import type { LyricJob } from "../types/jobs";

interface JobState {
  selectedJob?: LyricJob;
  setSelectedJob: (job?: LyricJob) => void;
}

export const useJobStore = create<JobState>((set) => ({
  selectedJob: undefined,
  setSelectedJob: (job) => set({ selectedJob: job })
}));

