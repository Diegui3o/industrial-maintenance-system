import { useEffect, useState } from "react";

import { getEquipos } from "../../../dashboard/DashboardAreas/Planta/services/equiposApi";

import "./programar.css";

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
  const [consecuencia, setConsecuencia] =
    useState("");

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
      personal: Number(personal) || 0,
      horas_reales: horas,
      hh,
      criticidad,
      prioridad,
    });

    onCerrar();
  }

  return (
    <div className="prog-overlay">
      <div className="prog-modal">

        <div className="prog-form-header">
          <div>
            <span className="prog-eyebrow">
              MANTENIMIENTO
            </span>

            <h2>
              Mantenimiento no programado
            </h2>

            <p>
              Registrar trabajo o evento ocurrido en planta
            </p>
          </div>

          <button
            type="button"
            className="prog-close"
            onClick={onCerrar}
          >
            ×
          </button>
        </div>

        <div className="prog-form">

          <section className="prog-section">
            <h3>1. Equipo afectado</h3>

            <div className="prog-equipo-search">
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setEquipo(null);
                }}
              />

              {busqueda &&
                !equipo &&
                equiposFiltrados.length > 0 && (
                  <div className="prog-equipo-results">
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
                          <strong>
                            {item.codigo}
                          </strong>

                          <span>
                            {item.nombre}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
            </div>

            {equipo && (
              <div className="prog-equipo-selected">
                <strong>{equipo.codigo}</strong>
                <span>{equipo.nombre}</span>
              </div>
            )}
          </section>

          <section className="prog-section">
            <h3>2. ¿Cuándo ocurrió?</h3>

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
            <h3>3. ¿Qué pasó?</h3>

            <div className="prog-type-buttons">
              {[
                "Correctivo",
                "Preventivo",
                "Predictivo",
                "Inspección",
              ].map((tipo) => (
                <button
                  type="button"
                  key={tipo}
                  className={
                    tipoIntervencion === tipo
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setTipoIntervencion(tipo)
                  }
                >
                  {tipo}
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
            <h3>4. ¿Qué se hizo?</h3>

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
            <h3>5. Impacto</h3>

            <div className="prog-checks">
              <label>
                <input
                  type="checkbox"
                  checked={standBy}
                  onChange={(e) =>
                    setStandBy(e.target.checked)
                  }
                />
                Stand by
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={produccionAfectada}
                  onChange={(e) =>
                    setProduccionAfectada(
                      e.target.checked
                    )
                  }
                />
                Producción afectada
              </label>
            </div>

            {produccionAfectada && (
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
            )}
          </section>

          <section className="prog-section">
            <h3>6. Recursos reales</h3>

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
                  type="number"
                  value={hh}
                  readOnly
                />
              </label>
            </div>
          </section>

          <section className="prog-section">
            <h3>7. Clasificación</h3>

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

        </div>

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
          >
            Registrar evento
          </button>
        </div>

      </div>
    </div>
  );
}