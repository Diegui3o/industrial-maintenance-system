import { colors } from '../theme/colors';

interface Props {
  text: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'default';
  dot?: boolean;
}

const variants = {
  success: { bg: colors.status.successBg, color: colors.status.success, border: colors.status.success },
  error: { bg: colors.status.errorBg, color: colors.status.error, border: colors.status.error },
  warning: { bg: colors.status.warningBg, color: colors.status.warning, border: colors.status.warning },
  info: { bg: colors.status.infoBg, color: colors.status.info, border: colors.status.info },
  primary: { bg: colors.primaryGhost, color: colors.primary, border: colors.primary },
  default: { bg: colors.borderLight, color: colors.text.secondary, border: colors.border },
};

export default function Badge({ text, variant = 'default', dot = false }: Props) {
  const v = variants[variant];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 50,
      fontSize: 12,
      fontWeight: 600,
      background: v.bg,
      color: v.color,
      border: `1px solid ${v.border}30`,
    }}>
      {dot && <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: v.color,
        display: 'inline-block'
      }} />}
      {text}
    </span>
  );
}