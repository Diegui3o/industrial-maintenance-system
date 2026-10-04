interface Props {
  tipo: 'proceso' | 'sistema';
  top: number;
  left: number;
  onEditar: () => void;
  onRelacionar: () => void;
  onDesactivar: () => void;
}

export function SubprocesoOpcionesMenu({
  tipo,
  top,
  left,
  onEditar,
  onRelacionar,
  onDesactivar,
}: Props) {
  return (
    <div
      className="planta-options-menu"
      style={{
        position: 'fixed',
        top,
        left,
      }}
    >
      <button
        type="button"
        onClick={onEditar}
      >
        Editar
      </button>

      <button
        type="button"
        onClick={onRelacionar}
      >
        {tipo === 'proceso'
          ? 'Relacionar con proceso'
          : 'Relacionar con sistema'}
      </button>

      <div className="planta-options-divider" />

      <button
        type="button"
        className="planta-options-delete"
        onClick={onDesactivar}
      >
        Desactivar
      </button>
    </div>
  );
}