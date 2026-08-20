import Card from '../../shared/components/Card';
import { colors } from '../../theme/colors';

interface SummaryProps {
  isLoading: boolean;
  stats: any;
}

export function DashboardSummary({ isLoading, stats }: SummaryProps) {
  const total = stats.total || 1;
  const pct = (n: number) => Math.round((n / total) * 100);

  const indicators = [
    { label: 'Total Equipos', value: isLoading ? '—' : stats.total || 'N/A', sub: 'Registrados' },
    { label: 'Activos', value: isLoading ? '—' : stats.activos || 'N/A', sub: `${isLoading ? '—' : pct(stats.activos)}% del total` },
    { label: 'Alarmas Pendientes', value: isLoading ? '—' : stats.alarmas || 'N/A', sub: isLoading ? '—' : `${stats.criticas} críticas` },
    { label: 'En Mantenimiento', value: isLoading ? '—' : stats.mantenimiento || 'N/A', sub: isLoading ? '—' : `${pct(stats.mantenimiento)}% del total` },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {indicators.map((kpi, i) => (
          <Card key={i} padding={24} hover={false} style={{ borderLeft: `3px solid ${i === 2 && stats.criticas > 0 ? colors.status.error : colors.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: colors.text.primary, lineHeight: 1, letterSpacing: -1 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, color: colors.text.muted, marginTop: 8 }}>
              {kpi.sub}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}