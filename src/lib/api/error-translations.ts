/** The backend (FastAPI) raises its ValueError/HTTPException messages in English.
 * Every one of them can end up in a toast — the users are Colombian JAC
 * volunteers who don't read English — so nothing from the backend reaches the
 * UI untranslated. Keep this list in sync with the ValueError/HTTPException
 * strings raised in bicicletas-inventory-api (grep for `raise ValueError` and
 * `detail=` there). Anything not listed here falls back to a generic Spanish
 * message rather than leaking English.
 */

const EXACT_TRANSLATIONS: Record<string, string> = {
  "Invalid credentials": "Documento o contraseña incorrectos",
  "Invalid or expired token": "Sesión inválida o expirada",
  "Too many failed login attempts, try again later":
    "Demasiados intentos fallidos. Intenta de nuevo en unos minutos",
  "Password change required": "Debes cambiar tu contraseña antes de continuar",
  "Database unreachable": "Base de datos no disponible",
  "start_date must not be after end_date": "La fecha de inicio no puede ser posterior a la fecha fin",
  "Loan not found": "No se encontró el préstamo",
  "Client not found": "No se encontró el cliente",
  "Administrator role required": "Se requiere rol de administrador",
  "Bicycle not found": "No se encontró la bicicleta",
  "Only image/jpeg, image/png or image/webp files are allowed": "Solo se permiten imágenes JPEG, PNG o WEBP",
  "Image must be at most 5MB": "La imagen debe pesar máximo 5MB",
  "User not found": "No se encontró el usuario",
  "Current password is incorrect": "La contraseña actual es incorrecta",
  "New password must be at least 6 characters long": "La nueva contraseña debe tener al menos 6 caracteres",
  "A user cannot modify or deactivate their own account": "No puedes modificar tu propia cuenta",
  "Only the superadministrator can manage another administrator":
    "Solo el superadministrador puede gestionar a otro administrador",
};

const PATTERN_TRANSLATIONS: { pattern: RegExp; translate: (match: RegExpMatchArray) => string }[] = [
  {
    pattern: /^Bicycle (.+) is already on an active loan$/,
    translate: (m) => `La bicicleta ${m[1]} ya tiene un préstamo activo`,
  },
  {
    pattern: /^Bicycle (\d+) does not exist$/,
    translate: (m) => `La bicicleta #${m[1]} no existe`,
  },
  {
    pattern: /^Bicycle (.+) is not in possession of the JAC$/,
    translate: (m) => `La bicicleta ${m[1]} no está en posesión de la JAC`,
  },
  {
    pattern: /^A bicycle with code '(.+)' already exists$/,
    translate: (m) => `Ya existe una bicicleta con el código "${m[1]}"`,
  },
  {
    pattern: /^A user with document '(.+)' already exists$/,
    translate: (m) => `Ya existe un usuario con el documento ${m[1]}`,
  },
  {
    pattern: /^Loan (\d+) does not exist$/,
    translate: (m) => `El préstamo #${m[1]} no existe`,
  },
  {
    pattern: /^Loan detail \d+ does not belong to loan \d+$/,
    translate: () => "Esa bicicleta no pertenece a este préstamo",
  },
  {
    pattern: /^Loan detail \d+ is already returned$/,
    translate: () => "Esta bicicleta ya fue entregada",
  },
  {
    pattern: /^Loan detail \d+ cannot be marked incumplido from its current status$/,
    translate: () => "Esta bicicleta ya fue entregada o ya está marcada como incumplida",
  },
  {
    pattern: /^Client (.+) already has an active loan; add bicycles to it instead of creating a new one$/,
    translate: (m) =>
      `El cliente con documento ${m[1]} ya tiene un préstamo activo. Agrega las bicicletas a ese préstamo en vez de crear uno nuevo.`,
  },
];

export function translateBackendError(message: string): string {
  const exact = EXACT_TRANSLATIONS[message];
  if (exact) return exact;

  for (const { pattern, translate } of PATTERN_TRANSLATIONS) {
    const match = message.match(pattern);
    if (match) return translate(match);
  }

  return "No se pudo completar la acción. Intenta de nuevo.";
}
