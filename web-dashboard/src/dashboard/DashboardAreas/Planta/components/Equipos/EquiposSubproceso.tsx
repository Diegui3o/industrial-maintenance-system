import { useCallback, useEffect, useState } from 'react';

import {
  getEquiposParaRelacionSubproceso,
  relacionarEquiposConSubproceso,
  type Equipo,
} from '../../services/plantaApi';

interface Props {
  subprocesoId: number;
  subprocesoNombre: string;
}

export function EquiposSubproceso({
  subprocesoId,
  subprocesoNombre,
}: Props) {
  const [equipos, setEquipos] =
    useState<Equipo[]>([]);

  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState('');

  const [busqueda, setBusqueda] =
    useState('');

  const cargarEquipos = useCallback(async () => {
    setLoading(true);
    setMensaje('');

    try {
      const resultado =
        await getEquiposParaRelacionSubproceso(
          subprocesoId
        );

      setEquipos(resultado);
      setSeleccionados([]);
    } catch (error) {
      console.error(
        'Error cargando equipos:',
        error
      );

      setEquipos([]);
      setMensaje(
        'No se pudieron cargar los equipos.'
      );
    } finally {
      setLoading(false);
    }
  }, [subprocesoId]);

  useEffect(() => {
    void cargarEquipos();
  }, [cargarEquipos]);

  const cambiarSeleccion = (id: number) => {
    setSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter(
            (item) => item !== id
          )
        : [...actuales, id]
    );
  };

  const guardarRelacion = async () => {
    if (seleccionados.length === 0) {
      setMensaje(
        'Seleccione al menos un equipo.'
      );
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      await relacionarEquiposConSubproceso(
        subprocesoId,
        seleccionados
      );

      await cargarEquipos();

      setMensaje(
        'Relación guardada correctamente.'
      );
    } catch (error) {
      console.error(
        'Error guardando relación de equipos:',
        error
      );

      setMensaje(
        'No se pudo guardar la relación.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const normalizar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const textoBusqueda =
    normalizar(busqueda.trim());

  const equiposFiltrados =
    equipos.filter((equipo) => {
      const texto = normalizar(
        [
          equipo.codigo ?? '',
          equipo.nombre,
          equipo.area ?? '',
          equipo.tipo ?? '',
          equipo.estado_equipo ?? '',
        ].join(' ')
      );

      return texto.includes(textoBusqueda);
    });

  return (
    <div className="planta-relation-panel">
      <div className="planta-relation-header">
        <div>
          <span className="planta-section-label">
            SUBPROCESO
          </span>

          <h3>{subprocesoNombre}</h3>

          <p>
            Seleccione los equipos que
            pertenecen a este subproceso.
          </p>
        </div>
      </div>

      <div className="planta-relation-summary">
        <span>Equipos</span>

        <strong>
          {seleccionados.length}
        </strong>

        <span>seleccionados</span>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando equipos...
        </div>
      )}

      {!loading && (
        <>
          <div className="planta-relation-search">
            <input
              type="search"
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              placeholder="Buscar equipo, código, área o tipo..."
            />
          </div>

          <div className="planta-relation-search-info">
            {busqueda.trim()
              ? `${equiposFiltrados.length} de ${equipos.length} equipos`
              : `${equipos.length} equipos disponibles`}
          </div>

          {equiposFiltrados.length > 0 && (
            <div className="planta-relation-grid">
              {equiposFiltrados.map((equipo) => {
                const seleccionado =
                  seleccionados.includes(
                    equipo.id
                  );

                return (
                  <label
                    key={equipo.id}
                    className={`planta-relation-item ${
                      seleccionado
                        ? 'selected'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={seleccionado}
                      onChange={() =>
                        cambiarSeleccion(
                          equipo.id
                        )
                      }
                    />

                    <div className="planta-relation-content">
                      <strong>
                        {equipo.codigo
                          ? `${equipo.codigo} - `
                          : ''}
                        {equipo.nombre}
                      </strong>

                      {equipo.area && (
                        <small>
                          Área: {equipo.area}
                        </small>
                      )}

                      {equipo.tipo && (
                        <small>
                          Tipo: {equipo.tipo}
                        </small>
                      )}

                      {equipo.estado_equipo && (
                        <span className="planta-status available">
                          {equipo.estado_equipo}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {equipos.length > 0 &&
            equiposFiltrados.length === 0 && (
              <div className="planta-relation-no-results">
                No se encontraron equipos con esa
                búsqueda.
              </div>
            )}

          {equipos.length === 0 && (
            <div className="planta-empty">
              No existen equipos registrados.
            </div>
          )}

          {equipos.length > 0 && (
            <div className="planta-relation-actions">
              <button
                type="button"
                className="planta-save-btn"
                onClick={guardarRelacion}
                disabled={guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : 'Guardar relación'}
              </button>
            </div>
          )}
        </>
      )}

      {mensaje && (
        <div className="planta-alert">
          {mensaje}
        </div>
      )}
    </div>
  );
}