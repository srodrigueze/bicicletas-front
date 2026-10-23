import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Loan, LoanStatus } from "@/lib/api/types";

const MASKED = "****";

/** Defense in depth for RNG-11 — the backend already masks administrators'
 * documents, but the UI never trusts a single layer for this rule. */
export function maskDocumentIfAdmin(document: string, role: "administrador" | "operador"): string {
  if (role === "administrador") return MASKED;
  return document;
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "d MMM yyyy, h:mm a", { locale: es });
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "d MMM yyyy", { locale: es });
}

export const BICYCLE_SIZE_LABELS: Record<string, string> = {
  small: "Pequeño",
  medium: "Mediano",
  large: "Grande",
};

export const BICYCLE_CONDITION_LABELS: Record<string, string> = {
  good: "Buen estado",
  bad: "Necesita reparación",
};

export const BICYCLE_BRAKES_LABELS: Record<number, string> = {
  0: "Sin frenos",
  1: "1 freno",
  2: "2 frenos",
};

export const USER_ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  operador: "Operador",
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  create: "Creación",
  update: "Actualización",
  delete: "Eliminación lógica",
  restore: "Restauración",
  activate: "Activación",
  deactivate: "Desactivación",
  swap: "Cambio de bicicleta",
  returned: "Devolución",
  add_bicycle: "Bicicleta agregada",
  incumplido: "Marcado incumplido",
  password_change: "Cambio de contraseña",
  password_reset: "Restablecimiento de contraseña",
};

export const LOAN_DETAIL_STATUS_LABELS: Record<string, string> = {
  on_loan: "Prestada",
  returned: "Entregada",
  incumplido: "Incumplido",
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  activo: "Activo",
  incumplido: "Incumplido",
  cerrado: "Cerrado",
};

/** Derived client-side from the same fields the backend's own LoanRead
 * already sends — see LoanStatus in lib/api/types.ts. */
export function getLoanStatus(loan: Pick<Loan, "is_active" | "details">): LoanStatus {
  if (loan.is_active) return "activo";
  if (loan.details.some((detail) => detail.status === "incumplido")) return "incumplido";
  return "cerrado";
}
