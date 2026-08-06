import { useMemo } from 'react'
import { colors } from '../../theme/colors'
import Badge from '../../components/Badge'

interface Props {
  equipos: any[]
  filter: string
  onNavigate: (page: string, params?: any) => void
}

interface TreeNode {
  equipo: any
  hijos: TreeNode[]
  nivel: number
}

const estadoColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  activo: 'success',
  fallo: 'error',
  mantenimiento: 'warning',
  inactivo: 'default',
}

const iconos: Record<string, string> = {
  planta: '🏭', fase: '📁', area: '📍', equipo: '🔧',
  motor: '⚙️', sensor: '📡', valvula: '🔩', bomba: '💧',
  compresor: '🌀', tablero: '🗄️', generador: '⚡',
  ventilador: '🌪️', molino: '⛓️', default: '📦',
}
const getIcono = (tipo?: string) => iconos[tipo?.toLowerCase() || ''] || iconos.default

/* ═══════════════════════════════════════
   ESCALADO POR NIVEL (mantenido tal cual)
   ═══════════════════════════════════════ */
const scale = (nivel: number) => {
  const pct = Math.max(58, 100 - nivel * 12)
  return pct / 100
}

const font = (base: number, nivel: number) =>
  Math.max(9, Math.round(base * scale(nivel)))

const nivelVisual = (nivel: number) => ({
  border: nivel === 0 ? colors.primary : nivel === 1 ? '#7A8BA3' : nivel === 2 ? '#A0AAB8' : '#B8C0CC',
  borderWidth: nivel === 0 ? 2 : 1.5,
  bg: nivel === 0 ? colors.surface : nivel === 1 ? '#F4F5F8' : nivel === 2 ? '#EFF1F5' : colors.surface,
  radius: Math.max(6, 12 - nivel * 2),
  pad: Math.max(8, 20 - nivel * 4),
  gap: Math.max(6, 14 - nivel * 3),
  icon: font(22, nivel),
  nombre: font(15, nivel),
  codigo: font(11, nivel),
  meta: font(10, nivel),
  badge: font(9, nivel),
  minW: Math.max(120, 320 - nivel * 70),
  leafMinW: Math.max(110, 160 - nivel * 18),
})

/* ═══════════════════════════════════════ */

export default function ArbolEquipos({ equipos, filter, onNavigate }: Props) {
  if (!equipos || equipos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ fontSize: 14, color: colors.text.muted }}>No hay equipos para mostrar</p>
      </div>
    )
  }

  const arbol = useMemo(() => {
    const mapa = new Map<number, TreeNode>()
    const raices: TreeNode[] = []

    equipos.forEach(e => mapa.set(e.id, { equipo: e, hijos: [], nivel: 0 }))

    equipos.forEach(e => {
      const nodo = mapa.get(e.id)!
      if (e.activo_padre_id && mapa.has(e.activo_padre_id)) {
        const padre = mapa.get(e.activo_padre_id)!
        nodo.nivel = padre.nivel + 1
        padre.hijos.push(nodo)
      } else {
        raices.push(nodo)
      }
    })

    return raices
  }, [equipos])

  const filtrar = (nodo: TreeNode, t: string): TreeNode | null => {
    const hijosF = nodo.hijos.map(h => filtrar(h, t)).filter(Boolean) as TreeNode[]
    const match =
      nodo.equipo.nombre?.toLowerCase().includes(t) ||
      nodo.equipo.codigo?.toLowerCase().includes(t)
    return match || hijosF.length ? { ...nodo, hijos: hijosF } : null
  }

  const arbolFiltrado = useMemo(() => {
    const t = filter.toLowerCase().trim()
    return t ? arbol.map(r => filtrar(r, t)).filter(Boolean) as TreeNode[] : arbol
  }, [arbol, filter])

  const contarDescendientes = (nodo: TreeNode): number =>
    nodo.hijos.reduce((acc, h) => acc + 1 + contarDescendientes(h), 0)

  const resaltar = (texto?: string, termino?: string) => {
    if (!termino || !texto) return <span>{texto || '—'}</span>
    const t = termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${t})`, 'gi')
    const partes = texto.split(regex)
    return (
      <span>
        {partes.map((p, i) =>
          regex.test(p) ? (
            <mark
              key={i}
              style={{
                background: '#FDE68A',
                color: '#1a3c5e',
                borderRadius: 2,
                padding: '0 2px',
                fontWeight: 700,
              }}
            >
              {p}
            </mark>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </span>
    )
  }

  /* ═══════ CAJA RECURSIVA ═══════ */
  const Caja = ({ nodo }: { nodo: TreeNode }) => {
    const { equipo, hijos, nivel } = nodo
    const term = filter.toLowerCase().trim()
    const v = nivelVisual(nivel)
    const desc = contarDescendientes(nodo)
    const esHoja = hijos.length === 0

    return (
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          background: v.bg,
          borderRadius: v.radius,
          border: `${v.borderWidth}px solid ${v.border}`,
          padding: `${v.pad}px`,
          width: 'fit-content',
          minWidth: esHoja ? v.leafMinW : v.minW,
          maxWidth: '100%',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
        }}
        onClick={(e) => { 
        e.stopPropagation()
        onNavigate('equipo-detalle', equipo) 
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = colors.primary
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = v.border
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* ── Línea indicadora de nivel ── */}
        {nivel > 0 && (
          <div
            style={{
              position: 'absolute',
              left: -1,
              top: 10,
              bottom: 10,
              width: 3,
              borderRadius: 4,
              background: nivel === 1 ? colors.primary : nivel === 2 ? '#7A8BA3' : '#B8C0CC',
              opacity: 0.4,
            }}
          />
        )}

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          {/* Icono */}
          <span style={{ fontSize: v.icon, lineHeight: 1.2, flexShrink: 0, marginTop: 2 }}>
            {getIcono(equipo.tipo_activo || equipo.tipo)}
          </span>

          {/* Datos organizados */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 1. NOMBRE: DESTACADO */}
            <div
              style={{
                fontSize: v.nombre,
                fontWeight: 700,
                color: colors.text.primary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {resaltar(equipo.nombre || 'Sin nombre', term)}
            </div>

            {/* 2. CÓDIGO: más pequeño y gris */}
            <div
              style={{
                fontSize: v.codigo,
                color: colors.text.muted,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {resaltar(equipo.codigo || '—', term)}
            </div>

            {/* 3. IP (si existe) */}
            {equipo.ip && (
            <div style={{ fontSize: v.meta, color: colors.text.muted }}>
                🌐 {equipo.ip}
            </div>
            )}
            {equipo.ubicacion_fisica && (
            <div style={{ fontSize: v.meta, color: colors.text.muted, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                📍 {equipo.ubicacion_fisica}
            </div>
            )}
          </div>

          {/* Badge Estado */}
          <div style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
            <Badge
              text={(equipo.estado_equipo || 'N/A').toUpperCase()}
              variant={estadoColors[equipo.estado_equipo] || 'default'}
              dot
            />
          </div>

          {/* Contador hijos */}
          {!esHoja && desc > 0 && (
            <span
              style={{
                fontSize: v.badge,
                fontWeight: 700,
                color: colors.text.muted,
                background: colors.surface,
                padding: '2px 8px',
                borderRadius: 20,
                border: `1px solid ${colors.borderLight}`,
                flexShrink: 0,
                alignSelf: 'flex-start',
              }}
            >
              {desc}
            </span>
          )}
        </div>

        {/* ── Hijos anidados ── */}
        {hijos.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: v.gap,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginTop: 8,
            }}
          >
            {hijos.map(h => (
              <Caja key={h.equipo.id} nodo={h} />
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ═══════ RENDER PRINCIPAL ═══════ */
  return (
    <div style={{ overflow: 'auto', padding: '4px 2px' }}>
      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {(arbolFiltrado || []).map(n => (
          <Caja key={n.equipo.id} nodo={n} />
        ))}
      </div>

      {arbolFiltrado.length === 0 && filter && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 14, color: colors.text.muted }}>
            Sin resultados para "{filter}"
          </p>
        </div>
      )}

      {arbolFiltrado.length === 0 && !filter && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 14, color: colors.text.muted }}>
            No hay equipos para mostrar
          </p>
        </div>
      )}
    </div>
  )
}