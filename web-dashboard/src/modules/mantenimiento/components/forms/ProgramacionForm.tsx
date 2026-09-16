import {
  Grid,
  Field,
  NumberField,
} from "../DetalleCampos";

type Props = {
  form: any;
  cambiar: (campo: string, valor: any) => void;
};

export default function ProgramacionForm({
  form,
  cambiar,
}: Props) {
  return (
    <Grid>
      <Field
        label="Tipo programación"
        value={form.tipo_programacion}
        onChange={(v) =>
          cambiar(
            "tipo_programacion",
            v
          )
        }
      />

      <Field
        label="Fecha programada"
        type="date"
        value={form.fecha_programada}
        onChange={(v) =>
          cambiar(
            "fecha_programada",
            v
          )
        }
      />

      <Field
        label="Semana"
        value={form.semana}
        onChange={(v) =>
          cambiar("semana", v)
        }
      />

      <Field
        label="Código programa"
        value={form.codigo_programa}
        onChange={(v) =>
          cambiar(
            "codigo_programa",
            v
          )
        }
      />

      <Field
        label="OT"
        value={form.ot}
        onChange={(v) =>
          cambiar("ot", v)
        }
      />

      <Field
        label="Código SAP"
        value={form.codigo_sap}
        onChange={(v) =>
          cambiar("codigo_sap", v)
        }
      />

      <NumberField
        label="Horas planificadas"
        value={form.horas_planificadas}
        onChange={(v) =>
          cambiar(
            "horas_planificadas",
            v
          )
        }
      />

      <NumberField
        label="HH planificadas"
        value={form.hh_planificadas}
        onChange={(v) =>
          cambiar(
            "hh_planificadas",
            v
          )
        }
      />

      <Field
        label="Prioridad"
        value={form.prioridad}
        onChange={(v) =>
          cambiar("prioridad", v)
        }
      />

      <Field
        label="Instrucciones"
        value={form.instrucciones}
        onChange={(v) =>
          cambiar(
            "instrucciones",
            v
          )
        }
      />

      <Field
        label="Comentario"
        value={form.comentario}
        onChange={(v) =>
          cambiar(
            "comentario",
            v
          )
        }
      />
    </Grid>
  );
}