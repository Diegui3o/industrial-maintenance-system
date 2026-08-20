import { useEffect, useState } from 'react';
import { getEquipos } from '../../../../services/dashboardApi';
import { EquipoCard } from './EquipoCard';
import './equiposMina.css';

const CATEGORIAS = [
  {
    nombre: 'Ventiladores',
    coincide: ['VARIADOR', 'VENTILADOR', 'VENTILADOR PRINCIPAL', 'VENTILADOR AUXILIAR'],
    color: '#0D9488',
  },
  {
    nombre: 'Estaciones',
    coincide: ['ESTACION', 'RADIO', 'FIBRA OPTICA'],
    color: '#2563A0',
  },
  {
    nombre: 'Wapsi',
    coincide: ['WAPSI', 'RADIO GASES'],
    color: '#7C3AED',
  },
  {
    nombre: 'Geófonos',
    coincide: ['GEOFONO', 'SENSOR SÍSMICO', 'GEOFONOS'],
    color: '#C45A1A',
  },
];

export function EquiposTab() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEquiposMina();
  }, []);

  const loadEquiposMina = async () => {
    setLoading(true);
    try {
      const todos = await getEquipos();
      const mina = todos.filter((e: any) => e.area === 'MINA');
      setEquipos(mina);
    } catch {
      setEquipos([]);
    }
    setLoading(false);
  };

  if (loading) return <p>Cargando equipos de MINA...</p>;

  const equiposPorCategoria = CATEGORIAS.map(cat => ({
    ...cat,
    equipos: equipos.filter(eq => {
      const tipo = (eq.tipo || '').toUpperCase();
      return cat.coincide.includes(tipo);
    }),
  })).filter(cat => cat.equipos.length > 0);

  return (
    <div>
      {equiposPorCategoria.map(categoria => (
        <section key={categoria.nombre} className="equipos-seccion">
          <div className="seccion-header">
            <h3 className="seccion-titulo">{categoria.nombre}</h3>
            <span className="seccion-contador">{categoria.equipos.length} equipos</span>
          </div>
          <div className="equipos-grid">
            {categoria.equipos.map(equipo => (
              <EquipoCard key={equipo.id} equipo={equipo} categoria={categoria} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}