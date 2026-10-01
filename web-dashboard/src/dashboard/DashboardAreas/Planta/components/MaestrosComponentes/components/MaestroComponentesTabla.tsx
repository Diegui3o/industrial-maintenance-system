import { MotorElectricoTabla } from '../motores/MotorElectricoTabla';

interface MaestroComponentesTablaProps {
  tipoSeleccionado: string;
}

export function MaestroComponentesTabla({
  tipoSeleccionado,
}: MaestroComponentesTablaProps) {
  switch (tipoSeleccionado) {
    case 'MOTOR ELECTRICO':
      return <MotorElectricoTabla />;

    default:
      return (
        <div className="maestro-componentes-tabla-vacia">
          <h3>
            Maestro de {tipoSeleccionado}
          </h3>

          <p>
            La tabla para este tipo de componente
            todavía no está configurada.
          </p>
        </div>
      );
  }
}