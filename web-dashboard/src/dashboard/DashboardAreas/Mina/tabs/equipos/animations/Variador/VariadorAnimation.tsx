import './Variador.css';

export function VariadorAnimation({ size = 80, activo = true }: { size?: number; activo?: boolean }) {
  return (
    <div className="variador-anim" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#A16207" strokeWidth="3" />

        {/* GRUPO COMPLETO DE ASPAS */}
        <g className={activo ? 'variador-girar' : 'variador-pausado'}>
          <ellipse cx="50" cy="18" rx="8" ry="18" fill="#C45A1A" />
          <ellipse cx="50" cy="82" rx="8" ry="18" fill="#D97706" />
          <ellipse cx="18" cy="50" rx="18" ry="8" fill="#B45309" />
          <ellipse cx="82" cy="50" rx="18" ry="8" fill="#C45A1A" />
        </g>

        <circle cx="50" cy="50" r="10" fill="#A16207" />
        <circle cx="50" cy="50" r="5" fill="#fff" />
      </svg>
    </div>
  );
}