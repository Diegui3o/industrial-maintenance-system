// src/modules/umbrales/components/AsignacionTagPanel.tsx
// Asigna tags PI a un equipo.
// IMPORTANTE: el backend actual solo soporta equipo_id en tags_descubiertos.
// Los niveles componente/repuesto están visualmente deshabilitados con nota.

import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../theme/colors';
import { piTagsApi } from '../services/piTagsApi';
import type { TagDescubierto } from '../../../shared/types/piTag';
import { etiquetaTag, norm } from '../../../shared/utils/jerarquiaHelpers';

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
      const [sinEquipo, porEquipo] = await Promise.all([
        piTagsApi.getSinEquipo(),
        piTagsApi.getTagsPorEquipo(equipoId),
      ]);
      setDisponibles(sinEquipo);
      const tagsEq = Array.isArray(porEquipo) ? porEquipo : porEquipo?.tags ?? [];
      setAsignados(tagsEq);
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
      (t) => norm(t.tag_name).includes(b) || norm(t.tag_path ?? '').includes(b),
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
      const tagsParaAsignar = disponibles
        .filter((t) => seleccionados.has(t.id))
        .map((t) => t.tag_path ?? t.tag_name);
      await piTagsApi.asignarTagsAEquipo(equipoId, tagsParaAsignar);
      setExito(`✅ ${tagsParaAsignar.length} tag(s) asignado(s).`);
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
    width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`,
    borderRadius: 8, fontSize: 14,
  };

  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: `1px solid ${colors.border}` }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, color: colors.text.secondary }}>
        🔌 Tags PI — {equipoNombre ?? `Equipo #${equipoId}`}
      </h3>

      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
        Asignando a: <strong>Equipo</strong> ·
        Componente / Repuesto: <em>pendiente migración backend</em>
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar tag por nombre o ruta…"
        style={{ ...inputStyle, marginBottom: 12 }}
      />

      {/* Tags asignados */}
      {asignados.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong style={{ fontSize: 13 }}>Asignados ({asignados.length}):</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {asignados.map((t, i) => (
              <span key={i} style={{
                background: '#dcfce7', color: '#166534', padding: '4px 10px',
                borderRadius: 999, fontSize: 12,
              }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Disponibles */}
      <div>
        <strong style={{ fontSize: 13 }}>
          Disponibles sin asignar ({filtrados.length}):
        </strong>
        {cargando && <p style={{ fontSize: 12, color: '#64748b' }}>Cargando…</p>}
        {!cargando && filtrados.length === 0 && (
          <p style={{ fontSize: 12, color: '#64748b' }}>
            No hay tags descubiertos sin asignar. Cuando el connector envíe nuevos, aparecerán aquí.
          </p>
        )}
        <div style={{ maxHeight: 240, overflowY: 'auto', marginTop: 6, border: `1px solid ${colors.border}`, borderRadius: 6 }}>
          {filtrados.map((t) => (
            <label key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: 13,
            }}>
              <input
                type="checkbox"
                checked={seleccionados.has(t.id)}
                onChange={() => toggle(t.id)}
              />
              <span style={{ flex: 1 }}>{etiquetaTag(t)}</span>
              {t.unidad && <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.unidad}</span>}
            </label>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={asignar}
          disabled={seleccionados.size === 0 || cargando}
          style={{
            padding: '10px 16px', borderRadius: 8, border: 0,
            background: seleccionados.size === 0 ? '#cbd5e1' : '#0284c7',
            color: '#fff', fontWeight: 600,
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
            padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1',
            background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer',
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