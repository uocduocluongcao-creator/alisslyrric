import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../api/jobs";

export const useJobs = () => {
  const client = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: jobApi.list,
    refetchInterval: 5000
  });

  const createJob = useMutation({
    mutationFn: jobApi.create,
    onSuccess: () => client.invalidateQueries({ queryKey: ["jobs"] })
  });

  return {
    jobs: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    createJob
  };
};

