import { useQuery } from '@tanstack/react-query';
import { getEquipos, getAlarmas } from '../../../services/api';

export function useDashboardData() {
  const equiposQ = useQuery({ queryKey: ['equipos'], queryFn: getEquipos, refetchInterval: 30000 });
  const alarmasQ = useQuery({ queryKey: ['alarmas', 'activas'], queryFn: () => getAlarmas({ estado: 'activa' }), refetchInterval: 15000 });

  const equipos = equiposQ.data || [];
  const alarmas = alarmasQ.data || [];

  const total = equipos.length;
  const activos = equipos.filter((e: any) => e.estado_equipo === 'activo').length;
  const mantenimiento = equipos.filter((e: any) => e.estado_equipo === 'mantenimiento').length;
  const fallo = equipos.filter((e: any) => e.estado_equipo === 'fallo').length;
  const inactivos = equipos.filter((e: any) => e.estado_equipo === 'inactivo').length;
  const criticas = alarmas.filter((a: any) => a.severidad === 'critica').length;

  return {
    isLoading: equiposQ.isLoading || alarmasQ.isLoading,
    isError: equiposQ.isError || alarmasQ.isError,
    stats: { total, activos, mantenimiento, fallo, inactivos, alarmas: alarmas.length, criticas },
    equipos,
    alarmas,
  };
}