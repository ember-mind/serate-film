import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Preserva la destinazione di un deep-link quando non c'è ancora una sessione.
// Controlla solo la presenza del cookie: la verifica del JWT resta a requireUser
// nel layout, che è la vera guardia. Qui serve solo a non perdere l'URL di partenza.
export function middleware(request: NextRequest) {
  if (request.cookies.get("serate_session")) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!login|signup|api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
