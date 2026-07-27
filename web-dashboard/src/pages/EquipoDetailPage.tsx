import { colors, spacing } from '../theme/colors';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

interface Props {
  equipo: any;
  onNavigate: (page: string) => void;
  onBack?: () => void
}

export default function EquipoDetailPage({ equipo, onNavigate }: Props) {
  if (!equipo) return null;

  const estadoColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
    activo: 'success', fallo: 'error', mantenimiento: 'warning', inactivo: 'default'
  };

  const infoItems = [
    { label: 'Código', value: equipo.codigo },
    { label: 'Área', value: equipo.area || '—' },
    { label: 'Tipo', value: equipo.tipo || '—' },
    { label: 'Fase', value: equipo.fase || '—' },
    { label: 'Fabricante', value: equipo.fabricante || '—' },
    { label: 'Modelo', value: equipo.modelo || '—' },
    { label: 'N° Serie', value: equipo.numero_serie || '—' },
    { label: 'Instalación', value: equipo.fecha_instalacion || '—' },
  ];

  return (
    <Layout
      title={equipo.nombre}
      subtitle={`${equipo.codigo} · ${equipo.area || 'Sin área'}`}
      onBack={() => onNavigate('equipos')}
    >
      {/* Status bar */}
      <div style={{
        display: 'flex',
        gap: spacing.md,
        marginBottom: spacing.lg,
        flexWrap: 'wrap',
      }}>
        <Card padding={16} hover={false} style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 12, color: colors.text.muted, marginBottom: 4 }}>Estado Actual</p>
          <Badge
            text={equipo.estado_equipo.toUpperCase()}
            variant={estadoColors[equipo.estado_equipo] || 'default'}
            dot
          />
        </Card>
        <Card padding={16} hover={false} style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 12, color: colors.text.muted, marginBottom: 4 }}>Crítico</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: equipo.critico ? colors.status.error : colors.text.secondary }}>
            {equipo.critico ? 'SÍ' : 'NO'}
          </p>
        </Card>
        <Card padding={16} hover={false} style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 12, color: colors.text.muted, marginBottom: 4 }}>Última actualización</p>
          <p style={{ fontSize: 14, fontWeight: 600 }}>{equipo.actualizado_en || equipo.fecha_creacion}</p>
        </Card>
      </div>

      {/* Info grid */}
      <Card padding={24} hover={false}>
        <h3 style={{ marginBottom: spacing.md, fontSize: 16 }}>Información General</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: spacing.md,
        }}>
          {infoItems.map(item => (
            <div key={item.label}>
              <p style={{ fontSize: 11, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                {item.label}
              </p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: spacing.md,
        marginTop: spacing.lg,
        flexWrap: 'wrap',
      }}>
        <Button variant="secondary" icon="🔧">Reportar Mantenimiento</Button>
        <Button variant="outline" icon="📊">Ver Métricas</Button>
        <Button variant="ghost" icon="📝">Editar</Button>
      </div>
    </Layout>
  );
}