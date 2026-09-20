import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getEquiposParaRelacionSubproceso,
  relacionarEquiposConSubproceso,
  type Equipo,
} from '../../services/plantaApi';

interface Props {
  subprocesoId: number;
  subprocesoNombre: string;
  onSelectEquipo?: (equipo: Equipo | null) => void;
}

export function EquiposSubproceso({
  subprocesoId,
  subprocesoNombre,
  onSelectEquipo,
}: Props) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [asignados, setAsignados] = useState<Equipo[]>([]);
  const [disponibles, setDisponibles] = useState<Equipo[]>([]);

  const [seleccionado, setSeleccionado] =
    useState<Equipo | null>(null);

  const [origenSeleccionado, setOrigenSeleccionado] =
    useState<'disponible' | 'asignado' | null>(null);

  const [busquedaDisponible, setBusquedaDisponible] =
    useState('');

  const [busquedaAsignado, setBusquedaAsignado] =
    useState('');

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const normalizar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const ordenarEquipos = (lista: Equipo[]) =>
    [...lista].sort((a, b) =>
      `${a.codigo ?? ''} ${a.nombre}`.localeCompare(
        `${b.codigo ?? ''} ${b.nombre}`,
        'es',
        { sensitivity: 'base' }
      )
    );

  const cargarEquipos = useCallback(async () => {
    setLoading(true);
    setMensaje('');

    try {
      const resultado =
        await getEquiposParaRelacionSubproceso(subprocesoId);

      const asignadosIniciales = resultado.filter(
        (equipo) => equipo.relacionado
      );

      const disponiblesIniciales = resultado.filter(
        (equipo) => !equipo.relacionado
      );

      setEquipos(resultado);
      setAsignados(ordenarEquipos(asignadosIniciales));
      setDisponibles(ordenarEquipos(disponiblesIniciales));
      setSeleccionado(null);
      setOrigenSeleccionado(null);
    } catch (error) {
      console.error('Error cargando equipos:', error);

      setEquipos([]);
      setAsignados([]);
      setDisponibles([]);
      setMensaje('No se pudieron cargar los equipos.');
    } finally {
      setLoading(false);
    }
  }, [subprocesoId]);

  useEffect(() => {
    void cargarEquipos();
  }, [cargarEquipos]);

  const equiposDisponiblesFiltrados = useMemo(() => {
    const texto = normalizar(
      busquedaDisponible.trim()
    );

    return disponibles.filter((equipo) => {
      const contenido = normalizar(
        [
          equipo.codigo ?? '',
          equipo.nombre,
          equipo.area ?? '',
          equipo.tipo ?? '',
          equipo.estado_equipo ?? '',
        ].join(' ')
      );

      return contenido.includes(texto);
    });
  }, [disponibles, busquedaDisponible]);

  const equiposAsignadosFiltrados = useMemo(() => {
    const texto = normalizar(
      busquedaAsignado.trim()
    );

    return asignados.filter((equipo) => {
      const contenido = normalizar(
        [
          equipo.codigo ?? '',
          equipo.nombre,
          equipo.area ?? '',
          equipo.tipo ?? '',
          equipo.estado_equipo ?? '',
        ].join(' ')
      );

      return contenido.includes(texto);
    });
  }, [asignados, busquedaAsignado]);

  const seleccionarEquipo = (
    equipo: Equipo,
    origen: 'disponible' | 'asignado'
  ) => {
    setSeleccionado(equipo);
    setOrigenSeleccionado(origen);

    onSelectEquipo?.(equipo);
  };

  const moverAAsignados = () => {
    if (!seleccionado || origenSeleccionado !== 'disponible') {
      return;
    }

    setDisponibles((actuales) =>
      actuales.filter(
        (equipo) => equipo.id !== seleccionado.id
      )
    );

    setAsignados((actuales) =>
      ordenarEquipos([...actuales, seleccionado])
    );

    setSeleccionado(null);
    setOrigenSeleccionado(null);
  };

  const moverADisponibles = () => {
    if (!seleccionado || origenSeleccionado !== 'asignado') {
      return;
    }

    setAsignados((actuales) =>
      actuales.filter(
        (equipo) => equipo.id !== seleccionado.id
      )
    );

    setDisponibles((actuales) =>
      ordenarEquipos([...actuales, seleccionado])
    );

    setSeleccionado(null);
    setOrigenSeleccionado(null);

    onSelectEquipo?.(null);
  };

  const guardarRelacion = async () => {
    if (asignados.length === 0) {
      setMensaje('Seleccione al menos un equipo.');
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      await relacionarEquiposConSubproceso(
        subprocesoId,
        asignados.map((equipo) => equipo.id)
      );

      setMensaje(
        'Relación de equipos guardada correctamente.'
      );
    } catch (error) {
      console.error(
        'Error guardando relación de equipos:',
        error
      );

      setMensaje('No se pudo guardar la relación.');
    } finally {
      setGuardando(false);
    }
  };

  const renderEquipo = (
    equipo: Equipo,
    origen: 'disponible' | 'asignado'
  ) => {
    const activo =
      seleccionado?.id === equipo.id &&
      origenSeleccionado === origen;

    return (
      <button
        key={equipo.id}
        type="button"
        className={`planta-relation-transfer-item ${
          activo ? 'selected' : ''
        }`}
        onClick={() =>
          seleccionarEquipo(equipo, origen)
        }
      >
        <span>
          <strong>
            {equipo.codigo
              ? `${equipo.codigo} - `
              : ''}
            {equipo.nombre}
          </strong>

          <small>
            Área: {equipo.area || 'Sin área'}
          </small>

          <small>
            Tipo: {equipo.tipo || 'Sin tipo'}
          </small>
        </span>

        <span>›</span>
      </button>
    );
  };

  return (
    <div className="planta-relation-panel">
      <div className="planta-relation-header">
        <div>
          <span className="planta-section-label">
            SUBPROCESO
          </span>

          <h3>{subprocesoNombre}</h3>

          <p>
            Seleccione los equipos que pertenecen a este
            subproceso.
          </p>
        </div>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando equipos...
        </div>
      )}

      {!loading && (
        <>
          <div className="planta-relation-transfer">
            <div className="planta-relation-transfer-panel">
              <div className="planta-relation-transfer-header">
                <div>
                  <span className="planta-section-label">
                    DISPONIBLES
                  </span>

                  <strong>
                    Equipos de otros subprocesos
                  </strong>
                </div>

                <span className="planta-relation-count">
                  {disponibles.length}
                </span>
              </div>

              <label className="planta-relation-search">
                <span>⌕</span>

                <input
                  type="search"
                  value={busquedaDisponible}
                  onChange={(e) =>
                    setBusquedaDisponible(
                      e.target.value
                    )
                  }
                  placeholder="Buscar equipo..."
                />
              </label>

              <div className="planta-relation-transfer-list">
                {equiposDisponiblesFiltrados.length > 0 ? (
                  equiposDisponiblesFiltrados.map(
                    (equipo) =>
                      renderEquipo(
                        equipo,
                        'disponible'
                      )
                  )
                ) : (
                  <div className="planta-relation-empty">
                    <span>⌕</span>

                    <p>
                      {disponibles.length === 0
                        ? 'No hay equipos disponibles.'
                        : 'No se encontraron equipos.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="planta-relation-transfer-actions">
              <button
                type="button"
                className="planta-relation-transfer-action"
                onClick={moverAAsignados}
                disabled={
                  !seleccionado ||
                  origenSeleccionado !==
                    'disponible'
                }
                title="Asignar equipo"
              >
                →
              </button>

              <button
                type="button"
                className="planta-relation-transfer-action"
                onClick={moverADisponibles}
                disabled={
                  !seleccionado ||
                  origenSeleccionado !==
                    'asignado'
                }
                title="Quitar equipo"
              >
                ←
              </button>
            </div>

            <div className="planta-relation-transfer-panel">
              <div className="planta-relation-transfer-header">
                <div>
                  <span className="planta-section-label">
                    ASIGNADOS
                  </span>

                  <strong>
                    Equipos del subproceso
                  </strong>
                </div>

                <span className="planta-relation-count assigned">
                  {asignados.length}
                </span>
              </div>

              <label className="planta-relation-search">
                <span>⌕</span>

                <input
                  type="search"
                  value={busquedaAsignado}
                  onChange={(e) =>
                    setBusquedaAsignado(
                      e.target.value
                    )
                  }
                  placeholder="Buscar equipo..."
                />
              </label>

              <div className="planta-relation-transfer-list">
                {equiposAsignadosFiltrados.length > 0 ? (
                  equiposAsignadosFiltrados.map(
                    (equipo) =>
                      renderEquipo(
                        equipo,
                        'asignado'
                      )
                  )
                ) : (
                  <div className="planta-relation-empty">
                    <span>⌕</span>

                    <p>
                      {asignados.length === 0
                        ? 'No hay equipos asignados.'
                        : 'No se encontraron equipos.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="planta-relation-summary">
            <span>Equipos asignados</span>

            <strong>
              {asignados.length}
            </strong>
          </div>

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