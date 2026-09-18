import { useEffect, useState } from "react";

import { getEquipos } from "../../../dashboard/DashboardAreas/Planta/services/equiposApi";

import "./programacion/programar.css";

type Props = {
  onCerrar: () => void;
};

type Equipo = {
  id: number;
  codigo: string;
  nombre: string;
};

export default function MantenimientoNoProgramado({
  onCerrar,
}: Props) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [equipo, setEquipo] = useState<Equipo | null>(null);

  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");

  const [tipoIntervencion, setTipoIntervencion] =
    useState("");

  const [modoFalla, setModoFalla] = useState("");
  const [causa, setCausa] = useState("");
  const [consecuencia, setConsecuencia] = useState("");
  const [descripcionEvento, setDescripcionEvento] =
    useState("");
  const [accionRealizada, setAccionRealizada] =
    useState("");

  const [standBy, setStandBy] = useState(false);
  const [produccionAfectada, setProduccionAfectada] =
    useState(false);

  const [tnDejadasProcesar, setTnDejadasProcesar] =
    useState("");

  const [personal, setPersonal] = useState("");
  const [horasReales, setHorasReales] = useState("");

  const [criticidad, setCriticidad] = useState("");
  const [prioridad, setPrioridad] = useState("");

  useEffect(() => {
    getEquipos()
      .then(setEquipos)
      .catch(() => setEquipos([]));
  }, []);

  const equiposFiltrados = equipos.filter((item) => {
    const texto =
      `${item.codigo} ${item.nombre}`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  const horas = Number(horasReales) || 0;
  const cantidadPersonal = Number(personal) || 0;
  const hh = horas * cantidadPersonal;

  function registrar() {
    if (!equipo) {
      alert("Selecciona un equipo.");
      return;
    }

    if (!fecha) {
      alert("Ingresa la fecha del trabajo.");
      return;
    }

    if (!tipoIntervencion) {
      alert("Selecciona el tipo de intervención.");
      return;
    }

    console.log({
      equipo_id: equipo.id,
      fecha_reporte: fecha,
      inicio_parada: horaInicio,
      fin_parada: horaFin,
      tipo_intervencion: tipoIntervencion,
      modo_falla: modoFalla,
      causa,
      consecuencia,
      descripcion_evento: descripcionEvento,
      accion_realizada: accionRealizada,
      stand_by: standBy,
      produccion_afectada: produccionAfectada,
      tn_dejadas_procesar: produccionAfectada
        ? Number(tnDejadasProcesar) || 0
        : 0,
      personal: cantidadPersonal,
      horas_reales: horas,
      hh,
      criticidad,
      prioridad,
    });

    onCerrar();
  }

  return (
    <div className="prog-modal">

      <div className="prog-form">

        <div className="prog-form-header">
          <div>
            <span>MANTENIMIENTO NO PROGRAMADO</span>

            <h3>
              Registrar trabajo o evento
            </h3>
          </div>

          <button
            type="button"
            onClick={onCerrar}
          >
            ×
          </button>
        </div>

        <section className="prog-section">

          <div className="prog-section-title">
            1. Equipo afectado
          </div>

          <div className="prog-search">

            <label>
              Buscar equipo

              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setEquipo(null);
                }}
              />
            </label>

            {busqueda &&
              !equipo &&
              equiposFiltrados.length > 0 && (

                <div className="prog-results">

                  {equiposFiltrados
                    .slice(0, 8)
                    .map((item) => (

                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setEquipo(item);
                          setBusqueda(
                            `${item.codigo} - ${item.nombre}`
                          );
                        }}
                      >
                        <span className="obj-equipo">
                          EQUIPO
                        </span>

                        <div>
                          <strong>
                            {item.codigo}
                          </strong>

                          <small>
                            {item.nombre}
                          </small>
                        </div>
                      </button>

                    ))}

                </div>
              )}

          </div>

          {equipo && (
            <div className="prog-selected">

              <span className="obj-equipo">
                EQUIPO
              </span>

              <div>
                <strong>
                  {equipo.codigo}
                </strong>

                <small>
                  {equipo.nombre}
                </small>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEquipo(null);
                  setBusqueda("");
                }}
              >
                Cambiar
              </button>

            </div>
          )}

        </section>

        <section className="prog-section">

          <div className="prog-section-title">
            2. ¿Cuándo ocurrió?
          </div>

          <div className="prog-grid">

            <label>
              Fecha *
              <input
                type="date"
                value={fecha}
                onChange={(e) =>
                  setFecha(e.target.value)
                }
              />
            </label>

            <label>
              Hora inicio
              <input
                type="time"
                value={horaInicio}
                onChange={(e) =>
                  setHoraInicio(e.target.value)
                }
              />
            </label>

            <label>
              Hora fin
              <input
                type="time"
                value={horaFin}
                onChange={(e) =>
                  setHoraFin(e.target.value)
                }
              />
            </label>

          </div>

        </section>

        <section className="prog-section">

          <div className="prog-section-title">
            3. ¿Qué pasó?
          </div>

          <div className="prog-choice-grid">

            {[
              "Correctivo",
              "Preventivo",
              "Predictivo",
              "Inspección",
            ].map((tipo) => (

              <button
                type="button"
                key={tipo}
                className={`prog-choice ${
                  tipoIntervencion === tipo
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setTipoIntervencion(tipo)
                }
              >
                <strong>
                  {tipo}
                </strong>

                <span>
                  Seleccionar tipo de intervención
                </span>
              </button>

            ))}

          </div>

          <div className="prog-grid">

            <label>
              Modo de falla
              <input
                value={modoFalla}
                onChange={(e) =>
                  setModoFalla(e.target.value)
                }
              />
            </label>

            <label>
              Causa
              <input
                value={causa}
                onChange={(e) =>
                  setCausa(e.target.value)
                }
              />
            </label>

            <label>
              Consecuencia
              <input
                value={consecuencia}
                onChange={(e) =>
                  setConsecuencia(e.target.value)
                }
              />
            </label>

          </div>

          <label>
            Descripción del evento

            <textarea
              value={descripcionEvento}
              onChange={(e) =>
                setDescripcionEvento(e.target.value)
              }
            />
          </label>

        </section>

        <section className="prog-section">

          <div className="prog-section-title">
            4. ¿Qué se hizo?
          </div>

          <label>
            Acción realizada

            <textarea
              value={accionRealizada}
              onChange={(e) =>
                setAccionRealizada(e.target.value)
              }
            />
          </label>

        </section>

        <section className="prog-section">

          <div className="prog-section-title">
            5. Impacto
          </div>

          <div className="prog-planificacion">

            <div>
              <span>
                Impacto del evento
              </span>

              <small>
                Indica si hubo afectación operacional
              </small>
            </div>

            <div className="prog-plan-buttons">

              <button
                type="button"
                className={standBy ? "active" : ""}
                onClick={() =>
                  setStandBy(!standBy)
                }
              >
                Stand by
              </button>

              <button
                type="button"
                className={
                  produccionAfectada
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setProduccionAfectada(
                    !produccionAfectada
                  )
                }
              >
                Producción afectada
              </button>

            </div>

          </div>

          {produccionAfectada && (
            <div className="prog-grid">

              <label>
                Toneladas dejadas de procesar

                <input
                  type="number"
                  min="0"
                  value={tnDejadasProcesar}
                  onChange={(e) =>
                    setTnDejadasProcesar(
                      e.target.value
                    )
                  }
                />
              </label>

            </div>
          )}

        </section>

        <section className="prog-section">

          <div className="prog-section-title">
            6. Recursos reales
          </div>

          <div className="prog-grid">

            <label>
              N° personal

              <input
                type="number"
                min="0"
                value={personal}
                onChange={(e) =>
                  setPersonal(e.target.value)
                }
              />
            </label>

            <label>
              Horas reales

              <input
                type="number"
                min="0"
                step="0.25"
                value={horasReales}
                onChange={(e) =>
                  setHorasReales(e.target.value)
                }
              />
            </label>

            <label>
              H-H

              <input
                className="prog-calculated"
                type="number"
                value={hh}
                readOnly
              />
            </label>

          </div>

        </section>

        <section className="prog-section">

          <div className="prog-section-title">
            7. Clasificación
          </div>

          <div className="prog-grid">

            <label>
              Criticidad

              <input
                value={criticidad}
                onChange={(e) =>
                  setCriticidad(e.target.value)
                }
              />
            </label>

            <label>
              Prioridad

              <input
                value={prioridad}
                onChange={(e) =>
                  setPrioridad(e.target.value)
                }
              />
            </label>

          </div>

        </section>

        <div className="prog-bottom">

          <div>
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
            >
              Registrar evento
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}