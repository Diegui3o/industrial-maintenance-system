import { useEffect, useState } from 'react';

import { ProcesoList } from './ProcesoList';
import { SubprocesoList } from './SubprocesoList';
import { EquiposSubproceso } from './EquiposSubproceso';
import { RepuestosCatalogo } from './RepuestosCatalogo';
import { CatalogosPlanta } from './CatalogosPlanta';
import { EstadoEstructura } from './EstadoEstructura';
import { SubprocesosSistema } from './SubprocesosSistema';

import {
  getProcesos,
  getSistemas,
  type Proceso,
  type Subproceso,
  type SistemaPlanta,
} from '../services/plantaApi';

type Nivel =
  | 'procesos'
  | 'subprocesos'
  | 'equipos';

export function PlantaEstructura() {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [sistema, setSistema] =
    useState<SistemaPlanta | null>(null);

  const [proceso, setProceso] =
    useState<Proceso | null>(null);

  const [subproceso, setSubproceso] =
    useState<Subproceso | null>(null);

  const [nivel, setNivel] =
    useState<Nivel>('procesos');

  const [loading, setLoading] =
    useState(true);

  const cargarProcesos = async () => {
    setLoading(true);

    try {
    const [procesosResultado, sistemasResultado] =
      await Promise.all([
        getProcesos(),
        getSistemas(),
      ]);

    setProcesos(procesosResultado);
    setSistemas(sistemasResultado);
    } catch (error) {
      console.error(
        'Error cargando procesos:',
        error
      );

      setProcesos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProcesos();
  }, []);

  const seleccionarProceso = (
    item: Proceso
  ) => {
    setProceso(item);
    setSubproceso(null);
    setNivel('subprocesos');
  };

  const seleccionarSubproceso = (
    item: Subproceso
  ) => {
    setSubproceso(item);
    setNivel('equipos');
  };

  const volverProcesos = () => {
    setProceso(null);
    setSubproceso(null);
    setNivel('procesos');
  };

  const volverSubprocesos = () => {
    if (!proceso) return;

    setSubproceso(null);
    setNivel('subprocesos');
  };

  const seleccionarSistema = (
    item: SistemaPlanta
  ) => {
    setSistema(item);
  };

  return (
    <div className="planta-estructura">

      <div className="planta-breadcrumb">

        <button
          className={
            nivel === 'procesos'
              ? 'active'
              : ''
          }
          onClick={volverProcesos}
        >
          1. Procesos
        </button>

        <span>›</span>

        <button
          className={
            nivel === 'subprocesos'
              ? 'active'
              : ''
          }
          disabled={!proceso}
          onClick={volverSubprocesos}
        >
          2. Subprocesos
        </button>

        <span>›</span>

        <button
          className={
            nivel === 'equipos'
              ? 'active'
              : ''
          }
          disabled={!subproceso}
          onClick={() => {
            if (subproceso) {
              setNivel('equipos');
            }
          }}
        >
          3. Equipos
        </button>

      </div>

      {loading && (
        <div className="planta-empty">
          Cargando estructura...
        </div>
      )}

      {!loading &&
        nivel === 'procesos' && (
          <ProcesoList
            procesos={procesos}
            seleccionado={proceso}
            loading={loading}
            onSelect={seleccionarProceso}
            onReload={cargarProcesos}
          />
        )}

      {!loading &&
        nivel === 'subprocesos' &&
        proceso && (
          <SubprocesoList
            proceso={proceso}
            onSelect={seleccionarSubproceso}
          />
        )}

      {!loading &&
        nivel === 'equipos' &&
        subproceso && (
          <EquiposSubproceso
            subproceso={subproceso}
          />
        )}
      <div className="planta-secondary-section">

        <section className="planta-card">

          <div className="planta-card-header">
            <div>
              <h3>Sistemas</h3>
              <p>
                Estructura independiente de sistemas de planta.
              </p>
            </div>
          </div>

          {sistemas.length === 0 ? (
            <p className="planta-empty">
              No existen sistemas configurados.
            </p>
          ) : (
            <div className="planta-list">

              {sistemas.map((item) => (
                <div
                  key={item.id}
                  className={`planta-list-item ${
                    sistema?.id === item.id
                      ? 'seleccionado'
                      : ''
                  }`}
                  onClick={() =>
                    seleccionarSistema(item)
                  }
                >
                  <div>
                    <strong>{item.nombre}</strong>

                    {item.descripcion && (
                      <p>{item.descripcion}</p>
                    )}
                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

        {sistema && (
          <SubprocesosSistema
            sistema={sistema}
          />
        )}

      </div>

      <div className="planta-secondary-section">

        <RepuestosCatalogo />

        <CatalogosPlanta />

        <EstadoEstructura />

      </div>

    </div>
  );
}