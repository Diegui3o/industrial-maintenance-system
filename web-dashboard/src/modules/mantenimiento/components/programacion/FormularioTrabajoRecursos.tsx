import "./programar.css";

type Props = {
  actividad: string;
  setActividad: (val: string) => void;
  ot: string;
  setOt: (val: string) => void;
  comentario: string;
  setComentario: (val: string) => void;
  numeroPersonal: string;
  setNumeroPersonal: (val: string) => void;
  horas: string;
  setHoras: (val: string) => void;
  hh: number;
  responsable: string;
  setResponsable: (val: string) => void;
  turno: string;
  setTurno: (val: string) => void;
};

export default function FormularioTrabajoRecursos({
  actividad,
  setActividad,
  ot,
  setOt,
  comentario,
  setComentario,
  numeroPersonal,
  setNumeroPersonal,
  horas,
  setHoras,
  hh,
  responsable,
  setResponsable,
  turno,
  setTurno,
}: Props) {
  return (
    <>
      {/* TRABAJO */}
      <section className="prog-section">
        <div className="prog-section-title">Trabajo</div>

        <div className="prog-grid prog-grid--two">
          <label>
            Actividad *
            <input
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
              placeholder="¿Qué trabajo se realizará?"
            />
          </label>

          <label>
            OT
            <input
              value={ot}
              onChange={(e) => setOt(e.target.value)}
              placeholder="Número de OT"
            />
          </label>
        </div>

        <label>
          Comentario / justificación
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Detalle, alcance o justificación del trabajo..."
            rows={3}
          />
        </label>
      </section>

      {/* RECURSOS */}
      <section className="prog-section">
        <div className="prog-section-title">Recursos</div>

        <div className="prog-grid">
          <label>
            N° personal
            <input
              type="number"
              min="1"
              value={numeroPersonal}
              onChange={(e) => setNumeroPersonal(e.target.value)}
            />
          </label>

          <label>
            Total horas mantto.
            <input
              type="number"
              min="0"
              step="0.5"
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
            />
          </label>

          <label>
            H-H
            <input
              value={hh ? hh.toFixed(2) : ""}
              readOnly
              className="prog-calculated"
            />
          </label>

          <label>
            Responsable
            <input
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
            />
          </label>

          <label>
            Turno
            <select value={turno} onChange={(e) => setTurno(e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="dia">Día</option>
              <option value="noche">Noche</option>
            </select>
          </label>
        </div>
      </section>
    </>
  );
}