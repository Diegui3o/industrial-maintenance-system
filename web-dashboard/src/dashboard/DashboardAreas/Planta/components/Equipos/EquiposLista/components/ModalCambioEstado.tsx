import { useState } from 'react';
import type { FilaEquipo } from '../types';

interface Props {
  equipo: FilaEquipo;
  onCerrar: () => void;
  onSuccess: (equipoId: number, nuevoEstado: string) => void;
}

export function ModalCambioEstado({ equipo, onCerrar, onSuccess }: Props) {
  const [nuevoEstado, setNuevoEstado] = useState(equipo.estado || 'activo');
  const [motivoEstado, setMotivoEstado] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  const cambiarEstadoEquipo = async () => {
    if (!motivoEstado.trim()) return;

    setGuardandoEstado(true);

    try {
      const res = await fetch(`/api/equipos/${equipo.equipoId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstado,
          motivo: motivoEstado.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('No se pudo cambiar el estado del equipo.');
      }

      onSuccess(equipo.equipoId, nuevoEstado);
      onCerrar();
    } catch (err) {
      console.error('Error cambiando estado:', err);
      window.alert('No se pudo cambiar el estado del equipo.');
    } finally {
      setGuardandoEstado(false);
    }
  };

  return (
    <div
      className="planta-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div className="planta-modal planta-estado-modal">
        <div className="planta-modal-header">
          <div>
            <span className="planta-section-label">ESTADO DEL EQUIPO</span>
            <h3>{equipo.codigo}</h3>
          </div>
          <button type="button" className="planta-modal-close" onClick={onCerrar}>
            ×
          </button>
        </div>

        <div className="planta-estado-opciones">
          {(['activo', 'inactivo', 'fallo', 'mantenimiento'] as const).map((est) => (
            <label
              key={est}
              className={`planta-estado-opcion ${nuevoEstado === est ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="estado-equipo"
                value={est}
                checked={nuevoEstado === est}
                onChange={() => setNuevoEstado(est)}
              />
              <span>
                <strong>{est.charAt(0).toUpperCase() + est.slice(1)}</strong>
                <small>
                  {est === 'activo' && 'El equipo está operativo.'}
                  {est === 'inactivo' && 'Está fuera de operación.'}
                  {est === 'fallo' && 'Presenta una avería o condición anormal.'}
                  {est === 'mantenimiento' && 'Está siendo intervenido o inspeccionado.'}
                </small>
              </span>
            </label>
          ))}
        </div>

        <div className="planta-modal-field">
          <label>Motivo del cambio</label>
          <textarea
            value={motivoEstado}
            onChange={(e) => setMotivoEstado(e.target.value)}
            placeholder="Ingrese el motivo..."
            rows={4}
          />
        </div>

        <div className="planta-modal-actions">
          <button type="button" className="planta-modal-btn-secondary" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="planta-modal-btn-primary"
            disabled={guardandoEstado || !motivoEstado.trim()}
            onClick={cambiarEstadoEquipo}
          >
            {guardandoEstado ? 'Guardando...' : 'Guardar estado'}
          </button>
        </div>
      </div>
    </div>
  );
}