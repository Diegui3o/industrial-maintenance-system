import React from 'react';
import { createPortal } from 'react-dom';
import './ComponenteMenuAcciones.css';

interface Props {
  posicion: { top: number; left: number };
  onVer: () => void;
  onCambiarEstado: () => void;
  onEliminar: () => void;
  onCerrar: () => void;
}

export const ComponenteMenuAcciones: React.FC<Props> = ({
  posicion,
  onVer,
  onCambiarEstado,
  onEliminar,
  onCerrar,
}) => {
  return createPortal(
    <>
      <div className="componente-menu-overlay" onClick={onCerrar} />
      <div
        className="componente-menu-desplegable"
        style={{ top: `${posicion.top}px`, left: `${posicion.left}px` }}
      >
        <div className="menu-grupo-titulo">Información</div>
        <button type="button" className="menu-opcion" onClick={onVer}>
          Ver información
        </button>
        <button type="button" className="menu-opcion" onClick={onCambiarEstado}>
          Cambiar estado
        </button>

        <div className="menu-separador" />

        <button type="button" className="menu-opcion menu-opcion-eliminar" onClick={onEliminar}>
          Eliminar componente
        </button>
      </div>
    </>,
    document.body
  );
};