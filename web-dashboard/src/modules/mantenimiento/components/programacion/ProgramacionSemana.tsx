import { useMemo, useState } from "react";

import SemanaHeader from "./SemanaHeader";
import SemanaDias from "./SemanaDias";
import ProgramarTrabajo from "./ProgramarTrabajo";

import "./programacion.css";

type Trabajo = {
  id: number;
  equipo: string;
  actividad: string;
  ot?: string;
  horas: number;
  hh: number;
  fecha: string;
  programado: boolean;
  avance: number;
  comentario: string;
};

export default function ProgramacionSemana() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicioSemana = useMemo(() => {
    const fecha = new Date(hoy);
    const dia = fecha.getDay();

    fecha.setDate(
      fecha.getDate() + (dia === 0 ? -6 : 1 - dia)
    );

    return fecha;
  }, []);

  const [semana, setSemana] = useState(inicioSemana);

  const [diaSeleccionado, setDiaSeleccionado] = useState(
    hoy.getDay() === 0 ? 6 : hoy.getDay() - 1
  );

  const [nuevoMantenimiento, setNuevoMantenimiento] =
    useState(false);

  // Luego vendrán desde PostgreSQL.
  const trabajos: Trabajo[] = [];

  const trabajosSemana = trabajos.filter((trabajo) => {
    const fecha = new Date(`${trabajo.fecha}T00:00:00`);

    const fin = new Date(semana);
    fin.setDate(fin.getDate() + 6);

    return fecha >= semana && fecha <= fin;
  });

  const trabajosDelDia = trabajosSemana.filter((trabajo) => {
    const fecha = new Date(`${trabajo.fecha}T00:00:00`);

    const dia = new Date(semana);
    dia.setDate(dia.getDate() + diaSeleccionado);

    return (
      fecha.getFullYear() === dia.getFullYear() &&
      fecha.getMonth() === dia.getMonth() &&
      fecha.getDate() === dia.getDate()
    );
  });

  const programados = trabajosDelDia.filter(
    (trabajo) => trabajo.programado
  );

  const noProgramados = trabajosDelDia.filter(
    (trabajo) => !trabajo.programado
  );

  function cambiarSemana(valor: number) {
    const nueva = new Date(semana);

    nueva.setDate(
      nueva.getDate() + valor * 7
    );

    setSemana(nueva);

    const hoySemana =
      nueva.getTime() === inicioSemana.getTime();

    setDiaSeleccionado(
      hoySemana
        ? hoy.getDay() === 0
          ? 6
          : hoy.getDay() - 1
        : 0
    );
  }

  function irHoy() {
    setSemana(inicioSemana);

    setDiaSeleccionado(
      hoy.getDay() === 0
        ? 6
        : hoy.getDay() - 1
    );
  }

  const fechaSeleccionada = (() => {
    const fecha = new Date(semana);

    fecha.setDate(
      fecha.getDate() + diaSeleccionado
    );

    return fecha.toISOString().split("T")[0];
  })();

  return (
    <section className="prog">
      <SemanaHeader
        semana={semana}
        onAnterior={() => cambiarSemana(-1)}
        onSiguiente={() => cambiarSemana(1)}
        onHoy={irHoy}
      />

      <SemanaDias
        semana={semana}
        trabajos={trabajosSemana}
        diaSeleccionado={diaSeleccionado}
        onSeleccionar={setDiaSeleccionado}
      />

      <div className="prog-columns">
        <div className="prog-column">
          <div className="prog-column-title">
            <strong>PROGRAMADO</strong>
            <span>
              {programados.length} trabajos
            </span>
          </div>

          {programados.length === 0 ? (
            <div className="prog-empty">
              No hay trabajos programados para este día.
            </div>
          ) : (
            programados.map((trabajo) => (
              <TrabajoCard
                key={trabajo.id}
                trabajo={trabajo}
              />
            ))
          )}
        </div>

        <div className="prog-column">
          <div className="prog-column-title">
            <strong>NO PROGRAMADO</strong>
            <span>
              {noProgramados.length} trabajos
            </span>
          </div>

          {noProgramados.length === 0 ? (
            <div className="prog-empty">
              No hay trabajos no programados.
            </div>
          ) : (
            noProgramados.map((trabajo) => (
              <TrabajoCard
                key={trabajo.id}
                trabajo={trabajo}
              />
            ))
          )}
        </div>
      </div>

      {/* UN ÚNICO PUNTO DE CREACIÓN */}
      <div className="prog-actions">
        <button
          type="button"
          className="prog-btn prog-btn--main"
          onClick={() =>
            setNuevoMantenimiento(true)
          }
        >
          + Nuevo mantenimiento
        </button>
      </div>

      {nuevoMantenimiento && (
        <ProgramarTrabajo
          fechaProgramada={fechaSeleccionada}
          onCerrar={() =>
            setNuevoMantenimiento(false)
          }
        />
      )}
    </section>
  );
}

function TrabajoCard({
  trabajo,
}: {
  trabajo: Trabajo;
}) {
  return (
    <div className="prog-card">
      <div className="prog-card-top">
        <strong>{trabajo.actividad}</strong>

        <span className="prog-status">
          {trabajo.programado
            ? "Programado"
            : "No programado"}
        </span>
      </div>

      <div className="prog-card-info">
        <span>
          Equipo: {trabajo.equipo}
        </span>

        {trabajo.ot && (
          <span>
            OT: {trabajo.ot}
          </span>
        )}

        <span>
          {trabajo.horas} h · {trabajo.hh} HH
        </span>
      </div>

      <div className="prog-progress">
        <div className="prog-progress-head">
          <span>Avance</span>
          <strong>
            {trabajo.avance}%
          </strong>
        </div>

        <div className="prog-progress-bar">
          <div
            style={{
              width: `${trabajo.avance}%`,
            }}
          />
        </div>
      </div>

      <p className="prog-comment">
        {trabajo.comentario}
      </p>
    </div>
  );
}