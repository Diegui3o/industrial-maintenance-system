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
  const [porcentaje, setPorcentaje] = useState(
    trabajo.avance > 0
      ? String(trabajo.avance)
      : ""
  );

  const [fecha, setFecha] = useState(
    trabajo.fecha
  );

  const [numeroPersonal, setNumeroPersonal] =
    useState("");

  const [horas, setHoras] =
    useState("");

  const [responsable, setResponsable] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  const avanceActual =
    Number(porcentaje) || 0;

  const personal =
    Number(numeroPersonal) || 0;

  const horasNumero =
    Number(horas) || 0;

  const hh =
    personal * horasNumero;

  const esCierre =
    avanceActual === 100;

  async function registrar() {
    const avance =
      Number(porcentaje);

    if (!porcentaje.trim()) {
      setError(
        "Ingresa el porcentaje de avance."
      );
      return;
    }

    if (!fecha) {
      setError(
        "Selecciona la fecha realizada."
      );
      return;
    }

    if (
      Number.isNaN(avance) ||
      avance < 0 ||
      avance > 100
    ) {
      setError(
        "El porcentaje debe estar entre 0 y 100."
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

    if (esCierre) {
      if (!numeroPersonal.trim()) {
        setError(
          "Ingresa el número de personal."
        );
        return;
      }

      if (personal <= 0) {
        setError(
          "El número de personal debe ser mayor a 0."
        );
        return;
      }

      if (!horas.trim()) {
        setError(
          "Ingresa el total de horas."
        );
        return;
      }

      if (horasNumero <= 0) {
        setError(
          "El total de horas debe ser mayor a 0."
        );
        return;
      }

      if (!responsable.trim()) {
        setError(
          "Ingresa el responsable."
        );
        return;
      }
    }

    try {
      setGuardando(true);
      setError("");

      /*
       * 1. Guardamos siempre el avance.
       * Cada registro queda almacenado con su fecha.
       */
      await crearAvance(
        trabajo.mantenimientoId,
        {
          porcentaje: avance,
          descripcion:
            `Actividad registrada: ${avance}%`,
          fecha: `${fecha}T00:00:00`,
        }
      );

      /*
       * 2. Los recursos reales solamente se registran
       * cuando el trabajo llega al 100%.
       */
      if (esCierre) {
        await crearPersonal(
          trabajo.mantenimientoId,
          {
            nombre:
              responsable.trim(),

            cargo: null,

            turno: null,

            horas:
              horasNumero,

            hh:
              hh,

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

          <div className="prog-field">
            <label>
              Porcentaje de avance
            </label>

            <div className="prog-percent-input">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={porcentaje}
                onChange={(e) =>
                  setPorcentaje(
                    e.target.value
                  )
                }
                disabled={guardando}
                placeholder="Ej. 65"
              />

              <span>%</span>
            </div>
          </div>
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

        {esCierre && (
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
                  min="1"
                  step="1"
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
          </section>
        )}

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