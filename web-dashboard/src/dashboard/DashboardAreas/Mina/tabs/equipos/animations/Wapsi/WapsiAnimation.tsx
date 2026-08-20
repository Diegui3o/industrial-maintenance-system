import './Wapsi.css';

export function WapsiAnimation({ size = 80 }: { size?: number }) {
  return (
    <div className="wapsi-anim" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Cuerpo del radio */}
        <rect x="20" y="30" width="60" height="50" rx="8" fill="none" stroke="#0D9488" strokeWidth="3" />
        
        {/* Antena */}
        <line x1="50" y1="30" x2="50" y2="12" stroke="#0D9488" strokeWidth="3" />
        <circle cx="50" cy="10" r="3" fill="#B93636" className="wapsi-luz" />
        
        {/* Pantalla */}
        <rect x="28" y="38" width="20" height="14" rx="2" fill="none" stroke="#0D9488" strokeWidth="2" />
        
        {/* Botones */}
        <circle cx="60" cy="42" r="4" fill="none" stroke="#0D9488" strokeWidth="2" />
        <circle cx="70" cy="42" r="4" fill="none" stroke="#0D9488" strokeWidth="2" />
        <circle cx="60" cy="55" r="4" fill="none" stroke="#0D9488" strokeWidth="2" />
        <circle cx="70" cy="55" r="4" fill="none" stroke="#0D9488" strokeWidth="2" />
        
        {/* Ondas de señal */}
        <path className="wapsi-onda wapsi-onda-1" d="M 75 25 Q 85 25 90 15" fill="none" stroke="#0D9488" strokeWidth="2" />
        <path className="wapsi-onda wapsi-onda-2" d="M 80 20 Q 95 20 100 5" fill="none" stroke="#14B8A6" strokeWidth="2" />
      </svg>
    </div>
  );
}