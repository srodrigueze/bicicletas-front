<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Bicicletas JAC — frontend

Admin web app for a JAC's Sunday cycling-loan operation: bicycle inventory, loans, users, audit log, PDF reports. Business rules (HU-/RNG-/RN- IDs), the data model, and what's explicitly out of scope live in `../documentation/Documentacion-bicicletas-JAC/` — read there before changing behavior, not here. This file's own architecture rationale is in `../documentation/Documentacion-bicicletas-front/Arquitectura-Frontend.md`.

The backend is a sibling repo, `../bicicletas-inventory-api` (FastAPI). Run it too (`uvicorn app.main:app --port 8000` from its venv) — nothing here works without it. `BACKEND_API_URL` in `.env.local` points at it.

## BFF: the browser never sees the JWT

Every backend call goes through a route handler under `src/app/api/**`, which reads the JWT from an httpOnly cookie (`src/lib/auth/session.ts`) and attaches it server-side. Client components call our own `/api/*` routes via `src/lib/api/client-fetch.ts`, never the FastAPI URL directly. When adding a new backend endpoint, add a route handler that mirrors it — don't reach for the backend from client code.

The JWT payload only carries the user id (`sub`). Role, name, and `is_superadmin` come from `GET /users/me`, called once per request via `getSession()` (React `cache`-memoized) and exposed to client components through `useSession()`. If that endpoint ever looks removable, it isn't — it's the only way an operator's own session knows its role.

The backend's error messages are English; the users are Colombian JAC volunteers who aren't. `backend.ts`'s `detailToMessage` runs every backend error through `translateBackendError` (`src/lib/api/error-translations.ts`) before it can reach a toast — this is the only choke point, so it's also the only place to add a translation. Adding a new `raise ValueError(...)` or `detail=` string on the backend means adding its Spanish counterpart there, or it'll silently fall back to a generic message instead of leaking English.

## UI kit is Base UI, not Radix

`components.json` says shadcn, but the generated primitives under `src/components/ui/` wrap `@base-ui/react`. The API differs from every shadcn example you've seen:

- No `asChild`. Use `render={<Button variant="outline" />}` on the trigger/item, and put the visible content as that component's own children.
- Any interactive primitive (`Button`, `DropdownMenuItem`, …) rendered as something other than a real `<button>` (e.g. a `next/link` `<Link>`) needs `nativeButton={false}`, or it throws a console error at runtime — build/typecheck won't catch it.
- `DropdownMenuLabel` (`Menu.GroupLabel`) must be inside a `DropdownMenuGroup` (`Menu.Group`) or it crashes. Wrap it even for a single label.
- `Select`'s `SelectValue` shows the raw selected value, not an item's label, unless you give it a children render function: `<SelectValue>{(v) => LABELS[v]}</SelectValue>`.
- `Dialog`/`AlertDialog`/`Sheet` popups have no `max-height` or scroll by default — tall content (e.g. a form plus an image uploader) clips off both ends on a short viewport with no way to reach it. `max-h-[calc(100dvh-2rem)] overflow-y-auto` is already on all three shared components; don't strip it with a one-off `className` override. If you add `Popover` back (removed — see below), give it the same treatment.
- **Combobox is not for free text.** Its selection mode binds the input to a selected item: close the popup with no item selected (e.g. the user typed something new that matched nothing) and it reverts the input to the empty string, wiping what they typed (verified in `@base-ui/react`'s bundled source, `combobox/root/AriaCombobox.js`, the `single` branch of `handleUnmount`). Use `Autocomplete` (`src/components/ui/autocomplete.tsx`) instead for any "type freely, suggestions are optional" field — its selection mode is `none`, so nothing ever overwrites typed text. `ClientSearchCombobox` is the reference implementation.
- **Don't put a `Select` inside a `Popover`.** Both are non-modal floating layers; clicking a `Select` trigger inside an open `Popover` gets read as an outside-press on the `Popover`, which closes before the `Select`'s own popup can open — the trigger looks dead. (`Select` inside a `Dialog` is fine — `Dialog` is modal, a different interaction model — that's why every form dialog in this app nests selects without issue.) For a collapsible panel of filter controls, use `Collapsible` (`src/components/ui/collapsible.tsx`) instead: it expands inline rather than floating, so nested selects behave exactly like they do in a dialog. `bicicletas/page.tsx`'s filter panel is the reference implementation. Confirmed by hand in Chrome — the Select literally would not open behind the Popover.

These are runtime failures, not type errors — always click through a new dialog/menu/select in the browser after adding one.

