export function EstacionIcon({ color = '#2563A0', size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M12 1v6M8 7h8M6 7v16M18 7v16M6 23h12" />
      <circle cx="12" cy="4" r="2" />
    </svg>
  );
}