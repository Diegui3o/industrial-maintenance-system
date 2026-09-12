import { SubprocesosProcesoPanel } from './SubprocesosProcesoPanel';
import { SubprocesosSistemaPanel } from './SubprocesosSistemaPanel';

export function SubprocesosEstructuraNueva() {
  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Subprocesos</h3>

          <p>
            Relacione los subprocesos con
            procesos y sistemas.
          </p>
        </div>
      </div>

      <div className="planta-dual-grid">
        <div>
          <SubprocesosProcesoPanel />
        </div>

        <div>
          <SubprocesosSistemaPanel />
        </div>
      </div>
    </section>
  );
}