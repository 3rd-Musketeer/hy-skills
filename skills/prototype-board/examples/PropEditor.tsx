import { type ReactNode } from "react";

export type FieldSchema =
  | { kind: "bool" }
  | { kind: "select"; options: { label: string; value: string }[] }
  | { kind: "number"; min: number; max: number; step?: number }
  | { kind: "text" };

export type Schema<T> = { [K in keyof T]: FieldSchema };

export function PropEditor<T extends Record<string, unknown>>({
  schema,
  value,
  onChange,
}: {
  schema: Schema<T>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: "6px 12px",
        padding: 12,
        background: "rgba(0,0,0,0.04)",
        borderRadius: 8,
        fontSize: 12,
        marginBottom: 12,
      }}
    >
      {Object.entries(schema).map(([key, field]) => (
        <Row key={key} label={key}>
          <Field
            field={field as FieldSchema}
            value={value[key as keyof T]}
            onChange={(v) => onChange({ ...value, [key]: v })}
          />
        </Row>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <label style={{ color: "#666", textAlign: "right", lineHeight: "24px" }}>{label}</label>
      <div>{children}</div>
    </>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.kind === "bool") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }
  if (field.kind === "select") {
    return (
      <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.kind === "number") {
    return (
      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        value={Number(value ?? 0)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }
  return (
    <input
      type="text"
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%" }}
    />
  );
}
