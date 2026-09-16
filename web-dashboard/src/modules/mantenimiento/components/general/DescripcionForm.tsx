import React from "react";
import { Field, Grid } from "../DetalleCampos";

type Props = {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
};

export default function DescripcionForm({ form, setForm }: Props) {
  const cambiar = (campo: string, valor: any) => {
    setForm((prev: any) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  return (
    <Grid>
      <Field
        label="Causa"
        value={form.causa}
        onChange={(v) => cambiar("causa", v)}
      />

      <Field
        label="Acción realizada"
        value={form.accion_realizada}
        onChange={(v) => cambiar("accion_realizada", v)}
      />

      <Field
        label="Consecuencia"
        value={form.consecuencia}
        onChange={(v) => cambiar("consecuencia", v)}
      />

      <Field
        label="Consecuencia inmediata"
        value={form.consecuencia_inmediata}
        onChange={(v) => cambiar("consecuencia_inmediata", v)}
      />

      <Field
        label="Descripción del evento"
        value={form.descripcion_evento}
        onChange={(v) => cambiar("descripcion_evento", v)}
      />

      <Field
        label="Descripción técnica"
        value={form.descripcion_tecnica}
        onChange={(v) => cambiar("descripcion_tecnica", v)}
      />
    </Grid>
  );
}