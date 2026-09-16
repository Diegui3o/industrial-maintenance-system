export function formatearClave(
  clave: string
) {
  return clave
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letra) =>
      letra.toUpperCase()
    );
}

export function formatearValor(
  valor: any
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "—";
  }

  if (typeof valor === "boolean") {
    return valor ? "Sí" : "No";
  }

  return String(valor);
}