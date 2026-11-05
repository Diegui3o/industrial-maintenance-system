// src/modules/umbrales/components/AsignacionTagPanel.tsx
import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../theme/colors';
import { piTagsApi } from '../services/piTagsApi';
import type { TagDescubierto } from '../../../shared/types/piTag';
import {
  contextoTag,
  etiquetaTag,
  norm,
  tagEsValido,
} from '../../../shared/utils/jerarquiaHelpers';

interface Props {
  equipoId: number;
  equipoNombre?: string;
  onAsignado?: () => void;
}

export default function AsignacionTagPanel({ equipoId, equipoNombre, onAsignado }: Props) {
  const [disponibles, setDisponibles] = useState<TagDescubierto[]>([]);
  const [asignados, setAsignados] = useState<string[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const recargar = async () => {
    setCargando(true);
    setError('');
    try {
      const [descubiertos, porEquipo] = await Promise.all([
        piTagsApi.getDescubiertos(),     // /api/pi/tags/descubiertos
        piTagsApi.getTagsPorEquipo(equipoId),
      ]);

      // Asignados: puede venir como array directo o como {tags: []}
      const tagsEq: string[] = Array.isArray(porEquipo)
        ? porEquipo
        : porEquipo?.tags ?? [];

      const asignadosLimpios = Array.from(
        new Set(
          tagsEq
            .filter(
              (t: any) =>
                t &&
                String(t).trim() &&
                String(t).toUpperCase() !== 'NULL',
            )
            .map((t: any) => String(t).trim()),
        ),
      );

      // Descubiertos válidos, no asignados
      const asignadosSet = new Set(asignadosLimpios.map((t) => t.toUpperCase()));
      const disponiblesLimpios = descubiertos
        .filter((t) => tagEsValido(t))
        .filter((t) => {
          const nombre = etiquetaTag(t).toUpperCase();
          return !asignadosSet.has(nombre);
        });

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
        norm(t.tag_path ?? '').includes(b),
    );
  }, [disponibles, busqueda]);

  const toggle = (id: number) => {
    const next = new Set(seleccionados);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSeleccionados(next);
  };

  const asignar = async () => {
    if (seleccionados.size === 0) return;
    setCargando(true);
    setError('');
    setExito('');
    try {
      // Usamos asignar-multiple por IDs (más robusto que por nombre)
      const ids = Array.from(seleccionados);
      await piTagsApi.asignarMultiplesPorId(equipoId, ids);

      setExito(`✅ ${ids.length} tag(s) asignado(s) al equipo.`);
      setSeleccionados(new Set());
      await recargar();
      onAsignado?.();
    } catch (e: any) {
      setError(e.message ?? 'Error asignando tags.');
    } finally {
      setCargando(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    fontSize: 14,
  };

  return (
    <div
      style={{
        background: '#fff',
        padding: 20,
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 15, color: colors.text.secondary }}>
        🔌 Tags PI — {equipoNombre ?? `Equipo #${equipoId}`}
      </h3>

      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
        Asignando a: <strong>Equipo #{equipoId}</strong> · Componente / Repuesto:
        <em> pendiente migración backend</em>
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar tag por nombre, elemento o ruta…"
        style={{ ...inputStyle, marginBottom: 12 }}
      />

      {asignados.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong style={{ fontSize: 13 }}>Asignados ({asignados.length}):</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {asignados.map((t, i) => (
              <span
                key={i}
                style={{
                  background: '#dcfce7',
                  color: '#166534',
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <strong style={{ fontSize: 13 }}>
          Disponibles sin asignar ({filtrados.length} de {disponibles.length}):
        </strong>
        {cargando && <p style={{ fontSize: 12, color: '#64748b' }}>Cargando…</p>}
        {!cargando && filtrados.length === 0 && (
          <p style={{ fontSize: 12, color: '#64748b' }}>
            {disponibles.length === 0
              ? 'No hay tags disponibles sin asignar.'
              : 'Ningún tag coincide con la búsqueda.'}
          </p>
        )}
        <div
          style={{
            maxHeight: 320,
            overflowY: 'auto',
            marginTop: 6,
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
          }}
        >
          {filtrados.map((t) => {
            const ctx = contextoTag(t);
            return (
              <label
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '8px 10px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={seleccionados.has(Number(t.id))}
                  onChange={() => toggle(Number(t.id))}
                  style={{ marginTop: 2 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{etiquetaTag(t)}</div>
                  {ctx && (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#94a3b8',
                        marginTop: 2,
                        wordBreak: 'break-word',
                      }}
                    >
                      {ctx}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={asignar}
          disabled={seleccionados.size === 0 || cargando}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 0,
            background: seleccionados.size === 0 ? '#cbd5e1' : '#0284c7',
            color: '#fff',
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
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            color: '#475569',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔄 Recargar
        </button>
      </div>

      {error && <p style={{ color: '#b91c1c', fontSize: 13, marginTop: 8 }}>{error}</p>}
      {exito && <p style={{ color: '#166534', fontSize: 13, marginTop: 8 }}>{exito}</p>}
    </div>
  );
}