import { useEffect, useState } from "react";
import "./programar.css";

type Equipo = {
  id: number;
  codigo: string;
  nombre: string;
};

type Resultado = {
  tipo: "equipo";
  id: number;
  codigo: string;
  nombre: string;
};

type Props = {
  onCerrar: () => void;
  fechaProgramada?: string;
};

export default function ProgramarTrabajo({
  onCerrar,
  fechaProgramada,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<Resultado | null>(null);

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [mostrarMaterial, setMostrarMaterial] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [numeroPersonal, setNumeroPersonal] = useState("");
  const [horasMantto, setHorasMantto] = useState("");

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

  const filtrados: Resultado[] = equipos
    .filter((equipo) => {
      const texto = busqueda.toLowerCase().trim();

      if (!texto) return false;

      return (
        equipo.codigo?.toLowerCase().includes(texto) ||
        equipo.nombre?.toLowerCase().includes(texto)
      );
    })
    .map((equipo) => ({
      tipo: "equipo",
      id: equipo.id,
      codigo: equipo.codigo,
      nombre: equipo.nombre,
    }));

  const horas = Number(horasMantto) || 0;
  const personal = Number(numeroPersonal) || 0;

  const hh = horas * personal;

  return (
    <div className="prog-modal">
      <div className="prog-form">

        {/* CABECERA */}
        <div className="prog-form-header">
          <div>
            <span>PROGRAMACIÓN</span>
            <h3>Programar trabajo</h3>
          </div>

          <button type="button" onClick={onCerrar}>
            ×
          </button>
        </div>

        {/* DÍA */}
         <div className="prog-day-indicator">
         <div>
            <span>DÍA SELECCIONADO</span>

            <strong>
               {fechaProgramada
               ? new Date(
                     `${fechaProgramada}T00:00:00`
                  ).toLocaleDateString("es-PE", {
                     weekday: "long",
                     day: "2-digit",
                     month: "long",
                     year: "numeric",
                  })
               : "No hay día seleccionado"}
            </strong>
         </div>

         <div className="prog-day-badge">
            PROGRAMACIÓN
         </div>
         </div>

        {/* EQUIPO */}
        <div className="prog-search">
          <label>Equipo / ubicación técnica</label>

          <input
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setSeleccion(null);
            }}
            placeholder="Buscar por código o nombre..."
          />

          {busqueda && !seleccion && (
            <div className="prog-results">

              {cargando && (
                <div className="prog-no-results">
                  Cargando equipos...
                </div>
              )}

              {!cargando &&
                filtrados.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSeleccion(item);
                      setBusqueda(
                        `${item.codigo} - ${item.nombre}`
                      );
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

              {!cargando && filtrados.length === 0 && (
                <div className="prog-no-results">
                  No se encontraron equipos
                </div>
              )}

            </div>
          )}
        </div>

        {/* EQUIPO SELECCIONADO */}
        {seleccion && (
          <div className="prog-selected">

            <span className="obj-equipo">
              EQUIPO
            </span>

            <div>
              <strong>{seleccion.nombre}</strong>
              <small>{seleccion.codigo}</small>
            </div>

            <button
              type="button"
              onClick={() => {
                setSeleccion(null);
                setBusqueda("");
              }}
            >
              cambiar
            </button>

          </div>
        )}

        {/* DATOS DEL TRABAJO */}
        <div className="prog-grid">

          <label>
            Actividad a realizar
            <input
              placeholder="Ej. Mantenimiento preventivo..."
            />
          </label>

          <label>
            OT
            <input placeholder="160864256" />
          </label>

          <label>
            N° personal
            <input
              type="number"
              min="1"
              value={numeroPersonal}
              onChange={(e) =>
                setNumeroPersonal(e.target.value)
              }
              placeholder="Ej. 2"
            />
          </label>

          <label>
            Total horas mantto.
            <input
              type="number"
              min="0"
              step="0.5"
              value={horasMantto}
              onChange={(e) =>
                setHorasMantto(e.target.value)
              }
              placeholder="Ej. 4.5"
            />
          </label>

          <label>
            H-H
            <input
              type="text"
              value={hh ? hh.toFixed(2) : ""}
              readOnly
              className="prog-calculated"
              placeholder="Automático"
            />
          </label>

          <label>
            Responsable
            <input
              placeholder="Responsable del trabajo"
            />
          </label>

          <label>
            Turno
            <select defaultValue="">
              <option value="">
                Seleccionar
              </option>
              <option>Día</option>
              <option>Noche</option>
            </select>
          </label>

        </div>

        {/* MATERIAL OPCIONAL */}
        <div className="prog-material">

          <button
            type="button"
            className="prog-add-material"
            onClick={() =>
              setMostrarMaterial(!mostrarMaterial)
            }
          >
            {mostrarMaterial
              ? "− Ocultar material"
              : "+ Añadir material"}
          </button>

          {mostrarMaterial && (
            <div className="prog-material-grid">

              <label>
                COD. SAP
                <input />
              </label>

              <label>
                DESCRIPCIÓN
                <input />
              </label>

              <label>
                CANT
                <input type="number" />
              </label>

              <label>
                COSTO
                <input
                  type="number"
                  step="0.01"
                />
              </label>

              <label>
                STOCK
                <input type="number" />
              </label>

              <label>
                UND
                <input />
              </label>

              <label>
                TIPO DE MATERIAL
                <select defaultValue="">
                  <option value="">
                    Seleccionar
                  </option>
                  <option>IMPUTADO</option>
                  <option>MRP</option>
                  <option>MRP ESTRATEG.</option>
                  <option>CONSIGNACION</option>
                </select>
              </label>

              <label>
                MPV
                <input />
              </label>

              <label>
                MCP
                <input />
              </label>

            </div>
          )}

        </div>

        {/* COMENTARIO */}
        <div className="prog-comment-form">

          <label>
            Comentario / justificación

            <textarea
              placeholder="Comentario..."
              rows={3}
            />

          </label>

        </div>

        {/* BOTONES */}
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
          >
            Programar
          </button>

        </div>

      </div>
    </div>
  );
}