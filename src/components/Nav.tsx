'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconToday, IconPlanner, IconBank, IconMetrics } from './icons';

const LINKS = [
  { href: '/', label: 'Today', Icon: IconToday },
  { href: '/planner', label: 'Planner', Icon: IconPlanner },
  { href: '/bank', label: 'Bank', Icon: IconBank },
  { href: '/metrics', label: 'Metrics', Icon: IconMetrics },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Desktop / tablet */}
      <header className="sticky top-0 z-40 hidden border-b border-white/[0.07] bg-noir/85 backdrop-blur-md sm:block">
        <div className="mx-auto flex max-w-6xl items-center gap-10 px-6">
          <Link href="/" className="display py-4 text-xl tracking-wide text-bone">
            TA<span className="mx-px text-gold">·</span>Auto
            <span className="ml-2.5 align-middle text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-faint">
              Content
            </span>
          </Link>

          <nav className="flex gap-7">
            {LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative py-4 text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                    active ? 'text-bone' : 'text-muted hover:text-bone'
                  }`}
                >
                  {label}
                  {/* Active indicator — hairline of gold on the shelf edge */}
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 -bottom-px h-px transition-opacity duration-200 ${
                      active ? 'bg-gold opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile: bottom bar, thumb-reachable on-site. */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-noir/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
        <div className="flex">
          {LINKS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-1 pb-2.5 pt-3 text-[10px] font-medium tracking-wide transition-colors duration-200 ${
                  active ? 'text-gold' : 'text-faint'
                }`}
              >
                <Icon size={19} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
