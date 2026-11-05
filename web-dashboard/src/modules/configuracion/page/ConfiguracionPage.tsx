import { colors, spacing } from '../../../theme/colors';
import Layout from '../../../shared/components/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';

interface Props {
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
}

export default function ConfiguracionPage({ onNavigate }: Props) {
  return (
    <Layout
      title="Configuración"
      subtitle="Ajustes del sistema y planta"
      onBack={() => onNavigate('dashboard')}
    >
      <div style={{ maxWidth: 700 }}>
        
        {/* NUEVA TARJETA: GESTIÓN DE UMBRALES Y TAGS PI */}
        <Card padding={24} hover={false} style={{ marginBottom: spacing.md, borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: 6, fontSize: 16, color: '#0f172a' }}>⚙️ Umbrales y Asociación de Tags PI</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Vincula atributos del PI System a tus equipos y configura rangos operativos, severidades y modos de fallo.
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => onNavigate('umbrales-config')}
            >
              Configurar Umbrales
            </Button>
          </div>
        </Card>

        <Card padding={24} hover={false} style={{ marginBottom: spacing.md }}>
          <h3 style={{ marginBottom: spacing.md, fontSize: 16 }}>⚙️ General</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Nombre de la Planta
              </label>
              <input defaultValue="NEXA Resources - Planta Norte" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
                Zona Horaria
              </label>
              <select defaultValue="America/Lima" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
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
          <Button onClick={() => alert("¡Cambios guardados con éxito!")}>Guardar Cambios</Button>
        </div>
      </div>
    </Layout>
  );
}
