import React from "react";
import { Grid, Field } from "../DetalleCampos";
import JerarquiaForm from "./JerarquiaForm";

type Props = {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
};

export default function DatosForm({ form, setForm }: Props) {
  const cambiar = (campo: string, valor: any) => {
    setForm((prev: any) => ({
      ...prev,
      [campo]: valor,
    }));
  };

return (
  <>
    <JerarquiaForm
      form={form}
      setForm={setForm}
    />

    <div style={{ height: 16 }} />

    <Grid>

        <Field
          label="Usuario ID"
          value={form.usuario_id}
          onChange={(v) => cambiar("usuario_id", v)}
          type="number"
        />

        <Field
          label="Fecha reporte"
          value={form.fecha_reporte}
          onChange={(v) => cambiar("fecha_reporte", v)}
          type="date"
        />

        <Field
          label="Fase"
          value={form.fase}
          onChange={(v) => cambiar("fase", v)}
        />

        <Field
          label="Taller"
          value={form.taller}
          onChange={(v) => cambiar("taller", v)}
        />

        <Field
          label="Tipo criticidad"
          value={form.tipo_criticidad}
          onChange={(v) => cambiar("tipo_criticidad", v)}
        />

        <Field
          label="Sistema"
          value={form.sistema}
          onChange={(v) => cambiar("sistema", v)}
        />

        <Field
          label="Tipo intervención"
          value={form.tipo_intervencion}
          onChange={(v) => cambiar("tipo_intervencion", v)}
        />

        <Field
          label="Modo de falla"
          value={form.modo_falla}
          onChange={(v) => cambiar("modo_falla", v)}
        />

        <Field
          label="Prioridad"
          value={form.prioridad}
          onChange={(v) => cambiar("prioridad", v)}
        />

        <JerarquiaForm
          form={form}
          setForm={setForm}
        />
      </Grid>
    </>
  );
}