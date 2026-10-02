import { useState } from "react";
import {
  crearAvance,
  crearPersonal,
} from "../../../../dashboard/services/mantenimientoApi";

type Trabajo = {
  id: number;
  mantenimientoId: number;
  fecha: string;
  equipo: string;
  actividad: string;
  avance: number;
};

type Props = {
  trabajo: Trabajo;
  onCerrar: () => void;
};

export default function RegistrarActividad({
  trabajo,
  onCerrar,
}: Props) {
  const [porcentaje, setPorcentaje] =
    useState(
      trabajo.avance >= 100
        ? "100"
        : trabajo.avance >= 80
        ? "80"
        : "40"
    );

  const [fecha, setFecha] =
    useState(trabajo.fecha);

  const [numeroPersonal, setNumeroPersonal] =
    useState("");

  const [horas, setHoras] =
    useState("");

  const [responsable, setResponsable] =
    useState("");

  const [turno, setTurno] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  const personal =
    Number(numeroPersonal) || 0;

  const horasNumero =
    Number(horas) || 0;

  const hh =
    personal * horasNumero;

  async function registrar() {
    const avance =
      Number(porcentaje);

    if (!fecha) {
      setError(
        "Selecciona la fecha realizada."
      );
      return;
    }

    if (
      avance <= trabajo.avance &&
      trabajo.avance < 100
    ) {
      setError(
        `El nuevo avance debe ser mayor al avance actual (${trabajo.avance}%).`
      );
      return;
    }

    if (avance < 0 || avance > 100) {
      setError(
        "El porcentaje debe estar entre 0 y 100."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");

      await crearAvance(
        trabajo.mantenimientoId,
        {
          porcentaje: avance,
          descripcion:
            `Actividad registrada: ${avance}%`,
          fecha: `${fecha}T00:00:00`,
        }
      );

      if (
        numeroPersonal.trim() ||
        horas.trim() ||
        responsable.trim() ||
        turno
      ) {
        await crearPersonal(
          trabajo.mantenimientoId,
          {
            nombre:
              responsable.trim() ||
              "Personal de mantenimiento",

            cargo: null,

            turno:
              turno || null,

            horas:
              horasNumero > 0
                ? horasNumero
                : null,

            hh:
              hh > 0
                ? hh
                : null,

            fecha,
          }
        );
      }

      onCerrar();
    } catch (error) {
      console.error(
        "Error registrando actividad:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la actividad."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="prog-modal">
      <div className="prog-form">
        <div className="prog-form-header">
          <div>
            <span>
              REGISTRAR ACTIVIDAD
            </span>

            <h3>
              Registro de ejecución
            </h3>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="prog-error">
            {error}
          </div>
        )}

        <section className="prog-section">
          <div className="prog-section-title">
            Mantenimiento
          </div>

          <div className="prog-program-date">
            <strong>
              {trabajo.equipo}
            </strong>

            <span>
              {trabajo.actividad}
            </span>
          </div>
        </section>

        <section className="prog-section">
          <div className="prog-section-title">
            Avance
          </div>

          <select
            value={porcentaje}
            onChange={(e) =>
              setPorcentaje(
                e.target.value
              )
            }
            disabled={guardando}
          >
            <option value="40">
              40%
            </option>

            <option value="80">
              80%
            </option>

            <option value="100">
              100%
            </option>
          </select>
        </section>

        <section className="prog-section">
          <div className="prog-section-title">
            Fecha realizada
          </div>

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
            disabled={guardando}
          />
        </section>

        <section className="prog-section">
          <div className="prog-section-title">
            Recursos reales
          </div>

          <div className="prog-grid">
            <div className="prog-field">
              <label>
                N° personal
              </label>

              <input
                type="number"
                min="0"
                value={numeroPersonal}
                onChange={(e) =>
                  setNumeroPersonal(
                    e.target.value
                  )
                }
                disabled={guardando}
              />
            </div>

            <div className="prog-field">
              <label>
                Total horas
              </label>

              <input
                type="number"
                min="0"
                step="0.5"
                value={horas}
                onChange={(e) =>
                  setHoras(
                    e.target.value
                  )
                }
                disabled={guardando}
              />
            </div>
          </div>

          <div className="prog-grid">
            <div className="prog-field">
              <label>
                H-H
              </label>

              <input
                type="text"
                value={hh.toFixed(2)}
                readOnly
              />
            </div>

            <div className="prog-field">
              <label>
                Responsable
              </label>

              <input
                type="text"
                value={responsable}
                onChange={(e) =>
                  setResponsable(
                    e.target.value
                  )
                }
                disabled={guardando}
              />
            </div>
          </div>

          <div className="prog-field">
            <label>
              Turno
            </label>

            <select
              value={turno}
              onChange={(e) =>
                setTurno(e.target.value)
              }
              disabled={guardando}
            >
              <option value="">
                Seleccionar turno
              </option>

              <option value="Día">
                Día
              </option>

              <option value="Noche">
                Noche
              </option>
            </select>
          </div>
        </section>

        <div className="prog-bottom">
          <button
            type="button"
            className="prog-cancel"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="prog-save"
            onClick={registrar}
            disabled={guardando}
          >
            {guardando
              ? "Registrando..."
              : "Registrar"}
          </button>
        </div>
      </div>
    </div>
  );
}