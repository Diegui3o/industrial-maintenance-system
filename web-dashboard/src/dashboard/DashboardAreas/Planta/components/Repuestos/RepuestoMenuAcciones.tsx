import React from 'react';
import { createPortal } from 'react-dom';
import './RepuestoMenuAcciones.css';

interface Props {
  posicion: { top: number; left: number };
  onVer: () => void;
  onEditar: () => void;
  onHistorial: () => void;
  onCambiarEstado: (estado: string) => void;
  onEliminar: () => void;
  onCerrar: () => void;
}

export const RepuestoMenuAcciones: React.FC<Props> = ({
  posicion,
  onVer,
  onEditar,
  onHistorial,
  onCambiarEstado,
  onEliminar,
  onCerrar,
}) => {
  return createPortal(
    <>
      <div className="repuesto-menu-overlay" onClick={onCerrar} />
      <div
        className="repuesto-menu-desplegable"
        style={{ top: `${posicion.top}px`, left: `${posicion.left}px` }}
      >
        <div className="menu-grupo-titulo">Información</div>
        <button type="button" className="menu-opcion" onClick={onVer}>Ver</button>
        <button type="button" className="menu-opcion" onClick={onEditar}>Editar</button>
        <button type="button" className="menu-opcion" onClick={onHistorial}>Historial</button>

        <div className="menu-separador" />

        <div className="menu-grupo-titulo">Cambiar estado</div>
        <button type="button" className="menu-opcion" onClick={() => onCambiarEstado('activo')}>Activo</button>
        <button type="button" className="menu-opcion" onClick={() => onCambiarEstado('planeado')}>Planeado</button>
        <button type="button" className="menu-opcion" onClick={() => onCambiarEstado('falla')}>Falla</button>
        <button type="button" className="menu-opcion" onClick={() => onCambiarEstado('inactivo')}>Inactivo</button>
        <button type="button" className="menu-opcion" onClick={() => onCambiarEstado('obsoleto')}>Obsoleto</button>

        <div className="menu-separador" />

        <button type="button" className="menu-opcion menu-opcion-eliminar" onClick={onEliminar}>
          Eliminar
        </button>
      </div>
    </>,
    document.body
  );
};