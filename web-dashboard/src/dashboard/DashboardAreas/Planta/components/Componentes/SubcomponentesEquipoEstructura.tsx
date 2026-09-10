import type {
  Componente,
} from '../../services/plantaApi';

import { SubcomponentesEstructura } from './SubcomponentesEstructura';

interface Props {
  componente: Componente;
}

export function SubcomponentesEquipoEstructura({
  componente,
}: Props) {
  return (
    <SubcomponentesEstructura
      componente={componente}
    />
  );
}