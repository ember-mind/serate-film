"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Stasera" },
  { href: "/film", label: "Film" },
  { href: "/serate", label: "Serate" },
  { href: "/storico", label: "Storico" },
];

export function Nav({ isAdmin, userName }: { isAdmin: boolean; userName: string }) {
  const pathname = usePathname();
  const links = isAdmin ? [...items, { href: "/admin", label: "Gruppo" }] : items;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* testata desktop */}
      <header className="beam sticky top-0 z-20 border-b border-riga bg-notte/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-display text-xl font-bold tracking-tight text-schermo">
            Serate<span className="text-proiettore"> Film</span>
          </Link>
          <nav className="hidden gap-1 sm:flex" aria-label="Principale">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  isActive(l.href)
                    ? "bg-proiettore font-semibold text-notte-fonda"
                    : "text-fumo hover:text-schermo"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <span className="eyebrow hidden sm:block">{userName}</span>
        </div>
      </header>

      {/* barra inferiore mobile */}
      <nav
        aria-label="Principale"
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-riga bg-notte-fonda/95 backdrop-blur sm:hidden"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(l.href) ? "page" : undefined}
            className={`flex-1 py-3 text-center text-xs font-medium ${
              isActive(l.href) ? "text-proiettore" : "text-fumo"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
