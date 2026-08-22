import { useState, useEffect } from 'react';
import { getIncidentes, getRequerimientos } from '../../../services/dashboardApi';

const CACHE_KEY = 'mina_incidentes_requerimientos';
const CACHE_TIME_KEY = 'mina_cache_timestamp';

export function useIncidentesCache() {
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [requerimientos, setRequerimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaCarga, setUltimaCarga] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // 1. Intentar cargar de caché PRIMERO
    const cache = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIME_KEY);

    if (cache) {
      try {
        const datos = JSON.parse(cache);
        setIncidentes(datos.incidentes || []);
        setRequerimientos(datos.requerimientos || []);
        if (timestamp) {
          setUltimaCarga(new Date(timestamp).toLocaleString('es-PE'));
        }
      } catch {
        // Caché corrupta, ignorar
      }
    }

    // 2. Decidir si refrescar
    const ahora = new Date();
    const hora = ahora.getHours();
    const esHoraDeRefrescar = (hora === 8 || hora === 20) && !esMismaHora(timestamp);

    // 3. Refrescar solo si es hora o no hay caché
    if (esHoraDeRefrescar || !cache) {
      await refrescarDatos();
    }

    // 4. SIEMPRE terminar el loading
    setLoading(false);
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
      // Si falla, mantener la caché existente
      console.log('No se pudo refrescar, usando caché');
    }
    setLoading(false);
  };

  const esMismaHora = (timestamp: string | null) => {
    if (!timestamp) return false;
    const ultima = new Date(timestamp);
    const ahora = new Date();
    return (
      ultima.getHours() === ahora.getHours() &&
      ultima.getDate() === ahora.getDate() &&
      ultima.getMonth() === ahora.getMonth() &&
      ultima.getFullYear() === ahora.getFullYear()
    );
  };

  return { incidentes, requerimientos, loading, ultimaCarga, refrescarDatos };
}