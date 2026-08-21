import { useState, useEffect } from 'react';
import { getIncidentes, getRequerimientos } from '../../../services/dashboardApi';

const CACHE_KEY = 'mina_incidentes_requerimientos';
const CACHE_TIME_KEY = 'mina_cache_timestamp';

export function useIncidentesCache() {
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [requerimientos, setRequerimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaCarga, setUltimaCarga] = useState<string>('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    const ahora = new Date();
    const hora = ahora.getHours();

    // Verificar si hay caché guardada
    const cache = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIME_KEY);

    // Si hay caché, usarla primero
    if (cache && timestamp) {
      const datos = JSON.parse(cache);
      setIncidentes(datos.incidentes || []);
      setRequerimientos(datos.requerimientos || []);
      setUltimaCarga(new Date(timestamp).toLocaleString('es-PE'));
      setLoading(false);
    }

    // Determinar si toca refrescar (8 AM o 8 PM)
    const esHoraDeRefrescar = (hora === 8 || hora === 20) && !esMismaHora(timestamp);

    if (esHoraDeRefrescar) {
      await refrescarDatos();
    }
  };

  const refrescarDatos = async () => {
    try {
      const [incs, reqs] = await Promise.all([
        getIncidentes(),
        getRequerimientos(),
      ]);

      const datos = { incidentes: incs, requerimientos: reqs };
      localStorage.setItem(CACHE_KEY, JSON.stringify(datos));
      localStorage.setItem(CACHE_TIME_KEY, new Date().toISOString());

      setIncidentes(incs);
      setRequerimientos(reqs);
      setUltimaCarga(new Date().toLocaleString('es-PE'));
    } catch {
      // Si falla, usar caché existente o vacío
      console.log('No se pudo refrescar, usando caché');
    }
    setLoading(false);
  };

  const esMismaHora = (timestamp: string | null) => {
    if (!timestamp) return false;
    const ultima = new Date(timestamp);
    const ahora = new Date();
    return ultima.getHours() === ahora.getHours() &&
           ultima.getDate() === ahora.getDate();
  };

  return { incidentes, requerimientos, loading, ultimaCarga, refrescarDatos };
}