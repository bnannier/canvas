interface CanvasMarkProps {
  size?: number;
}

export function CanvasMark({ size = 22 }: CanvasMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#cm-grad)" />
      <path d="M7 9.5l5 -3 5 3v5l-5 3 -5 -3z" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <defs>
        <linearGradient id="cm-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--orb-indigo, #6366f1)" />
          <stop offset="100%" stopColor="var(--orb-violet, #8b5cf6)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
