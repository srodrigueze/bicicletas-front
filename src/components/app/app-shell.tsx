"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bike, LogOut, Menu, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/session-context";
import { visibleNavItems } from "@/components/app/nav-items";
import { apiFetch } from "@/lib/api/client-fetch";
import { USER_ROLE_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const session = useSession();
  const items = visibleNavItems(session.role);

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Bike className="size-4.5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-sidebar-foreground">Bicicletas JAC</p>
        <p className="text-xs text-sidebar-foreground/60">Jornada de ciclovía</p>
      </div>
    </div>
  );
}

function UserMenu() {
  const session = useSession();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="flex h-auto items-center gap-2 px-2 py-1.5" />}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserIcon className="size-4" />
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight">{session.fullName}</span>
          <span className="block text-xs leading-tight text-muted-foreground">
            {USER_ROLE_LABELS[session.role]}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{session.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {USER_ROLE_LABELS[session.role]}
              {session.isSuperadmin ? " · Superadmin" : ""}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/perfil" />} nativeButton={false}>
          Cambiar contraseña
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={loggingOut} onClick={handleLogout}>
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <BrandMark />
        <NavList />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 sm:px-4">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Abrir menú" />}>
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-4">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <div className="flex flex-col gap-6">
                  <BrandMark />
                  <NavList onNavigate={() => setMobileNavOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Badge variant="secondary" className="font-normal">
              <Bike className="size-3" />
              JAC
            </Badge>
          </div>
          <div className="hidden md:block" />
          <UserMenu />
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
