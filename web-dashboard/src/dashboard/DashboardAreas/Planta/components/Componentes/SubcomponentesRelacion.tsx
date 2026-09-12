import { useEffect, useState } from 'react';

import {
  getSubcomponentesParaRelacion,
  getSubcomponentes,
  relacionarSubcomponentes,
  type Subcomponente,
} from '../../services/plantaApi';

interface Props {
  componenteId: number | null;
}

export function SubcomponentesRelacion({
  componenteId,
}: Props) {
  const [items, setItems] = useState<Subcomponente[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!componenteId) {
      return;
    }

    let cancelado = false;

    const cargar = async () => {
      setLoading(true);
      setMensaje('');

      try {
        const [todos, relacionados] = await Promise.all([
          getSubcomponentesParaRelacion(componenteId),
          getSubcomponentes(componenteId),
        ]);

        if (cancelado) {
          return;
        }

        setItems(todos);

        setSeleccionados(
          relacionados.map((item) => item.id)
        );
      } catch (error) {
        console.error(
          'Error cargando subcomponentes:',
          error
        );

        if (!cancelado) {
          setItems([]);
          setSeleccionados([]);
          setMensaje(
            'No se pudieron cargar los subcomponentes.'
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [componenteId]);

  const cambiarSeleccion = (id: number) => {
    setSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((item) => item !== id)
        : [...actuales, id]
    );
  };

  const guardar = async () => {
    if (!componenteId) {
      return;
    }

    if (seleccionados.length === 0) {
      setMensaje(
        'Seleccione al menos un subcomponente.'
      );
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      await relacionarSubcomponentes(
        componenteId,
        seleccionados
      );

      setMensaje(
        'Relación guardada correctamente.'
      );
    } catch (error) {
      console.error(
        'Error guardando subcomponentes:',
        error
      );

      setMensaje(
        'No se pudo guardar la relación.'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!componenteId) {
    return (
      <div className="planta-empty">
        Seleccione un componente para administrar
        sus subcomponentes.
      </div>
    );
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Subcomponentes</h3>

          <p>
            Seleccione uno o varios subcomponentes.
          </p>
        </div>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando subcomponentes...
        </div>
      )}

      {!loading && (
        <>
          <div className="planta-list">
            {items.map((item) => (
              <label
                key={item.id}
                className="planta-list-item"
              >
                <input
                  type="checkbox"
                  checked={seleccionados.includes(
                    item.id
                  )}
                  onChange={() =>
                    cambiarSeleccion(item.id)
                  }
                />

                <div className="planta-list-main">
                  <strong>{item.nombre}</strong>

                  {item.codigo && (
                    <small>
                      Código: {item.codigo}
                    </small>
                  )}

                  <small>
                    {seleccionados.includes(item.id)
                      ? 'Relacionado'
                      : 'Disponible'}
                  </small>
                </div>
              </label>
            ))}
          </div>

          {items.length === 0 && (
            <div className="planta-empty">
              No hay subcomponentes registrados.
            </div>
          )}

          <div className="planta-form-actions">
            <button
              type="button"
              className="planta-save-btn"
              onClick={guardar}
              disabled={guardando}
            >
              {guardando
                ? 'Guardando...'
                : 'Guardar relación'}
            </button>
          </div>
        </>
      )}

      {mensaje && (
        <div className="planta-alert">
          {mensaje}
        </div>
      )}
    </section>
  );
}