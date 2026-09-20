export function exportarTablaExcel(
  nombreArchivo: string,
  columnas: string[],
  filas: (string | number | null | undefined)[][]
) {
  const escapar = (valor: unknown) => {
    const texto = String(
      valor ?? ""
    );

    return `"${texto.replace(
      /"/g,
      '""'
    )}"`;
  };

  const contenido = [
    columnas.map(escapar).join(";"),
    ...filas.map((fila) =>
      fila.map(escapar).join(";")
    ),
  ].join("\r\n");

  const blob = new Blob(
    [
      "\uFEFF" + contenido,
    ],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const enlace =
    document.createElement("a");

  enlace.href = url;

  enlace.download =
    `${nombreArchivo}.csv`;

  document.body.appendChild(
    enlace
  );

  enlace.click();

  document.body.removeChild(
    enlace
  );

  URL.revokeObjectURL(url);
}