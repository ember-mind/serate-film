"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/NotificationBell";
import { eveningsNavigation, libraryNavigation, matchesNavigation, primaryNavigation } from "@/lib/navigation";
import styles from "./Editorial.module.css";

function NavigationIcon({ href }: { href: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {href === "/" ? <path d="m3 10 9-7 9 7v10H3z M9 20v-7h6v7" />
        : href === "/film" ? <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></>
          : href === "/serate" ? <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 11h18" /></>
            : <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>}
    </svg>
  );
}

export function Nav({ userName, unreadNotifications }: {
  isAdmin: boolean;
  userName: string;
  unreadNotifications: number;
}) {
  const pathname = usePathname();
  const inLibrary = matchesNavigation(pathname, primaryNavigation[1]);
  const inEvenings = matchesNavigation(pathname, primaryNavigation[2]);
  const sectionLinks = inLibrary ? libraryNavigation : inEvenings ? eveningsNavigation : [];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>Serate <span>Film</span></Link>
          <nav className={styles.desktopNav} aria-label="Principale">
            {primaryNavigation.map((item) => (
              <Link key={item.href} href={item.href} aria-current={matchesNavigation(pathname, item) ? "page" : undefined} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.utility}>
            <NotificationBell initialCount={unreadNotifications} />
            <Link href="/io" className={styles.profile} aria-label={`Il tuo spazio · ${userName}`} title={userName}>
              {userName.trim().slice(0, 1).toLocaleUpperCase("it") || "Io"}
            </Link>
          </div>
        </div>
        {sectionLinks.length > 0 && (
          <nav aria-label={inLibrary ? "Sezioni della cineteca" : "Sezioni delle serate"} className={styles.contextNav}>
            {sectionLinks.map((item) => (
              <Link key={item.href} href={item.href} aria-current={matchesNavigation(pathname, item) ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <nav className={styles.bottomNav} aria-label="Principale">
        {primaryNavigation.map((item) => (
          <Link key={item.href} href={item.href} aria-current={matchesNavigation(pathname, item) ? "page" : undefined} className={styles.navLink}>
            <NavigationIcon href={item.href} />{item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
