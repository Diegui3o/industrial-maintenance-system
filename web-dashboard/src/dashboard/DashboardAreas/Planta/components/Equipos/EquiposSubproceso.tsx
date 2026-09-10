import type {
  Equipo,
} from '../../services/plantaApi';

import { EquiposSubprocesoFinal } from './EquiposSubprocesoFinal';

interface Props {
  subprocesoId: number;
  subprocesoNombre?: string;
  onSelectEquipo?: (
    equipo: Equipo | null
  ) => void;
}

export function EquiposSubproceso({
  subprocesoId,
  subprocesoNombre = '',
  onSelectEquipo,
}: Props) {
  return (
    <EquiposSubprocesoFinal
      subprocesoId={subprocesoId}
      subprocesoNombre={subprocesoNombre}
      onSelectEquipo={onSelectEquipo}
    />
  );
}