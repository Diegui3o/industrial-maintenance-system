import { colors, radius, shadows } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({ 
  children, variant = 'primary', size = 'md', onClick, type = 'button', 
  disabled, icon, fullWidth 
}: Props) {
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 13, height: 36 },
    md: { padding: '10px 20px', fontSize: 14, height: 44 },
    lg: { padding: '14px 28px', fontSize: 15, height: 52 },
  };
  
  const s = sizes[size];
  
  const variants = {
    primary: {
      background: colors.primary,
      color: '#FFF',
      border: 'none',
      boxShadow: shadows.md,
    },
    secondary: {
      background: colors.surface,
      color: colors.text.primary,
      border: `1.5px solid ${colors.border}`,
      boxShadow: shadows.sm,
    },
    outline: {
      background: 'transparent',
      color: colors.primary,
      border: `1.5px solid ${colors.primary}`,
      boxShadow: 'none',
    },
    ghost: {
      background: 'transparent',
      color: colors.text.secondary,
      border: 'none',
      boxShadow: 'none',
    },
    danger: {
      background: colors.status.error,
      color: '#FFF',
      border: 'none',
      boxShadow: shadows.sm,
    },
  };
  
  const v = variants[variant];
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="btn-hover"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        height: s.height,
        borderRadius: radius.lg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...v,
      }}
    >
      {icon}
      {children}
    </button>
  );
}