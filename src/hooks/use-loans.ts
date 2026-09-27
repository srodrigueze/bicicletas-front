import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client-fetch";
import type { Client, Loan, LoanCreateInput, LoanListFilters } from "@/lib/api/types";

const loanKeys = {
  all: ["loans"] as const,
  list: (filters: LoanListFilters) => [...loanKeys.all, "list", filters] as const,
  detail: (id: number) => [...loanKeys.all, "detail", id] as const,
};

function buildQuery(filters: LoanListFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export function useLoans(filters: LoanListFilters) {
  return useQuery({
    queryKey: loanKeys.list(filters),
    queryFn: () => apiFetch<Loan[]>(`/api/loans?${buildQuery(filters)}`),
    placeholderData: (prev) => prev,
  });
}

export function useLoan(id: number) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => apiFetch<Loan>(`/api/loans/${id}`),
    enabled: Number.isFinite(id),
  });
}

function useInvalidateLoans() {
  const queryClient = useQueryClient();
  return (id?: number) => {
    queryClient.invalidateQueries({ queryKey: loanKeys.all });
    if (id !== undefined) queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: ["bicycles"] });
  };
}

export function useCreateLoan() {
  const invalidate = useInvalidateLoans();
  return useMutation({
    mutationFn: (data: LoanCreateInput) =>
      apiFetch<Loan>("/api/loans", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => invalidate(),
  });
}

export function useReturnDetail(loanId: number) {
  const invalidate = useInvalidateLoans();
  return useMutation({
    mutationFn: (detailId: number) =>
      apiFetch<Loan>(`/api/loans/${loanId}/details/${detailId}/return`, { method: "POST" }),
    onSuccess: () => invalidate(loanId),
  });
}

export function useSwapBicycle(loanId: number) {
  const invalidate = useInvalidateLoans();
  return useMutation({
    mutationFn: (data: { detail_id: number; new_bicycle_id: number }) =>
      apiFetch<Loan>(`/api/loans/${loanId}/swap`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => invalidate(loanId),
  });
}

export function useClientByDocument() {
  return useMutation({
    mutationFn: (document: string) => apiFetch<Client>(`/api/clients/by-document/${document}`),
  });
}
