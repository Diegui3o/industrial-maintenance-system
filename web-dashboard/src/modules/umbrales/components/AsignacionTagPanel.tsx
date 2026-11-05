// src/modules/umbrales/components/AsignacionTagPanel.tsx
import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../theme/colors';
import { piTagsApi } from '../services/piTagsApi';
import type { TagDescubierto } from '../../../shared/types/piTag';
import { etiquetaTag, norm, tagEsValido } from '../../../shared/utils/jerarquiaHelpers';

interface Props {
  equipoId: number;
  equipoNombre?: string;
  onAsignado?: () => void;
}

interface NodoArbol {
  nombre: string;
  rutaCompleta: string;
  hijos: NodoArbol[];
  tags: TagDescubierto[];
}

function segmentosDeRuta(tag: TagDescubierto): string[] {
  const ruta = tag.element_path || tag.tag_path || '';
  if (!ruta) return ['(sin ubicación)'];
  const limpio = String(ruta).replace(/\\+/g, '/').replace(/^\/+|\/+$/g, '');
  const partes = limpio.split('/').filter(Boolean);
  let inicio = 0;
  if (partes[0]?.toUpperCase().includes('PEELPWP')) inicio = 2;
  const utiles = partes.slice(inicio);
  if (utiles.length === 0) return ['(sin ubicación)'];
  return utiles;
}

function construirArbol(tags: TagDescubierto[]): NodoArbol {
  const raiz: NodoArbol = { nombre: '', rutaCompleta: '', hijos: [], tags: [] };
  for (const tag of tags) {
    const segmentos = segmentosDeRuta(tag);
    let actual = raiz;
    let rutaAcumulada = '';
    for (const seg of segmentos) {
      rutaAcumulada = rutaAcumulada ? `${rutaAcumulada}/${seg}` : seg;
      let hijo = actual.hijos.find((h) => h.nombre === seg);
      if (!hijo) {
        hijo = { nombre: seg, rutaCompleta: rutaAcumulada, hijos: [], tags: [] };
        actual.hijos.push(hijo);
      }
      actual = hijo;
    }
    actual.tags.push(tag);
  }
  ordenarArbol(raiz);
  return raiz;
}

function ordenarArbol(nodo: NodoArbol) {
  nodo.hijos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  nodo.tags.sort((a, b) =>
    etiquetaTag(a).localeCompare(etiquetaTag(b), 'es', { sensitivity: 'base' }),
  );
  nodo.hijos.forEach(ordenarArbol);
}

function contarTags(nodo: NodoArbol): number {
  return nodo.tags.length + nodo.hijos.reduce((s, h) => s + contarTags(h), 0);
}

export default function AsignacionTagPanel({ equipoId, equipoNombre, onAsignado }: Props) {
  const [disponibles, setDisponibles] = useState<TagDescubierto[]>([]);
  const [asignados, setAsignados] = useState<string[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [busqueda, setBusqueda] = useState('');
  const [carpetasAbiertas, setCarpetasAbiertas] = useState<Set<string>>(new Set());
  const [panelAbierto, setPanelAbierto] = useState(false); // ← colapsado por defecto
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const recargar = async () => {
    setCargando(true);
    setError('');
    try {
      const [descubiertos, porEquipo] = await Promise.all([
        piTagsApi.getDescubiertos(),
        piTagsApi.getTagsPorEquipo(equipoId),
      ]);
      const tagsEq: string[] = Array.isArray(porEquipo) ? porEquipo : porEquipo?.tags ?? [];
      const asignadosLimpios = Array.from(
        new Set(
          tagsEq
            .filter((t: any) => t && String(t).trim() && String(t).toUpperCase() !== 'NULL')
            .map((t: any) => String(t).trim()),
        ),
      );
      const asignadosSet = new Set(asignadosLimpios.map((t) => t.toUpperCase()));
      const disponiblesLimpios = descubiertos
        .filter((t) => tagEsValido(t))
        .filter((t) => !asignadosSet.has(etiquetaTag(t).toUpperCase()));
      setDisponibles(disponiblesLimpios);
      setAsignados(asignadosLimpios);
    } catch (e: any) {
      setError(e.message ?? 'Error cargando tags.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (equipoId) recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipoId]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return disponibles;
    const b = norm(busqueda);
    return disponibles.filter(
      (t) =>
        norm(etiquetaTag(t)).includes(b) ||
        norm(t.element_name ?? '').includes(b) ||
        norm(t.element_path ?? '').includes(b),
    );
  }, [disponibles, busqueda]);

  const arbol = useMemo(() => construirArbol(filtrados), [filtrados]);

  const toggleCarpeta = (ruta: string) => {
    const next = new Set(carpetasAbiertas);
    if (next.has(ruta)) next.delete(ruta);
    else next.add(ruta);
    setCarpetasAbiertas(next);
  };

  const toggleTag = (id: number) => {
    const next = new Set(seleccionados);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSeleccionados(next);
  };

  const seleccionarTodoEnCarpeta = (nodo: NodoArbol, marcar: boolean) => {
    const next = new Set(seleccionados);
    const aplicar = (n: NodoArbol) => {
      n.tags.forEach((t) => {
        const id = Number(t.id);
        if (marcar) next.add(id);
        else next.delete(id);
      });
      n.hijos.forEach(aplicar);
    };
    aplicar(nodo);
    setSeleccionados(next);
  };

  const asignar = async () => {
    if (seleccionados.size === 0) return;
    setCargando(true);
    setError('');
    setExito('');
    try {
      const ids = Array.from(seleccionados);
      await piTagsApi.asignarMultiplesPorId(equipoId, ids);
      setExito(`✅ ${ids.length} tag(s) asignado(s).`);
      setSeleccionados(new Set());
      await recargar();
      onAsignado?.();
    } catch (e: any) {
      setError(e.message ?? 'Error asignando tags.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
      }}
    >
      {/* ─── Cabecera colapsable ─── */}
      <div
        onClick={() => setPanelAbierto((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          cursor: 'pointer',
          background: panelAbierto ? '#f0f9ff' : '#fafbfc',
          borderBottom: panelAbierto ? '1px solid #e0f2fe' : 'none',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 12,
            color: '#64748b',
            transition: 'transform 0.15s',
            transform: panelAbierto ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▶
        </span>
        <span style={{ fontSize: 15 }}>🔌</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          Tags PI — {equipoNombre ?? `Equipo #${equipoId}`}
        </span>
        <span
          style={{
            fontSize: 11,
            color: '#475569',
            background: '#e2e8f0',
            padding: '2px 8px',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          {asignados.length} asignado{asignados.length === 1 ? '' : 's'}
        </span>
        {seleccionados.size > 0 && (
          <span
            style={{
              fontSize: 11,
              color: '#0369a1',
              background: '#dbeafe',
              padding: '2px 8px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            {seleccionados.size} nuevo{seleccionados.size === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {/* ─── Contenido colapsado ─── */}
      {panelAbierto && (
        <div style={{ padding: 16 }}>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar tag por nombre, elemento o ruta…"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 10,
              boxSizing: 'border-box',
            }}
          />

          {asignados.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                YA ASIGNADOS ({asignados.length})
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  maxHeight: 60,
                  overflowY: 'auto',
                }}
              >
                {asignados.map((t, i) => (
                  <span
                    key={i}
                    style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
              fontSize: 12,
            }}
          >
            <strong style={{ color: '#475569' }}>
              Explorador ({filtrados.length} tag{filtrados.length === 1 ? '' : 's'})
            </strong>
            <span style={{ color: '#94a3b8' }}>Árbol PI System</span>
          </div>

          {cargando && (
            <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0' }}>Cargando…</p>
          )}
          {!cargando && filtrados.length === 0 && (
            <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0' }}>
              {disponibles.length === 0
                ? 'No hay tags disponibles sin asignar.'
                : 'Ningún tag coincide con la búsqueda.'}
            </p>
          )}

          {/* ─── Árbol ─── */}
          {filtrados.length > 0 && (
            <div
              style={{
                maxHeight: 320,
                overflowY: 'auto',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                padding: '2px 0',
                background: '#fafbfc',
              }}
            >
              {arbol.hijos.map((hijo) => (
                <NodoCarpeta
                  key={hijo.rutaCompleta}
                  nodo={hijo}
                  nivel={0}
                  carpetasAbiertas={carpetasAbiertas}
                  toggleCarpeta={toggleCarpeta}
                  seleccionados={seleccionados}
                  toggleTag={toggleTag}
                  seleccionarTodoEnCarpeta={seleccionarTodoEnCarpeta}
                />
              ))}
            </div>
          )}

          {/* ─── Acciones ─── */}
          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={asignar}
              disabled={seleccionados.size === 0 || cargando}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: 0,
                background: seleccionados.size === 0 ? '#cbd5e1' : '#0284c7',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: seleccionados.size === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Asignar {seleccionados.size > 0 ? `(${seleccionados.size})` : ''}
            </button>
            <button
              type="button"
              onClick={recargar}
              disabled={cargando}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#475569',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔄 Recargar
            </button>
            {seleccionados.size > 0 && (
              <button
                type="button"
                onClick={() => setSeleccionados(new Set())}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {error && (
            <p style={{ color: '#b91c1c', fontSize: 12, marginTop: 6 }}>{error}</p>
          )}
          {exito && (
            <p style={{ color: '#166534', fontSize: 12, marginTop: 6 }}>{exito}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Nodo de carpeta compacto ───────────────────────────────────

interface NodoProps {
  nodo: NodoArbol;
  nivel: number;
  carpetasAbiertas: Set<string>;
  toggleCarpeta: (ruta: string) => void;
  seleccionados: Set<number>;
  toggleTag: (id: number) => void;
  seleccionarTodoEnCarpeta: (nodo: NodoArbol, marcar: boolean) => void;
}

function NodoCarpeta({
  nodo,
  nivel,
  carpetasAbiertas,
  toggleCarpeta,
  seleccionados,
  toggleTag,
  seleccionarTodoEnCarpeta,
}: NodoProps) {
  const abierta = carpetasAbiertas.has(nodo.rutaCompleta);
  const total = contarTags(nodo);
  const hijosConTags = nodo.hijos.filter((h) => contarTags(h) > 0);

  const seleccionadosEnCarpeta = useMemo(() => {
    let count = 0;
    const recorrer = (n: NodoArbol) => {
      n.tags.forEach((t) => {
        if (seleccionados.has(Number(t.id))) count++;
      });
      n.hijos.forEach(recorrer);
    };
    recorrer(nodo);
    return count;
  }, [nodo, seleccionados]);

  const todosSeleccionados = seleccionadosEnCarpeta === total && total > 0;

  return (
    <div>
      {/* Cabecera de carpeta */}
      <div
        onClick={() => toggleCarpeta(nodo.rutaCompleta)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          paddingLeft: 8 + nivel * 14,
          cursor: 'pointer',
          background: abierta ? '#e0f2fe' : 'transparent',
          borderBottom: '1px solid #f1f5f9',
          fontSize: 12,
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: '#64748b',
            width: 10,
            transition: 'transform 0.15s',
            transform: abierta ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▶
        </span>
        <span style={{ fontSize: 12 }}>📁</span>
        <span
          style={{
            flex: 1,
            fontWeight: 600,
            color: '#334155',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={nodo.nombre}
        >
          {nodo.nombre}
        </span>
        <span
          style={{
            fontSize: 10,
            color: '#64748b',
            background: '#e2e8f0',
            padding: '1px 6px',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          {total}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            seleccionarTodoEnCarpeta(nodo, !todosSeleccionados);
          }}
          style={{
            padding: '1px 6px',
            fontSize: 10,
            border: '1px solid #cbd5e1',
            background: '#fff',
            borderRadius: 3,
            cursor: 'pointer',
            color: '#475569',
          }}
        >
          {todosSeleccionados ? '−' : '+'}
        </button>
      </div>

      {/* Subcarpetas */}
      {abierta && (
        <div>
          {hijosConTags.map((hijo) => (
            <NodoCarpeta
              key={hijo.rutaCompleta}
              nodo={hijo}
              nivel={nivel + 1}
              carpetasAbiertas={carpetasAbiertas}
              toggleCarpeta={toggleCarpeta}
              seleccionados={seleccionados}
              toggleTag={toggleTag}
              seleccionarTodoEnCarpeta={seleccionarTodoEnCarpeta}
            />
          ))}

          {/* Tags directos */}
          {nodo.tags.map((t) => {
            const id = Number(t.id);
            const checked = seleccionados.has(id);
            return (
              <label
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px',
                  paddingLeft: 8 + (nivel + 1) * 14 + 12,
                  fontSize: 12,
                  cursor: 'pointer',
                  background: checked ? '#eff6ff' : 'transparent',
                  borderBottom: '1px solid #f8fafc',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTag(id)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: 10, color: '#94a3b8' }}>🔖</span>
                <span style={{ flex: 1 }}>{etiquetaTag(t)}</span>
                {t.unidad && t.unidad !== 'N/A' && (
                  <span
                    style={{
                      fontSize: 10,
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '0px 5px',
                      borderRadius: 3,
                    }}
                  >
                    {t.unidad}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}