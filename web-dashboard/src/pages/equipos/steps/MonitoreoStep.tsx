import type { EquipoFormData } from '../hooks/useEquipoForm';
import { colors } from '../../../theme/colors'

interface Props { form: EquipoFormData; update: (d: Partial<EquipoFormData>) => void }

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
    <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
  </div>
)

export default function MonitoreoStep({ form, update }: Props) {
  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Monitoreo y Red</h3>

      <Toggle label="¿Es un equipo crítico?" checked={form.critico} onChange={v => update({ critico: v })} />

      <Toggle label="¿Es dispositivo de red?" checked={form.es_dispositivo_red} onChange={v => update({ es_dispositivo_red: v })} />
      {form.es_dispositivo_red && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginLeft: 28, marginBottom: 16 }}>
          <Field label="Tipo Dispositivo" value={form.tipo_dispositivo} onChange={v => update({ tipo_dispositivo: v })} />
          <Field label="IP" value={form.ip} onChange={v => update({ ip: v })} />
          <Field label="Puerto" value={String(form.puerto)} onChange={v => update({ puerto: Number(v) || 0 })} />
          <Field label="Protocolo" value={form.protocolo} onChange={v => update({ protocolo: v })} />
        </div>
      )}

      <Toggle label="¿Requiere monitoreo (ping/PI)?" checked={form.requiere_monitoreo} onChange={v => update({ requiere_monitoreo: v })} />
      {form.requiere_monitoreo && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginLeft: 28 }}>
          <Field label="Tipo Fuente" value={form.tipo_fuente} onChange={v => update({ tipo_fuente: v })} />
          <Field label="Endpoint (IP/URL)" value={form.endpoint} onChange={v => update({ endpoint: v })} />
          <Field label="Intervalo (seg)" value={String(form.intervalo_segundos)} onChange={v => update({ intervalo_segundos: Number(v) || 60 })} />
          <Field label="Timeout (seg)" value={String(form.timeout_segundos)} onChange={v => update({ timeout_segundos: Number(v) || 10 })} />
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '8px 10px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 13 }} />
    </div>
  )
}