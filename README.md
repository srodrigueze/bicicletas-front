# Bicicletas JAC — Frontend

Aplicación web administrativa para la jornada de préstamo de bicicletas de una Junta de Acción Comunal (JAC) en Medellín. Reemplaza el registro en papel: inventario de bicicletas, préstamos con una o varias bicicletas por cliente, devoluciones y cambios de bicicleta, gestión de usuarios, auditoría de solo lectura y reportes en PDF.

Es exclusivamente administrativa — sin acceso ni formulario público para los clientes — y responsive para operarse desde celular o tablet durante la ciclovía, además de desde escritorio.

## Por qué está hecha así

- **Next.js actúa como BFF (Backend-for-Frontend).** El JWT que emite el backend nunca llega al navegador: vive en una cookie `httpOnly` y todas las llamadas pasan por route handlers propios (`src/app/api/**`) que la adjuntan del lado servidor. Esto evita exponer el token a XSS y evita configurar CORS en el backend.
- **shadcn/ui sobre Base UI**, no Radix — mismo aspecto visual, pero la API de composición (`render` en vez de `asChild`, `nativeButton`) es distinta a la de los ejemplos típicos de shadcn. Ver `AGENTS.md` si vas a tocar componentes.
- **TanStack Query + react-hook-form/zod** para el estado de datos y los formularios, con schemas que reflejan los schemas Pydantic del backend.
- Paleta e identidad visual propias (verde/mostaza, Public Sans + IBM Plex Mono) en vez del gris genérico de shadcn — pensada para uso al aire libre en la ciclovía, con buen contraste y sin saturar.

El detalle completo de la arquitectura, las decisiones de requisitos no funcionales y lo que quedó pendiente está en [`../documentation/Documentacion-bicicletas-front/Arquitectura-Frontend.md`](../documentation/Documentacion-bicicletas-front/Arquitectura-Frontend.md). Los requisitos funcionales, historias de usuario y reglas de negocio (HU-/RNG-/RN-) están en [`../documentation/Documentacion-bicicletas-JAC/`](../documentation/Documentacion-bicicletas-JAC/).

## Cómo correrlo

Necesitas el backend (`../bicicletas-inventory-api`, FastAPI) corriendo en paralelo — este frontend no llama a ninguna base de datos por sí mismo.

```bash
# 1. Backend (en su propia carpeta, con su propio entorno virtual)
cd ../bicicletas-inventory-api
source env/bin/activate
uvicorn app.main:app --port 8000

# 2. Frontend
cd ../bicicletas-front
pnpm install
cp .env.local.example .env.local   # si no existe, crea uno con BACKEND_API_URL=http://localhost:8000
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). El login pide número de documento y, como contraseña, sus últimos 4 dígitos (RNG-06) — los usuarios los crea un administrador desde el panel de Usuarios, no hay auto-registro.

## Estructura

```
src/
  app/
    login/              → login, público
    (app)/              → rutas autenticadas: préstamos, bicicletas, usuarios, auditoría, reportes, perfil
    api/                → route handlers BFF: proxian al backend con el JWT de la cookie
  components/
    ui/                  → primitivos shadcn/Base UI
    app/, bicycles/, loans/, users/, auth/  → componentes propios por dominio
  hooks/                → hooks de TanStack Query por recurso (bicicletas, préstamos, usuarios, auditoría)
  lib/
    api/                 → cliente del backend (server-only), tipos, cliente fetch para el navegador
    auth/                → sesión (lee la cookie, llama a /users/me)
    validation/          → schemas zod de formularios
  proxy.ts               → guard de rutas (reemplazo de middleware en Next 16)
```

## Pruebas

Vitest + Testing Library (unitarios/integración) y Playwright (e2e) quedaron definidos como stack de testing pero aún no implementados — ver la sección de pendientes en el documento de arquitectura.
