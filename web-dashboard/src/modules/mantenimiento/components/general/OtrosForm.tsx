import React from "react";
import { Grid, Field } from "../DetalleCampos";

type Props = {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
};

export default function OtrosForm({ form, setForm }: Props) {
  const cambiar = (campo: string, valor: any) => {
    setForm((prev: any) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  return (
    <Grid>
      <Field
        label="Horas planificadas"
        value={form.horas_planificadas}
        onChange={(v) => cambiar("horas_planificadas", v)}
        type="number"
      />

      <Field
        label="HH planificadas"
        value={form.hh_planificadas}
        onChange={(v) => cambiar("hh_planificadas", v)}
        type="number"
      />

      <Field
        label="Horas ejecutadas"
        value={form.horas_ejecutadas}
        onChange={(v) => cambiar("horas_ejecutadas", v)}
        type="number"
      />

      <Field
        label="HH ejecutadas"
        value={form.hh_ejecutadas}
        onChange={(v) => cambiar("hh_ejecutadas", v)}
        type="number"
      />
    </Grid>
  );
}