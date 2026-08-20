import { useQuery } from '@tanstack/react-query'
import { getEquipos, getAlarmas } from '../../shared/services/api'

export function useDashboardData() {
  const equiposQ = useQuery({
    queryKey: ['equipos'],
    queryFn: getEquipos,
    refetchInterval: 15000,
  })

  const alarmasQ = useQuery({
    queryKey: ['alarmas', 'activas'],
    queryFn: () => getAlarmas({ estado: 'activa' }),
    refetchInterval: 10000,
  })

  const equipos = equiposQ.data || []
  const alarmas = alarmasQ.data || []

  // =========================
  // ESTADO GENERAL
  // =========================

  const total = equipos.length

  const activos = equipos.filter(
    (e: any) => e.estado_equipo === 'activo'
  ).length

  const mantenimiento = equipos.filter(
    (e: any) => e.estado_equipo === 'mantenimiento'
  ).length

  const fallo = equipos.filter(
    (e: any) => e.estado_equipo === 'fallo'
  ).length

  const inactivos = equipos.filter(
    (e: any) => e.estado_equipo === 'inactivo'
  ).length

  const criticas = alarmas.filter(
    (a: any) => a.severidad === 'critica'
  ).length

  // =========================
  // ÁREAS
  // =========================

  const mina = equipos.filter(
    (e: any) => (e.area || '').toUpperCase() === 'MINA'
  )

  const planta = equipos.filter(
    (e: any) => (e.area || '').toUpperCase() === 'PLANTA'
  )

  // Todo lo que todavía no está clasificado como MINA o PLANTA
  const infraestructura = equipos.filter((e: any) => {
    const area = (e.area || '').toUpperCase()
    return area !== 'MINA' && area !== 'PLANTA'
  })

  // =========================
  // ESTADO POR ÁREA
  // =========================

  const calcularEstadoArea = (lista: any[]) => {
    const totalArea = lista.length

    const activosArea = lista.filter(
      e => e.estado_equipo === 'activo'
    ).length

    const fallosArea = lista.filter(
      e => e.estado_equipo === 'fallo'
    ).length

    const mantenimientoArea = lista.filter(
      e => e.estado_equipo === 'mantenimiento'
    ).length

    let estado: 'normal' | 'atencion' | 'critico' = 'normal'

    if (fallosArea > 0) {
      estado = 'critico'
    } else if (mantenimientoArea > 0) {
      estado = 'atencion'
    }

    return {
      total: totalArea,
      activos: activosArea,
      fallos: fallosArea,
      mantenimiento: mantenimientoArea,
      estado,
    }
  }

  return {
    isLoading: equiposQ.isLoading || alarmasQ.isLoading,

    isError: equiposQ.isError || alarmasQ.isError,

    stats: {
      total,
      activos,
      mantenimiento,
      fallo,
      inactivos,
      alarmas: alarmas.length,
      criticas,
    },

    areas: {
      mina: calcularEstadoArea(mina),
      planta: calcularEstadoArea(planta),
      infraestructura: calcularEstadoArea(infraestructura),
    },

    equipos,

    alarmas,

    mina,

    planta,

    infraestructura,
  }
}