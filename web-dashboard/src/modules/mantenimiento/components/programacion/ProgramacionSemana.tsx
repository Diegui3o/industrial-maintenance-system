import { useEffect, useMemo, useState } from "react";
import {
  listarTodosLosMantenimientos,
  listarProgramacion,
} from "../../../../dashboard/services/mantenimientoApi";
import SemanaHeader from "./SemanaHeader";
import SemanaDias from "./SemanaDias";
import ProgramarTrabajo from "./ProgramarTrabajo";
import RegistrarActividad from "./RegistrarActividad";
import "./programacion.css";

type Trabajo = {
  id: number;
  mantenimientoId: number;
  fecha: string;
  programado: boolean;

  equipo: string;
  actividad: string;
  ot?: string;

  horas: number;
  hh: number;
  avance: number;

  componente?: string;

  programacionId: number;
};

type Mantenimiento = {
  id: number;
  equipo_id: number;
  componente_id?: number | null;

  descripcion_evento?: string | null;
  descripcion_tecnica?: string | null;

  porcentaje_avance?: number | null;

  horas_planificadas?: number | null;
  hh_planificadas?: number | null;

  tipo_programacion?: string | null;
  fecha_programada?: string | null;
};

type Equipo = {
  id: number;
  codigo?: string;
  nombre?: string;
};

export default function ProgramacionSemana() {
  const hoy = new Date();

  const inicioSemana = useMemo(() => {
    const fecha = new Date(hoy);
    const dia = fecha.getDay();

    const diferencia = dia === 0 ? -6 : 1 - dia;

    fecha.setDate(fecha.getDate() + diferencia);
    fecha.setHours(0, 0, 0, 0);

    return fecha;
  }, []);

  const [semana, setSemana] = useState(inicioSemana);

  const [diaSeleccionado, setDiaSeleccionado] = useState(
    hoy.getDay() === 0 ? 6 : hoy.getDay() - 1
  );

  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [cargando, setCargando] = useState(false);

  const [programar, setProgramar] = useState(false);

  const [actividadSeleccionada, setActividadSeleccionada] =
    useState<Trabajo | null>(null);

  async function cargarTrabajos() {
    try {
      setCargando(true);

      const mantenimientos =
        await listarTodosLosMantenimientos();

      if (!Array.isArray(mantenimientos)) {
        setTrabajos([]);
        return;
      }

      const equiposResponse = await fetch("/api/equipos");

      const equiposData = equiposResponse.ok
        ? await equiposResponse.json()
        : [];

      const equipos: Equipo[] = Array.isArray(equiposData)
        ? equiposData
        : [];

      const resultado: Trabajo[] = [];

      await Promise.all(
        mantenimientos.map(
          async (mantenimiento: Mantenimiento) => {
            try {
              const programaciones =
                await listarProgramacion(
                  mantenimiento.id
                );

              if (!Array.isArray(programaciones)) {
                return;
              }

              const equipo = equipos.find(
                (item) =>
                  item.id === mantenimiento.equipo_id
              );

              for (const programacion of programaciones) {
                const fecha =
                  programacion.fecha_programada;

                if (!fecha) {
                  continue;
                }

                const horas =
                  Number(
                    programacion.horas_planificadas ??
                      mantenimiento.horas_planificadas ??
                      0
                  ) || 0;

                const hh =
                  Number(
                    programacion.hh_planificadas ??
                      mantenimiento.hh_planificadas ??
                      0
                  ) || 0;

                const avance =
                  Number(
                    mantenimiento.porcentaje_avance ?? 0
                  ) || 0;

                resultado.push({
                  id: programacion.id,

                  mantenimientoId:
                    mantenimiento.id,

                  programacionId:
                    programacion.id,

                  fecha: String(fecha).slice(0, 10),

                  programado: true,

                  equipo:
                    equipo?.codigo &&
                    equipo?.nombre
                      ? `${equipo.codigo} - ${equipo.nombre}`
                      : equipo?.nombre ||
                        equipo?.codigo ||
                        `Equipo ${mantenimiento.equipo_id}`,

                  actividad:
                    programacion.instrucciones ||
                    mantenimiento.descripcion_evento ||
                    mantenimiento.descripcion_tecnica ||
                    "Mantenimiento",

                  ot: programacion.ot || undefined,

                  horas,

                  hh,

                  avance,

                  componente:
                    mantenimiento.componente_id
                      ? `Componente ${mantenimiento.componente_id}`
                      : undefined,
                });
              }
            } catch (error) {
              console.error(
                `Error cargando programación del mantenimiento ${mantenimiento.id}:`,
                error
              );
            }
          }
        )
      );

      setTrabajos(resultado);
    } catch (error) {
      console.error(
        "Error cargando programación semanal:",
        error
      );

      setTrabajos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTrabajos();
  }, []);

  const trabajosSemana = trabajos.filter(
    (trabajo) => {
      const fecha = new Date(
        `${trabajo.fecha}T00:00:00`
      );

      const fin = new Date(semana);
      fin.setDate(fin.getDate() + 6);

      return fecha >= semana && fecha <= fin;
    }
  );

  const trabajosDelDia = trabajosSemana.filter(
    (trabajo) => {
      const fecha = new Date(
        `${trabajo.fecha}T00:00:00`
      );

      const dia = new Date(semana);

      dia.setDate(
        dia.getDate() + diaSeleccionado
      );

      return (
        fecha.getFullYear() ===
          dia.getFullYear() &&
        fecha.getMonth() ===
          dia.getMonth() &&
        fecha.getDate() ===
          dia.getDate()
      );
    }
  );

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

    const year = fecha.getFullYear();
    const month = String(
      fecha.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      fecha.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, [semana, diaSeleccionado]);

  function cambiarSemana(valor: number) {
    const nueva = new Date(semana);

    nueva.setDate(
      nueva.getDate() + valor * 7
    );

    setSemana(nueva);

    const hoySemana =
      nueva.getTime() ===
      inicioSemana.getTime();

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

  function cerrarProgramacion() {
    setProgramar(false);
    cargarTrabajos();
  }

  function cerrarActividad() {
    setActividadSeleccionada(null);
    cargarTrabajos();
  }

  return (
    <section className="prog">
      <SemanaHeader
        semana={semana}
        onAnterior={() =>
          cambiarSemana(-1)
        }
        onSiguiente={() =>
          cambiarSemana(1)
        }
        onHoy={irHoy}
      />

      <SemanaDias
        semana={semana}
        trabajos={trabajosSemana}
        diaSeleccionado={diaSeleccionado}
        onSeleccionar={
          setDiaSeleccionado
        }
      />

      {cargando && (
        <div className="prog-loading">
          Cargando programación...
        </div>
      )}

      <div className="prog-columns">
        {/* PROGRAMADO */}
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
                No hay trabajos programados
                para este día.
              </p>
            ) : (
              programados.map(
                (trabajo) => (
                  <div
                    key={
                      trabajo.programacionId
                    }
                    className="prog-card"
                  >
                    <strong>
                      {trabajo.equipo}
                    </strong>

                    {trabajo.componente && (
                      <span>
                        {trabajo.componente}
                      </span>
                    )}

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
                        Avance:{" "}
                        {trabajo.avance}%
                      </span>
                    </div>

                    <button
                      type="button"
                      className="prog-btn prog-btn--main"
                      onClick={() =>
                        setActividadSeleccionada(
                          trabajo
                        )
                      }
                    >
                      Registrar actividad
                    </button>
                  </div>
                )
              )
            )}
          </div>

          <div className="prog-actions">
            <button
              type="button"
              className="prog-btn prog-btn--main"
              onClick={() =>
                setProgramar(true)
              }
            >
              + Programar mantenimiento
            </button>
          </div>
        </div>

        {/* NO PROGRAMADO */}
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
                No hay trabajos no
                programados.
              </p>
            ) : (
              noProgramados.map(
                (trabajo) => (
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
                        Avance:{" "}
                        {trabajo.avance}%
                      </span>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>

      {programar && (
        <ProgramarTrabajo
          fechaProgramada={
            fechaSeleccionada
          }
          onCerrar={
            cerrarProgramacion
          }
        />
      )}

      {actividadSeleccionada && (
        <RegistrarActividad
          trabajo={
            actividadSeleccionada
          }
          onCerrar={cerrarActividad}
        />
      )}
    </section>
  );
}