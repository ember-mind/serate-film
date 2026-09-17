// One information architecture for both desktop and mobile navigation.
export type NavigationItem = { href: string; label: string; paths: readonly string[] };

export const primaryNavigation: readonly NavigationItem[] = [
  { href: "/", label: "Home", paths: ["/", "/attivita"] },
  { href: "/film", label: "Cineteca", paths: ["/film", "/watchlist", "/attori", "/registi", "/percorsi", "/trova-film"] },
  { href: "/serate", label: "Serate", paths: ["/serate", "/storico", "/circoli", "/club", "/persone"] },
  { href: "/io", label: "Io", paths: ["/io", "/admin", "/notifiche"] },
];

export const libraryNavigation: readonly NavigationItem[] = [
  { href: "/film", label: "Film", paths: ["/film", "/trova-film"] },
  { href: "/watchlist", label: "Watchlist", paths: ["/watchlist"] },
  { href: "/attori", label: "Attori", paths: ["/attori"] },
  { href: "/registi", label: "Registi", paths: ["/registi"] },
  { href: "/percorsi", label: "Percorsi", paths: ["/percorsi"] },
];

export const eveningsNavigation: readonly NavigationItem[] = [
  { href: "/serate", label: "In programma", paths: ["/serate"] },
  { href: "/storico", label: "Storico", paths: ["/storico"] },
  { href: "/circoli", label: "I tuoi circoli", paths: ["/circoli"] },
  { href: "/club", label: "Scopri circoli", paths: ["/club", "/persone"] },
];

export function matchesNavigation(pathname: string, item: NavigationItem): boolean {
  return item.paths.some((path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)));
}
