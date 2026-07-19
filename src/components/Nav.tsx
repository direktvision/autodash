'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Today' },
  { href: '/planner', label: 'Planner' },
  { href: '/bank', label: 'Bank' },
  { href: '/metrics', label: 'Metrics' },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Desktop / tablet */}
      <header className="sticky top-0 z-40 hidden border-b border-white/10 bg-noir/90 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <Link href="/" className="display text-lg tracking-wide text-bone">
            TA<span className="text-gold">·</span>Auto
          </Link>
          <nav className="flex gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-white/5 text-gold'
                    : 'text-muted hover:text-bone'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile: bottom bar, thumb-reachable on-site. */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-noir/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <div className="flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 py-3 text-center text-xs transition-colors ${
                isActive(link.href) ? 'text-gold' : 'text-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
