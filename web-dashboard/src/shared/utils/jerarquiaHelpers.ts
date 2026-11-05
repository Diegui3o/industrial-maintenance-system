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

// Acepta tags de las 2 formas (tag_descubiertos y pi_tags agregado)
export function etiquetaTag(tag: any): string {
  const candidatos = [
    tag?.tag_name,
    tag?.nombre,
    tag?.pi_point_name,
    tag?.element_name,
    tag?.tag_path,
    tag?.parametro,
  ];
  for (const c of candidatos) {
    if (c && String(c).trim()) return String(c).trim();
  }
  return `Tag #${tag?.id ?? '?'}`;
}

// Contexto adicional del tag (element_name + unidad) para el listado
export function contextoTag(tag: any): string {
  const partes: string[] = [];
  if (tag?.element_name && tag.element_name !== etiquetaTag(tag)) {
    partes.push(String(tag.element_name).trim());
  }
  if (tag?.unidad && tag.unidad !== 'N/A' && String(tag.unidad).trim()) {
    partes.push(String(tag.unidad).trim());
  }
  return partes.join(' · ');
}

// Validar tag usable
export function tagEsValido(tag: any): boolean {
  if (!tag) return false;
  if (tag.id == null) return false;
  const nombre = etiquetaTag(tag);
  if (!nombre || nombre.startsWith('Tag #')) return false;
  if (String(nombre).toUpperCase() === 'NULL') return false;
  return true;
}