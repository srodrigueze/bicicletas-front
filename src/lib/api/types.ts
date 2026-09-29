// Mirrors app/schemas/*.py and app/domain/entities/*.py in bicicletas-inventory-api.

export type BicycleCondition = "good" | "bad";
export type BicycleSize = "small" | "medium" | "large";

export interface Bicycle {
  id: number;
  code: string;
  condition: BicycleCondition;
  size: BicycleSize;
  rueditas_asistencia: boolean;
  tiene_pedales: boolean;
  en_posesion_jac: boolean;
  observations: string | null;
  is_available: boolean;
  image_path: string | null;
  image_url: string | null;
}

export interface BicycleCreateInput {
  code: string;
  condition: BicycleCondition;
  size: BicycleSize;
  rueditas_asistencia: boolean;
  tiene_pedales: boolean;
  observations?: string | null;
}

export type BicycleUpdateInput = Partial<BicycleCreateInput>;

export interface BicycleListFilters {
  skip?: number;
  limit?: number;
  code?: string;
  size?: BicycleSize;
  condition?: BicycleCondition;
  rueditas_asistencia?: boolean;
  tiene_pedales?: boolean;
  en_posesion_jac?: boolean;
}

export type UserRole = "administrador" | "operador";
export type UserStatus = "activo" | "inactivo";

export interface AppUser {
  id: number;
  full_name: string;
  document: string;
  role: UserRole;
  status: UserStatus;
  is_superadmin: boolean;
}

export interface UserCreateInput {
  full_name: string;
  document: string;
  role: UserRole;
  status?: UserStatus;
}

export interface UserUpdateInput {
  full_name?: string;
  status?: UserStatus;
}

export interface Client {
  id: number;
  full_name: string;
  document: string;
  phone: string;
}

export interface ClientDataInput {
  full_name: string;
  document: string;
  phone: string;
}

export type LoanDetailStatus = "on_loan" | "returned";

export interface LoanDetail {
  id: number;
  bicycle_id: number;
  status: LoanDetailStatus;
  returned_at: string | null;
}

export interface Loan {
  id: number;
  client: Client;
  loan_datetime: string;
  is_active: boolean;
  details: LoanDetail[];
}

export interface LoanCreateInput {
  bicycle_ids: number[];
  client: ClientDataInput;
}

export interface LoanListFilters {
  skip?: number;
  limit?: number;
  active_only?: boolean;
}

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "restore"
  | "activate"
  | "deactivate"
  | "swap"
  | "returned"
  | "add_bicycle";

export interface AuditLog {
  id: number;
  user_id: number;
  timestamp: string;
  action: AuditAction;
  entity_name: string;
  entity_id: number;
  previous_values: string | null;
  new_values: string | null;
}

export interface Session {
  userId: number;
  fullName: string;
  document: string;
  role: UserRole;
  status: UserStatus;
  isSuperadmin: boolean;
}
