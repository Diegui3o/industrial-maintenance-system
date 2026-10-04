import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { SubprocesosCatalogo } from './SubprocesosCatalogo';
import { SubprocesosProcesoPanel } from './SubprocesosProcesoPanel';
import { SubprocesosSistemaPanel } from './SubprocesosSistemaPanel';

import type {
  SubprocesoCatalogo as SubprocesoCatalogoType,
} from './subprocesosTipos';

export function SubprocesosPorEstructura() {
  const [subprocesoProcesoId, setSubprocesoProcesoId] =
    useState<number | null>(null);

  const [subprocesoSistemaId, setSubprocesoSistemaId] =
    useState<number | null>(null);

  const procesoRef =
    useRef<HTMLDivElement | null>(null);

  const sistemaRef =
    useRef<HTMLDivElement | null>(null);

  const relacionarProceso = (
    subproceso: SubprocesoCatalogoType
  ) => {
    if (subproceso.tipo !== 'proceso') {
      return;
    }

    setSubprocesoProcesoId(
      subproceso.id
    );

    setSubprocesoSistemaId(null);
  };

  const relacionarSistema = (
    subproceso: SubprocesoCatalogoType
  ) => {
    if (subproceso.tipo !== 'sistema') {
      return;
    }

    setSubprocesoSistemaId(
      subproceso.id
    );

    setSubprocesoProcesoId(null);
  };

  useEffect(() => {
    if (!subprocesoProcesoId) {
      return;
    }

    procesoRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [subprocesoProcesoId]);

  useEffect(() => {
    if (!subprocesoSistemaId) {
      return;
    }

    sistemaRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [subprocesoSistemaId]);

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Subprocesos</h3>

          <p>
            Consulte los subprocesos y
            gestione sus relaciones.
          </p>
        </div>
      </div>

      <SubprocesosCatalogo
        onRelacionarProceso={
          relacionarProceso
        }
        onRelacionarSistema={
          relacionarSistema
        }
      />

      <div style={{ marginTop: 24, paddingLeft: 16 }}>
        <div className="planta-section-label">
          RELACIONES
        </div>

        <div className="planta-dual-grid">
          <div ref={procesoRef}>
            <SubprocesosProcesoPanel
              subprocesoInicialId={
                subprocesoProcesoId
              }
            />
          </div>

          <div ref={sistemaRef}>
            <SubprocesosSistemaPanel
              subprocesoInicialId={
                subprocesoSistemaId
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}