import './Estacion.css';

export function EstacionAnimation({ size = 80 }: { size?: number }) {
  return (
    <div className="estacion-anim" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Torre */}
        <line x1="50" y1="20" x2="50" y2="80" stroke="#2563A0" strokeWidth="4" />
        <line x1="35" y1="30" x2="65" y2="30" stroke="#2563A0" strokeWidth="2" />
        <line x1="30" y1="45" x2="70" y2="45" stroke="#2563A0" strokeWidth="2" />
        <line x1="25" y1="60" x2="75" y2="60" stroke="#2563A0" strokeWidth="2" />
        
        {/* Antena */}
        <line x1="50" y1="20" x2="50" y2="10" stroke="#2563A0" strokeWidth="2" />
        <circle cx="50" cy="10" r="3" fill="#B93636" className="estacion-luz" />
        
        {/* Ondas */}
        <path className="estacion-onda estacion-onda-1" d="M 25 15 Q 15 15 10 5" fill="none" stroke="#2563A0" strokeWidth="2" />
        <path className="estacion-onda estacion-onda-2" d="M 30 20 Q 15 20 5 10" fill="none" stroke="#3B82F6" strokeWidth="2" />
        <path className="estacion-onda estacion-onda-3" d="M 35 25 Q 15 25 0 15" fill="none" stroke="#2563A0" strokeWidth="2" />
      </svg>
    </div>
  );
}