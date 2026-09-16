import {
  Grid,
  Field,
  NumberField,
} from "../DetalleCampos";

type Props = {
  form: any;
  cambiar: (campo: string, valor: any) => void;
};

export default function PersonalEditor({
  form,
  cambiar,
}: Props) {
  return (
    <Grid>
      <Field
        label="Nombre"
        value={form.nombre}
        onChange={(v) =>
          cambiar("nombre", v)
        }
      />

      <Field
        label="Cargo"
        value={form.cargo}
        onChange={(v) =>
          cambiar("cargo", v)
        }
      />

      <Field
        label="Turno"
        value={form.turno}
        onChange={(v) =>
          cambiar("turno", v)
        }
      />

      <NumberField
        label="Horas"
        value={form.horas}
        onChange={(v) =>
          cambiar("horas", v)
        }
      />

      <NumberField
        label="HH"
        value={form.hh}
        onChange={(v) =>
          cambiar("hh", v)
        }
      />

      <Field
        label="Fecha"
        type="date"
        value={form.fecha}
        onChange={(v) =>
          cambiar("fecha", v)
        }
      />
    </Grid>
  );
}
