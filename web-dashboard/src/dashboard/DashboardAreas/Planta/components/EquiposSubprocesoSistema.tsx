import { useEffect, useState } from 'react';
import {
  asignarEquipoSubprocesoSistema,
  getEquiposPorSubprocesoSistema,
  getEquiposDisponiblesSistema,
  type Equipo,
} from '../services/plantaApi';

import { ComponentesEquipo } from './ComponentesEquipo';

interface Props {
  subprocesoSistemaId: number;
}

export function EquiposSubprocesoSistema({
  subprocesoSistemaId,
}: Props) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equiposDisponibles, setEquiposDisponibles] =
    useState<Equipo[]>([]);

  const [equipoSeleccionadoDetalle, setEquipoSeleccionadoDetalle] =
    useState<Equipo | null>(null);

  const [equipoSeleccionado, setEquipoSeleccionado] =
    useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);

    try {
    const [asignados, disponibles] =
      await Promise.all([
        getEquiposPorSubprocesoSistema(
          subprocesoSistemaId
        ),
        getEquiposDisponiblesSistema(),
      ]);

      setEquipos(asignados);
      setEquiposDisponibles(disponibles);
    } catch (error) {
      console.error(
        'Error cargando equipos del subproceso de sistema:',
        error
      );

      setEquipos([]);
      setEquiposDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEquipoSeleccionado('');
    setEquipoSeleccionadoDetalle(null);
    cargar();
  }, [subprocesoSistemaId]);

  const asignar = async () => {
    if (
      equipoSeleccionado === '' ||
      guardando
    ) {
      return;
    }

    setGuardando(true);

    try {
      await asignarEquipoSubprocesoSistema(
        subprocesoSistemaId,
        Number(equipoSeleccionado)
      );

      setEquipoSeleccionado('');

      await cargar();
    } catch (error) {
      console.error(
        'Error asignando equipo al sistema:',
        error
      );

      alert(
        'No se pudo asignar el equipo al subproceso de sistema.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h4>Equipos</h4>
          <p>
            Equipos asociados a este subproceso del sistema.
          </p>
        </div>
      </div>

      <div className="planta-form">
        <div className="planta-form-grid">
          <label>
            Agregar equipo
            <select
              value={equipoSeleccionado}
              onChange={(e) =>
                setEquipoSeleccionado(
                  e.target.value === ''
                    ? ''
                    : Number(e.target.value)
                )
              }
            >
              <option value="">
                Seleccionar equipo...
              </option>

              {equiposDisponibles.map((equipo) => (
                <option
                  key={equipo.id}
                  value={equipo.id}
                >
                  {equipo.codigo} — {equipo.nombre}
                </option>
              ))}
            </select>
          </label>

          <div className="planta-form-actions">
            <button
              type="button"
              className="planta-btn planta-btn-primary"
              onClick={asignar}
              disabled={
                equipoSeleccionado === '' ||
                guardando
              }
            >
              {guardando
                ? 'Asignando...'
                : 'Asignar equipo'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Cargando equipos...</p>
      ) : equipos.length === 0 ? (
        <p className="planta-empty">
          Este subproceso de sistema todavía no tiene
          equipos asociados.
        </p>
      ) : (
        <div className="planta-list">
          {equipos.map((equipo) => (
            <div
              key={equipo.id}
              className={`planta-list-item ${
                equipoSeleccionadoDetalle?.id === equipo.id
                  ? 'seleccionado'
                  : ''
              }`}
              onClick={() =>
                setEquipoSeleccionadoDetalle(equipo)
              }
            >
              <div>
                <strong>
                  {equipo.codigo}
                </strong>

                <span>
                  {' — '}
                  {equipo.nombre}
                </span>

                {equipo.tipo && (
                  <small>
                    Tipo: {equipo.tipo}
                  </small>
                )}
              </div>

              <span>
                {equipo.estado_equipo}
              </span>
            </div>
          ))}
        </div>
      )}
      {equipoSeleccionadoDetalle && (
        <ComponentesEquipo
          equipo={equipoSeleccionadoDetalle}
        />
      )}
    </section>
  );
}