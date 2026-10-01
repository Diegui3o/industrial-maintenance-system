import type {
  ColumnaFiltro,
} from '../types/maestroGeneralTypes';

import type { MaestroGeneralItem } from '../../../services/plantaMasterGeneralApi';

export function normalizarTexto(
  valor: unknown,
): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function textoMostrar(
  valor: unknown,
): string {
  const texto = String(
    valor ?? '',
  ).trim();

  return texto || '—';
}

export function obtenerTextoEquipo(
  item: MaestroGeneralItem,
): string {
  return [
    item.equipo_codigo,
    item.equipo_nombre,
  ]
    .filter(Boolean)
    .join(' ');
}

export function obtenerTextoComponente(
  item: MaestroGeneralItem,
): string {
  return [
    item.componente_codigo,
    item.componente_tag,
    item.componente_nombre,
  ]
    .filter(Boolean)
    .join(' ');
}

export function obtenerValorColumna(
  item: MaestroGeneralItem,
  columna: ColumnaFiltro,
): string {
  switch (columna) {
    case 'fase':
      return item.fase ?? '';

    case 'proceso':
      return item.proceso ?? '';

    case 'subproceso':
      return item.subproceso ?? '';

    case 'equipo':
      return obtenerTextoEquipo(item);

    case 'componente':
      return obtenerTextoComponente(item);

    case 'repuesto':
      return item.repuesto_nombre ?? '';

    default:
      return '';
  }
}

export function obtenerValoresUnicos(
  datos: MaestroGeneralItem[],
  columna: ColumnaFiltro,
): string[] {
  return [
    ...new Set(
      datos
        .map((item) =>
          obtenerValorColumna(
            item,
            columna,
          ),
        )
        .filter(Boolean),
    ),
  ].sort((a, b) =>
    normalizarTexto(a).localeCompare(
      normalizarTexto(b),
      'es',
      {
        numeric: true,
        sensitivity: 'base',
      },
    ),
  );
}