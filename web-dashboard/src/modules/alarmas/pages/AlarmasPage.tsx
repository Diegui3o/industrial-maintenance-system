import { colors, spacing } from '../../../theme/colors';
import Layout from '../../../shared/components/Layout';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import Button from '../../../shared/components/Button';

interface Props {
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
}

const mockAlarmas = [
  { id: 1, equipo: 'COMP-001', tipo: 'Sobrecalentamiento', mensaje: 'Temperatura excede 85°C', severidad: 'alta', estado: 'activa', fecha: '2026-07-27 10:30' },
  { id: 2, equipo: 'BOM-003', tipo: 'Vibración', mensaje: 'Vibración anómala detectada', severidad: 'media', estado: 'atendida', fecha: '2026-07-27 08:15' },
  { id: 3, equipo: 'MOL-005', tipo: 'Parada', mensaje: 'Equipo detenido por fallo', severidad: 'critica', estado: 'activa', fecha: '2026-07-26 22:00' },
];

const severidadColors = {
  baja: 'info',
  media: 'warning',
  alta: 'warning',
  critica: 'error',
} as const;

const estadoColors = {
  activa: 'error',
  atendida: 'info',
  cerrada: 'success',
} as const;

export default function AlarmasPage({ onNavigate }: Props) {
  return (
    <Layout
      title="Alarmas"
      subtitle="Monitoreo de alertas del sistema"
      onBack={() => onNavigate('dashboard')}
    >
      <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg, flexWrap: 'wrap' }}>
        <Card padding={16} hover={false} style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: colors.text.muted }}>Activas</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: colors.status.error }}>2</p>
        </Card>
        <Card padding={16} hover={false} style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: colors.text.muted }}>Atendidas Hoy</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: colors.status.info }}>1</p>
        </Card>
        <Card padding={16} hover={false} style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: colors.text.muted }}>Críticas</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: colors.status.error }}>1</p>
        </Card>
      </div>

      <Card padding={0} hover={false}>
        <table>
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Tipo</th>
              <th>Mensaje</th>
              <th>Severidad</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mockAlarmas.map(alarma => (
              <tr key={alarma.id}>
                <td style={{ fontWeight: 600 }}>{alarma.equipo}</td>
                <td>{alarma.tipo}</td>
                <td>{alarma.mensaje}</td>
                  <Badge text={alarma.severidad.toUpperCase()} variant={severidadColors[alarma.severidad as keyof typeof severidadColors]} />
                  <Badge text={alarma.estado.toUpperCase()} variant={estadoColors[alarma.estado as keyof typeof estadoColors]} dot />
                <td style={{ color: colors.text.muted, fontSize: 13 }}>{alarma.fecha}</td>
                <td>
                  <Button size="sm" variant="ghost">Ver</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Layout>
  );
}