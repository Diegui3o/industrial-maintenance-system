interface MaestroGeneralAccionesProps {
  tipo:
    | 'mantenimiento'
    | 'tecnico';

  onClick?: () => void;
}

const CONFIG = {
  mantenimiento: {
    clase: 'mantenimiento',
    icono: '🔧',
    texto: 'Mantenimiento',
    titulo:
      'Programa de mantenimiento',
  },

  tecnico: {
    clase: 'tecnico',
    icono: '📋',
    texto: 'Detalle técnico',
    titulo: 'Detalle técnico',
  },
} as const;

export function MaestroGeneralAcciones({
  tipo,
  onClick,
}: MaestroGeneralAccionesProps) {
  const config = CONFIG[tipo];

  return (
    <button
      type="button"
      className={`maestro-general-accion-btn ${config.clase}`}
      onClick={onClick}
      title={config.titulo}
    >
      <span className="maestro-general-accion-icono">
        {config.icono}
      </span>

      <span>
        {config.texto}
      </span>
    </button>
  );
}