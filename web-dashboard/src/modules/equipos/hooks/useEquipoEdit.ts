import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'

const BASE = '/api'

interface EquipoEditHookReturn {
  form: any
  update: (data: Partial<any>) => void
  mutation: any
  feedback: 'success' | 'error' | null
  errorMsg: string
}

export function useEquipoEdit(
  equipoId: number,
  initialData: any,
  onNavigate?: (page: string, params?: any) => void
): EquipoEditHookReturn {
  const [form, setForm] = useState(initialData)
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const update = (data: Partial<any>) => setForm((prev: any) => ({ ...prev, ...data }))

  useEffect(() => {
    fetch(`${BASE}/equipos/${equipoId}`)
      .then(r => r.json())
      .then(data => {
        const d = data.dispositivo || {}
        const p = data.ping || {}
        setForm((prev: any) => ({
          ...prev,
          ...data.equipo,
          tipo_dispositivo: d.tipo_dispositivo || '',
          ip: d.ip || '',
          puerto: d.puerto || '',
          protocolo: d.protocolo || '',
          usuario_red: d.usuario_red || '',
          password_hash: d.password_hash || '',
          endpoint: p.endpoint || '',
          intervalo_segundos: p.intervalo_segundos || 60,
          timeout_segundos: p.timeout_segundos || 10,
          reintentos: p.reintentos || 3,
        }))
      })
      .catch(() => {})
  }, [equipoId])

  const mutation = useMutation({
    mutationFn: async () => {
      // 1. Guardar datos del equipo
      const resEquipo = await fetch(`${BASE}/equipos/${equipoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!resEquipo.ok) throw new Error('Error al guardar equipo')

      // 2. Guardar dispositivo de red
      if (form.ip && form.ip.trim() !== '') {
        const dispData: any = {
          equipo_id: equipoId,
          ip: form.ip,
          tipo_dispositivo: form.tipo_dispositivo || '',
          protocolo: form.protocolo || '',
          usuario: form.usuario_red || '',
          password_hash: form.password_hash || '',
          puerto: form.puerto ? Number(form.puerto) : null,
        }

        const dispRes = await fetch(`${BASE}/equipos/${equipoId}/dispositivos`)
        const dispositivos = await dispRes.json()
        const existente = dispositivos[0]

        const url = existente
          ? `${BASE}/dispositivos/${existente.id}`
          : `${BASE}/dispositivos`
        const metodo = existente ? 'PUT' : 'POST'

        const resDisp = await fetch(url, {
          method: metodo,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dispData),
        })
        if (!resDisp.ok) throw new Error('Error al guardar dispositivo')
      }

      // 3. Guardar configuración de ping
      if (form.endpoint && form.endpoint.trim() !== '') {
        const fuenteData = {
          equipo_id: equipoId,
          tipo_fuente: 'ping',
          endpoint: form.endpoint.trim(),
          intervalo_segundos: Number(form.intervalo_segundos) || 60,
          timeout_segundos: Number(form.timeout_segundos) || 10,
          reintentos: Number(form.reintentos) || 3,
          activo: true,
        }

        const fuentesRes = await fetch(`${BASE}/config/fuentes`)
        const fuentes = await fuentesRes.json()
        const existente = fuentes.find((f: any) => f.equipo_id === equipoId && f.tipo_fuente === 'ping')

        const url = existente
          ? `${BASE}/config/fuentes/${existente.id}`
          : `${BASE}/config/fuentes`
        const metodo = existente ? 'PUT' : 'POST'

        const resFuente = await fetch(url, {
          method: metodo,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fuenteData),
        })
        if (!resFuente.ok) throw new Error('Error al guardar monitoreo ping')
      }

      return true
    },
    onSuccess: () => {
      setFeedback('success')
      setTimeout(() => {
        if (typeof onNavigate === 'function') {
          onNavigate('equipo-detalle', { id: equipoId })
        }
      }, 1000)
    },
    onError: (err: any) => {
      setFeedback('error')
      setErrorMsg(err.message || 'Error desconocido')
    },
  })

  return { form, update, mutation, feedback, errorMsg }
}