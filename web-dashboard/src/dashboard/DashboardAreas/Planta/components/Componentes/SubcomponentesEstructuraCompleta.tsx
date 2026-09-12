import type { Componente } from '../../services/plantaApi';

import { SubcomponentesRelacion } from './SubcomponentesRelacion';

interface Props {
  componente: Componente;
}

export function SubcomponentesEstructuraCompleta({
  componente,
}: Props) {
  return (
    <SubcomponentesRelacion
      componenteId={componente.id}
    />
  );
}