// Accetta solo path interni come destinazione post-login: niente protocol-relative
// ("//evil.com") né URL con schema, per evitare open redirect.
export function sanitizeNext(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || /^\/[a-z]+:/i.test(value)) return "/";
  return value;
}
