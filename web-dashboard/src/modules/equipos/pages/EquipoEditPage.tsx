import Layout from '../../../shared/components/Layout'
import Card from '../../../shared/components/Card'
import Button from '../../../shared/components/Button'
import { colors, spacing } from '../../../theme/colors'
import { useEquipoEdit } from '../hooks/useEquipoEdit'

interface Props {
  equipo: any
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
}

export default function EquipoEditPage({ equipo, onNavigate, onBack }: Props) {
  const { form, update, mutation, feedback, errorMsg } = useEquipoEdit(equipo.id, equipo, onNavigate)

  const Field = ({ label, field, type = 'text', placeholder }: any) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted, display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        value={form[field] ?? ''}
        onChange={e => update({ [field]: e.target.value })}
        placeholder={placeholder}
        style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 13 }}
      />
    </div>
  )

  return (
    <Layout title={`Editar: ${equipo.codigo}`} subtitle={equipo.nombre} onBack={onBack || (() => onNavigate('equipo-detalle', equipo))}>
      {feedback === 'success' && (
        <div style={{ background: colors.status.successBg, color: colors.status.success, padding: '14px 20px', borderRadius: 12, marginBottom: 20 }}>
          ✅ Equipo actualizado correctamente
        </div>
      )}
      {feedback === 'error' && (
        <div style={{ background: colors.status.errorBg, color: colors.status.error, padding: '14px 20px', borderRadius: 12, marginBottom: 20 }}>
          ❌ Error al actualizar: {errorMsg || 'Revisa los datos e intenta de nuevo'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Datos Generales</h3>
          <Field label="Código" field="codigo" />
          <Field label="Nombre" field="nombre" />
          <Field label="Área" field="area" />
          <Field label="Tipo" field="tipo" />
          <Field label="Fase" field="fase" />
          <Field label="Fabricante" field="fabricante" />
          <Field label="Modelo" field="modelo" />
          <Field label="N° Serie" field="numero_serie" />
          <Field label="Fecha Instalación" field="fecha_instalacion" type="date" />

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted, display: 'block', marginBottom: 4 }}>Estado</label>
            <select value={form.estado_equipo} onChange={e => update({ estado_equipo: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 13 }}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="fallo">Fallo</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.critico} onChange={e => update({ critico: e.target.checked })} />
            Equipo crítico
          </label>
        </Card>

        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Jerarquía</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted, display: 'block', marginBottom: 4 }}>Activo Padre</label>
            <select value={form.activo_padre_id ?? ''} onChange={e => update({ activo_padre_id: e.target.value ? Number(e.target.value) : null })}
              style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 13 }}>
              <option value="">Ninguno</option>
            </select>
          </div>
          <Field label="Nivel Jerarquía" field="nivel_jerarquia" />
          <Field label="Tag Industrial" field="tag" placeholder="ZS-2020005B" />
          <Field label="Ubicación Física" field="ubicacion_fisica" placeholder="Tablero RIO-001" />
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted, display: 'block', marginBottom: 4 }}>Descripción</label>
            <textarea value={form.descripcion_larga ?? ''} onChange={e => update({ descripcion_larga: e.target.value })}
              rows={3}
              style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
        </Card>

        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Dispositivo de Red</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Tipo Dispositivo" field="tipo_dispositivo" />
            <Field label="IP" field="ip" />
            <Field label="Puerto" field="puerto" />
            <Field label="Protocolo" field="protocolo" />
            <Field label="Usuario Red" field="usuario_red" />
            <Field label="Password" field="password_hash" type="password" />
          </div>
        </Card>

        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Monitoreo por Ping</h3>
          <div style={{ marginBottom: 16, padding: 12, background: colors.background, borderRadius: 8 }}>
            <p style={{ fontSize: 13, color: colors.text.secondary }}>
              💡 Si pones una IP, el sistema hará ping automáticamente. Si la dejas vacía, no se monitoreará.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="IP a monitorear" field="endpoint" placeholder="192.168.1.100" />
            <Field label="Intervalo (segundos)" field="intervalo_segundos" placeholder="60" />
            <Field label="Timeout (segundos)" field="timeout_segundos" placeholder="10" />
            <Field label="Reintentos antes de fallo" field="reintentos" placeholder="3" />
          </div>
        </Card>
      </div>  
      <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg, justifyContent: 'flex-end' }}>
        <Button icon="💾" onClick={() => {
          console.log('Endpoint actual:', form.endpoint)
          console.log('IP dispositivo:', form.ip)
          mutation.mutate()
        }} disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </Layout>
  )
}