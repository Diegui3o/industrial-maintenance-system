import Card from '../../shared/components/Card';
import { colors, spacing } from '../../theme/colors';

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export default function StatCard({ icon, label, value, trend, trendUp, color = colors.primary }: Props) {
  return (
    <Card padding={20} hover>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}>
          {icon}
        </div>
        {trend && (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: trendUp ? colors.status.success : colors.status.error,
            background: trendUp ? colors.status.successBg : colors.status.errorBg,
            padding: '2px 8px',
            borderRadius: 20,
          }}>
            {trend}
          </span>
        )}
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, color: colors.text.primary, lineHeight: 1.2 }}>{value}</p>
      <p style={{ fontSize: 13, color: colors.text.muted, marginTop: 4 }}>{label}</p>
    </Card>
  );
}