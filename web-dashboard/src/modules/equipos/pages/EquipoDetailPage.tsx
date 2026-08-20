import { useState, useEffect } from 'react'
import { colors, spacing } from '../../../theme/colors'
import Layout from '../../../shared/components/Layout'
import Card from '../../../shared/components/Card'
import Badge from '../../../shared/components/Badge'
import Button from '../../../shared/components/Button'

interface Props {
  equipo: any
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
}

const BASE = '/api'

export default function EquipoDetailPage({ equipo, onNavigate, onBack }: Props) {
  const [detalle, setDetalle] = useState<any>(equipo)
  const [dispositivo, setDispositivo] = useState<any>(null)
  const [ping, setPing] = useState<any>(null)

  useEffect(() => {
    fetch(`${BASE}/equipos/${equipo.id}`)
      .then(r => r.json())
      .then(data => {
        setDetalle(data.equipo)
        setDispositivo(data.dispositivo)
        setPing(data.ping)
      })
  }, [equipo.id])

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 14, color: colors.text.primary }}>{value ?? '—'}</p>
    </div>
  )

  return (
    <Layout title={detalle.codigo || 'Equipo'} subtitle={detalle.nombre} onBack={onBack}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Información General</h3>
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

        <Card padding={24} hover={false}>
          <h3 style={{ marginBottom: 16 }}>Jerarquía y Ubicación</h3>
          <Field label="Activo Padre (ID)" value={detalle.activo_padre_id} />
          <Field label="Nivel Jerarquía" value={detalle.nivel_jerarquia} />
          <Field label="Tag Industrial" value={detalle.tag} />
          <Field label="Ubicación Física" value={detalle.ubicacion_fisica} />
          <Field label="Descripción" value={detalle.descripcion_larga} />
        </Card>

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

        {ping && (
          <Card padding={24} hover={false}>
            <h3 style={{ marginBottom: 16 }}>Monitoreo Ping</h3>
            <Field label="IP Monitoreada" value={ping.endpoint} />
            <Field label="Intervalo" value={`${ping.intervalo_segundos}s`} />
            <Field label="Timeout" value={`${ping.timeout_segundos}s`} />
            <Field label="Reintentos" value={ping.reintentos} />
          </Card>
        )}
      </div>

      <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg }}>
        <Button icon="✏️" variant="secondary" onClick={() => onNavigate('editar-equipo', detalle)}>Editar</Button>
        <Button icon="🔗" variant="secondary" onClick={() => onNavigate('conexiones', detalle)}>Conexiones</Button>
        <Button icon="📋" variant="secondary" onClick={() => onNavigate('mantenimiento', detalle)}>Mantenimiento</Button>
      </div>
    </Layout>
  )
}