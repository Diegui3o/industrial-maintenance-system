// src/modules/umbrales/components/JerarquiaCascadeSelector.tsx
// Selector jerárquico completo.
// Niveles: Área → Proceso → Subproceso → Equipo → Componente → (Subcomponente) → Repuesto
// Degradación elegante cuando un nivel está vacío.

import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../../theme/colors';
import { jerarquiaApi } from '../services/jerarquiaApi';
import type {
  ProcesoPlanta,
  SubprocesoPlanta,
  EquipoJerarquia,
  ComponenteJerarquia,
  SubcomponenteJerarquia,
  RepuestoJerarquia,
  SeleccionJerarquica,
} from '../../../shared/types/seleccionJerarquica';
import {
  etiquetaEquipo,
  etiquetaComponente,
  etiquetaRepuesto,
  nombreDe,
  norm,
} from '../../../shared/utils/jerarquiaHelpers';

interface Props {
  onSelect: (seleccion: SeleccionJerarquica) => void;
  /** Si se pasa, el selector arranca con este equipo preseleccionado */
  equipoIdInicial?: number;
}

const AREAS: { key: string; label: string }[] = [
  { key: 'PLANTA', label: '🏭 Planta' },
  { key: 'MINA', label: '⛏️ Mina' },
  { key: 'INFRAESTRUCTURA', label: '💻 Infraestructura' },
];

export default function JerarquiaCascadeSelector({ onSelect, equipoIdInicial }: Props) {
  // Catálogos
  const [procesos, setProcesos] = useState<ProcesoPlanta[]>([]);
  const [subprocesos, setSubprocesos] = useState<SubprocesoPlanta[]>([]);
  const [equipos, setEquipos] = useState<EquipoJerarquia[]>([]);
  const [componentes, setComponentes] = useState<ComponenteJerarquia[]>([]);
  const [subcomponentes, setSubcomponentes] = useState<SubcomponenteJerarquia[]>([]);
  const [repuestos, setRepuestos] = useState<RepuestoJerarquia[]>([]);

  // Selección actual
  const [area, setArea] = useState<string>('PLANTA');
  const [procesoId, setProcesoId] = useState<string>('');
  const [subprocesoId, setSubprocesoId] = useState<string>('');
  const [equipoId, setEquipoId] = useState<string>(equipoIdInicial ? String(equipoIdInicial) : '');
  const [componenteId, setComponenteId] = useState<string>('');
  const [subcomponenteId, setSubcomponenteId] = useState<string>('');
  const [repuestoId, setRepuestoId] = useState<string>('');

  // UI
  const [cargando, setCargando] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');

  // Carga inicial: procesos
  useEffect(() => {
    setCargando((p) => ({ ...p, procesos: true }));
    jerarquiaApi
      .getProcesos()
      .then(setProcesos)
      .catch(() => setError('No se pudieron cargar los procesos.'))
      .finally(() => setCargando((p) => ({ ...p, procesos: false })));
  }, []);

  // Subprocesos al elegir proceso
  useEffect(() => {
    setSubprocesos([]);
    setSubprocesoId('');
    setEquipos([]);
    setEquipoId('');
    setComponentes([]);
    setComponenteId('');
    setSubcomponentes([]);
    setSubcomponenteId('');
    setRepuestos([]);
    setRepuestoId('');
    if (!procesoId) return;
    setCargando((p) => ({ ...p, subprocesos: true }));
    jerarquiaApi
      .getSubprocesosPorProceso(Number(procesoId))
      .then(setSubprocesos)
      .catch(() => setError('No se pudieron cargar los subprocesos.'))
      .finally(() => setCargando((p) => ({ ...p, subprocesos: false })));
  }, [procesoId]);

  // Equipos al elegir subproceso
  useEffect(() => {
    setEquipos([]);
    setEquipoId('');
    setComponentes([]);
    setComponenteId('');
    setSubcomponentes([]);
    setSubcomponenteId('');
    setRepuestos([]);
    setRepuestoId('');
    if (!subprocesoId) return;
    const sub = subprocesos.find((s) => String(s.id) === subprocesoId);
    if (!sub) return;
    setCargando((p) => ({ ...p, equipos: true }));
    jerarquiaApi
      .getEquiposPorSubproceso(Number(subprocesoId), sub.nombre)
      .then((lista) => setEquipos(lista.filter((e) => norm(e.area).includes(norm(area)) || area === 'TODAS')))
      .catch(() => setError('No se pudieron cargar los equipos.'))
      .finally(() => setCargando((p) => ({ ...p, equipos: false })));
  }, [subprocesoId, subprocesos, area]);

  // Componentes al elegir equipo
  useEffect(() => {
    setComponentes([]);
    setComponenteId('');
    setSubcomponentes([]);
    setSubcomponenteId('');
    setRepuestos([]);
    setRepuestoId('');
    if (!equipoId) return;
    setCargando((p) => ({ ...p, componentes: true }));
    jerarquiaApi
      .getComponentesPorEquipo(Number(equipoId))
      .then(setComponentes)
      .catch(() => setError('No se pudieron cargar los componentes.'))
      .finally(() => setCargando((p) => ({ ...p, componentes: false })));
  }, [equipoId]);

  // Subcomponentes + repuestos al elegir componente
  useEffect(() => {
    setSubcomponentes([]);
    setSubcomponenteId('');
    setRepuestos([]);
    setRepuestoId('');
    if (!componenteId) return;
    setCargando((p) => ({ ...p, hijos: true }));
    Promise.all([
      jerarquiaApi.getSubcomponentesPorComponente(Number(componenteId)).catch(() => []),
      jerarquiaApi.getRepuestosPorComponente(Number(componenteId)).catch(() => []),
    ])
      .then(([subs, reps]) => {
        setSubcomponentes(subs);
        setRepuestos(reps);
      })
      .finally(() => setCargando((p) => ({ ...p, hijos: false })));
  }, [componenteId]);

  // Repuestos al elegir subcomponente
  useEffect(() => {
    if (!subcomponenteId) return;
    setRepuestos([]);
    setRepuestoId('');
    setCargando((p) => ({ ...p, repuestos: true }));
    jerarquiaApi
      .getRepuestosPorSubcomponente(Number(subcomponenteId))
      .then(setRepuestos)
      .catch(() => {})
      .finally(() => setCargando((p) => ({ ...p, repuestos: false })));
  }, [subcomponenteId]);

  // Notificar al padre cada vez que cambia la selección
  useEffect(() => {
    const proc = procesos.find((p) => String(p.id) === procesoId);
    const sub = subprocesos.find((s) => String(s.id) === subprocesoId);
    const eq = equipos.find((e) => String(e.id) === equipoId);
    const comp = componentes.find((c) => String(c.id) === componenteId);
    const subcomp = subcomponentes.find((s) => String(s.id) === subcomponenteId);
    const rep = repuestos.find((r) => String(r.id) === repuestoId);

    if (!eq) {
      onSelect({ nombreCompleto: '', tipo: '' });
      return;
    }

    const labels: SeleccionJerarquica['labels'] = {};
    let nombre = '';
    if (proc) { labels.proceso = proc.nombre; nombre += `${proc.nombre} › `; }
    if (sub) { labels.subproceso = sub.nombre; nombre += `${sub.nombre} › `; }
    nombre += etiquetaEquipo(eq);
    labels.equipo = nombreDe(eq);

    let tipo: SeleccionJerarquica['tipo'] = 'equipo';
    if (comp) {
      labels.componente = nombreDe(comp);
      nombre += ` › ${etiquetaComponente(comp)}`;
      tipo = 'componente';
    }
    if (subcomp) {
      labels.subcomponente = nombreDe(subcomp);
      nombre += ` › ${nombreDe(subcomp)}`;
      tipo = 'subcomponente';
    }
    if (rep) {
      labels.repuesto = nombreDe(rep);
      nombre += ` › ${etiquetaRepuesto(rep)}`;
      tipo = 'repuesto';
    }

    onSelect({
      procesoId: proc ? Number(proc.id) : undefined,
      subprocesoId: sub ? Number(sub.id) : undefined,
      equipoId: eq ? Number(eq.id) : undefined,
      componenteId: comp ? Number(comp.id) : undefined,
      subcomponenteId: subcomp ? Number(subcomp.id) : undefined,
      repuestoId: rep ? Number(rep.id) : undefined,
      tipo,
      nombreCompleto: nombre,
      labels,
    });
  }, [procesoId, subprocesoId, equipoId, componenteId, subcomponenteId, repuestoId,
      procesos, subprocesos, equipos, componentes, subcomponentes, repuestos, onSelect]);

  const equiposFiltrados = useMemo(() => {
    if (!busqueda.trim()) return equipos;
    const b = norm(busqueda);
    return equipos.filter((e) => norm(e.codigo).includes(b) || norm(e.nombre).includes(b));
  }, [equipos, busqueda]);

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    fontSize: 14,
    background: '#fff',
    color: '#1e293b',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: colors.text.muted,
    marginBottom: 6,
  };

  return (
    <div style={{
      background: '#fff', padding: 20, borderRadius: 8,
      border: `1px solid ${colors.border}`, marginBottom: 20,
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, color: colors.text.secondary }}>
        🏗️ Selector Jerárquico — Área › Proceso › Subproceso › Equipo › Componente › Repuesto
      </h3>

      {/* Filtro de área */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <strong style={{ fontSize: 13, alignSelf: 'center' }}>Área:</strong>
        {AREAS.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => { setArea(a.key); }}
            style={{
              padding: '7px 13px', borderRadius: 6, border: '1px solid',
              borderColor: area === a.key ? '#0284c7' : '#cbd5e1',
              background: area === a.key ? '#0284c7' : '#f8fafc',
              color: area === a.key ? '#fff' : '#475569',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Niveles */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12,
      }}>
        {/* Proceso */}
        <div>
          <label style={labelStyle}>1. Proceso ({procesos.length})</label>
          <select value={procesoId} onChange={(e) => setProcesoId(e.target.value)} style={selectStyle}
            disabled={cargando.procesos}>
            <option value="">{cargando.procesos ? 'Cargando…' : '-- Seleccionar proceso --'}</option>
            {procesos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>

        {/* Subproceso */}
        <div>
          <label style={labelStyle}>2. Subproceso ({subprocesos.length})</label>
          <select value={subprocesoId} onChange={(e) => setSubprocesoId(e.target.value)} style={selectStyle}
            disabled={!procesoId || cargando.subprocesos}>
            <option value="">{cargando.subprocesos ? 'Cargando…' : '-- Seleccionar subproceso --'}</option>
            {subprocesos.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        {/* Equipo */}
        <div>
          <label style={labelStyle}>3. Equipo ({equiposFiltrados.length})</label>
          <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)} style={selectStyle}
            disabled={!subprocesoId || cargando.equipos}>
            <option value="">{cargando.equipos ? 'Cargando…' : '-- Seleccionar equipo --'}</option>
            {equiposFiltrados.map((e) => <option key={e.id} value={e.id}>{etiquetaEquipo(e)}</option>)}
          </select>
        </div>

        {/* Componente */}
        <div>
          <label style={labelStyle}>4. Componente ({componentes.length})</label>
          <select value={componenteId} onChange={(e) => setComponenteId(e.target.value)} style={selectStyle}
            disabled={!equipoId || cargando.componentes}>
            <option value="">
              {cargando.componentes ? 'Cargando…' : '-- Todo el equipo --'}
            </option>
            {componentes.map((c) => <option key={c.id} value={c.id}>{etiquetaComponente(c)}</option>)}
          </select>
        </div>

        {/* Subcomponente (opcional) */}
        {subcomponentes.length > 0 && (
          <div>
            <label style={labelStyle}>5. Subcomponente ({subcomponentes.length})</label>
            <select value={subcomponenteId} onChange={(e) => setSubcomponenteId(e.target.value)} style={selectStyle}>
              <option value="">-- Todo el componente --</option>
              {subcomponentes.map((s) => <option key={s.id} value={s.id}>{nombreDe(s)}</option>)}
            </select>
          </div>
        )}

        {/* Repuesto (opcional) */}
        {repuestos.length > 0 && (
          <div>
            <label style={labelStyle}>
              {subcomponentes.length > 0 ? '6' : '5'}. Repuesto ({repuestos.length})
            </label>
            <select value={repuestoId} onChange={(e) => setRepuestoId(e.target.value)} style={selectStyle}
              disabled={cargando.repuestos}>
              <option value="">-- Sin repuesto específico --</option>
              {repuestos.map((r) => <option key={r.id} value={r.id}>{etiquetaRepuesto(r)}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Buscador (aplica solo a equipos) */}
      {equipos.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar equipos por código o nombre…"
            style={selectStyle}
          />
        </div>
      )}

      {/* Mensajes de estado */}
      {error && <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 0 }}>{error}</p>}

      {equipoId && componentes.length === 0 && !cargando.componentes && (
        <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
          ⚠️ Este equipo no tiene componentes registrados.
        </p>
      )}
      {componenteId && subcomponentes.length === 0 && repuestos.length === 0 && !cargando.hijos && (
        <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
          ℹ️ Este componente aún no tiene subcomponentes ni repuestos asociados.
        </p>
      )}
      {subcomponentes.length === 0 && componenteId && (
        <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
          El nivel de subcomponentes aparecerá cuando existan datos en <code>subcomponentes_equipo</code>.
        </p>
      )}
    </div>
  );
}