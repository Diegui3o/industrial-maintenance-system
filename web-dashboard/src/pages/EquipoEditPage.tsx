import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import { colors, spacing } from '../theme/colors'
import { getEquipos } from '../services/api'

interface Props {
  equipo: any
  onNavigate: (page: string, params?: any) => void
  onBack?: () => void
}

const BASE = '/api'

export default function EquipoEditPage({ equipo, onNavigate, onBack }: Props) {
  const [form, setForm] = useState({ ...equipo })
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [] = useState(false)

  const { data: equipos = [] } = useQuery({
    queryKey: ['equipos'],
    queryFn: getEquipos
  })

  const update = (data: Partial<any>) => setForm((f: any) => ({ ...f, ...data }))
  useEffect(() => {
    fetch(`${BASE}/equipos/${equipo.id}`)
      .then(r => r.json())
      .then(data => {
        console.log("DATA BACKEND:", data)
        const d = data.dispositivo
        if (d) {
          update({
            tipo_dispositivo: d.tipo_dispositivo || '',
            ip: d.ip || '',
            puerto: d.puerto || '',
            protocolo: d.protocolo || '',
            usuario_red: d.usuario_red || '',
            password_hash: d.password_hash || '',
          })
        }

        // Cargar ping
        const p = data.ping
        if (p) {
          update({
            endpoint: p.endpoint || '',
            intervalo_segundos: p.intervalo_segundos || 60,
            timeout_segundos: p.timeout_segundos || 10,
            reintentos: p.reintentos || 3,
          })
        }
      })
  }, [equipo.id])
const mutation = useMutation({
  mutationFn: async () => {
    setErrorMsg('')

    // ============================================
    // 1. GUARDAR DATOS DEL EQUIPO
    // ============================================
    const payload = {
      codigo: form.codigo,
      nombre: form.nombre,
      area: form.area,
      tipo: form.tipo,
      fase: form.fase,
      fabricante: form.fabricante,
      modelo: form.modelo,
      numero_serie: form.numero_serie,
      critico: Boolean(form.critico),
      estado_equipo: form.estado_equipo,
      fecha_instalacion: form.fecha_instalacion || null,
      activo_padre_id: form.activo_padre_id ? Number(form.activo_padre_id) : null,
      nivel_jerarquia: Number(form.nivel_jerarquia) || 0,
      tag: form.tag || '',
      ubicacion_fisica: form.ubicacion_fisica || '',
      descripcion_larga: form.descripcion_larga || '',
    }

    const resEquipo = await fetch(`${BASE}/equipos/${equipo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!resEquipo.ok) {
      const data = await resEquipo.json()
      throw new Error(data.error || 'Error al guardar equipo')
    }

    // ============================================
    // 2. GUARDAR DISPOSITIVO DE RED (si tiene IP)
    // ============================================
    if (form.ip && form.ip.trim() !== '') {
      const dispData: any = {
        equipo_id: equipo.id,
        tipo_dispositivo: form.tipo_dispositivo || '',
        protocolo: form.protocolo || '',
        usuario: form.usuario_red || '',
        password_hash: form.password_hash || '',
      }

      if (form.ip && form.ip.trim() !== '') {
        dispData.ip = form.ip
      }

      if (form.puerto) {
        dispData.puerto = form.puerto ? Number(form.puerto) : null
      }

      // Verificar si ya existe
      const dispRes = await fetch(`${BASE}/equipos/${equipo.id}/dispositivos`)
      const dispositivos = await dispRes.json()
      const existente = dispositivos.length > 0 ? dispositivos[0] : null
      console.log("DISPOSITIVOS:", dispositivos)
      if (existente) {
        const res = await fetch(`${BASE}/dispositivos/${existente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dispData)
        })
        if (!res.ok) throw new Error('Error al actualizar dispositivo')
      } else {
        const res = await fetch(`${BASE}/dispositivos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dispData)
        })
        if (!res.ok) throw new Error('Error al crear dispositivo')
      }
    }

    // ============================================
    // 3. GUARDAR CONFIGURACIÓN DE PING
    // ============================================
    if (form.endpoint && form.endpoint.trim() !== '') {
      const fuenteData = {
        equipo_id: equipo.id,
        tipo_fuente: 'ping',
        endpoint: form.endpoint?.trim() === '' ? null : form.endpoint,
        intervalo_segundos: Number(form.intervalo_segundos) || 60,
        timeout_segundos: Number(form.timeout_segundos) || 10,
        reintentos: Number(form.reintentos) || 3,
        activo: true,
      }

      // Verificar si ya existe fuente ping para este equipo
      const fuentesRes = await fetch(`${BASE}/config/fuentes`)
      const fuentes = await fuentesRes.json()
      console.log("FUENTES RAW:", fuentes)
      const existente = fuentes.find((f: any) => f.equipo_id === equipo.id && f.tipo_fuente === 'ping')
      if (!form.endpoint || form.endpoint.trim() === '') {
        if (existente) {
          await fetch(`${BASE}/config/fuentes/${existente.id}`, {
            method: 'DELETE'
          })
        }
      }
      if (existente) {
        const res = await fetch(`${BASE}/config/fuentes/${existente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fuenteData)
        })
        if (!res.ok) throw new Error('Error al actualizar fuente ping')
      } else {
        const res = await fetch(`${BASE}/config/fuentes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fuenteData)
        })
        if (!res.ok) throw new Error('Error al crear fuente ping')
      }
    }

    return resEquipo.json()
  },
  onSuccess: () => {
    setFeedback('success')
    setTimeout(() => onNavigate('equipos'), 1000)
  },
  onError: (err: any) => {
    setFeedback('error')
    setErrorMsg(err.message || 'Error desconocido')
  }
})

  const handleSave = () => {
    if (form.endpoint && form.endpoint.trim() !== '') {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
      const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!ipRegex.test(form.endpoint) && !domainRegex.test(form.endpoint)) {
        setFeedback('error')
        setErrorMsg('Formato de IP inválido')
        return
      }
      if (!form.intervalo_segundos || form.intervalo_segundos < 1) {
        setFeedback('error')
        setErrorMsg('Intervalo es obligatorio')
        return
      }
      if (!form.timeout_segundos || form.timeout_segundos < 1) {
        setFeedback('error')
        setErrorMsg('Timeout es obligatorio')
        return
      }
      if (!form.reintentos || form.reintentos < 1) {
        setFeedback('error')
        setErrorMsg('Reintentos es obligatorio')
        return
      }
    }
    setFeedback(null)
    setErrorMsg('')
    mutation.mutate()
  }

  const Field = ({ label, field, type = 'text', placeholder }: any) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted, display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      <input
        key={`${field}-${form[field]}`}
        type={type}
        defaultValue={form[field] ?? ''}
        onBlur={e => update({ [field]: e.target.value })}
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
              {equipos.filter((e: any) => e.id !== equipo.id).map((e: any) => (
                <option key={e.id} value={e.id}>{e.codigo} - {e.nombre}</option>
              ))}
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
        <Button variant="ghost" onClick={() => onBack ? onBack() : onNavigate('equipo-detalle', equipo)}>Cancelar</Button>
        <Button icon="💾" onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </Layout>
  )
}