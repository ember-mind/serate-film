"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/NotificationBell";

type NavItem = {
  href: string;
  label: string;
  paths: string[];
};

const desktopItems: NavItem[] = [
  { href: "/", label: "Stasera", paths: ["/", "/attivita", "/trova-film"] },
  { href: "/film", label: "Cineteca", paths: ["/film", "/watchlist", "/attori", "/registi"] },
  { href: "/serate", label: "Proiezioni", paths: ["/serate", "/storico"] },
  { href: "/circoli", label: "Circoli", paths: ["/circoli", "/club", "/persone"] },
  { href: "/io", label: "Io", paths: ["/io", "/admin"] },
];

const mobileItems: NavItem[] = [
  { href: "/", label: "Stasera", paths: ["/"] },
  { href: "/film", label: "Cineteca", paths: ["/film", "/watchlist", "/attori", "/registi"] },
  { href: "/serate", label: "Serate", paths: ["/serate", "/storico"] },
  { href: "/io", label: "Io", paths: ["/io", "/admin"] },
];

const libraryItems = [
  { href: "/film", label: "Film" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/attori", label: "Attori" },
  { href: "/registi", label: "Registi" },
];

export function Nav({
  userName,
  unreadNotifications,
}: {
  isAdmin: boolean;
  userName: string;
  unreadNotifications: number;
}) {
  const pathname = usePathname();
  const desktopLinks = desktopItems;

  const isActive = (item: NavItem) =>
    item.paths.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));
  const isLibraryItemActive = (href: string) => pathname.startsWith(href);
  const isInLibrary = libraryItems.some((item) => isLibraryItemActive(item.href));

  return (
    <>
      {/* insegna */}
      <header className="sticky top-0 z-20 border-b border-riga bg-notte/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="titlecard text-lg text-schermo">
            Serate<span className="text-proiettore"> Film</span>
          </Link>
          <nav className="hidden gap-6 sm:flex" aria-label="Principale">
            {desktopLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item) ? "page" : undefined}
                className={`border-b-2 pb-0.5 font-mono text-xs uppercase tracking-[0.22em] transition-colors ${
                  isActive(item)
                    ? "border-proiettore text-proiettore"
                    : "border-transparent text-fumo hover:text-schermo"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <NotificationBell initialCount={unreadNotifications} />
            <span className="eyebrow hidden sm:block">{userName}</span>
          </div>
        </div>
        {isInLibrary && (
          <nav
            aria-label="Sezioni della cineteca"
            className="mx-auto flex max-w-5xl justify-center gap-5 border-t border-riga/60 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] sm:gap-8"
          >
            {libraryItems.map((item) => {
              const active = isLibraryItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "text-proiettore"
                      : "text-fumo transition-colors hover:text-schermo"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* barra inferiore mobile */}
      <nav
        aria-label="Principale"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-riga bg-notte-fonda/95 backdrop-blur sm:hidden"
      >
        {mobileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item) ? "page" : undefined}
            className={`min-w-0 py-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] ${
              isActive(item) ? "text-proiettore" : "text-fumo"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
