# Examples

Copy-ready code samples referenced from the SKILL.md and references/. Loaded on demand — don't preload.

| File | What it is | Referenced from |
|---|---|---|
| `AppSkeleton.tsx` | Shape A two-tab + hash-route App.tsx, ~120 lines (Shape B variant inlined) | `references/architecture.md` |
| `ThemeProvider.tsx` | Context + tokens + CSS-vars + localStorage persistence | `references/theme-system.md` |
| `ThemePanel.tsx` | FAB-style theme control surface | `references/theme-system.md` |
| `PropEditor.tsx` | Self-written PropEditor (~80 lines, no deps) | `references/components-conventions.md` |
| `ZustandStore.ts` | Story-tab Zustand store template with devtools | `references/state-management.md`, `references/story-conventions.md` |

## Usage

These are starter templates, not a vendored library. Copy into your project, rename, modify freely. They are designed to be **owned by your project**, not imported from this skill.

For draft / scene file shape templates, see the inline examples in:
- `references/components-conventions.md` § The draft file
- `references/architecture.md` § Registry pattern (for scene `Entry` shape)
