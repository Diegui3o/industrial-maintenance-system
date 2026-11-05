// src/shared/utils/jerarquiaHelpers.ts

export const norm = (s: any): string =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

export const idNum = (item: any): number => Number(item?.id ?? 0);

export const nombreDe = (item: any): string =>
  item?.nombre ?? item?.descripcion ?? item?.codigo ?? '';

export const codigoDe = (item: any): string =>
  item?.codigo ?? item?.codigo_sap ?? '';

export function etiquetaEquipo(eq: any): string {
  const cod = codigoDe(eq);
  return cod ? `[${cod}] ${nombreDe(eq)}` : nombreDe(eq);
}

export function etiquetaComponente(c: any): string {
  const cod = codigoDe(c);
  const tipo = c?.tipo_componente ? ` — ${c.tipo_componente}` : '';
  return `${cod ? `[${cod}] ` : ''}${nombreDe(c)}${tipo}`;
}

export function etiquetaRepuesto(r: any): string {
  const cod = codigoDe(r);
  const stock = typeof r?.stock_actual === 'number' ? ` (stock: ${r.stock_actual})` : '';
  return `${cod ? `[${cod}] ` : ''}${nombreDe(r)}${stock}`;
}

export function etiquetaTag(tag: any): string {
  return tag?.tag_name ?? tag?.nombre ?? tag?.tag_path ?? '(sin nombre)';
}