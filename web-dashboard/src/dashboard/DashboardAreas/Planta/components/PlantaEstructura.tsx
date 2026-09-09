import { useEffect, useState } from 'react';

import { ProcesoList } from './ProcesoList';
import { SubprocesoList } from './SubprocesoList';
import { EquiposSubproceso } from './EquiposSubproceso';
import { SubprocesosSistema } from './SubprocesosSistema';
import { ComponentesEquipo } from './ComponentesEquipo';
import { RepuestosCatalogo } from './RepuestosCatalogo';
import { CatalogosPlanta } from './CatalogosPlanta';
import { EstadoEstructura } from './EstadoEstructura';

import {
  getProcesos,
  getSistemas,
  type Proceso,
  type Subproceso,
  type SistemaPlanta,
  type Equipo,
} from '../services/plantaApi';

export function PlantaEstructura() {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [procesoSeleccionado, setProcesoSeleccionado] =
    useState<Proceso | null>(null);

  const [sistemaSeleccionado, setSistemaSeleccionado] =
    useState<SistemaPlanta | null>(null);

  const [subprocesoSeleccionado, setSubprocesoSeleccionado] =
    useState<Subproceso | null>(null);

  const [equipoSeleccionado, setEquipoSeleccionado] =
    useState<Equipo | null>(null);

  const [mostrarSubprocesos, setMostrarSubprocesos] =
    useState(false);

  const [mostrarEquipos, setMostrarEquipos] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const cargar = async () => {
    setLoading(true);

    try {
      const [
        procesosResultado,
        sistemasResultado,
      ] = await Promise.all([
        getProcesos(),
        getSistemas(),
      ]);

      setProcesos(procesosResultado);
      setSistemas(sistemasResultado);
    } catch (error) {
      console.error(
        'Error cargando estructura de planta:',
        error
      );

      setProcesos([]);
      setSistemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const seleccionarProceso = (
    proceso: Proceso
  ) => {
    setProcesoSeleccionado(proceso);
    setSubprocesoSeleccionado(null);
    setSistemaSeleccionado(null);
    setEquipoSeleccionado(null);

    setMostrarSubprocesos(true);
    setMostrarEquipos(false);
  };

  const seleccionarSistema = (
    sistema: SistemaPlanta
  ) => {
    setSistemaSeleccionado(sistema);
    setProcesoSeleccionado(null);
    setSubprocesoSeleccionado(null);
    setEquipoSeleccionado(null);

    setMostrarSubprocesos(false);
    setMostrarEquipos(false);
  };

  const seleccionarSubproceso = (
    subproceso: Subproceso
  ) => {
    setSubprocesoSeleccionado(subproceso);
    setEquipoSeleccionado(null);
    setMostrarEquipos(true);
  };

  const seleccionarEquipo = (
    equipo: Equipo
  ) => {
    setEquipoSeleccionado(equipo);
  };

  return (
    <div className="planta-estructura">

      {loading && (
        <div className="planta-empty">
          Cargando estructura...
        </div>
      )}

      {!loading && (
        <>
          {/* =====================================================
              PROCESOS Y SISTEMAS
          ===================================================== */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: 20,
              marginBottom: 20,
            }}
          >

            <ProcesoList
              procesos={procesos}
              seleccionado={procesoSeleccionado}
              loading={loading}
              onSelect={seleccionarProceso}
              onReload={cargar}
            />

            <section className="planta-card">

              <div className="planta-card-header">
                <div>
                  <h3>Sistemas</h3>

                  <p>
                    Estructura independiente de sistemas
                    de planta.
                  </p>
                </div>

                <button
                  type="button"
                  className="planta-add-btn"
                >
                  + Nuevo sistema
                </button>
              </div>

              {sistemas.length === 0 ? (
                <p className="planta-empty">
                  No existen sistemas configurados.
                </p>
              ) : (
                <div className="planta-list">

                  {sistemas.map((sistema) => (
                    <div
                      key={sistema.id}
                      className={`planta-list-item ${
                        sistemaSeleccionado?.id === sistema.id
                          ? 'seleccionado'
                          : ''
                      }`}
                    >
                      <button
                        className="planta-list-main"
                        onClick={() =>
                          seleccionarSistema(sistema)
                        }
                      >
                        <div>
                          <strong>
                            {sistema.nombre}
                          </strong>

                          {sistema.descripcion && (
                            <small>
                              {sistema.descripcion}
                            </small>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}

                </div>
              )}

            </section>

          </div>

          {/* =====================================================
              SUBPROCESOS
          ===================================================== */}

          <section className="planta-card">

            <div className="planta-card-header">
              <div>
                <h3>Subprocesos</h3>

                {mostrarSubprocesos && procesoSeleccionado ? (
                  <p>
                    Proceso seleccionado:{' '}
                    <strong>
                      {procesoSeleccionado.nombre}
                    </strong>
                  </p>
                ) : mostrarSubprocesos && sistemaSeleccionado ? (
                  <p>
                    Sistema seleccionado:{' '}
                    <strong>
                      {sistemaSeleccionado.nombre}
                    </strong>
                  </p>
                ) : (
                  <p>
                    Selecciona primero un proceso o sistema.
                  </p>
                )}
              </div>
            </div>

            {!mostrarEquipos || !subprocesoSeleccionado ? (
              <SubprocesoList
                proceso={procesoSeleccionado}
                onSelect={seleccionarSubproceso}
              />
            ) : sistemaSeleccionado ? (
              <SubprocesosSistema
                sistema={sistemaSeleccionado}
              />
            ) : (
              <div className="planta-alert warning">
                <strong>
                  Selecciona un proceso o sistema
                </strong>

                <span>
                  Debes seleccionar el padre antes de
                  administrar sus subprocesos.
                </span>
              </div>
            )}

          </section>

          {/* =====================================================
              EQUIPOS
          ===================================================== */}

          <section
            className="planta-card"
            style={{ marginTop: 20 }}
          >

            <div className="planta-card-header">
              <div>
                <h3>Equipos</h3>

                <p>
                  Selecciona un subproceso para administrar
                  sus equipos.
                </p>
              </div>

              <button
                className="planta-add-btn"
                onClick={() => {
                  window.location.href =
                    '/equipos/nuevo';
                }}
              >
                + Crear equipo
              </button>
            </div>

            {!mostrarEquipos || !subprocesoSeleccionado ? (
              <div className="planta-alert warning">
                <strong>
                  Selecciona un subproceso
                </strong>

                <span>
                  Un equipo debe pertenecer a un
                  subproceso antes de formar parte
                  de la estructura.
                </span>
              </div>
            ) : (
              <EquiposSubproceso
                subproceso={subprocesoSeleccionado}
                onSelectEquipo={seleccionarEquipo}
              />
            )}

          </section>

          {/* =====================================================
              COMPONENTES
          ===================================================== */}

          <section
            className="planta-card"
            style={{ marginTop: 20 }}
          >

            <div className="planta-card-header">
              <div>
                <h3>Componentes</h3>

                {equipoSeleccionado ? (
                  <p>
                    Equipo seleccionado:{' '}
                    <strong>
                      {equipoSeleccionado.codigo} —{' '}
                      {equipoSeleccionado.nombre}
                    </strong>
                  </p>
                ) : (
                  <p>
                    Selecciona primero un equipo.
                  </p>
                )}
              </div>
            </div>

            {!equipoSeleccionado ? (
              <div className="planta-alert warning">
                <strong>
                  Selecciona un equipo
                </strong>

                <span>
                  Los componentes solamente pueden
                  crearse asociados a un equipo existente.
                </span>
              </div>
            ) : (
              <ComponentesEquipo
                equipo={equipoSeleccionado}
              />
            )}

          </section>

          {/* =====================================================
              ADMINISTRACIÓN SECUNDARIA
          ===================================================== */}

          <div
            style={{
              marginTop: 20,
            }}
          >
            <RepuestosCatalogo />
          </div>

          <div
            style={{
              marginTop: 20,
            }}
          >
            <CatalogosPlanta />
          </div>

          <div
            style={{
              marginTop: 20,
            }}
          >
            <EstadoEstructura />
          </div>
        </>
      )}

    </div>
  );
}