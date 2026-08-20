import { VariadorAnimation } from './animations/Variador/VariadorAnimation';
import { GeofonoAnimation } from './animations/Geofono/GeofonoAnimation';
import { EstacionAnimation } from './animations/Estacion/EstacionAnimation';
import { WapsiAnimation } from './animations/Wapsi/WapsiAnimation';

const ANIMACIONES: Record<string, any> = {
  'Ventiladores': VariadorAnimation,
  'Estaciones': EstacionAnimation,
  'Wapsi': WapsiAnimation,
  'Geófonos': GeofonoAnimation,
};

interface Props {
  equipo: any;
  categoria: any;
}

export function EquipoCard({ equipo, categoria }: Props) {
  const Animacion = ANIMACIONES[categoria.nombre] || VariadorAnimation;
  const estado = equipo.estado_equipo || 'inactivo';
  const esActivo = estado === 'activo';

  return (
    <div className={`equipo-card ${esActivo ? 'activo' : ''} estado-${estado}`}>
      <div className="equipo-animacion">
        <Animacion size={60} activo={esActivo} />
      </div>

      <div className="equipo-nombre">{equipo.nombre || equipo.codigo}</div>
      <div className="equipo-codigo">{equipo.codigo}</div>

      <div className="equipo-footer">
        <span className="equipo-tipo" style={{ color: categoria.color }}>
          {equipo.tipo || 'SIN TIPO'}
        </span>
        <span className={`equipo-estado-texto estado-texto-${estado}`}>
          {estado.toUpperCase()}
        </span>
      </div>

      {equipo.ip && <div className="equipo-ip">IP: {equipo.ip}</div>}
    </div>
  );
}