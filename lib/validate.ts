/** Validaciones compartidas, con mensajes claros en español (§8, §10). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esEmailValido(email: unknown): email is string {
  return typeof email === "string" && EMAIL_RE.test(email.trim());
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}
