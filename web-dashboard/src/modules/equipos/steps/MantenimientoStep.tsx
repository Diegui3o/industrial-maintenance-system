import type { EquipoFormData } from '../hooks/useEquipoForm';
import { colors } from '../../../theme/colors'

interface Props { form: EquipoFormData; update: (d: Partial<EquipoFormData>) => void }

export default function MantenimientoStep({ form, update }: Props) {
  if (!form.requiere_mantenimiento && form.estado_equipo !== 'mantenimiento' && form.estado_equipo !== 'fallo') {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ fontSize: 48 }}>✅</p>
        <h3>No se requiere mantenimiento inicial</h3>
        <p style={{ color: colors.text.muted, marginTop: 8 }}>
          El equipo está en estado <strong>{form.estado_equipo}</strong>. Puedes agregar mantenimiento después.
        </p>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.requiere_mantenimiento}
            onChange={e => update({ requiere_mantenimiento: e.target.checked })} />
          <span style={{ fontSize: 14 }}>Agregar mantenimiento de todas formas</span>
        </label>
      </div>
    )
  }

  const set = (k: keyof EquipoFormData) => (v: any) => update({ [k]: v })

  return (
    <div>
      <h3 style={{ marginBottom: 4 }}>Registro de Mantenimiento</h3>
      <p style={{ fontSize: 13, color: colors.text.muted, marginBottom: 20 }}>
        Datos del evento de mantenimiento asociado a este equipo.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Fecha Reporte" value={form.fecha_reporte} onChange={set('fecha_reporte')} type="date" />
        <Field label="Fase" value={form.fase_mant} onChange={set('fase_mant')} placeholder="FASE II" />
        <Field label="Taller" value={form.taller} onChange={set('taller')} placeholder="MECANICO" />
        <SelectField label="Tipo Criticidad" value={form.tipo_criticidad} onChange={set('tipo_criticidad')}
          options={['', 'TOP TEN', 'TOP N']} />
        <Field label="Sistema" value={form.sistema} onChange={set('sistema')} placeholder="ALIMENTACION" />
        <Field label="Tipo Intervención" value={form.tipo_intervencion} onChange={set('tipo_intervencion')} placeholder="MPV, MCP..." />
        <Field label="Modo de Falla" value={form.modo_falla} onChange={set('modo_falla')} placeholder="Desgaste" />
        <Field label="Inicio Parada" value={form.inicio_parada} onChange={set('inicio_parada')} type="datetime-local" />
        <Field label="Fin Parada" value={form.fin_parada} onChange={set('fin_parada')} type="datetime-local" />
        <Field label="Horas" value={form.horas.toString()} onChange={(v: any) => set('horas')(Number(v) || 0)} />
        <Field label="TN Dejadas de Procesar" value={form.tn_dejadas_procesar.toString()} onChange={(v: any) => set('tn_dejadas_procesar')(Number(v) || 0)} />
        <Field label="Enlace" value={form.enlace} onChange={set('enlace')} placeholder="https://..." />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
          Consecuencia Inmediata
        </label>
        <input value={form.consecuencia_inmediata} onChange={e => update({ consecuencia_inmediata: e.target.value })}
          placeholder="PARADA DE EQUIPO"
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14 }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
          Descripción del Evento
        </label>
        <textarea value={form.descripcion_evento} onChange={e => update({ descripcion_evento: e.target.value })}
          placeholder="SE REALIZO LA REPARACION DE..."
          rows={3}
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
        <Toggle label="Stand By" checked={form.stand_by} onChange={v => update({ stand_by: v })} />
        <Toggle label="Producción Afectada" checked={form.produccion_afectada} onChange={v => update({ produccion_afectada: v })} />
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: any) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>{label}</label>
      <input {...{ type, value, placeholder }} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 13 }} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 13 }}>
        {options.map(o => <option key={o} value={o}>{o || 'Seleccionar...'}</option>)}
      </select>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 16, height: 16 }} />
      {label}
    </label>
  )
}