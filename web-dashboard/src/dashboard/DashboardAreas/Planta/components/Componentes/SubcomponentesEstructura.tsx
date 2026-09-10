import type {
  Componente,
} from '../../services/plantaApi';

import { SubcomponentesEstructuraFinal } from './SubcomponentesEstructuraFinal';

interface Props {
  componente: Componente;
}

export function SubcomponentesEstructura({
  componente,
}: Props) {
  return (
    <SubcomponentesEstructuraFinal
      componente={componente}
    />
  );
}