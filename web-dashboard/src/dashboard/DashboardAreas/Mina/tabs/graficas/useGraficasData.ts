import { useState, useEffect } from 'react';
import { getIncidentes, getRequerimientos } from '../../../../../dashboard/services/dashboardApi';

export type FiltroFecha = 'hoy' | '7dias' | '30dias' | 'mes' | 'todo';

export function useGraficasData(filtro: FiltroFecha) {
  const [incidentes, setIncidentes] = useState<any[]>([]);
  const [requerimientos, setRequerimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incs, reqs] = await Promise.all([
        getIncidentes(),
        getRequerimientos(),
      ]);
      setIncidentes(incs);
      setRequerimientos(reqs);
    } catch {
      setIncidentes([]);
      setRequerimientos([]);
    }
    setLoading(false);
  };

  const filtrarPorFecha = (data: any[]) => {
    const now = new Date();
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return data.filter(item => {
      const fecha = new Date(item.fecha).getTime();
      switch (filtro) {
        case 'hoy':
          return fecha >= hoy;
        case '7dias':
          return fecha >= hoy - 7 * 24 * 60 * 60 * 1000;
        case '30dias':
          return fecha >= hoy - 30 * 24 * 60 * 60 * 1000;
        case 'mes':
          return new Date(fecha).getMonth() === now.getMonth() && new Date(fecha).getFullYear() === now.getFullYear();
        case 'todo':
          return true;
        default:
          return true;
      }
    });
  };

  return {
    incidentes: filtrarPorFecha(incidentes),
    requerimientos: filtrarPorFecha(requerimientos),
    loading,
  };
}