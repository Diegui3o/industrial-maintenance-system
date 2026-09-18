type Trabajo = {
  id: number;
  fecha: string;
  programado: boolean;
};

type Props = {
  semana: Date;
  trabajos: Trabajo[];
  diaSeleccionado: number;
  onSeleccionar: (dia: number) => void;
};

export default function SemanaDias({
  semana,
  trabajos,
  diaSeleccionado,
  onSeleccionar,
}: Props) {
  const dias = Array.from({ length: 7 }, (_, index) => {
    const fecha = new Date(semana);
    fecha.setDate(fecha.getDate() + index);

    const trabajosDia = trabajos.filter((trabajo) => {
      const fechaTrabajo = new Date(
        `${trabajo.fecha}T00:00:00`
      );

      return (
        fechaTrabajo.getFullYear() === fecha.getFullYear() &&
        fechaTrabajo.getMonth() === fecha.getMonth() &&
        fechaTrabajo.getDate() === fecha.getDate()
      );
    });

    return {
      fecha,
      programados: trabajosDia.filter(
        (trabajo) => trabajo.programado
      ).length,
      noProgramados: trabajosDia.filter(
        (trabajo) => !trabajo.programado
      ).length,
    };
  });

  return (
    <div className="prog-days">
      {dias.map((dia, index) => {
        const nombre = dia.fecha
          .toLocaleDateString("es-PE", {
            weekday: "short",
          })
          .replace(".", "")
          .toUpperCase();

        return (
          <button
            key={dia.fecha.toISOString()}
            type="button"
            className={`prog-day ${
              index === diaSeleccionado
                ? "prog-day--actual"
                : ""
            }`}
            onClick={() => onSeleccionar(index)}
          >
            <span>{nombre}</span>

            <strong>
              {dia.fecha.getDate()}
            </strong>

            <small>
              {dia.programados} programado
              {dia.programados === 1 ? "" : "s"}
            </small>

            {dia.noProgramados > 0 && (
              <small className="prog-day-unplanned">
                +{dia.noProgramados} no programado
                {dia.noProgramados === 1 ? "" : "s"}
              </small>
            )}

            {index === diaSeleccionado && (
              <span className="prog-day-current">
                DÍA SELECCIONADO
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}