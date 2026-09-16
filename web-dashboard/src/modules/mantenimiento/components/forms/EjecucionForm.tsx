import {
  Grid,
  Field,
  NumberField,
  Check,
} from "../DetalleCampos";

type Props = {
  form: any;
  cambiar: (campo: string, valor: any) => void;
};

export default function EjecucionForm({
  form,
  cambiar,
}: Props) {
  return (
    <Grid>
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

      <NumberField
        label="Horas ejecutadas"
        value={form.horas_ejecutadas}
        onChange={(v) =>
          cambiar(
            "horas_ejecutadas",
            v
          )
        }
      />

      <NumberField
        label="HH ejecutadas"
        value={form.hh_ejecutadas}
        onChange={(v) =>
          cambiar(
            "hh_ejecutadas",
            v
          )
        }
      />

      <Field
        label="Supervisor"
        value={form.supervisor}
        onChange={(v) =>
          cambiar("supervisor", v)
        }
      />

      <Field
        label="PETAR"
        value={form.petar}
        onChange={(v) =>
          cambiar("petar", v)
        }
      />

      <Check
        label="Equipo detenido"
        checked={
          form.equipo_detiene ?? false
        }
        onChange={(v) =>
          cambiar(
            "equipo_detiene",
            v
          )
        }
      />

      <Field
        label="Descripción técnica"
        value={form.descripcion_tecnica}
        onChange={(v) =>
          cambiar(
            "descripcion_tecnica",
            v
          )
        }
      />

      <Field
        label="Desviaciones"
        value={form.desviaciones}
        onChange={(v) =>
          cambiar(
            "desviaciones",
            v
          )
        }
      />
    </Grid>
  );
}