import { MotorElectricoTabla } from '../motores/MotorElectricoTabla';
import { ComponenteGenericoTabla } from './ComponenteGenericoTabla';

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
      // Para MÓDULO, TABLERO, ARRANCADOR y los demás tipos
      return <ComponenteGenericoTabla tipo={tipoSeleccionado} />;
  }
}