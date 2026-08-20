import { colors, spacing } from '../../../theme/colors';
import Layout from '../../../shared/components/Layout';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import Button from '../../../shared/components/Button';

interface Props {
  onNavigate: (page: string) => void;
  onBack?: () => void
}

const mockEventos = [
  { id: 1, equipo: 'BOM-003', estado: 'mantenimiento', motivo: 'Cambio de sellos mecánicos', fecha_inicio: '2026-07-25 09:00', fecha_fin: '2026-07-27 14:00' },
  { id: 2, equipo: 'MOL-005', estado: 'fallo', motivo: 'Falla en rodamiento principal', fecha_inicio: '2026-07-26 22:00', fecha_fin: null },
  { id: 3, equipo: 'VEN-012', estado: 'inactivo', motivo: 'Parada programada', fecha_inicio: '2026-07-20 08:00', fecha_fin: '2026-07-22 18:00' },
];

export default function EventosPage({ onNavigate }: Props) {
  return (
    <Layout
      title="Mantenimiento"
      subtitle="Historial de eventos y estados"
      onBack={() => onNavigate('dashboard')}
    >
      <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg }}>
        <Button variant="primary" icon="➕">Nuevo Evento</Button>
        <Button variant="secondary" icon="📊">Exportar</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {mockEventos.map((evento, i) => (
          <Card
            key={evento.id}
            padding={20}
            className={`animate-fade-in-up stagger-${(i % 6) + 1}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.md }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{evento.equipo}</h3>
                  <Badge
                    text={evento.estado.toUpperCase()}
                    variant={evento.estado === 'activo' ? 'success' : evento.estado === 'fallo' ? 'error' : 'warning'}
                    dot
                  />
                </div>
                <p style={{ color: colors.text.secondary }}>{evento.motivo}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, color: colors.text.muted }}>Inicio: {evento.fecha_inicio}</p>
                {evento.fecha_fin ? (
                  <p style={{ fontSize: 12, color: colors.status.success }}>Fin: {evento.fecha_fin}</p>
                ) : (
                  <p style={{ fontSize: 12, color: colors.status.error, fontWeight: 600 }}>EN CURSO</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
