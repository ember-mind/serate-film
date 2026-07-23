"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Stasera" },
  { href: "/film", label: "Cineteca" },
  { href: "/attori", label: "Attori" },
  { href: "/registi", label: "Registi" },
  { href: "/serate", label: "Proiezioni" },
  { href: "/storico", label: "Registro" },
];

export function Nav({ isAdmin, userName }: { isAdmin: boolean; userName: string }) {
  const pathname = usePathname();
  const links = isAdmin ? [...items, { href: "/admin", label: "Regia" }] : items;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* insegna */}
      <header className="sticky top-0 z-20 border-b border-riga bg-notte/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="titlecard text-lg text-schermo">
            Serate<span className="text-proiettore"> Film</span>
          </Link>
          <nav className="hidden gap-6 sm:flex" aria-label="Principale">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`border-b-2 pb-0.5 font-mono text-xs uppercase tracking-[0.22em] transition-colors ${
                  isActive(l.href)
                    ? "border-proiettore text-proiettore"
                    : "border-transparent text-fumo hover:text-schermo"
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
            className={`flex-1 py-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] ${
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
