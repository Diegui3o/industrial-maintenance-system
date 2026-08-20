import './Geofono.css';

export function GeofonoAnimation({ size = 80 }: { size?: number }) {
  return (
    <div className="geofono-anim" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="#7C3AED" strokeWidth="3" />
        
        {/* Ondas sísmicas */}
        <path className="geofono-onda geofono-onda-1" d="M 15 50 Q 25 50 35 50" fill="none" stroke="#7C3AED" strokeWidth="2" />
        <path className="geofono-onda geofono-onda-2" d="M 15 50 Q 25 30 35 50 Q 45 70 55 50" fill="none" stroke="#9F67FF" strokeWidth="2" />
        <path className="geofono-onda geofono-onda-3" d="M 15 50 Q 25 20 35 50 Q 45 80 55 50 Q 65 20 75 50" fill="none" stroke="#7C3AED" strokeWidth="2" />
        
        <circle cx="50" cy="50" r="6" fill="#7C3AED" />
        <circle className="geofono-pulso" cx="50" cy="50" r="6" fill="none" stroke="#7C3AED" strokeWidth="2" />
      </svg>
    </div>
  );
}