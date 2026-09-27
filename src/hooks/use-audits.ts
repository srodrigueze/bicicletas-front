import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import type { AuditLog } from "@/lib/api/types";

export function useAudits(skip: number, limit: number) {
  return useQuery({
    queryKey: ["audits", { skip, limit }],
    queryFn: () => apiFetch<AuditLog[]>(`/api/audits?skip=${skip}&limit=${limit}`),
    placeholderData: (prev) => prev,
  });
}
