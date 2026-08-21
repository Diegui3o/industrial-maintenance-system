import { useIncidentesCache } from './useIncidentesCache';

export type FiltroFecha = 'hoy' | '7dias' | '30dias' | 'mes' | 'todo';

export function useGraficasData(filtro: FiltroFecha) {
  const { incidentes, requerimientos, loading } = useIncidentesCache();

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