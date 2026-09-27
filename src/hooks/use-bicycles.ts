import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import type { Bicycle, BicycleCreateInput, BicycleListFilters, BicycleUpdateInput } from "@/lib/api/types";

const bicycleKeys = {
  all: ["bicycles"] as const,
  list: (filters: BicycleListFilters) => [...bicycleKeys.all, "list", filters] as const,
  detail: (id: number) => [...bicycleKeys.all, "detail", id] as const,
};

function buildQuery(filters: BicycleListFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export function useBicycles(filters: BicycleListFilters) {
  return useQuery({
    queryKey: bicycleKeys.list(filters),
    queryFn: () => apiFetch<Bicycle[]>(`/api/bicycles?${buildQuery(filters)}`),
    placeholderData: (prev) => prev,
  });
}

export function useBicycle(id: number) {
  return useQuery({
    queryKey: bicycleKeys.detail(id),
    queryFn: () => apiFetch<Bicycle>(`/api/bicycles/${id}`),
    enabled: Number.isFinite(id),
  });
}

function useInvalidateBicycles() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: bicycleKeys.all });
}

export function useCreateBicycle() {
  const invalidate = useInvalidateBicycles();
  return useMutation({
    mutationFn: (data: BicycleCreateInput) =>
      apiFetch<Bicycle>("/api/bicycles", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: invalidate,
  });
}

export function useUpdateBicycle(id: number) {
  const invalidate = useInvalidateBicycles();
  return useMutation({
    mutationFn: (data: BicycleUpdateInput) =>
      apiFetch<Bicycle>(`/api/bicycles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: invalidate,
  });
}

export function useDeleteBicycle() {
  const invalidate = useInvalidateBicycles();
  return useMutation({
    mutationFn: (id: number) => apiFetch<Bicycle>(`/api/bicycles/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

export function useRestoreBicycle() {
  const invalidate = useInvalidateBicycles();
  return useMutation({
    mutationFn: (id: number) => apiFetch<Bicycle>(`/api/bicycles/${id}/restore`, { method: "PATCH" }),
    onSuccess: invalidate,
  });
}

export function useUploadBicycleImage(id: number) {
  const invalidate = useInvalidateBicycles();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch<Bicycle>(`/api/bicycles/${id}/image`, { method: "POST", body: formData });
    },
    onSuccess: invalidate,
  });
}
