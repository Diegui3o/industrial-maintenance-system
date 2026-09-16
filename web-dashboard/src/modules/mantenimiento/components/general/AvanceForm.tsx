import React from "react";
import { Grid, Field } from "../DetalleCampos";

type Props = {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
};

export default function AvanceForm({ form, setForm }: Props) {
  const cambiar = (campo: string, valor: any) => {
    setForm((prev: any) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  return (
    <Grid>
      <Field
        label="Estado de falla"
        value={form.estado_falla}
        onChange={(v) => cambiar("estado_falla", v)}
      />

      <Field
        label="Porcentaje de avance"
        value={form.porcentaje_avance}
        onChange={(v) => cambiar("porcentaje_avance", v)}
        type="number"
      />

      <Field
        label="Fecha inicio real"
        value={form.fecha_inicio_real}
        onChange={(v) => cambiar("fecha_inicio_real", v)}
        type="datetime-local"
      />

      <Field
        label="Fecha fin real"
        value={form.fecha_fin_real}
        onChange={(v) => cambiar("fecha_fin_real", v)}
        type="datetime-local"
      />

      <Field
        label="Tipo programación"
        value={form.tipo_programacion}
        onChange={(v) => cambiar("tipo_programacion", v)}
      />

      <Field
        label="Fecha programada"
        value={form.fecha_programada}
        onChange={(v) => cambiar("fecha_programada", v)}
        type="datetime-local"
      />
    </Grid>
  );
}