import { colors, spacing } from '../theme/colors';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

interface Props {
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
}

export default function ConfiguracionPage({ onNavigate }: Props) {
  return (
    <Layout
      title="Configuración"
      subtitle="Ajustes del sistema"
      onBack={() => onNavigate('dashboard')}
    >
      <div style={{ maxWidth: 600 }}>
        <Card padding={24} hover={false} style={{ marginBottom: spacing.md }}>
          <h3 style={{ marginBottom: spacing.md, fontSize: 16 }}>⚙️ General</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Nombre de la Planta
              </label>
              <input defaultValue="NEXA Resources - Planta Norte" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Zona Horaria
              </label>
              <select defaultValue="America/Lima">
                <option>America/Lima</option>
                <option>America/Mexico_City</option>
                <option>America/Santiago</option>
              </select>
            </div>
          </div>
        </Card>

        <Card padding={24} hover={false} style={{ marginBottom: spacing.md }}>
          <h3 style={{ marginBottom: spacing.md, fontSize: 16 }}>🔔 Notificaciones</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
            {[
              'Alertas por email',
              'Alertas por SMS',
              'Notificaciones push',
              'Resumen diario',
            ].map(item => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, padding: '8px 0', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: 'auto' }} />
                <span style={{ fontSize: 14 }}>{item}</span>
              </label>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'flex-end' }}>
          <Button variant="ghost">Restaurar</Button>
          <Button icon="💾">Guardar Cambios</Button>
        </div>
      </div>
    </Layout>
  );
}