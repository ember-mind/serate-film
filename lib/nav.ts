// Only root-relative, same-origin destinations may be used after authentication.
// WHATWG URL parsing treats backslashes as slashes and strips some controls, so
// checking startsWith("//") alone is not enough to reject external redirects.
export function sanitizeNext(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(value) ||
    /^\/[a-z]+:/i.test(value)
  ) {
    return "/";
  }

  try {
    const base = "https://serate-film.invalid";
    const target = new URL(value, base);
    // Dot-segment normalization can expose a leading "//" even when the
    // original input did not have one. Never return it as a relative redirect.
    if (target.origin !== base || target.pathname.startsWith("//")) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}
