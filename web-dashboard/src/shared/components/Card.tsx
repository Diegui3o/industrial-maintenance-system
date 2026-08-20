import { colors, radius, shadows } from '../../theme/colors';

interface Props {
  children: React.ReactNode;
  padding?: number;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export default function Card({ children, padding = 20, hover = true, onClick, style, className }: Props) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: colors.surface,
        borderRadius: radius.md,
        padding,
        border: `1px solid ${colors.borderLight}`,
        boxShadow: shadows.sm,
        cursor: onClick ? 'pointer' : 'default',
        transition: hover ? 'all 0.2s ease' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}