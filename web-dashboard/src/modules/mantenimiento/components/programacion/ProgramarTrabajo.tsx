import { useEffect, useState } from "react";
import "./programar.css";

type Equipo = {
  id: number;
  codigo: string;
  nombre: string;
  fase?: string;
  area?: string;
  tipo?: string;
  ubicacion?: string;
};

type Material = {
  codigoSap: string;
  descripcion: string;
  cantidad: string;
  costo: string;
  stock: string;
  unidad: string;
  tipoMaterial: string;
  mpv: string;
  mcp: string;
};

type Props = {
  onCerrar: () => void;
  fechaProgramada?: string;
};

export default function ProgramarTrabajo({
  onCerrar,
  fechaProgramada,
}: Props) {
  const [equipoBusqueda, setEquipoBusqueda] = useState("");
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(false);

  const [actividad, setActividad] = useState("");
  const [ot, setOt] = useState("");

  const [numeroPersonal, setNumeroPersonal] = useState("");
  const [horas, setHoras] = useState("");
  const [responsable, setResponsable] = useState("");
  const [turno, setTurno] = useState("");

  const [comentario, setComentario] = useState("");

  const [mostrarMaterial, setMostrarMaterial] = useState(false);

  const [material, setMaterial] = useState<Material>({
    codigoSap: "",
    descripcion: "",
    cantidad: "",
    costo: "",
    stock: "",
    unidad: "",
    tipoMaterial: "",
    mpv: "",
    mcp: "",
  });

  useEffect(() => {
    cargarEquipos();
  }, []);

  async function cargarEquipos() {
    try {
      setCargando(true);

      const respuesta = await fetch("/api/equipos");

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los equipos");
      }

      const data = await respuesta.json();

      setEquipos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando equipos:", error);
      setEquipos([]);
    } finally {
      setCargando(false);
    }
  }

  const resultados = equipos.filter((item) => {
    const texto = equipoBusqueda.toLowerCase().trim();

    if (!texto) {
      return false;
    }

    return (
      item.codigo?.toLowerCase().includes(texto) ||
      item.nombre?.toLowerCase().includes(texto)
    );
  });

  const personal = Number(numeroPersonal) || 0;
  const horasNumero = Number(horas) || 0;
  const hh = personal * horasNumero;

  function cambiarMaterial(
    campo: keyof Material,
    valor: string
  ) {
    setMaterial((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function registrar() {
    const datos = {
      equipoId: equipo?.id,
      equipo,
      fechaProgramada,
      actividad,
      ot,
      numeroPersonal: personal,
      horas: horasNumero,
      hh,
      responsable,
      turno,
      materiales: mostrarMaterial ? [material] : [],
      comentario,
    };

    console.log("PROGRAMACIÓN SEMANAL:", datos);

    // Siguiente paso:
    // conectar esta información con el endpoint
    // de programación semanal.
  }

  const fechaTexto = fechaProgramada
    ? new Date(
        `${fechaProgramada}T00:00:00`
      ).toLocaleDateString("es-PE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="prog-modal">
      <div className="prog-form">
        {/* CABECERA */}

        <div className="prog-form-header">
          <div>
            <span>PROGRAMACIÓN SEMANAL</span>

            <h3>Programar mantenimiento</h3>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* FECHA */}

        <section className="prog-section">
          <div className="prog-section-title">
            Día programado
          </div>

          <div className="prog-program-date">
            <strong>{fechaTexto}</strong>
          </div>
        </section>

        {/* EQUIPO */}

        <section className="prog-section">
          <div className="prog-section-title">
            Equipo
          </div>

          {!equipo ? (
            <div className="prog-equipment-search">
              <input
                value={equipoBusqueda}
                onChange={(e) => {
                  setEquipoBusqueda(e.target.value);
                  setEquipo(null);
                }}
                placeholder="Buscar equipo por código o nombre..."
                autoFocus
              />

              {equipoBusqueda && (
                <div className="prog-results">
                  {cargando && (
                    <div className="prog-no-results">
                      Cargando equipos...
                    </div>
                  )}

                  {!cargando &&
                    resultados.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="prog-result"
                        onClick={() => {
                          setEquipo(item);
                          setEquipoBusqueda("");
                        }}
                      >
                        <span className="obj-equipo">
                          EQUIPO
                        </span>

                        <div>
                          <strong>{item.nombre}</strong>

                          <small>{item.codigo}</small>
                        </div>
                      </button>
                    ))}

                  {!cargando &&
                    resultados.length === 0 && (
                      <div className="prog-no-results">
                        No se encontraron equipos
                      </div>
                    )}
                </div>
              )}
            </div>
          ) : (
            <div className="prog-equipment-selected">
              <div>
                <strong>{equipo.nombre}</strong>

                <span>{equipo.codigo}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEquipo(null);
                  setEquipoBusqueda("");
                }}
              >
                Cambiar
              </button>
            </div>
          )}

          {equipo && (
            <div className="prog-equipment-meta">
              <span>
                Fase:{" "}
                <strong>
                  {equipo.fase || "Sin clasificar"}
                </strong>
              </span>

              <span>
                Área:{" "}
                <strong>
                  {equipo.area || "—"}
                </strong>
              </span>

              <span>
                Tipo:{" "}
                <strong>
                  {equipo.tipo || "—"}
                </strong>
              </span>

              <span>
                Ubicación:{" "}
                <strong>
                  {equipo.ubicacion || "—"}
                </strong>
              </span>
            </div>
          )}
        </section>

        {/* TRABAJO */}

        <section className="prog-section">
          <div className="prog-section-title">
            Trabajo
          </div>

          <div className="prog-grid prog-grid--two">
            <label>
              Actividad
              <input
                value={actividad}
                onChange={(e) =>
                  setActividad(e.target.value)
                }
                placeholder="¿Qué trabajo se realizará?"
              />
            </label>

            <label>
              OT
              <input
                value={ot}
                onChange={(e) =>
                  setOt(e.target.value)
                }
                placeholder="Número de OT"
              />
            </label>
          </div>

          <label>
            Comentario / justificación
            <textarea
              value={comentario}
              onChange={(e) =>
                setComentario(e.target.value)
              }
              placeholder="Detalle, alcance o justificación del trabajo..."
              rows={3}
            />
          </label>
        </section>

        {/* RECURSOS */}

        <section className="prog-section">
          <div className="prog-section-title">
            Recursos
          </div>

          <div className="prog-grid">
            <label>
              N° personal
              <input
                type="number"
                min="1"
                value={numeroPersonal}
                onChange={(e) =>
                  setNumeroPersonal(e.target.value)
                }
              />
            </label>

            <label>
              Total horas mantto.
              <input
                type="number"
                min="0"
                step="0.5"
                value={horas}
                onChange={(e) =>
                  setHoras(e.target.value)
                }
              />
            </label>

            <label>
              H-H
              <input
                value={hh ? hh.toFixed(2) : ""}
                readOnly
                className="prog-calculated"
              />
            </label>

            <label>
              Responsable
              <input
                value={responsable}
                onChange={(e) =>
                  setResponsable(e.target.value)
                }
              />
            </label>

            <label>
              Turno
              <select
                value={turno}
                onChange={(e) =>
                  setTurno(e.target.value)
                }
              >
                <option value="">
                  Seleccionar
                </option>

                <option value="dia">
                  Día
                </option>

                <option value="noche">
                  Noche
                </option>
              </select>
            </label>
          </div>
        </section>

        {/* MATERIALES */}

        <section className="prog-section">
          <div className="prog-section-title">
            Materiales
          </div>

          <button
            type="button"
            className="prog-add-material"
            onClick={() =>
              setMostrarMaterial(!mostrarMaterial)
            }
          >
            {mostrarMaterial
              ? "− Ocultar materiales"
              : "+ Añadir materiales"}
          </button>

          {mostrarMaterial && (
            <div className="prog-material-grid">
              <label>
                COD SAP
                <input
                  value={material.codigoSap}
                  onChange={(e) =>
                    cambiarMaterial(
                      "codigoSap",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                DESCRIPCIÓN
                <input
                  value={material.descripcion}
                  onChange={(e) =>
                    cambiarMaterial(
                      "descripcion",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                CANT.
                <input
                  type="number"
                  min="0"
                  value={material.cantidad}
                  onChange={(e) =>
                    cambiarMaterial(
                      "cantidad",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                COSTO
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={material.costo}
                  onChange={(e) =>
                    cambiarMaterial(
                      "costo",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                STOCK
                <input
                  value={material.stock}
                  onChange={(e) =>
                    cambiarMaterial(
                      "stock",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                UND.
                <input
                  value={material.unidad}
                  onChange={(e) =>
                    cambiarMaterial(
                      "unidad",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                TIPO MATERIAL
                <input
                  value={material.tipoMaterial}
                  onChange={(e) =>
                    cambiarMaterial(
                      "tipoMaterial",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                MPV
                <input
                  value={material.mpv}
                  onChange={(e) =>
                    cambiarMaterial(
                      "mpv",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                MCP
                <input
                  value={material.mcp}
                  onChange={(e) =>
                    cambiarMaterial(
                      "mcp",
                      e.target.value
                    )
                  }
                />
              </label>
            </div>
          )}
        </section>

        {/* ACCIONES */}

        <div className="prog-bottom">
          <button
            type="button"
            className="prog-cancel"
            onClick={onCerrar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="prog-save"
            onClick={registrar}
            disabled={!equipo || !actividad}
          >
            Programar mantenimiento
          </button>
        </div>
      </div>
    </div>
  );
}