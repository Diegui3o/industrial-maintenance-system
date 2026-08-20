import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../../shared/components/Layout'
import Card from '../../../shared/components/Card'
import Button from '../../../shared/components/Button'
import DatosBasicosStep from '../steps/DatosBasicosStep'
import UbicacionStep from '../steps/UbicacionStep'
import MonitoreoStep from '../steps/MonitoreoStep'
import MantenimientoStep from '../steps/MantenimientoStep'
import { type EquipoFormData, emptyForm } from '../hooks/useEquipoForm'
import { createEquipo, createDispositivoRed, createConfigFuente, createMantenimiento } from '../../../shared/services/api'
import { colors } from '../../../theme/colors'

interface Props {
  onSuccess: () => void
  onNavigate: (page: string) => void
}

export default function EquipoFormPage({ onSuccess, onNavigate }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<EquipoFormData>(emptyForm)
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null)
  const queryClient = useQueryClient()

  const STEPS = [
    'Datos Básicos',
    'Ubicación',
    'Monitoreo',
    ...(form.estado_equipo === 'mantenimiento' || form.estado_equipo === 'fallo' ? ['Mantenimiento'] : [])
  ]
  const lastStep = STEPS.length - 1

  const update = (data: Partial<EquipoFormData>) => setForm(f => ({ ...f, ...data }))

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = JSON.parse(JSON.stringify({
        codigo: form.codigo,
        nombre: form.nombre,
        area: form.area,
        tipo: form.tipo,
        fase: form.fase,
        fabricante: form.fabricante,
        modelo: form.modelo,
        numero_serie: form.numero_serie,
        critico: form.critico,
        estado_equipo: form.estado_equipo,
        fecha_instalacion: form.fecha_instalacion || null,
        activo_padre_id: form.activo_padre_id ?? null,
        nivel_jerarquia: form.nivel_jerarquia ?? 0,
        tag: form.tag || '',
        ubicacion_fisica: form.ubicacion_fisica || '',
        descripcion_larga: form.descripcion_larga || '',
      }))

      const equipo = await createEquipo(payload)
      const equipoId = equipo.id

      if (!equipoId || equipoId === 0) {
        console.error('Error: equipo sin ID')
        return
      }

      if (form.es_dispositivo_red && form.ip) {
        await createDispositivoRed(equipoId, {
          tipo_dispositivo: form.tipo_dispositivo,
          ip: form.ip,
          puerto: form.puerto,
          protocolo: form.protocolo,
          usuario: form.usuario_red,
          password_hash: form.password_hash,
        })
      }

      if (form.requiere_monitoreo && form.endpoint) {
        await createConfigFuente(equipoId, {
          tipo_fuente: form.tipo_fuente,
          endpoint: form.endpoint,
          intervalo_segundos: form.intervalo_segundos,
          timeout_segundos: form.timeout_segundos,
          reintentos: form.reintentos,
          activo: true,
        })
      }

      if (form.requiere_mantenimiento) {
        await createMantenimiento({
          equipo_id: equipoId,
          fecha_reporte: form.fecha_reporte,
          fase: form.fase_mant,
          taller: form.taller,
          tipo_criticidad: form.tipo_criticidad,
          sistema: form.sistema,
          inicio_parada: form.inicio_parada || undefined,
          fin_parada: form.fin_parada || undefined,
          horas: form.horas,
          tipo_intervencion: form.tipo_intervencion,
          modo_falla: form.modo_falla,
          consecuencia_inmediata: form.consecuencia_inmediata,
          descripcion_evento: form.descripcion_evento,
          stand_by: form.stand_by,
          produccion_afectada: form.produccion_afectada,
          tn_dejadas_procesar: form.tn_dejadas_procesar,
          enlace: form.enlace,
        })
      }
    },
    onSuccess: () => {
      setFeedback('success')
      queryClient.invalidateQueries({ queryKey: ['equipos'] })
      setTimeout(() => onSuccess(), 1500)
    },
    onError: (err: any) => {
      setFeedback('error')
      if (err.message?.includes('duplicate') || err.message?.includes('llave duplicada')) {
        alert('⚠️ Ya existe un equipo con ese código. Usa uno diferente.')
      }
    }
  })

const handleSubmit = () => {
  // Validar IP si se ingresó
  if (form.endpoint && form.endpoint.trim() !== '') {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!ipRegex.test(form.endpoint) && !domainRegex.test(form.endpoint)) {
      setFeedback('error')
      return
    }
    if (!form.intervalo_segundos || form.intervalo_segundos < 1) {
      setFeedback('error')
      return
    }
    if (!form.timeout_segundos || form.timeout_segundos < 1) {
      setFeedback('error')
      return
    }
    if (!form.reintentos || form.reintentos < 1) {
      setFeedback('error')
      return
    }
  }
  
  setFeedback(null)
  mutation.mutate()
}

  return (
    <Layout title="Nuevo Equipo" subtitle={`Paso ${step + 1}: ${STEPS[step]}`} onBack={() => onNavigate('equipos')}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= step ? colors.primary : colors.borderLight,
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      {feedback === 'success' && (
        <div style={{ background: colors.status.successBg, color: colors.status.success, padding: '14px 20px', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
          ✅ Equipo guardado correctamente
        </div>
      )}
      {feedback === 'error' && (
        <div style={{ background: colors.status.errorBg, color: colors.status.error, padding: '14px 20px', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
          ❌ Error al guardar. Revisa los datos e intenta de nuevo.
        </div>
      )}

      <Card padding={24} hover={false}>
        {step === 0 && <DatosBasicosStep form={form} update={update} />}
        {step === 1 && <UbicacionStep form={form} update={update} />}
        {step === 2 && <MonitoreoStep form={form} update={update} />}
        {step === 3 && STEPS.length > 3 && <MantenimientoStep form={form} update={update} />}
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : onNavigate('equipos')}>
          {step === 0 ? 'Cancelar' : '← Anterior'}
        </Button>
        {step < lastStep ? (
          <Button onClick={() => setStep(step + 1)}>Siguiente →</Button>
        ) : (
          <Button icon="💾" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Guardar Equipo'}
          </Button>
        )}
      </div>
    </Layout>
  )
}