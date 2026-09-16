import {
  Grid,
  Field,
  NumberField,
} from "../DetalleCampos";

type Props = {
  form: any;
  cambiar: (campo: string, valor: any) => void;
};

export default function ActividadEditor({
  form,
  cambiar,
}: Props) {
  return (
    <Grid>
      <Field
        label="Descripción"
        value={form.descripcion}
        onChange={(v) =>
          cambiar("descripcion", v)
        }
      />

      <Field
        label="Estado"
        value={form.estado}
        onChange={(v) =>
          cambiar("estado", v)
        }
      />

      <Field
        label="Prioridad"
        value={form.prioridad}
        onChange={(v) =>
          cambiar("prioridad", v)
        }
      />

      <NumberField
        label="Horas planificadas"
        value={form.horas_planificadas}
        onChange={(v) =>
          cambiar("horas_planificadas", v)
        }
      />

      <NumberField
        label="Horas ejecutadas"
        value={form.horas_ejecutadas}
        onChange={(v) =>
          cambiar("horas_ejecutadas", v)
        }
      />

      <NumberField
        label="Porcentaje"
        value={form.porcentaje}
        onChange={(v) =>
          cambiar("porcentaje", v)
        }
      />

      <Field
        label="Fecha inicio"
        type="datetime-local"
        value={form.fecha_inicio}
        onChange={(v) =>
          cambiar("fecha_inicio", v)
        }
      />

      <Field
        label="Fecha fin"
        type="datetime-local"
        value={form.fecha_fin}
        onChange={(v) =>
          cambiar("fecha_fin", v)
        }
      />
    </Grid>
  );
}