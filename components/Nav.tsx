"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  paths: string[];
};

const desktopItems: NavItem[] = [
  { href: "/", label: "Stasera", paths: ["/"] },
  { href: "/film", label: "Cineteca", paths: ["/film", "/watchlist", "/attori", "/registi"] },
  { href: "/serate", label: "Proiezioni", paths: ["/serate"] },
  { href: "/storico", label: "Registro", paths: ["/storico"] },
  { href: "/io", label: "Io", paths: ["/io"] },
];

const mobileItems: NavItem[] = [
  { href: "/", label: "Stasera", paths: ["/"] },
  { href: "/film", label: "Cineteca", paths: ["/film", "/watchlist", "/attori", "/registi"] },
  { href: "/serate", label: "Serate", paths: ["/serate", "/storico"] },
  { href: "/io", label: "Io", paths: ["/io", "/admin"] },
];

export function Nav({ isAdmin, userName }: { isAdmin: boolean; userName: string }) {
  const pathname = usePathname();
  const desktopLinks = isAdmin
    ? [...desktopItems, { href: "/admin", label: "Regia", paths: ["/admin"] }]
    : desktopItems;

  const isActive = (item: NavItem) =>
    item.paths.some((path) => (path === "/" ? pathname === "/" : pathname.startsWith(path)));

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
          <span className="eyebrow hidden sm:block">{userName}</span>
        </div>
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
