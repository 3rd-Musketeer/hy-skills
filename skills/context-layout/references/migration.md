# Move, rename, archive

One procedure at any scale: tidying a messy directory, moving a batch of files, closing a line of work. Each step has an output; do not start a step before the previous one produced its output.

| Step | Do | Output |
|---|---|---|
| 1 Audit | List every path at the root and two levels down: what question it answers, who references it, whether a script or test uses it. Include anything outside the repo that holds an absolute path into it: running dev servers, `npm link` links, a tool's own registry, worktree gitdirs. | Current-state table (path · role · referenced by) |
| 2 Target | Give each path a destination and one action: keep, move/rename, split (one file holds two authorities), archive (to `.archive/`), or delete (only content shown unreferenced and rebuildable). | Migration table (old · new · action · risk) |
| 3 Execute | `git mv` everything and stage it, rewrite references from the rename table, then run the dead-link scan and the tests, all in one commit. Outside git, use `mv` and list the renames by hand. | One commit |
| 4 Verify | No new dead links, tests green, no hits when grepping old paths, the README routing table points at the new locations. | The report below |

## Rewriting references

References hide in five places: Markdown relative links, path constants in tests, locators in JSON, task runners and CI scripts, code comments. Hand edits miss some, so move first, then rewrite in one pass.

- Take the rename table from `git diff --cached -M --name-status`; do not write it by hand inside git.
- Resolve each relative link against its file's old location, map the target through the rename table, then recompute the link from the file's new location. Resolving against the new location gives wrong results.
- Skip `.archive/`, files whose content tests verify by hash, `.venv/`, and `node_modules/`.
- Report only the dead links this change introduced; list links that were already dead separately.

## Pitfalls

- Tests with literal paths and file counts can be half the work. Change the constants, not the semantics.
- Code moved into a dated directory stops importing.
- Historical docs keep old paths where they describe the past; change only navigation and text that describes the present.
- A virtualenv records absolute paths. Delete and recreate it after a move.
- Prose still names old paths after the move. Grep the old names last; fix what describes the present, leave what describes history.

## Archiving

Do not archive cold work unprompted; wait for the owner to ask. Offer a retro on the thread first, and run it only if they agree. Write `ARCHIVED.md` with three lines: why it closed, where the active surface is now, what was extracted and where it went. Move the directory to `.archive/<YYYY-MM-DD>-<name>/` and rewrite references as in step 3.

## Report

Add two items to the usual handback: the migration table (old → new · action), and external references left unchanged (path · reason).
