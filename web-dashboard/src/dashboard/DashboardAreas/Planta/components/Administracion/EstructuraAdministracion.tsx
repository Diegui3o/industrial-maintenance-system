import type {
  Subcomponente,
} from '../../services/plantaApi';

import { RepuestosEstructura } from './RepuestosEstructura';

interface Props {
  subcomponente:
    | Subcomponente
    | null;
}

export function EstructuraAdministracion({
  subcomponente,
}: Props) {
  return (
    <section>
      <RepuestosEstructura
        subcomponente={
          subcomponente
        }
      />
    </section>
  );
}