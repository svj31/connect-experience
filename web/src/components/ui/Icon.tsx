import type { SVGProps } from "react";

/** Hand drawn line icons. Every icon is decorative unless given a label. */
const PATHS: Record<string, React.ReactNode> = {
  wyr: (<><path d="M12 20V11" /><path d="M12 11 6 5" /><path d="m12 11 6-6" /><path d="M4 9V5h4" /><path d="M20 9V5h-4" /></>),
  insync: (<><circle cx="9" cy="12" r="5" /><circle cx="15" cy="12" r="5" /></>),
  ttl: (<><path d="M4 6h10" /><path d="M4 12h10" /><path d="M4 18h10" /><path d="m17 16 4 4" /><path d="m21 16-4 4" /><path d="m17 5 1.5 1.5L21 4" /><path d="m17 11 1.5 1.5L21 10" /></>),
  draw: (<><path d="M4 20c2-1 3-3 5-3s2 2 4 2" /><path d="m14 4 6 6-8 8-4 1 1-4z" /></>),
  story: (<><path d="M4 5h6a3 3 0 0 1 2 1v13a3 3 0 0 0-2-1H4z" /><path d="M20 5h-6a3 3 0 0 0-2 1v13a3 3 0 0 1 2-1h6z" /></>),
  constellation: (<><circle cx="5" cy="17" r="1.6" /><circle cx="10" cy="8" r="1.6" /><circle cx="16" cy="13" r="1.6" /><circle cx="20" cy="5" r="1.6" /><path d="m6 15.5 3-6" /><path d="m11.4 9 3.3 3" /><path d="m17 11.6 2.2-5" /></>),
  connect4: (<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.5" /><circle cx="12" cy="9" r="1.5" /><circle cx="16" cy="9" r="1.5" /><circle cx="8" cy="15" r="1.5" /><circle cx="12" cy="15" r="1.5" /><circle cx="16" cy="15" r="1.5" /></>),
  memory: (<><rect x="3" y="5" width="8" height="12" rx="1.5" /><rect x="13" y="7" width="8" height="12" rx="1.5" /><path d="M7 9v4" /><path d="M5 11h4" /></>),
  watch: (<><rect x="3" y="5" width="18" height="12" rx="2" /><path d="m10 8.5 5 2.5-5 2.5z" /><path d="M8 21h8" /></>),
  chat: (<><path d="M4 5h16v10H9l-5 4z" /></>),
  heart: (<><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></>),
  laugh: (<><circle cx="12" cy="12" r="8" /><path d="M8 13c1 2.5 7 2.5 8 0z" /><path d="M9 9.5h.01" /><path d="M15 9.5h.01" /></>),
  wow: (<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="15" r="1.8" /><path d="M9 9.5h.01" /><path d="M15 9.5h.01" /></>),
  clap: (<><path d="M12 3v3" /><path d="m6 5 2 2.5" /><path d="m18 5-2 2.5" /><path d="M8 13a4 4 0 0 0 8 0v-2a4 4 0 0 0-8 0z" /><path d="M7 21h10" /></>),
  fire: (<><path d="M12 21a6 6 0 0 0 6-6c0-4-3-5-3-10-2 1-4 3-4 6-1-1-1.5-2-1.5-3C7 10 6 12.5 6 15a6 6 0 0 0 6 6z" /></>),
  shield: (<><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>),
  flag: (<><path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" /></>),
  lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  unlock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 7.5-2" /></>),
  eye: (<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.5" /></>),
  eyeOff: (<><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.6" /><path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 6 10 6a10 10 0 0 0 5.4-1.6" /></>),
  arrowRight: (<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
  arrowLeft: (<><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>),
  close: (<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>),
  menu: (<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>),
  check: (<><path d="m5 12 5 5 9-10" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  logout: (<><path d="M15 4h4v16h-4" /><path d="M10 8 6 12l4 4" /><path d="M6 12h10" /></>),
  copy: (<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4H4v12h4" /></>),
  send: (<><path d="M4 12 20 4l-4 16-4-7z" /><path d="m12 13 8-9" /></>),
  sparkle: (<><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m6 6 2.5 2.5" /><path d="m15.5 15.5 2.5 2.5" /><path d="m18 6-2.5 2.5" /><path d="M8.5 15.5 6 18" /></>),
  undo: (<><path d="M9 7 4 12l5 5" /><path d="M4 12h10a6 6 0 0 1 0 12h-2" /></>),
  trash: (<><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" /></>),
  save: (<><path d="M5 4h11l3 3v13H5z" /><path d="M8 4v5h7V4" /><rect x="8" y="13" width="8" height="5" /></>),
  refresh: (<><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.5a5 5 0 0 1 5.5 5" /></>),
  compass: (<><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>),
  plus: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  door: (<><path d="M14 3H6v18h8" /><path d="M18 12h-8" /><path d="m15 9 3 3-3 3" /></>),
  play: (<><path d="M7 5v14l12-7z" /></>),
  pause: (<><path d="M8 5v14" /><path d="M16 5v14" /></>),
  // Memory card symbols
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v3" /><path d="M12 19v3" /><path d="M2 12h3" /><path d="M19 12h3" /><path d="m5 5 2 2" /><path d="m17 17 2 2" /><path d="m19 5-2 2" /><path d="m7 17-2 2" /></>),
  moon: (<><path d="M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10z" /></>),
  leaf: (<><path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z" /><path d="M5 19 13 11" /></>),
  wave: (<><path d="M2 10c3-3 5-3 7 0s4 3 7 0 4-3 6 0" /><path d="M2 16c3-3 5-3 7 0s4 3 7 0 4-3 6 0" /></>),
  key: (<><circle cx="7.5" cy="14.5" r="3.5" /><path d="m10 12 9-9" /><path d="m16 6 3 3" /><path d="m14 8 2 2" /></>),
  note: (<><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>),
  kite: (<><path d="M12 2 19 9l-7 9-7-9z" /><path d="M12 2v16" /><path d="M5 9h14" /><path d="M12 18c0 2 1.5 3.5 3 3.5" /></>),
  cup: (<><path d="M5 8h12v5a6 6 0 0 1-12 0z" /><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" /><path d="M9 3v2" /><path d="M13 3v2" /></>),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, label, ...rest }: { name: string; size?: number; label?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {PATHS[name] ?? PATHS.sparkle}
    </svg>
  );
}
