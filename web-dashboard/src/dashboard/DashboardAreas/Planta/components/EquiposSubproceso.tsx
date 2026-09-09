import { useEffect, useState } from 'react';
import {
  asignarEquipoSubproceso,
  getEquiposPorSubproceso,
  type Equipo,
  type Subproceso,
} from '../services/plantaApi';
import { EquipoSelector } from './EquipoSelector';
import { ComponentesEquipo } from './ComponentesEquipo';
import { EquipoClasificacionSistema } from './EquipoClasificacionSistema';

interface Props {
  subproceso: Subproceso | null;
}

export function EquiposSubproceso({
  subproceso,
}: Props) {
  const [equipos, setEquipos] =
    useState<Equipo[]>([]);

  const [equipoSeleccionado, setEquipoSeleccionado] =
    useState<Equipo | null>(null);

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] =
    useState(false);

  const [mostrarSelector, setMostrarSelector] =
    useState(false);

  const cargar = async () => {
    if (!subproceso) return;

    setLoading(true);

    try {
      const resultado =
        await getEquiposPorSubproceso(
          subproceso.id
        );

      setEquipos(resultado);

      setEquipoSeleccionado((actual) => {
        if (!actual) return null;

        return (
          resultado.find(
            (equipo) => equipo.id === actual.id
          ) || null
        );
      });
    } catch (error) {
      console.error(
        'Error cargando equipos:',
        error
      );

      setEquipos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEquipos([]);
    setEquipoSeleccionado(null);
    setMostrarSelector(false);

    if (subproceso) {
      cargar();
    }
  }, [subproceso]);

  const asignar = async (equipo: Equipo) => {
    if (!subproceso || guardando) return;

    setGuardando(true);

    try {
      await asignarEquipoSubproceso(
        equipo.id,
        subproceso.id
      );

      await cargar();

      setMostrarSelector(false);
      setEquipoSeleccionado(equipo);
    } catch (error) {
      console.error(
        'Error asignando equipo:',
        error
      );

      alert(
        'No se pudo asignar el equipo.'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!subproceso) {
    return null;
  }

  return (
    <>
      <section className="planta-card planta-equipos-card">

        <div className="planta-card-header">
          <div>
            <h3>Equipos</h3>

            <p>
              {subproceso.nombre} ·{' '}
              {equipos.length} equipo(s)
            </p>
          </div>

          <button
            className="planta-add-btn"
            onClick={() =>
              setMostrarSelector(
                !mostrarSelector
              )
            }
          >
            {mostrarSelector
              ? 'Cerrar'
              : '+ Asignar equipo'}
          </button>
        </div>

        {mostrarSelector && (
          <div className="planta-selector-container">

            <div className="planta-selector-title">
              <strong>
                Seleccionar equipo existente
              </strong>

              <span>
                Los equipos se crean y editan desde
                el módulo Equipos.
              </span>
            </div>

            <EquipoSelector
              equiposAsignados={equipos}
              onAsignar={asignar}
              guardando={guardando}
            />
          </div>
        )}

        <div className="planta-list">

          {loading && (
            <div className="planta-empty">
              Cargando equipos...
            </div>
          )}

          {!loading &&
            equipos.length === 0 && (
              <div className="planta-alert warning">
                <strong>
                  Subproceso sin equipos
                </strong>

                <span>
                  Selecciona “Asignar equipo” para
                  comenzar.
                </span>
              </div>
            )}

          {!loading &&
            equipos.map((equipo) => (
              <button
                key={equipo.id}
                className={`planta-list-item ${
                  equipoSeleccionado?.id === equipo.id
                    ? 'selected'
                    : ''
                }`}
                onClick={() =>
                  setEquipoSeleccionado(equipo)
                }
              >
                <div>
                  <strong>
                    {equipo.codigo} —{' '}
                    {equipo.nombre}
                  </strong>

                  <small>
                    {equipo.tipo ||
                      'Sin tipo'}
                    {equipo.fabricante
                      ? ` · ${equipo.fabricante}`
                      : ''}
                    {equipo.modelo
                      ? ` · ${equipo.modelo}`
                      : ''}
                  </small>
                </div>

                <span>
                  {equipo.estado_equipo ||
                    'Sin estado'}
                </span>
              </button>
            ))}
        </div>
      </section>

      {equipoSeleccionado && (
        <>
          <div style={{ marginTop: 20 }}>
            <EquipoClasificacionSistema
              equipo={equipoSeleccionado}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <ComponentesEquipo
              equipo={equipoSeleccionado}
            />
          </div>
        </>
      )}
    </>
  );
}