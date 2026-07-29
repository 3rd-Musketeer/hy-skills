// Reference implementation of a ThemePanel — the FAB-style control surface
// for switching theme axes. See references/theme-system.md for the rationale.
//
// Two states:
//   - Collapsed: a small floating action button (FAB) at bottom-right.
//   - Expanded: a panel listing each theme axis as a row of chips.
//
// Default is collapsed. The FAB respects the current stamp color so the
// user gets a visual hint of the active theme.

import { useEffect, useState } from "react";
import { tokens, useTheme } from "./ThemeProvider";
import type { ThemeState } from "./ThemeProvider";

export function ThemePanel() {
  const { theme, set, reset } = useTheme();
  const [open, setOpen] = useState(false);

  // Esc closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open theme panel"
        onClick={() => setOpen(true)}
        style={fabStyle}
      >
        ⚙
      </button>
    );
  }

  return (
    <div role="dialog" aria-label="Theme" style={panelStyle}>
      <header style={headerStyle}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>Theme</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={closeBtnStyle}
        >
          ×
        </button>
      </header>

      <Row label="Surface">
        {Object.keys(tokens.surfaces).map((k) => (
          <Chip
            key={k}
            active={theme.surface === k}
            onClick={() => set("surface", k as ThemeState["surface"])}
          >
            {k}
          </Chip>
        ))}
      </Row>

      <Row label="Stamp">
        {Object.entries(tokens.stamps).map(([k, v]) => (
          <Chip
            key={k}
            active={theme.stamp === k}
            onClick={() => set("stamp", k as ThemeState["stamp"])}
            swatch={v.base}
          >
            {k}
          </Chip>
        ))}
      </Row>

      <Row label="Lang">
        {(["en", "cn"] as const).map((k) => (
          <Chip
            key={k}
            active={theme.lang === k}
            onClick={() => set("lang", k)}
          >
            {k.toUpperCase()}
          </Chip>
        ))}
      </Row>

      <footer style={footerStyle}>
        <button type="button" onClick={reset} style={resetBtnStyle}>
          Reset to defaults
        </button>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal pieces
// ---------------------------------------------------------------------------

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={rowStyle}>
      <span style={rowLabelStyle}>{label}</span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  swatch,
  children,
}: {
  active: boolean;
  onClick: () => void;
  swatch?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        ...chipStyle,
        borderColor: active ? "var(--stamp, #ff9500)" : "rgba(0,0,0,0.12)",
        color: active ? "#1a1a1a" : "#5a5a5a",
      }}
    >
      {swatch && (
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: swatch,
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        />
      )}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Styles (inline for the example; use CSS in real code)
// ---------------------------------------------------------------------------

const fabStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 20,
  width: 44,
  height: 44,
  borderRadius: "50%",
  border: 0,
  background: "var(--stamp, #ff9500)",
  color: "white",
  fontSize: 18,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
  zIndex: 100,
};

const panelStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 20,
  right: 20,
  width: 280,
  background: "var(--surface, #fdfcf8)",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 12px 36px rgba(0,0,0,0.14)",
  zIndex: 100,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: 12,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const closeBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: 0,
  fontSize: 18,
  cursor: "pointer",
  color: "#888",
  padding: 0,
  width: 24,
  height: 24,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const rowLabelStyle: React.CSSProperties = {
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#9a9a9a",
};

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  height: 26,
  padding: "0 10px",
  borderRadius: 6,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "transparent",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
};

const footerStyle: React.CSSProperties = {
  borderTop: "1px solid rgba(0,0,0,0.06)",
  paddingTop: 10,
  display: "flex",
  justifyContent: "flex-end",
};

const resetBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: 0,
  color: "#9a9a9a",
  fontSize: 11,
  cursor: "pointer",
  padding: 0,
};
