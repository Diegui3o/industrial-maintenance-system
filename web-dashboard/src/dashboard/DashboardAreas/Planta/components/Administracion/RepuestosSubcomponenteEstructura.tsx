import type {
  Subcomponente,
} from '../../services/plantaApi';

import { RepuestosEstructura } from './RepuestosEstructura';

interface Props {
  subcomponente:
    | Subcomponente
    | null;
}

export function RepuestosSubcomponenteEstructura({
  subcomponente,
}: Props) {
  return (
    <RepuestosEstructura
      subcomponente={
        subcomponente
      }
    />
  );
}