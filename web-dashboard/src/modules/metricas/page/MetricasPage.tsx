import { colors, spacing } from '../../../theme/colors';
import Layout from '../../../shared/components/Layout';
import Card from '../../../shared/components/Card';
import StatCard from '../../../dashboard/components/StatCard';

interface Props {
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
}

export default function MetricasPage({ onNavigate }: Props) {
  return (
    <Layout
      title="Métricas"
      subtitle="KPIs y análisis de rendimiento"
      onBack={() => onNavigate('dashboard')}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing.md,
        marginBottom: spacing.lg,
      }}>
        <StatCard icon="⏱️" label="Horas Operación (Hoy)" value="18.5h" trend="+2.3h" trendUp color="#10B981" />
        <StatCard icon="❌" label="Horas Fallo (Hoy)" value="1.2h" trend="-0.5h" trendUp color="#EF4444" />
        <StatCard icon="📈" label="Disponibilidad" value="94%" trend="+1.2%" trendUp color="#3B82F6" />
        <StatCard icon="🔧" label="MTTR Promedio" value="2.4h" trend="-0.3h" trendUp color="#F59E0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: spacing.md, fontSize: 16 }}>Disponibilidad por Equipo</h3>
          {['COMP-001', 'BOM-003', 'GEN-002', 'MOL-005'].map((eq, i) => (
            <div key={eq} style={{ marginBottom: spacing.md }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{eq}</span>
                <span style={{ fontSize: 14, color: colors.text.muted }}>{95 - i * 5}%</span>
              </div>
              <div style={{ height: 8, background: colors.borderLight, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${95 - i * 5}%`,
                  background: i === 3 ? colors.status.error : colors.status.success,
                  borderRadius: 4,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          ))}
        </Card>

        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: spacing.md, fontSize: 16 }}>Alarmas por Tipo (Semana)</h3>
          {[
            { label: 'Sobrecalentamiento', value: 12, color: colors.status.error },
            { label: 'Vibración', value: 8, color: colors.status.warning },
            { label: 'Presión', value: 5, color: colors.status.info },
            { label: 'Parada', value: 2, color: colors.text.muted },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
              <span style={{ flex: 1, fontSize: 14 }}>{item.label}</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{item.value}</span>
            </div>
          ))}
        </Card>
      </div>
    </Layout>
  );
}