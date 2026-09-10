interface Props {
  procesos: number;
  subprocesos: number;
  equipos: number;
  equiposSinUbicar: number;
}

export function PlantaEstado({
  procesos,
  subprocesos,
  equipos,
  equiposSinUbicar,
}: Props) {
  return (
    <div className="planta-estado">

      <div className="planta-estado-item">
        <span>Procesos</span>
        <strong>{procesos}</strong>
      </div>

      <div className="planta-estado-item">
        <span>Subprocesos</span>
        <strong>{subprocesos}</strong>
      </div>

      <div className="planta-estado-item">
        <span>Equipos ubicados</span>
        <strong>{equipos}</strong>
      </div>

      <div
        className={`planta-estado-item ${
          equiposSinUbicar > 0 ? 'warning' : 'ok'
        }`}
      >
        <span>Equipos sin ubicar</span>
        <strong>{equiposSinUbicar}</strong>
      </div>

    </div>
  );
}