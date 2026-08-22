// web-dashboard/src/modules/equipos/pages/EquipoDetailPage.tsx
import { useState, useEffect } from 'react'
import Layout from '../../../shared/components/Layout'
import Card from '../../../shared/components/Card'
import Badge from '../../../shared/components/Badge'
import Button from '../../../shared/components/Button'
import { getEquipo, getEquipoTags, getEquipoTiempoReal } from '../../../shared/services/api'
import { spacing } from '../../../theme/colors'

interface Props {
  equipo: { id: number }
  onNavigate: (page: string, params?: any) => void
  onBack: () => void
}

export default function EquipoDetailPage({ equipo, onNavigate, onBack }: Props) {
  const [detalle, setDetalle] = useState<any>(null)
  const [dispositivo, setDispositivo] = useState<any>(null)
  const [ping, setPing] = useState<any>(null)
  const [tags, setTags] = useState<any[]>([])  // ← AGREGADO
  const [tiempoReal, setTiempoReal] = useState<any[]>([])  // ← AGREGADO
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await getEquipo(equipo.id)
        setDetalle(data.equipo || data)
        setDispositivo(data.dispositivo || null)
        setPing(data.ping || null)

        // Cargar tags del equipo
        const tagsData = await getEquipoTags(equipo.id)
        setTags(tagsData || [])

        // Cargar tiempo real
        const tiempoRealData = await getEquipoTiempoReal(equipo.id)
        setTiempoReal(tiempoRealData || [])
      } catch (error) {
        console.error('Error cargando equipo:', error)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [equipo.id])

  if (loading) {
    return (
      <Layout title="Cargando..." onBack={onBack}>
        <div style={{ textAlign: 'center', padding: 40 }}>Cargando...</div>
      </Layout>
    )
  }

  if (!detalle) {
    return (
      <Layout title="Equipo no encontrado" onBack={onBack}>
        <div style={{ textAlign: 'center', padding: 40 }}>El equipo no existe</div>
      </Layout>
    )
  }

  return (
    <Layout title={`Equipo: ${detalle.nombre}`} subtitle={detalle.codigo} onBack={onBack}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
        {/* Datos básicos */}
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Datos Básicos</h3>
          <Field label="Código" value={detalle.codigo} />
          <Field label="Nombre" value={detalle.nombre} />
          <Field label="Área" value={detalle.area} />
          <Field label="Tipo" value={detalle.tipo} />
          <Field label="Fase o Nivel" value={detalle.fase} />
          <Field label="Fabricante" value={detalle.fabricante} />
          <Field label="Modelo" value={detalle.modelo} />
          <Field label="N° Serie" value={detalle.numero_serie} />
          <Field label="Fecha Instalación" value={detalle.fecha_instalacion ? new Date(detalle.fecha_instalacion).toLocaleDateString('es-PE') : '—'} />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <Badge text={(detalle.estado_equipo || '').toUpperCase()} variant={detalle.estado_equipo === 'activo' ? 'success' : detalle.estado_equipo === 'fallo' ? 'error' : 'warning'} dot />
            {detalle.critico && <Badge text="CRÍTICO" variant="error" />}
          </div>
        </Card>

        {/* Jerarquía */}
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Jerarquía y Ubicación</h3>
          <Field label="Activo Padre (ID)" value={detalle.activo_padre_id} />
          <Field label="Nivel Jerarquía" value={detalle.nivel_jerarquia} />
          <Field label="Tag Industrial" value={detalle.tag} />
          <Field label="Ubicación Física" value={detalle.ubicacion_fisica} />
          <Field label="Descripción" value={detalle.descripcion_larga} />
        </Card>
      </div>

      {/* Dispositivo de Red */}
      {dispositivo && (
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Dispositivo de Red</h3>
          <Field label="Tipo" value={dispositivo.tipo_dispositivo} />
          <Field label="IP" value={dispositivo.ip} />
          <Field label="Puerto" value={dispositivo.puerto} />
          <Field label="Protocolo" value={dispositivo.protocolo} />
          <Field label="Usuario" value={dispositivo.usuario_red} />
        </Card>
      )}

      {/* Monitoreo Ping */}
      {ping && (
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Monitoreo Ping</h3>
          <Field label="IP Monitoreada" value={ping.endpoint} />
          <Field label="Intervalo" value={`${ping.intervalo_segundos}s`} />
          <Field label="Timeout" value={`${ping.timeout_segundos}s`} />
          <Field label="Reintentos" value={ping.reintentos} />
        </Card>
      )}

      {/* ============================================ */}
      {/* NUEVO: Tags PI System asignados */}
      {/* ============================================ */}
      {tags && tags.length > 0 && (
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>📡 Sensores PI System</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {tags.map((tag: any) => (
              <div key={tag.tag_name} style={{
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: 8,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontWeight: 600 }}>{tag.tag_name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {tag.unidad} • Último: {tag.ultimo_valor !== undefined ? tag.ultimo_valor : '—'}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>
                  {tag.actualizado_en ? new Date(tag.actualizado_en).toLocaleString() : '—'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tiempo Real */}
      {tiempoReal && tiempoReal.length > 0 && (
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>⏱️ Tiempo Real</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {tiempoReal.map((item: any) => (
              <div key={item.parametro} style={{
                padding: '8px 12px',
                background: '#f0fdf4',
                borderRadius: 8,
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ fontWeight: 600 }}>{item.parametro}</div>
                <div style={{ fontSize: 14, color: '#15803d' }}>
                  {item.valor} {item.unidad}
                </div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>
                  {item.actualizado_en ? new Date(item.actualizado_en).toLocaleString() : '—'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg }}>
        <Button icon="✏️" variant="secondary" onClick={() => onNavigate('editar-equipo', detalle)}>Editar</Button>
        <Button icon="🔗" variant="secondary" onClick={() => onNavigate('conexiones', detalle)}>Conexiones</Button>
        <Button icon="📋" variant="secondary" onClick={() => onNavigate('mantenimiento', detalle)}>Mantenimiento</Button>
        <Button 
        icon="🔧" 
        variant="secondary" 
        onClick={() => onNavigate(`/equipos/${detalle.id}/mantenimiento/nuevo`)}
      >
        Registrar Mantenimiento
      </Button>
      </div>
    </Layout>
  )
}

// Componente helper para mostrar campos
function Field({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{value ?? '—'}</div>
    </div>
  )
}