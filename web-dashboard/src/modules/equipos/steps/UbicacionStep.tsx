import { useState, useEffect } from 'react'
import type { EquipoFormData } from '../hooks/useEquipoForm';
import { getEquipos } from '../../../shared/services/api'
import { colors } from '../../../theme/colors'

interface Props { form: EquipoFormData; update: (d: Partial<EquipoFormData>) => void }

export default function UbicacionStep({ form, update }: Props) {
  const [equipos, setEquipos] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarLista, setMostrarLista] = useState(false)

  useEffect(() => {
    getEquipos()
      .then(data => setEquipos(data || []))
      .catch(() => setEquipos([]))
  }, [])

  const equiposFiltrados = (equipos || []).filter(e =>
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.codigo?.toLowerCase().includes(busqueda.toLowerCase())
  ) ?? []

  const equipoSeleccionado = equipos.find(e => e.id === form.activo_padre_id)

  const set = (k: keyof EquipoFormData) => (v: string) => update({ [k]: v })

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>Ubicación y Jerarquía</h3>
      <p style={{ fontSize: 13, color: colors.text.muted, marginBottom: 20 }}>
        Estos campos son opcionales. Puedes completarlos después.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        
        {/* Selector de Activo Padre */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
            Activo Padre
          </label>
          
          {equipoSeleccionado ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', border: `1px solid ${colors.primary}`, borderRadius: 8,
              background: colors.primaryGhost
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{equipoSeleccionado.codigo}</span>
                <span style={{ color: colors.text.muted, marginLeft: 8, fontSize: 13 }}>{equipoSeleccionado.nombre}</span>
              </div>
              <button onClick={() => { update({ activo_padre_id: null }); setBusqueda('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: colors.text.muted }}>
                ✕
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                value={busqueda}
                onChange={e => { setBusqueda(e.target.value); setMostrarLista(true) }}
                onFocus={() => setMostrarLista(true)}
                placeholder="Buscar equipo contenedor..."
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14 }}
              />
              {mostrarLista && busqueda && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  maxHeight: 200, overflow: 'auto',
                  background: colors.surface, border: `1px solid ${colors.border}`,
                  borderRadius: 8, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {equiposFiltrados.length === 0 ? (
                    <p style={{ padding: 10, color: colors.text.muted, fontSize: 13 }}>No se encontraron equipos</p>
                  ) : (
                    equiposFiltrados.map(e => (
                      <div key={e.id}
                        onClick={() => {
                          update({ activo_padre_id: e.id })
                          setBusqueda('')
                          setMostrarLista(false)
                        }}
                        style={{
                          padding: '10px 12px', cursor: 'pointer',
                          borderBottom: `1px solid ${colors.borderLight}`,
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={ev => (ev.currentTarget.style.background = colors.background)}
                        onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{e.codigo}</span>
                        <span style={{ color: colors.text.muted, marginLeft: 8, fontSize: 12 }}>{e.nombre}</span>
                        <span style={{ color: colors.text.muted, marginLeft: 8, fontSize: 11 }}>(ID: {e.id})</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          <p style={{ fontSize: 11, color: colors.text.muted, marginTop: 4 }}>
            Ej: Si este motor está dentro de una chancadora, selecciona la chancadora
          </p>
        </div>

        <Field label="Nivel Jerarquía" value={form.nivel_jerarquia.toString()} onChange={v => update({ nivel_jerarquia: Number(v) || 0 })}
          hint="1=Planta, 2=Fase, 3=Área, 4=Equipo, 5=Componente" />

        <Field label="Tag Industrial" value={form.tag} onChange={set('tag')}
          placeholder="ZS-2020005B" hint="Código del plano P&amp;ID o diagrama de lazo" />

        <Field label="Ubicación Física" value={form.ubicacion_fisica} onChange={set('ubicacion_fisica')}
          placeholder="Tablero RIO-001, Rack 1, Slot 7" hint="Dónde está instalado físicamente" />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>
          Descripción Larga
        </label>
        <textarea value={form.descripcion_larga} onChange={e => update({ descripcion_larga: e.target.value })}
          placeholder="Descripción detallada del equipo, función, características..."
          rows={4}
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, color: colors.text.muted }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14 }} />
      {hint && <p style={{ fontSize: 11, color: colors.text.muted, marginTop: 4 }}>{hint}</p>}
    </div>
  )
}