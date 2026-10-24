import { useState } from 'react';
import type { FilaEquipo } from '../types';

interface Props {
  equipo: FilaEquipo;
  onCerrar: () => void;
  onSuccess: (equipoId: number, nuevoEstado: string) => void;
}

export function ModalCambioEstado({
  equipo,
  onCerrar,
  onSuccess,
}: Props) {
  const [estado, setEstado] = useState('activo');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      onSuccess(equipo.equipoId, estado);
      onCerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="planta-modal-overlay">
      <div className="planta-modal">
        <h3>Cambiar Estado - {equipo.nombre}</h3>
        <p>Fase: {equipo.fase} | Subproceso: {equipo.subproceso}</p>

        {error && <div className="planta-modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="planta-modal-field">
            <label>Nuevo Estado:</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="fallo">Fallo</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div className="planta-modal-field">
            <label>Motivo:</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Indique el motivo del cambio..."
              rows={3}
            />
          </div>

          <div className="planta-modal-acciones">
            <button type="button" onClick={onCerrar} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
