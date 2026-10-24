import { useEffect, useState } from "react";

import {
  getHistorialRepuesto,
  getEquiposCompatibles,
  agregarCompatibilidadEquipo,
  eliminarCompatibilidadEquipo,
  type Repuesto,
  type RepuestoHistorial,
} from "../../services/plantaRepuestosApi";

import { getEquipos } from "../../services/plantaEquiposApi";
import type { Equipo } from "../../services/plantaEquiposApi";

import "./RepuestoFicha.css";

interface Props {
  repuesto: Repuesto;
  onVolver: () => void;
}

function valor(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function Campo({ etiqueta, valor: v }: { etiqueta: string; valor: unknown }) {
  return (
    <div className="repuesto-ficha-campo">
      <span>{etiqueta}</span>
      <strong>{valor(v)}</strong>
    </div>
  );
}

export function RepuestoFicha({
  repuesto,
  onVolver,
}: Props) {
  const [editando, setEditando] = useState(false);
  const [historial, setHistorial] = useState<RepuestoHistorial[]>([]);
  const [equiposCompatibles, setEquiposCompatibles] = useState<number[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [nuevoEquipoId, setNuevoEquipoId] = useState("");
  const [loadingHist, setLoadingHist] = useState(false);

  useEffect(() => {
    async function cargar() {
      setLoadingHist(true);
      try {
        const [hist, eqCompat, eqs] = await Promise.all([
          getHistorialRepuesto(repuesto.id),
          getEquiposCompatibles(repuesto.id),
          getEquipos(),
        ]);
        setHistorial(hist);
        setEquiposCompatibles(eqCompat);
        setEquipos(eqs);
      } catch (e) {
        console.error("Error cargando ficha repuesto:", e);
      } finally {
        setLoadingHist(false);
      }
    }
    cargar();
  }, [repuesto.id]);

  async function agregarCompatibilidad() {
    const id = Number(nuevoEquipoId);
    if (!id) return;
    try {
      await agregarCompatibilidadEquipo(repuesto.id, id);
      setEquiposCompatibles(prev => [...prev, id]);
      setNuevoEquipoId("");
    } catch (e) {
      alert("Error agregando compatibilidad: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  async function quitarCompatibilidad(eqId: number) {
    if (!window.confirm("¿Quitar esta compatibilidad?")) return;
    try {
      await eliminarCompatibilidadEquipo(repuesto.id, eqId);
      setEquiposCompatibles(prev => prev.filter(id => id !== eqId));
    } catch (e) {
      alert("Error: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  if (editando) {
    return (
      <div className="repuesto-ficha">
        <div className="repuesto-ficha-titulo">
          <div>
            <span className="repuesto-ficha-tipo">EDITANDO REPUESTO</span>
            <h1>{repuesto.nombre}</h1>
          </div>
        </div>
        <div className="repuesto-ficha-placeholder">
          <p>Edición inline - usar RepuestoForm en panel lateral</p>
          <button onClick={() => setEditando(false)}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="repuesto-ficha">
      <div className="repuesto-ficha-top">
        <span className="repuesto-ficha-kicker">CATÁLOGO TÉCNICO</span>
      </div>

      <div className="repuesto-ficha-titulo">
        <div>
          <span className="repuesto-ficha-tipo">{valor(repuesto.categoria)}</span>
          <h1>{repuesto.nombre}</h1>
          <p>Ficha técnica completa del repuesto.</p>
        </div>
        <div className="repuesto-ficha-acciones">
          <span className={`componente-estado ${repuesto.activo ? "activo" : "inactivo"}`}>
            {repuesto.activo ? "Activo" : "Inactivo"}
          </span>
          <button className="repuesto-ficha-editar" onClick={() => setEditando(true)}>Editar</button>
        </div>
      </div>

      <section className="repuesto-ficha-bloque">
        <h2>Identificación</h2>
        <div className="repuesto-ficha-grid">
          <Campo etiqueta="Código" valor={repuesto.codigo} />
          <Campo etiqueta="Código SAP" valor={repuesto.codigo_sap} />
          <Campo etiqueta="Nombre" valor={repuesto.nombre} />
          <Campo etiqueta="Categoría" valor={repuesto.categoria} />
          <Campo etiqueta="Criticidad" valor={repuesto.criticidad} />
          <Campo etiqueta="Unidad de medida" valor={repuesto.unidad_medida} />
        </div>
      </section>

      <section className="repuesto-ficha-bloque">
        <h2>Stock</h2>
        <div className="repuesto-ficha-grid">
          <Campo etiqueta="Stock actual" valor={repuesto.stock_actual} />
          <Campo etiqueta="Stock mínimo" valor={repuesto.stock_minimo} />
          <Campo etiqueta="Marca" valor={repuesto.marca} />
          <Campo etiqueta="Modelo" valor={repuesto.modelo} />
        </div>
      </section>

      {repuesto.especificaciones_tecnicas && (
        <section className="repuesto-ficha-bloque">
          <h2>Especificaciones técnicas</h2>
          <div className="repuesto-ficha-descripcion">{repuesto.especificaciones_tecnicas}</div>
        </section>
      )}

      <section className="repuesto-ficha-bloque">
        <h2>Compatibilidad con equipos</h2>
        <div className="repuesto-compatibilidad">
          <div className="repuesto-compatibilidad-lista">
            {equiposCompatibles.length === 0 ? (
              <span className="repuesto-empty">Sin equipos compatibles definidos</span>
            ) : (
              equiposCompatibles.map(eqId => {
                const eq = equipos.find(e => e.id === eqId);
                return (
                  <div key={eqId} className="repuesto-compat-item">
                    <span>{eq?.codigo ? `${eq.codigo} - ` : ""}{eq?.nombre || `Equipo #${eqId}`}</span>
                    <button className="repuesto-compat-quitar" onClick={() => quitarCompatibilidad(eqId)}>✕</button>
                  </div>
                );
              })
            )}
          </div>
          <div className="repuesto-compat-agregar">
            <select value={nuevoEquipoId} onChange={e => setNuevoEquipoId(e.target.value)}>
              <option value="">Seleccionar equipo...</option>
              {equipos.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.codigo ? `${eq.codigo} - ` : ""}{eq.nombre}
                </option>
              ))}
            </select>
            <button onClick={agregarCompatibilidad}>Agregar</button>
          </div>
        </div>
      </section>

      <section className="repuesto-ficha-bloque">
        <h2>Historial de cambios</h2>
        {loadingHist ? <span>Cargando...</span> : historial.length === 0 ? (
          <span className="repuesto-empty">Sin historial registrado</span>
        ) : (
          <div className="repuesto-historial">
            {historial.map(h => (
              <div key={h.id} className="repuesto-hist-item">
                <div className="repuesto-hist-header">
                  <strong>{h.campo}</strong>
                  <span className={`repuesto-hist-origen ${h.tipo_origen}`}>{h.tipo_origen}</span>
                  <span className="repuesto-hist-fecha">
                    {new Date(h.creado_en).toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="repuesto-hist-valores">
                  <span>Antes: <strong>{h.valor_anterior ?? "—"}</strong></span>
                  <span>Después: <strong>{h.valor_nuevo ?? "—"}</strong></span>
                </div>
                {h.comentario && <div className="repuesto-hist-comentario">{h.comentario}</div>}
                <div className="repuesto-hist-meta">
                  {h.usuario_id && <span>Usuario: {h.usuario_id}</span>}
                  {h.conector_id && <span>Conector: {h.conector_id}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="repuesto-ficha-final">
        <button className="repuesto-ficha-volver" onClick={onVolver}>← Volver al catálogo</button>
      </div>
    </div>
  );
}