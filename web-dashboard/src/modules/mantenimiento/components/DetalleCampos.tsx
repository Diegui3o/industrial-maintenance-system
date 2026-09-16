import type {
  ReactNode,
  CSSProperties,
} from "react";

export function Grid({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={styles.grid}>
      {children}
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: any;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (value: number) => void;
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <input
        type="number"
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            e.target.value === ""
              ? 0
              : Number(e.target.value)
          )
        }
      />
    </label>
  );
}

export function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label style={styles.check}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
      />

      {label}
    </label>
  );
}

const styles: Record<
  string,
  CSSProperties
> = {
  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 12,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    fontSize: 12,
    fontWeight: 600,
  },

  check: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 13,
  },
};