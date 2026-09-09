import { useState } from 'react';
import {
  actualizarSubproceso,
  crearSubproceso,
  type Subproceso,
} from '../services/plantaApi';

interface Props {
  procesoId: number;
  subproceso?: Subproceso | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function SubprocesoForm({
  procesoId,
  subproceso,
  onSaved,
  onCancel,
}: Props) {
  const [nombre, setNombre] = useState(subproceso?.nombre || '');
  const [descripcion, setDescripcion] = useState(
    subproceso?.descripcion || ''
  );
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!nombre.trim() || guardando) return;

    setGuardando(true);

    try {
      if (subproceso) {
        await actualizarSubproceso(subproceso.id, {
          proceso_id: procesoId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo: subproceso.activo,
        });
      } else {
        await crearSubproceso({
          proceso_id: procesoId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
        });
      }

      onSaved();
    } catch (error) {
      console.error('Error guardando subproceso:', error);
      alert('No se pudo guardar el subproceso.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="planta-form">
      <input
        placeholder="Nombre del subproceso"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <input
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <div className="planta-form-actions">
        <button
          className="planta-cancel-btn"
          onClick={onCancel}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          className="planta-save-btn"
          onClick={guardar}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}