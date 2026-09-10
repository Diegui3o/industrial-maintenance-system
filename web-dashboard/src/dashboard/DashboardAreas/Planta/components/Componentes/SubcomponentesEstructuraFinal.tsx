import {
  useEffect,
  useState,
} from 'react';

import {
  getSubcomponentes,
  type Componente,
  type Subcomponente,
} from '../../services/plantaApi';

interface Props {
  componente: Componente;
}

export function SubcomponentesEstructuraFinal({
  componente,
}: Props) {
  const [
    subcomponentes,
    setSubcomponentes,
  ] = useState<Subcomponente[]>([]);

  const [
    subcomponenteId,
    setSubcomponenteId,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);

      try {
        const resultado =
          await getSubcomponentes(
            componente.id
          );

        if (!activo) return;

        setSubcomponentes(resultado);
      } catch (error) {
        if (!activo) return;

        console.error(
          'Error cargando subcomponentes:',
          error
        );

        setSubcomponentes([]);
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [componente.id]);

  const seleccionarSubcomponente = (
    id: string
  ) => {
    setSubcomponenteId(id);
  };

  const seleccionado =
    subcomponentes.find(
      (item) =>
        item.id.toString() ===
        subcomponenteId
    ) || null;

  return (
    <section className="planta-card">

      <div className="planta-card-header">
        <div>
          <h3>Subcomponentes</h3>

          <p>
            Componente padre:{' '}
            <strong>
              {componente.codigo
                ? `${componente.codigo} — `
                : ''}
              {componente.nombre}
            </strong>
          </p>
        </div>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando subcomponentes...
        </div>
      )}

      {!loading &&
        subcomponentes.length === 0 && (
          <div className="planta-alert warning">
            <strong>
              No existen subcomponentes
            </strong>

            <span>
              El componente seleccionado todavía
              no tiene subcomponentes registrados.
            </span>
          </div>
        )}

      {!loading &&
        subcomponentes.length > 0 && (
          <>
            <div className="planta-form">
              <label>
                Subcomponente padre
              </label>

              <select
                value={subcomponenteId}
                onChange={(e) =>
                  seleccionarSubcomponente(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Seleccione un subcomponente
                </option>

                {subcomponentes.map(
                  (subcomponente) => (
                    <option
                      key={subcomponente.id}
                      value={subcomponente.id}
                    >
                      {subcomponente.nombre}
                    </option>
                  )
                )}
              </select>
            </div>

            {seleccionado && (
              <div className="planta-alert">
                <strong>
                  Subcomponente seleccionado:
                </strong>

                <span>
                  {seleccionado.nombre}
                </span>
              </div>
            )}
          </>
        )}
    </section>
  );
}