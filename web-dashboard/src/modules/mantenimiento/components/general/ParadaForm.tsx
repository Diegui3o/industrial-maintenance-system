import React from "react";
import { Grid, Field, Check } from "../DetalleCampos";

type Props = {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
};

export default function ParadaForm({ form, setForm }: Props) {
  const cambiar = (campo: string, valor: any) => {
    setForm((prev: any) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  return (
    <>
      <Grid>
        <Field
          label="Inicio parada"
          value={form.inicio_parada}
          onChange={(v) => cambiar("inicio_parada", v)}
          type="datetime-local"
        />

        <Field
          label="Fin parada"
          value={form.fin_parada}
          onChange={(v) => cambiar("fin_parada", v)}
          type="datetime-local"
        />

        <Field
          label="Horas"
          value={form.horas}
          onChange={(v) => cambiar("horas", v)}
          type="number"
        />

        <Field
          label="TN dejadas de procesar"
          value={form.tn_dejadas_procesar}
          onChange={(v) => cambiar("tn_dejadas_procesar", v)}
          type="number"
        />

        <Field
          label="Enlace"
          value={form.enlace}
          onChange={(v) => cambiar("enlace", v)}
        />
      </Grid>

      <div style={checkRow}>
        <Check
          label="Stand by"
          checked={!!form.stand_by}
          onChange={(v) => cambiar("stand_by", v)}
        />

        <Check
          label="Producción afectada"
          checked={!!form.produccion_afectada}
          onChange={(v) => cambiar("produccion_afectada", v)}
        />
      </div>
    </>
  );
}

const checkRow: React.CSSProperties = {
  display: "flex",
  gap: 24,
  marginTop: 16,
  flexWrap: "wrap",
};