export function VariadorIcon({ color = '#A16207', size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="4" y="8" width="16" height="8" rx="2" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}