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
  compresor: '🌀', tablero: '🗄️',
}

const getIcono = (tipo: string) => iconos[tipo] || '📦'

export default function ArbolEquipos({ equipos, filter, onNavigate }: Props) {
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
    const hijos = nodo.hijos.map(h => filtrar(h, t)).filter(Boolean) as TreeNode[]
    const match = nodo.equipo.nombre?.toLowerCase().includes(t) || nodo.equipo.codigo?.toLowerCase().includes(t)
    return (match || hijos.length) ? { ...nodo, hijos } : null
  }

  const arbolFiltrado = useMemo(() => {
    const t = filter.toLowerCase().trim()
    return t ? arbol.map(r => filtrar(r, t)).filter(Boolean) as TreeNode[] : arbol
  }, [arbol, filter])

  const resaltar = (texto: string, termino: string) => {
    if (!termino || !texto) return texto
    const t = termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${t})`, 'gi')
    const partes = texto.split(regex)
    return partes.map((p, i) =>
      regex.test(p)
        ? <mark key={i} style={{ background: '#FDE68A', color: '#1a3c5e', borderRadius: 2, padding: '0 2px' }}>{p}</mark>
        : p
    )
  }

  const Bloque = ({ nodo }: { nodo: TreeNode }) => {
    const { equipo, hijos, nivel } = nodo
    const term = filter.toLowerCase().trim()
    const borderColor = nivel === 0 ? colors.primary : nivel === 1 ? '#5B8CB8' : nivel === 2 ? '#8BB0D0' : colors.borderLight

    return (
      <div style={{
        marginBottom: nivel === 0 ? 16 : 0,
        padding: nivel === 0 ? 16 : '8px 8px 8px 20px',
        background: nivel === 0 ? colors.surface : nivel === 1 ? '#F8FAFD' : nivel === 2 ? '#FDFDFE' : 'transparent',
        borderRadius: nivel === 0 ? 12 : 8,
        border: `1.5px solid ${borderColor}`,
        borderLeft: `4px solid ${borderColor}`,
        transition: 'all 0.2s',
      }}>
        {/* Header del bloque */}
        <div
          onClick={() => onNavigate('equipo-detalle', equipo)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
            cursor: 'pointer', borderBottom: hijos.length > 0 ? `1px solid ${colors.borderLight}` : 'none',
            marginBottom: hijos.length > 0 ? 6 : 0,
          }}
        >
          <span style={{ fontSize: nivel === 0 ? 20 : 16 }}>{getIcono(equipo.tipo_activo || equipo.tipo)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: nivel === 0 ? 14 : 13, fontWeight: 700 }}>
                {resaltar(equipo.codigo, term)}
              </span>
              <span style={{ fontSize: 12, color: colors.text.secondary }}>
                {resaltar(equipo.nombre, term)}
              </span>
            </div>
          </div>
          <Badge text={(equipo.estado_equipo || '').toUpperCase()}
            variant={estadoColors[equipo.estado_equipo] || 'default'} dot />
          <span style={{ fontSize: 11, color: colors.text.muted, marginLeft: 4 }}>
            {hijos.length > 0 ? `${hijos.length} sub` : ''}
          </span>
        </div>

        {/* Hijos */}
        {hijos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {hijos.map(h => (
              <Bloque key={h.equipo.id} nodo={h} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxHeight: '75vh', overflow: 'auto', paddingRight: 6 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {arbolFiltrado.map(n => (
          <Bloque key={n.equipo.id} nodo={n} />
        ))}
      </div>
      {arbolFiltrado.length === 0 && filter && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 36 }}>🔍</p>
          <p style={{ color: colors.text.muted }}>Sin resultados para "{filter}"</p>
        </div>
      )}
    </div>
  )
}