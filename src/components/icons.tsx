/**
 * Inline icon set, Lucide-style: 24-unit grid, stroke 1.75, round caps.
 * Inlined rather than imported so the bundle carries exactly what's used.
 */

type IconProps = { size?: number; className?: string };

function base({ size = 16, className }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
}

export function IconToday(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M3 9h18M8 2.5V5.5M16 2.5V5.5M9 14.5l2 2 4-4" />
    </svg>
  );
}

export function IconPlanner(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M3 9h18M8 2.5V5.5M16 2.5V5.5M7.5 13h3M7.5 17h3M13.5 13h3" />
    </svg>
  );
}

export function IconBank(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6.5 6.5 0 0 0-3.7 11.85c.7.5 1.2 1.26 1.2 2.15h5c0-.89.5-1.65 1.2-2.15A6.5 6.5 0 0 0 12 3Z" />
    </svg>
  );
}

export function IconMetrics(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />
    </svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconChevronLeft(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M14.5 6L8.5 12l6 6" />
    </svg>
  );
}

export function IconChevronRight(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9.5 6l6 6-6 6" />
    </svg>
  );
}

export function IconArrowUp(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

export function IconArrowDown(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

export function IconCamera(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h3l1.5-2.5h7L17 7h3a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V8.5A1.5 1.5 0 0 1 4 7Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function IconTrash(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1.5 1.5 0 0 0 1.5 1.3h7A1.5 1.5 0 0 0 17 20l1-13M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
    </svg>
  );
}

/* --- Platform marks — filled, single-color, drawn to read at 12px --------- */

export function MarkTikTok({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 3c.4 2.2 1.9 3.9 4.4 4.1v3.1c-1.7 0-3.2-.5-4.4-1.4v6.6c0 3.6-2.6 6.1-6 6.1-3.3 0-5.9-2.4-5.9-5.8 0-3.3 2.5-5.8 5.9-5.8.3 0 .7 0 1 .1v3.2a2.7 2.7 0 0 0-1-.2 2.7 2.7 0 0 0-2.7 2.7c0 1.5 1.2 2.7 2.7 2.7 1.6 0 2.9-1.2 2.9-3V3h3.1Z" />
    </svg>
  );
}

export function MarkInstagram({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MarkFacebook({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-7h2.6l.5-3.2h-3.1V8.7c0-.9.3-1.6 1.7-1.6h1.5V4.2c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4v2.7H8v3.2h2.6v7h2.9Z" />
    </svg>
  );
}
