import { Bike, ClipboardList, FileText, ScrollText, Users } from "lucide-react";
import type { UserRole } from "@/lib/api/types";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof Bike;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/prestamos", label: "Préstamos", icon: ClipboardList },
  { href: "/bicicletas", label: "Bicicletas", icon: Bike },
  { href: "/auditoria", label: "Auditoría", icon: ScrollText },
  { href: "/usuarios", label: "Usuarios", icon: Users, roles: ["administrador"] },
  { href: "/reportes", label: "Reportes", icon: FileText, roles: ["administrador"] },
];

export function visibleNavItems(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
