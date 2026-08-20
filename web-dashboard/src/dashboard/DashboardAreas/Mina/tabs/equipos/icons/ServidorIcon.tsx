export function ServidorIcon({ color = '#C45A1A', size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="6" rx="2" />
      <rect x="4" y="14" width="16" height="6" rx="2" />
      <circle cx="8" cy="7" r="1" />
      <circle cx="8" cy="17" r="1" />
    </svg>
  );
}