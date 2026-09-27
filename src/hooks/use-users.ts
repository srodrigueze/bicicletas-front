import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import type { AppUser, UserCreateInput, UserUpdateInput } from "@/lib/api/types";

const usersKey = ["users"] as const;

export function useUsers(skip: number, limit: number) {
  return useQuery({
    queryKey: [...usersKey, { skip, limit }],
    queryFn: () => apiFetch<AppUser[]>(`/api/users?skip=${skip}&limit=${limit}`),
    placeholderData: (prev) => prev,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: usersKey });
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (data: UserCreateInput) =>
      apiFetch<AppUser>("/api/users", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: invalidate,
  });
}

export function useUpdateUser(id: number) {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (data: UserUpdateInput) =>
      apiFetch<AppUser>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: invalidate,
  });
}

export function useResetPassword() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (id: number) => apiFetch<AppUser>(`/api/users/${id}/reset-password`, { method: "POST" }),
    onSuccess: invalidate,
  });
}
