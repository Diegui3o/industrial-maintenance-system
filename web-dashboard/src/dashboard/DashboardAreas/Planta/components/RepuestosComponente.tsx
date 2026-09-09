import { useEffect, useState } from 'react';
import {
  asignarRepuesto,
  getRepuestos,
  getRepuestosComponente,
  type Componente,
  type ComponenteRepuesto,
  type Repuesto,
} from '../services/plantaApi';

interface Props {
  componente: Componente | null;
}

export function RepuestosComponente({
  componente,
}: Props) {
  const [repuestos, setRepuestos] =
    useState<ComponenteRepuesto[]>([]);

  const [disponibles, setDisponibles] =
    useState<Repuesto[]>([]);

  const [mostrar, setMostrar] = useState(false);

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    if (!componente) return;

    setLoading(true);

    try {
      const [asignados, todos] =
        await Promise.all([
          getRepuestosComponente(componente.id),
          getRepuestos(),
        ]);

      setRepuestos(asignados);

      const ids = new Set(
        asignados.map(
          (repuesto) => repuesto.repuesto_id
        )
      );

      setDisponibles(
        todos.filter(
          (repuesto) => !ids.has(repuesto.id)
        )
      );
    } catch (error) {
      console.error(
        'Error cargando repuestos:',
        error
      );

      setRepuestos([]);
      setDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRepuestos([]);
    setDisponibles([]);
    setMostrar(false);

    if (componente) {
      cargar();
    }
  }, [componente]);

  const asignar = async (repuesto: Repuesto) => {
    if (!componente || guardando) return;

    setGuardando(true);

    try {
      await asignarRepuesto(componente.id, {
        repuesto_id: repuesto.id,
        cantidad: 1,
      });

      await cargar();
    } catch (error) {
      console.error(
        'Error asignando repuesto:',
        error
      );

      alert(
        'No se pudo asociar el repuesto.'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!componente) {
    return null;
  }

  return (
    <section className="planta-card">

      <div className="planta-card-header">
        <div>
          <h3>Repuestos</h3>

          <p>
            {componente.codigo
              ? `${componente.codigo} · `
              : ''}
            {componente.nombre}
          </p>
        </div>

        <button
          className="planta-add-btn"
          onClick={() => setMostrar(!mostrar)}
        >
          {mostrar
            ? 'Cerrar'
            : '+ Asociar repuesto'}
        </button>
      </div>

      {mostrar && (
        <div className="planta-selector-container">

          <div className="planta-selector-title">
            <strong>
              Repuestos disponibles
            </strong>

            <span>
              Selecciona un repuesto existente.
            </span>
          </div>

          {disponibles.length === 0 && (
            <div className="planta-alert warning">
              <strong>
                No hay repuestos disponibles
              </strong>

              <span>
                Primero debes registrar repuestos.
              </span>
            </div>
          )}

          {disponibles.map((repuesto) => (
            <div
              key={repuesto.id}
              className="planta-equipo-disponible"
            >
              <div>
                <strong>
                  {repuesto.codigo ||
                    `REP-${repuesto.id}`}
                </strong>

                <small>
                  {repuesto.nombre}
                </small>
              </div>

              <button
                className="planta-save-btn"
                onClick={() =>
                  asignar(repuesto)
                }
                disabled={guardando}
              >
                Asociar
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="planta-list">

        {loading && (
          <div className="planta-empty">
            Cargando repuestos...
          </div>
        )}

        {!loading &&
          repuestos.length === 0 && (
            <div className="planta-alert warning">
              <strong>
                Componente sin repuestos
              </strong>

              <span>
                No hay repuestos asociados.
              </span>
            </div>
          )}

        {!loading &&
          repuestos.map((repuesto) => (
            <div
              key={repuesto.repuesto_id}
              className="planta-list-item"
            >
              <div>
                <strong>
                  {repuesto.codigo ||
                    `REP-${repuesto.repuesto_id}`}
                  {' — '}
                  {repuesto.nombre}
                </strong>

                <small>
                  Cantidad: {repuesto.cantidad}
                  {repuesto.posicion
                    ? ` · Posición: ${repuesto.posicion}`
                    : ''}
                </small>
              </div>
            </div>
          ))}

      </div>
    </section>
  );
}