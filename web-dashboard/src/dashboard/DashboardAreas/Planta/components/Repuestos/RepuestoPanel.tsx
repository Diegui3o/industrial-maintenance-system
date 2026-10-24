import { useState, useEffect, useMemo, useRef } from "react";
import { 
  crearRepuesto 
} from "../../services/plantaRepuestosApi";
import { 
  getTodosComponentes, 
  type Componente
} from "../../services/plantaComponentesApi";

interface Props {
  abierto: boolean;
  onClosing: () => void;
  onGuardado?: () => void;
}

interface Asignacion {
  componenteId: number;
  nombre: string;
  cantidad: number;
}

export function RepuestoPanel({ abierto, onClosing, onGuardado }: Props) {
  const [categoria, setCategoria] = useState<"Instrumental" | "Mecánico" | "Eléctrico" | "">("");
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [codigoSAP, setCodigoSAP] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [criticidad, setCriticidad] = useState("Media");
  const [estado, setEstado] = useState<"activo" | "inactivo" | "falla" | "planeado" | "obsoleto">("activo");
  const [stockActual, setStockActual] = useState(0);
  const [stockMinimo, setStockMinimo] = useState(0);
  const [observaciones, setObservaciones] = useState("");

  const [tagArea, setTagArea] = useState("200XX_");
  const [tagSistema, setTagSistema] = useState("0010_");
  const [tagEquipo, setTagEquipo] = useState("");
  const [tagScada, setTagScada] = useState("");
  const [tagCompleto, setTagCompleto] = useState("");

  const [poleaDiaMayor, setPoleaDiaMayor] = useState("");
  const [poleaDiaMenor, setPoleaDiaMenor] = useState("");
  const [poleaCanales, setPoleaCanales] = useState("");
  const [poleaFaja, setPoleaFaja] = useState("");
  const [poleaChavetero, setPoleaChavetero] = useState("");
  const [poleaManguito, setPoleaManguito] = useState("");

  const [listaComponentes, setListaComponentes] = useState<Componente[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [tempCompId, setTempCompId] = useState<number | "">("");
  const [tempCant, setTempCant] = useState(1);

  // Estados del combo (selector con buscador)
  const [comboAbierto, setComboAbierto] = useState(false);
  const [comboTexto, setComboTexto] = useState("");
  const comboRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto) {
      getTodosComponentes().then(setListaComponentes).catch(console.error);
    }
  }, [abierto]);

  // Cerrar combo al hacer click fuera
  useEffect(() => {
    function handleClickFuera(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setComboAbierto(false);
      }
    }
    if (comboAbierto) {
      document.addEventListener("mousedown", handleClickFuera);
      return () => document.removeEventListener("mousedown", handleClickFuera);
    }
  }, [comboAbierto]);

  // Componentes filtrados según texto del combo
  const componentesFiltrados = useMemo(() => {
    const texto = comboTexto.trim().toLowerCase();
    if (!texto) return listaComponentes.slice(0, 100);

    return listaComponentes
      .filter((comp) => {
        const contenido = [
          comp.codigo ?? '',
          comp.codigo_sap ?? '',
          comp.tag ?? '',
          comp.nombre ?? '',
          comp.tipo_componente ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return contenido.includes(texto);
      })
      .slice(0, 100);
  }, [listaComponentes, comboTexto]);

  useEffect(() => {
    if (categoria === "Instrumental") {
      setTagCompleto(`${tagArea}${tagSistema}${tagEquipo}${tagScada}`.replace(/_+$/, ""));
    }
  }, [tagArea, tagSistema, tagEquipo, tagScada, categoria]);

  if (!abierto) return null;

  const seleccionarComponente = (comp: Componente) => {
    setTempCompId(comp.id);
    setComboTexto(comp.nombre);
    setComboAbierto(false);
  };

  const agregarAsignacion = () => {
    if (!tempCompId) return;
    const comp = listaComponentes.find(c => c.id === tempCompId);
    if (!comp) return;

    // Evitar duplicados
    if (asignaciones.some(a => a.componenteId === comp.id)) {
      setError("Este componente ya está en la lista");
      return;
    }

    setAsignaciones([...asignaciones, { 
      componenteId: comp.id, 
      nombre: comp.nombre, 
      cantidad: tempCant
    }]);
    setTempCompId(""); 
    setTempCant(1);
    setComboTexto("");
  };

  const quitarAsignacion = (idx: number) => {
    setAsignaciones(asignaciones.filter((_, i) => i !== idx));
  };

  const guardarTodo = async () => {
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setGuardando(true);
    try {
      let specs = observaciones;
      if (categoria === "Instrumental") {
        specs = `Tags: Area=${tagArea}, Sist=${tagSistema}, Eq=${tagEquipo}, SCADA=${tagScada}. Full=${tagCompleto}. ${observaciones}`;
      } else if (categoria === "Mecánico" && poleaDiaMayor) {
        specs = `Polea: D.Mayor=${poleaDiaMayor}, D.Menor=${poleaDiaMenor}, Canales=${poleaCanales}, Faja=${poleaFaja}, Chavetero=${poleaChavetero}, Manguito=${poleaManguito}. ${observaciones}`;
      }

      const nuevoRepuesto = await crearRepuesto({
          nombre, categoria, codigo_sap: codigoSAP, marca, modelo,
          criticidad, estado, stock_actual: stockActual, stock_minimo: stockMinimo,
          especificaciones_tecnicas: specs, activo: true
      });

      for (const asig of asignaciones) {
        await fetch(`/api/planta/componentes/${asig.componenteId}/repuestos`, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ 
            repuesto_id: nuevoRepuesto.id, 
            cantidad: asig.cantidad
          })
        });
      }

      onGuardado?.();
      onClosing();
      resetForm();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const resetForm = () => {
    setCategoria(""); setPaso(1); setNombre(""); setAsignaciones([]);
    setComboTexto(""); setComboAbierto(false); setTempCompId(""); setTempCant(1);
  };

  return (
    <>
      <div className="componentes-panel-overlay" onClick={onClosing} />
      <aside className="componentes-panel">
        <header className="componentes-panel-header">
          <h3>{paso === 1 ? "Seleccionar Categoría" : `Nuevo Repuesto ${categoria}`}</h3>
          <button onClick={onClosing}>×</button>
        </header>

        <div className="componentes-panel-body">
          {paso === 1 ? (
            <div className="repuesto-categoria-selector">
              <div className="cat-card" onClick={() => { setCategoria("Instrumental"); setPaso(2); }}>
                <span className="icon">📡</span>
                <strong>Instrumental</strong>
                <small>Sensores, Transmisores, Tags Industriales</small>
              </div>
              <div className="cat-card" onClick={() => { setCategoria("Mecánico"); setPaso(2); }}>
                <span className="icon">⚙️</span>
                <strong>Mecánico</strong>
                <small>Poleas, Rodamientos, Transmisión</small>
              </div>
              <div className="cat-card" onClick={() => { setCategoria("Eléctrico"); setPaso(2); }}>
                <span className="icon">⚡</span>
                <strong>Eléctrico</strong>
                <small>Motores, Contactores, Protecciones</small>
              </div>
            </div>
          ) : (
            <div className="repuesto-form-scroll">
              <button className="btn-volver-paso" onClick={() => setPaso(1)}>← Cambiar categoría</button>
              
              <section className="form-section">
                  <h4>1. Datos de Catálogo (Almacén)</h4>
                  <div className="componente-form-grid">
                    <label className="full"><span>Nombre del Repuesto *</span><input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Sensor Inductivo M30" /></label>
                    <label><span>Código SAP</span><input value={codigoSAP} onChange={e => setCodigoSAP(e.target.value)} /></label>
                    <label>
                      <span>Estado</span>
                      <select value={estado} onChange={e => setEstado(e.target.value as typeof estado)}>
                        <option value="activo">✅ Activo (en uso)</option>
                        <option value="planeado">📋 Planeado (para proyecto)</option>
                        <option value="falla">⚠️ Falla (dañado)</option>
                        <option value="inactivo">⛔ Inactivo (fuera de servicio)</option>
                        <option value="obsoleto">🗑️ Obsoleto (ya no se usa)</option>
                      </select>
                    </label>
                    <label><span>Criticidad</span><select value={criticidad} onChange={e => setCriticidad(e.target.value)}><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></label>
                    <label><span>Stock Actual</span><input type="number" value={stockActual} onChange={e => setStockActual(Number(e.target.value))} /></label>
                    <label><span>Stock Mínimo</span><input type="number" value={stockMinimo} onChange={e => setStockMinimo(Number(e.target.value))} /></label>
                    <label><span>Marca</span><input value={marca} onChange={e => setMarca(e.target.value)} /></label>
                    <label><span>Modelo</span><input value={modelo} onChange={e => setModelo(e.target.value)} /></label>
                    <label className="full"><span>Observaciones</span><textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={2} /></label>
                  </div>
              </section>

              {categoria === "Instrumental" && (
                <section className="form-section highlight">
                  <h4>2. Identificación Industrial (Tags)</h4>
                  <div className="componente-form-grid">
                    <label><span>Tag Área</span><input value={tagArea} onChange={e => setTagArea(e.target.value)} /></label>
                    <label><span>Tag Sistema</span><input value={tagSistema} onChange={e => setTagSistema(e.target.value)} /></label>
                    <label><span>Tag Equipo</span><input value={tagEquipo} onChange={e => setTagEquipo(e.target.value)} placeholder="Ej: CH01P" /></label>
                    <label><span>Tag SCADA</span><input value={tagScada} onChange={e => setTagScada(e.target.value)} placeholder="Ej: ZS_01" /></label>
                    <label className="full"><span>Tag Industrial Completo</span><input value={tagCompleto} readOnly className="readonly" /></label>
                  </div>
                </section>
              )}

              {categoria === "Mecánico" && (
                <section className="form-section highlight">
                  <h4>2. Especificaciones de Polea / Mecánica</h4>
                  <div className="componente-form-grid">
                    <label><span>Diámetro Mayor</span><input value={poleaDiaMayor} onChange={e => setPoleaDiaMayor(e.target.value)} /></label>
                    <label><span>Diámetro Menor</span><input value={poleaDiaMenor} onChange={e => setPoleaDiaMenor(e.target.value)} /></label>
                    <label><span>N° Canales</span><input value={poleaCanales} onChange={e => setPoleaCanales(e.target.value)} /></label>
                    <label><span>Tipo de Faja</span><input value={poleaFaja} onChange={e => setPoleaFaja(e.target.value)} /></label>
                    <label><span>Canal Chavetero</span><input value={poleaChavetero} onChange={e => setPoleaChavetero(e.target.value)} /></label>
                    <label><span>Manguito</span><input value={poleaManguito} onChange={e => setPoleaManguito(e.target.value)} /></label>
                  </div>
                </section>
              )}

              <section className="form-section">
                <h4>
                  3. Asignación a Componentes{' '}
                  <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '12px' }}>(Opcional)</span>
                </h4>

                {/* Fila única: Combo buscador + Cantidad + Botón */}
                <div className="asig-fila-combo">
                  {/* Combo con buscador integrado */}
                  <div className="combo-wrapper" ref={comboRef}>
                    <div
                      className={`combo-input ${comboAbierto ? 'combo-abierto' : ''}`}
                      onClick={() => setComboAbierto(!comboAbierto)}
                    >
                      <span className="combo-icono">🔍</span>
                      <input
                        type="text"
                        value={comboTexto}
                        onChange={e => {
                          setComboTexto(e.target.value);
                          setTempCompId("");
                          if (!comboAbierto) setComboAbierto(true);
                        }}
                        onFocus={() => setComboAbierto(true)}
                        placeholder="Buscar y seleccionar componente..."
                        className="combo-texto"
                      />
                      <span className="combo-flecha">{comboAbierto ? '▲' : '▼'}</span>
                    </div>

                    {comboAbierto && (
                      <div className="combo-lista">
                        {componentesFiltrados.length === 0 ? (
                          <div className="combo-vacio">Sin resultados</div>
                        ) : (
                          componentesFiltrados.map(c => (
                            <div
                              key={c.id}
                              className={`combo-item ${tempCompId === c.id ? 'combo-item-activo' : ''}`}
                              onClick={() => seleccionarComponente(c)}
                            >
                              <span className="combo-item-nombre">{c.nombre}</span>
                              {c.codigo && (
                                <span className="combo-item-codigo">{c.codigo}</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cantidad */}
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={tempCant}
                    onChange={e => setTempCant(Number(e.target.value) || 1)}
                    placeholder="Cant."
                    title="Cantidad requerida"
                    className="asig-cant-input"
                  />

                  {/* Botón añadir */}
                  <button
                    type="button"
                    onClick={agregarAsignacion}
                    disabled={!tempCompId}
                    className="asig-add-btn"
                    title="Añadir asignación"
                  >
                    ➕
                  </button>
                </div>

                {/* Lista de asignaciones */}
                {asignaciones.length > 0 && (
                  <div className="asig-lista">
                    {asignaciones.map((as, idx) => (
                      <div key={idx} className="asig-item">
                        <span className="asig-nombre">{as.nombre}</span>
                        <span className="asig-cant">×{as.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => quitarAsignacion(idx)}
                          title="Quitar"
                          className="asig-remove-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
          {error && <div className="componente-form-error">{error}</div>}
        </div>

        <footer className="componentes-panel-footer">
          <button className="componentes-btn-secondary" onClick={onClosing}>Cancelar</button>
          {paso === 2 && (
            <button className="componentes-btn-primary" onClick={guardarTodo} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Repuesto y Asignaciones"}
            </button>
          )}
        </footer>
      </aside>
    </>
  );
}