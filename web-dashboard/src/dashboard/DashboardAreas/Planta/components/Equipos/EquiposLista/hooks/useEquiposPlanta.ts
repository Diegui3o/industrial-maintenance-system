import { useEffect, useState, useMemo } from 'react';
import { getEquipos, type Equipo } from '../../../../services/equiposApi';
import { getEquipoPlantaDetalle, type EquipoPlantaDetalle } from '../../../../services/plantaEquiposApi';
import type { FilaEquipo } from '../types';

function texto(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }
  return String(valor);
}

export function useEquiposPlanta() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [detalles, setDetalles] = useState<EquipoPlantaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setLoading(true);
        setError('');

        const lista = await getEquipos();
        if (!activo) return;

        const listaPlanta = lista.filter(
          (equipo) => String(equipo.area ?? '').trim().toUpperCase() === 'PLANTA'
        );

        setEquipos(listaPlanta);

        const resultados = await Promise.all(
          listaPlanta.map(async (equipo) => {
            try {
              return await getEquipoPlantaDetalle(equipo.id);
            } catch {
              return null;
            }
          })
        );

        if (!activo) return;

        setDetalles(
          resultados.filter((detalle): detalle is EquipoPlantaDetalle => detalle !== null)
        );
      } catch (err) {
        if (activo) {
          setError(err instanceof Error ? err.message : 'Error cargando equipos');
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const filas = useMemo(() => {
    const resultado: FilaEquipo[] = [];

    equipos.forEach((equipo) => {
      const detalle = detalles.find((item) => item.equipo.id === equipo.id);
      const componentesOriginales = detalle?.componentes ?? [];

      const componentes = componentesOriginales.filter(
        (c) => c?.nombre !== null && c?.nombre !== undefined && String(c.nombre).trim() !== ""
      );

      if (componentes.length === 0) {
        resultado.push({
          equipoId: equipo.id,
          codigo: texto(equipo.codigo),
          nombre: texto(equipo.nombre),
          area: texto(equipo.area),
          componente: "-",
          estado: texto(equipo.estado_equipo),
        });
        return;
      }

      componentes.forEach((componente) => {
        resultado.push({
          equipoId: equipo.id,
          codigo: texto(equipo.codigo),
          nombre: texto(equipo.nombre),
          area: texto(equipo.area),
          componente: texto(componente.nombre),
          estado: texto(equipo.estado_equipo),
        });
      });
    });

    return resultado;
  }, [equipos, detalles]);

  return { equipos, filas, loading, error, setEquipos };
}