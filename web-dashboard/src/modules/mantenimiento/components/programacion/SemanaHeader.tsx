type Props = {
  semana: Date;
  onAnterior: () => void;
  onSiguiente: () => void;
  onHoy: () => void;
};

export default function SemanaHeader({
  semana,
  onAnterior,
  onSiguiente,
  onHoy,
}: Props) {
  const fin = new Date(semana);
  fin.setDate(fin.getDate() + 6);

  const formato = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="prog-header">
      <div>
        <span className="prog-label">
          PLANIFICACIÓN
        </span>

        <h2>Semana de mantenimiento</h2>

        <span className="prog-range">
          {formato.format(semana)} — {formato.format(fin)}
        </span>
      </div>

      <div className="prog-nav">
        <button
          type="button"
          onClick={onAnterior}
          title="Semana anterior"
        >
          ←
        </button>

        <button
          type="button"
          onClick={onHoy}
        >
          Hoy
        </button>

        <button
          type="button"
          onClick={onSiguiente}
          title="Semana siguiente"
        >
          →
        </button>
      </div>
    </div>
  );
}