// Shape A · two-tab shell. For Shape B (single Workbench view), see the
// commented variant at the bottom of this file.
//
// Folder convention (see references/code-structure.md):
//   views/VariantGallery.tsx → exports `entries` for Components tab
//   views/scenes/registry.ts → exports `entries` for Prototype tab

import { Suspense, useEffect, useState } from "react";
import { entries as componentsEntries } from "./views/VariantGallery";
import { entries as prototypeEntries } from "./views/scenes/registry";

type Tab = "components" | "prototype";
type Route = { tab: Tab; idx: number };

function listFor(tab: Tab) {
  return tab === "components" ? componentsEntries : prototypeEntries;
}

function parseHash(): Route {
  const m = /^#(components|prototype)(?:\/([\w-]+))?$/.exec(window.location.hash);
  if (!m) return { tab: "prototype", idx: 0 };
  const tab = m[1] as Tab;
  const slug = m[2];
  const list = listFor(tab);
  const idx = slug ? Math.max(0, list.findIndex((e) => e.slug === slug)) : 0;
  return { tab, idx };
}

function routeToHash(r: Route): string {
  const list = listFor(r.tab);
  if (list.length === 0) return `#${r.tab}`;
  const entry = list[Math.min(r.idx, list.length - 1)];
  return `#${r.tab}/${entry.slug}`;
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    window.history.replaceState(null, "", routeToHash(route));
  }, [route]);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) return;
      const list = listFor(route.tab);
      if (list.length === 0) return;
      if (e.key === "ArrowRight") setRoute({ ...route, idx: Math.min(list.length - 1, route.idx + 1) });
      if (e.key === "ArrowLeft") setRoute({ ...route, idx: Math.max(0, route.idx - 1) });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [route]);

  const list = listFor(route.tab);
  const safeIdx = list.length === 0 ? -1 : Math.min(route.idx, list.length - 1);
  const Cmp = safeIdx >= 0 ? list[safeIdx].Component : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header style={{ display: "flex", gap: 8, padding: "10px 16px", borderBottom: "1px solid #ddd" }}>
        <TabBtn active={route.tab === "components"} onClick={() => setRoute({ tab: "components", idx: 0 })}>
          Components
        </TabBtn>
        <TabBtn active={route.tab === "prototype"} onClick={() => setRoute({ tab: "prototype", idx: 0 })}>
          Prototype
        </TabBtn>
      </header>
      <nav style={{ display: "flex", gap: 4, padding: "8px 16px", borderBottom: "1px solid #eee", overflowX: "auto" }}>
        {list.map((e, i) => (
          <button
            key={e.slug}
            onClick={() => setRoute({ ...route, idx: i })}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid transparent",
              background: i === safeIdx ? "#0066ff" : "transparent",
              color: i === safeIdx ? "#fff" : "#333",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {e.title}
          </button>
        ))}
      </nav>
      <main style={{ flex: 1, overflow: "auto" }}>
        {Cmp ? (
          <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
            <Cmp />
          </Suspense>
        ) : (
          <div style={{ padding: 20, color: "#666", fontSize: 13 }}>
            No entries for {route.tab} yet. Add one and refresh.
          </div>
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 12px",
        borderRadius: 7,
        border: "1px solid transparent",
        background: active ? "#0066ff" : "transparent",
        color: active ? "#fff" : "#666",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Shape B variant — single workbench, no tabs. ~30 lines.
// ---------------------------------------------------------------------------
//
// import { ThemeProvider } from "./theme/ThemeProvider";
// import { ThemePanel } from "./theme/ThemePanel";
// import { Workbench } from "./views/Workbench";
//
// export default function App() {
//   return (
//     <ThemeProvider>
//       <Workbench />
//       <ThemePanel />
//     </ThemeProvider>
//   );
// }
