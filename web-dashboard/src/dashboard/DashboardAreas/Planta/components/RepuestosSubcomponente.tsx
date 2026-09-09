import { useEffect, useState } from 'react';
import {
  asignarRepuestoSubcomponente,
  getRepuestos,
  getRepuestosSubcomponente,
  type Repuesto,
  type Subcomponente,
  type SubcomponenteRepuesto,
} from '../services/plantaApi';

interface Props {
  subcomponente: Subcomponente;
}

export function RepuestosSubcomponente({
  subcomponente,
}: Props) {
  const [asignados, setAsignados] = useState<
    SubcomponenteRepuesto[]
  >([]);

  const [catalogo, setCatalogo] = useState<Repuesto[]>([]);
  const [repuestoId, setRepuestoId] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [posicion, setPosicion] = useState('');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);

    try {
    const [asignadosResultado, catalogoResultado] =
    await Promise.all([
        getRepuestosSubcomponente(subcomponente.id),
        getRepuestos(),
    ]);

      setAsignados(asignadosResultado);
      setCatalogo(catalogoResultado);
    } catch (error) {
      console.error('Error cargando repuestos:', error);
      setAsignados([]);
      setCatalogo([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRepuestoId('');
    setCantidad('1');
    setPosicion('');
    setNotas('');
    cargar();
  }, [subcomponente.id]);

  const asignar = async () => {
    if (!repuestoId || guardando) return;

    const cantidadNumero = Number(cantidad);

    if (!Number.isFinite(cantidadNumero) || cantidadNumero <= 0) {
      alert('La cantidad debe ser mayor que cero.');
      return;
    }

    setGuardando(true);

    try {
      await asignarRepuestoSubcomponente(
        subcomponente.id,
        {
          repuesto_id: Number(repuestoId),
          cantidad: cantidadNumero,
          posicion: posicion.trim() || undefined,
          notas: notas.trim() || undefined,
        }
      );

      setRepuestoId('');
      setCantidad('1');
      setPosicion('');
      setNotas('');

      await cargar();
    } catch (error) {
      console.error('Error asignando repuesto:', error);
      alert('No se pudo asignar el repuesto.');
    } finally {
      setGuardando(false);
    }
  };

  const idsAsignados = new Set(
    asignados.map((item) => item.repuesto_id)
  );

  const disponibles = catalogo.filter(
    (item) => !idsAsignados.has(item.id)
  );

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h4>Repuestos</h4>
          <p>
            Subcomponente:{' '}
            <strong>{subcomponente.nombre}</strong>
          </p>
        </div>
      </div>

      <div className="planta-form">
        <div className="planta-form-grid">
          <label>
            Repuesto
            <select
              value={repuestoId}
              onChange={(e) => setRepuestoId(e.target.value)}
            >
              <option value="">
                Seleccione un repuesto
              </option>

              {disponibles.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.codigo
                    ? `${item.codigo} - ${item.nombre}`
                    : item.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Cantidad
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </label>

          <label>
            Posición
            <input
              type="text"
              value={posicion}
              onChange={(e) => setPosicion(e.target.value)}
              placeholder="Posición"
            />
          </label>

          <label>
            Notas
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas"
            />
          </label>
        </div>

        <div className="planta-form-actions">
          <button
            type="button"
            className="planta-btn planta-btn-primary"
            onClick={asignar}
            disabled={!repuestoId || guardando}
          >
            {guardando
              ? 'Asignando...'
              : 'Asignar repuesto'}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando repuestos...</p>
      ) : asignados.length === 0 ? (
        <p className="planta-empty">
          Este subcomponente todavía no tiene repuestos.
        </p>
      ) : (
        <div className="planta-list">
          {asignados.map((item) => (
            <div
              key={item.repuesto_id}
              className="planta-list-item"
            >
              <div>
                <strong>{item.nombre}</strong>

                {item.codigo && (
                  <span> — {item.codigo}</span>
                )}

                <p>
                  Cantidad: {item.cantidad}
                  {item.posicion &&
                    ` | Posición: ${item.posicion}`}
                </p>

                {item.notas && (
                  <p>{item.notas}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}