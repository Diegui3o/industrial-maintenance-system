import { colors, spacing } from '../theme/colors'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'

interface Props {
  equipo: any
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
}

const estadoColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  activo: 'success',
  fallo: 'error',
  mantenimiento: 'warning',
  inactivo: 'default',
}

export default function EquipoDetailPage({ equipo, onNavigate, onBack }: Props) {
  if (!equipo) return null

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 14, color: colors.text.primary }}>{value ?? '—'}</p>
    </div>
  )

  return (
    <Layout title={equipo.codigo || 'Equipo'} subtitle={equipo.nombre} onBack={onBack}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Información General</h3>
          <Field label="Código" value={equipo.codigo} />
          <Field label="Nombre" value={equipo.nombre} />
          <Field label="Área" value={equipo.area} />
          <Field label="Tipo" value={equipo.tipo} />
          <Field label="Fase" value={equipo.fase} />
          <Field label="Fabricante" value={equipo.fabricante} />
          <Field label="Modelo" value={equipo.modelo} />
          <Field label="N° Serie" value={equipo.numero_serie} />
          <Field label="Fecha Instalación" value={equipo.fecha_instalacion ? new Date(equipo.fecha_instalacion).toLocaleDateString('es-PE') : '—'} />
          <div style={{ marginTop: 12 }}>
            <Badge text={(equipo.estado_equipo || '').toUpperCase()} variant={estadoColors[equipo.estado_equipo] || 'default'} dot />
            {equipo.critico && <Badge text="CRÍTICO" variant="error" />}
          </div>
        </Card>

        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Jerarquía y Ubicación</h3>
          <Field label="Activo Padre (ID)" value={equipo.activo_padre_id} />
          <Field label="Nivel Jerarquía" value={equipo.nivel_jerarquia} />
          <Field label="Tag Industrial" value={equipo.tag} />
          <Field label="Ubicación Física" value={equipo.ubicacion_fisica} />
          <Field label="IP" value={equipo.ip} />
          <Field label="Descripción" value={equipo.descripcion_larga} />
        </Card>
      </div>

      <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg }}>
        <Button icon="✏️" variant="secondary" onClick={() => onNavigate('editar-equipo', equipo)}>Editar</Button>
        <Button icon="🔗" variant="secondary" onClick={() => onNavigate('conexiones', equipo)}>Conexiones</Button>
        <Button icon="📋" variant="secondary" onClick={() => onNavigate('mantenimiento', equipo)}>Mantenimiento</Button>
      </div>
    </Layout>
  )
}