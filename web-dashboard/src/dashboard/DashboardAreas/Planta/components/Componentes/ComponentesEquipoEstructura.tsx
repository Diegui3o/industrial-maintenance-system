import type {
  Equipo,
} from '../../services/plantaApi';

import { ComponentesEstructura } from './ComponentesEstructura';

interface Props {
  equipo: Equipo | null;
}

export function ComponentesEquipoEstructura({
  equipo,
}: Props) {
  return (
    <ComponentesEstructura
      equipo={equipo}
    />
  );
}