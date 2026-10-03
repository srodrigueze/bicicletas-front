import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import { placeholderDataSamePage } from "@/lib/query-pagination";
import type { AuditLog } from "@/lib/api/types";

export function useAudits(skip: number, limit: number) {
  const filters = { skip, limit };
  return useQuery({
    queryKey: ["audits", filters],
    queryFn: () => apiFetch<AuditLog[]>(`/api/audits?skip=${skip}&limit=${limit}`),
    placeholderData: (prev, prevQuery) => placeholderDataSamePage(prev, prevQuery, filters),
  });
}
