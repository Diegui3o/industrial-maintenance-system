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
  const hoy = useMemo(() => {
    const fecha = new Date();
    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }, []);

  const inicioSemana = useMemo(() => {
    const fecha = new Date(hoy);
    const dia = fecha.getDay();

    fecha.setDate(
      fecha.getDate() + (dia === 0 ? -6 : 1 - dia)
    );

    return fecha;
  }, [hoy]);

  const [semana, setSemana] = useState(inicioSemana);

  const [diaSeleccionado, setDiaSeleccionado] = useState(
    hoy.getDay() === 0 ? 6 : hoy.getDay() - 1
  );

  const [programar, setProgramar] = useState(false);

  /*
   * Luego estos trabajos vendrán desde PostgreSQL.
   */
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

  const fechaSeleccionada = useMemo(() => {
    const fecha = new Date(semana);

    fecha.setDate(
      fecha.getDate() + diaSeleccionado
    );

    return fecha.toISOString().split("T")[0];
  }, [semana, diaSeleccionado]);

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
          <div className="prog-column-header">
            <div>
              <h3>PROGRAMADO</h3>
              <span>
                {programados.length}{" "}
                {programados.length === 1
                  ? "trabajo"
                  : "trabajos"}
              </span>
            </div>
          </div>

          <div className="prog-list">
            {programados.length === 0 ? (
              <p className="prog-empty">
                No hay trabajos programados para este día.
              </p>
            ) : (
              programados.map((trabajo) => (
                <div
                  key={trabajo.id}
                  className="prog-card"
                >
                  <strong>
                    {trabajo.equipo}
                  </strong>

                  <span>
                    {trabajo.actividad}
                  </span>

                  {trabajo.ot && (
                    <span>
                      OT: {trabajo.ot}
                    </span>
                  )}

                  <div className="prog-card-meta">
                    <span>
                      {trabajo.horas} h
                    </span>

                    <span>
                      {trabajo.hh} HH
                    </span>

                    <span>
                      {trabajo.avance}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="prog-actions">
            <button
              type="button"
              className="prog-btn prog-btn--main"
              onClick={() => setProgramar(true)}
            >
              + Programar mantenimiento
            </button>
          </div>
        </div>

        <div className="prog-column">
          <div className="prog-column-header">
            <div>
              <h3>NO PROGRAMADO</h3>
              <span>
                {noProgramados.length}{" "}
                {noProgramados.length === 1
                  ? "trabajo"
                  : "trabajos"}
              </span>
            </div>
          </div>

          <div className="prog-list">
            {noProgramados.length === 0 ? (
              <p className="prog-empty">
                No hay trabajos no programados.
              </p>
            ) : (
              noProgramados.map((trabajo) => (
                <div
                  key={trabajo.id}
                  className="prog-card"
                >
                  <strong>
                    {trabajo.equipo}
                  </strong>

                  <span>
                    {trabajo.actividad}
                  </span>

                  <div className="prog-card-meta">
                    <span>
                      {trabajo.horas} h
                    </span>

                    <span>
                      {trabajo.hh} HH
                    </span>

                    <span>
                      {trabajo.avance}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {programar && (
        <ProgramarTrabajo
          fechaProgramada={fechaSeleccionada}
          onCerrar={() => setProgramar(false)}
        />
      )}
    </section>
  );
}