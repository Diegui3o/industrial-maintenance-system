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
  planta: '🏭',
  fase: '📁',
  area: '📍',
  equipo: '🔧',
  motor: '⚙️',
  sensor: '📡',
  valvula: '🔩',
  bomba: '💧',
  compresor: '🌀',
  tablero: '🗄️',
  generador: '⚡',
  ventilador: '🌪️',
  molino: '⛓️',
}
const getIcono = (tipo: string) => iconos[tipo?.toLowerCase()] || '📦'

// ─── Estilos por nivel con valores DINÁMICOS y límites ───
const nivelBorder = (nivel: number): string => {
  if (nivel === 0) return colors.primary
  if (nivel === 1) return '#7A8BA3'
  return '#B8C0CC'
}

const nivelBg = (nivel: number): string => {
  if (nivel === 0) return colors.surface
  if (nivel === 1) return '#F4F5F8'
  return colors.surface
}

const nivelRadius = (nivel: number): number => {
  if (nivel === 0) return 12
  if (nivel === 1) return 10
  return 8
}

const nivelPadding = (nivel: number): string => {
  if (nivel === 0) return '18px'
  if (nivel === 1) return '12px'
  return '10px'
}

// ✅ TAMAÑO DE TEXTO DINÁMICO CON LÍMITES MÍNIMOS
const tamanoTextoPrincipal = (nivel: number, cantidadHijos: number): number => {
  // Base por nivel
  let base = nivel === 0 ? 15 : nivel === 1 ? 13 : 12
  // Reducimos levemente si hay muchos hijos, SIN BAJAR DE 10px (legible)
  if (cantidadHijos > 6) base -= 1
  if (cantidadHijos > 12) base -= 0.5
  return Math.max(base, 11) // LÍNEA CLAVE: nunca menor a 11px
}

const tamanoTextoSecundario = (nivel: number, cantidadHijos: number): number => {
  let base = nivel === 0 ? 12 : nivel === 1 ? 11 : 10
  if (cantidadHijos > 6) base -= 0.5
  return Math.max(base, 10) // Nunca menor a 10px
}

// ✅ Ajuste de ancho mínimo según cantidad de hijos y nivel
const anchoMinimo = (nivel: number, cantidadHijos: number): number => {
  let base = nivel === 0 ? 220 : nivel === 1 ? 180 : 150
  if (cantidadHijos > 8) base += 20
  return base
}

export default function ArbolEquipos({ equipos, filter, onNavigate }: Props) {
  // ─── Construir árbol ───
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

  // ─── Filtrar recursivamente ───
  const filtrar = (nodo: TreeNode, t: string): TreeNode | null => {
    const hijosFiltrados = nodo.hijos
      .map(h => filtrar(h, t))
      .filter(Boolean) as TreeNode[]

    const match =
      nodo.equipo.nombre?.toLowerCase().includes(t) ||
      nodo.equipo.codigo?.toLowerCase().includes(t)

    return match || hijosFiltrados.length > 0
      ? { ...nodo, hijos: hijosFiltrados }
      : null
  }

  const arbolFiltrado = useMemo(() => {
    const t = filter.toLowerCase().trim()
    return t ? arbol.map(r => filtrar(r, t)).filter(Boolean) as TreeNode[] : arbol
  }, [arbol, filter])

  // ─── Resaltar búsqueda ───
  const resaltar = (texto: string, termino: string) => {
    if (!termino || !texto) return <span>{texto}</span>
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

  // ─── Contador recursivo de hijos ───
  const contarDescendientes = (nodo: TreeNode): number => {
    return nodo.hijos.reduce((acc, h) => acc + 1 + contarDescendientes(h), 0)
  }

  // ─── Render recursivo de cajas anidadas ───
  const Caja = ({ nodo }: { nodo: TreeNode }) => {
    const { equipo, hijos, nivel } = nodo
    const term = filter.toLowerCase().trim()
    const border = nivelBorder(nivel)
    const bg = nivelBg(nivel)
    const radius = nivelRadius(nivel)
    const pad = nivelPadding(nivel)
    const desc = contarDescendientes(nodo)
    const esHoja = hijos.length === 0
    const cantidadHijosDirectos = hijos.length

    // Valores dinámicos calculados
    const tamanoCodigo = tamanoTextoPrincipal(nivel, cantidadHijosDirectos)
    const tamanoNombre = tamanoTextoSecundario(nivel, cantidadHijosDirectos)
    const minW = anchoMinimo(nivel, cantidadHijosDirectos)
    const tamanoIcono = nivel === 0 ? 22 : nivel === 1 ? 19 : 17

    return (
      <div
        style={{
          background: bg,
          borderRadius: radius,
          border: `${nivel === 0 ? 2 : 1.5}px solid ${border}`,
          padding: pad,
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          flexDirection: 'column',
          width: 'fit-content',
          minWidth: minW,
          maxWidth: '100%',
          cursor: 'pointer',
        }}
        onClick={() => esHoja && onNavigate('equipo-detalle', equipo)}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = colors.primary
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = border
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Header de la caja */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: esHoja ? 8 : 12,
            flexWrap: 'nowrap',
          }}
        >
          <span style={{ fontSize: tamanoIcono, flexShrink: 0 }}>
            {getIcono(equipo.tipo_activo || equipo.tipo)}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: tamanoCodigo,
                fontWeight: 700,
                color: colors.text.primary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {resaltar(equipo.codigo || 'N/A', term)}
            </div>
            {!esHoja && (
              <div
                style={{
                  fontSize: tamanoNombre,
                  color: colors.text.muted,
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {resaltar(equipo.nombre, term)}
              </div>
            )}
          </div>

          {/* Badge estado (solo en hojas) */}
          {esHoja && (
            <Badge
              text={(equipo.estado_equipo || 'N/A').toUpperCase()}
              variant={estadoColors[equipo.estado_equipo] || 'default'}
              dot
            />
          )}

          {/* Contador de hijos (solo en ramas) */}
          {!esHoja && desc > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: colors.text.muted,
                background: colors.surface,
                padding: '2px 8px',
                borderRadius: 20,
                border: `1px solid ${colors.borderLight}`,
                flexShrink: 0,
              }}
            >
              {desc}
            </span>
          )}
        </div>

        {/* Contenedor de hijos con mejor espaciado */}
        {hijos.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: nivel === 0 ? 14 : 10,
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

  return (
    <div style={{ overflow: 'auto', padding: '12px 0' }}>
      <div
        style={{
          display: 'flex',
          gap: 18,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        {arbolFiltrado.map(n => (
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