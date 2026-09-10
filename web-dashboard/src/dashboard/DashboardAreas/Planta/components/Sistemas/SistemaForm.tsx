import { useState } from 'react';
import {
  actualizarSistema,
  crearSistema,
  type SistemaPlanta,
} from '../../services/plantaApi';

interface Props {
  sistema?: SistemaPlanta | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function SistemaForm({
  sistema,
  onSaved,
  onCancel,
}: Props) {
  const [nombre, setNombre] = useState(
    sistema?.nombre || ''
  );

  const [descripcion, setDescripcion] = useState(
    sistema?.descripcion || ''
  );

  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!nombre.trim() || guardando) {
      return;
    }

    setGuardando(true);

    try {
      if (sistema) {
        await actualizarSistema(sistema.id, {
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() || undefined,
          activo: sistema.activo,
        });
      } else {
        await crearSistema({
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() || undefined,
        });
      }

      onSaved();
    } catch (error) {
      console.error(
        'Error guardando sistema:',
        error
      );

      alert(
        'No se pudo guardar el sistema.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="planta-form">
      <input
        placeholder="Nombre del sistema"
        value={nombre}
        onChange={(e) =>
          setNombre(e.target.value)
        }
        autoFocus
      />

      <input
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) =>
          setDescripcion(e.target.value)
        }
      />

      <div className="planta-form-actions">
        <button
          type="button"
          className="planta-cancel-btn"
          onClick={onCancel}
          disabled={guardando}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="planta-save-btn"
          onClick={guardar}
          disabled={
            !nombre.trim() || guardando
          }
        >
          {guardando
            ? 'Guardando...'
            : sistema
              ? 'Actualizar'
              : 'Guardar'}
        </button>
      </div>
    </div>
  );
}