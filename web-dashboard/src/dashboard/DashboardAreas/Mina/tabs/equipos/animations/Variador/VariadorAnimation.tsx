import './Variador.css';

export function VariadorAnimation({ size = 80 }: { size?: number }) {
  return (
    <div className="variador-anim" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Círculo exterior */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#A16207" strokeWidth="3" />
        
        {/* Centro */}
        <circle cx="50" cy="50" r="10" fill="#A16207" />
        <circle cx="50" cy="50" r="5" fill="#fff" />

        {/* Aspa 1 (0°) */}
        <g className="variador-aspa variador-aspa-1">
          <ellipse cx="50" cy="22" rx="8" ry="18" fill="#C45A1A" />
        </g>

        {/* Aspa 2 (90°) */}
        <g className="variador-aspa variador-aspa-2">
          <ellipse cx="50" cy="22" rx="8" ry="18" fill="#D97706" />
        </g>

        {/* Aspa 3 (180°) */}
        <g className="variador-aspa variador-aspa-3">
          <ellipse cx="50" cy="22" rx="8" ry="18" fill="#B45309" />
        </g>

        {/* Aspa 4 (270°) */}
        <g className="variador-aspa variador-aspa-4">
          <ellipse cx="50" cy="22" rx="8" ry="18" fill="#C45A1A" />
        </g>
      </svg>
    </div>
  );
}