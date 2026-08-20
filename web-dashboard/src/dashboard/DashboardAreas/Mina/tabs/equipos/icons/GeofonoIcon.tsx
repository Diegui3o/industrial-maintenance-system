export function GeofonoIcon({ color = '#7C3AED', size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2c3 3 3 17 0 20c-3-3-3-17 0-20z" />
    </svg>
  );
}