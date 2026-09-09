import { useState } from 'react';
import {
  actualizarProceso,
  crearProceso,
  type Proceso,
} from '../services/plantaApi';

interface Props {
  proceso?: Proceso | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function ProcesoForm({
  proceso,
  onSaved,
  onCancel,
}: Props) {
  const [nombre, setNombre] = useState(proceso?.nombre || '');
  const [descripcion, setDescripcion] = useState(proceso?.descripcion || '');
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!nombre.trim() || guardando) return;

    setGuardando(true);

    try {
      if (proceso) {
        await actualizarProceso(proceso.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          activo: proceso.activo,
        });
      } else {
        await crearProceso({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
        });
      }

      onSaved();
    } catch (error) {
      console.error('Error guardando proceso:', error);
      alert('No se pudo guardar el proceso.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="planta-form">
      <input
        placeholder="Nombre del proceso"
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