# Obsidian Vault Restructure Design

**Date:** 2026-03-25
**Vault:** `/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School`
**Status:** Approved

---

## Goal

Clean up and connect the vault so that:
1. 生命OS (Life OS) remains the primary dashboard/UI layer
2. Numbered folders (0–10) are the physical filing system
3. All imported notes (Apple Notes + Notion misc) are tagged, classified, and moved to correct folders
4. Utility folders are prefixed with `_` to sort below the numbered structure
5. No data is lost or incorrectly deleted

---

## Safety Constraints (non-negotiable)

- **Moves only** — `mv` never `rm` during migration
- **Dry-run before execution** — full move manifest shown and confirmed before any files move
- **Life OS is read-only** — zero changes to `Notion/生命OS*/` subfolders or any `.base` files; non-Life-OS files in `Notion/` are moved out in Phase 3
- **Sensitive notes** (`BOA Information`, `卡号...`) → `8.个人Personal/sensitive/` with `type: sensitive` frontmatter field
- **"Confirmed at destination"** means: immediately after each individual `mv`, verify the destination path exists AND has non-zero size before proceeding to the next move. Per-file, not per-phase.
- **Apple Notes/ folder** only removed (rmdir) after every file is confirmed at destination per above definition
- **No overwrites — collision handling:**
  - If destination file exists: halt the current move, log conflict filename, surface to user
  - User resolves (rename source with `-imported` suffix or skip)
  - If `-imported` suffix also collides: escalate to user with full path — no automatic retry beyond one suffix attempt
  - Phase continues only after user explicitly approves resolution
- **Dry-run gate** — dry-run output must be reviewed and explicitly approved by user before real execution begins. No phase executes without this approval.
- **Wiki-links** — use Obsidian's built-in move (not shell mv) where possible so internal links auto-update; for shell-level renames (Phase 1 folder renames), run a grep pass afterward for `[[Assets/`, `[[Excalidraw/`, `[[Tags/`, `[[data/`, `[[docs/` and update to `_` prefix
- **iCloud sync pre-check** — before starting any phase, run: `find "<vault>" -name "*.icloud" | wc -l` — must return 0. If non-zero, abort and wait for iCloud to finish downloading before retrying.
- **`type: sensitive` replaces other type values** — a sensitive note has ONLY `type: sensitive`, not both `type: journal` and `type: sensitive`. This ensures it is excluded from all Life OS Bases queries (which filter `WHERE type != "sensitive"`).

---

## Final Vault Structure

```
0.计划Planning/        ← goals, tasks, plans
1.日记文件/            ← daily journals
2.联系人文件Contact/   ← people, contacts
3.知识文件/            ← knowledge, learning notes
4.模版文件Template/    ← note templates
5.插件/                ← plugin notes
6.工作/                ← work notes
7.学校School/          ← school, academic work
8.个人Personal/        ← personal life, spiritual
9.成长Career & Growth/ ← career, growth notes
10.AI构建/             ← AI projects

Notion/               ← Life OS UI layer (UNTOUCHED)
_Assets/              ← images & attachments (renamed from Assets/)
_Excalidraw/          ← drawings (renamed from Excalidraw/)
_Tags/                ← make-md tag taxonomy (renamed from Tags/)
_data/                ← app data, mood-tracker (renamed from data/)
_docs/                ← vault documentation (renamed from docs/)
```

---

## Tag Taxonomy

All notes get YAML frontmatter. The Life OS `.base` views query by `type:`.

```yaml
---
type: <type>         # required — drives Life OS Bases queries
tags: [topic, status, source]
date: YYYY-MM-DD
---
```

### Tag Categories (built on existing Tags/ structure)

| Namespace | Values |
|---|---|
| `#type/` | journal, task, contact, knowledge, project, book, movie, health, finance, habit, sensitive |
| `#topic/` | school, work, personal, spiritual, career, ai |
| `#status/` | active, archive, inbox, reference |
| `#source/` | apple-notes, notion-import |

---

## Phase 1 — Rename Utility Folders

| From | To | Notes |
|---|---|---|
| `Assets/` | `_Assets/` | mv, preserves all attachments |
| `Excalidraw/` | `_Excalidraw/` | mv, 2 drawings preserved |
| `Tags/` | `_Tags/` | mv, make-md .space files preserved |
| `data/` | `_data/` | mv, mood-tracker-data.json preserved |
| `docs/` | `_docs/` | mv, superpowers docs preserved |

---

## Phase 2 — Process Apple Notes (33 files)

All 33 files are in `Apple Notes/Archive/`. Classification by content:

| Note | Destination | type | tags |
|---|---|---|---|
| `BOA Information.md` | `8.个人Personal/sensitive/` | sensitive | personal, finance |
| `卡号：PEjDGogi@ncps.cc密码KlpFEmZx.md` | `8.个人Personal/sensitive/` | sensitive | personal |
| `2023-02-09 Bank.md` | `8.个人Personal/sensitive/` | sensitive | personal, finance |
| `2024-08-01 Wire transfer.md` | `8.个人Personal/sensitive/` | sensitive | personal, finance |
| `2024-03-03 362.md` | `8.个人Personal/` | knowledge | personal |
| `2024-02-02 Chat with Emma.md` | `2.联系人文件Contact/` | contact | personal |
| `2023-12-05 Naba.md` | `2.联系人文件Contact/` | contact | personal |
| `2023-10-31 Stipend.md` | `9.成长Career & Growth/` | finance | career |
| `2024-04-20 Sorato DJ.md` | `8.个人Personal/` | project | personal |
| `2023-10-22 Lds casting.md` | `8.个人Personal/` | project | personal, spiritual |
| `2025-06-02 Discretion.md` | `3.知识文件/` | knowledge | personal |
| `2025-05-29 Midas—.md` | `3.知识文件/` | knowledge | personal |
| `2023-12-07 Software.md` | `10.AI构建/` | knowledge | ai |
| `2023-11-16 Builder.I'm.md` | `9.成长Career & Growth/` | knowledge | career |
| `2023-07-21 Story1.md` | `3.知识文件/` | knowledge | personal |
| `2022-04-17 My arm can always.md` | `1.日记文件/` | journal | personal |
| `2022-01-05 2 Intro.md` | `7.学校School/` | knowledge | school |
| `2022-01-05 Scholar. Google.com.md` | `7.学校School/` | knowledge | school |
| `2022-03-24 X2-3+0.9...md` | `7.学校School/` | knowledge | school |
| `2021-12-26 Rim.md` | `8.个人Personal/` | journal | personal |
| `2022-01-19 Deli.md` | `8.个人Personal/` | journal | personal |
| `2022-03-12 Tithe..md` | `8.个人Personal/` | journal | spiritual |
| `2022-03-13 准.md` | `8.个人Personal/` | journal | personal |
| `2023-02-27 __儿'N.md` | `8.个人Personal/` | journal | personal |
| `2023-01-13 Sketch.md` | `_Excalidraw/` | — | — |
| `2022-11-22 Sketch.md` | `_Excalidraw/` | — | — |
| `2022-03-06 Sketch.md` | `_Excalidraw/` | — | — |
| `2022-11-26 Sketch.md` | `_Excalidraw/` | — | — |
| `2025-02-09 https--youtube.com-shorts...md` | `3.知识文件/` | knowledge | inbox |
| `2024-02-27 https--docs.google.com...md` | `3.知识文件/` | knowledge | inbox |
| `2025-04-07 https--maven.com...md` | `9.成长Career & Growth/` | knowledge | career |
| `2023-06-09 New Note.md` | `_data/` | — | — (blank/archive) |
| `Miscellaneous.md` | `_data/` | — | — (blank notes compiled) |

---

## Phase 3 — Process Notion Folder (non-Life-OS notes)

Move misc notes out of `Notion/` into numbered folders:

| Note/Folder | Destination | type | tags |
|---|---|---|---|
| `Essay Outline The Civil Rights Movement...md` | `7.学校School/` | knowledge | school |
| `Draft 2 Literature Review.md` | `7.学校School/` | knowledge | school |
| `Literature review.md` | `7.学校School/` | knowledge | school |
| `Ethic 1.5.md` / `1.6.md` / `1.7.md` | `7.学校School/` | knowledge | school |
| `Filibuster.md` | `7.学校School/` | knowledge | school |
| `Lesson 1.md` / `Lesson 2.md` | `7.学校School/` | knowledge | school |
| `2.1 Obedience.md` | `8.个人Personal/` | knowledge | spiritual |
| `43 Campion Court Tax.md` | `8.个人Personal/sensitive/` | sensitive | finance |
| `General Conference/` folder | `8.个人Personal/General Conference/` | knowledge | spiritual |
| `Awardco Shadowing.md` | `6.工作/` | knowledge | work |
| `China Conference Quick Planning.md` | `6.工作/` | project | work |
| `IGEM/` folder | `7.学校School/` | project | school |
| `生命OS  开箱即用版/` | stays in `Notion/` | — | Life OS template |
| `生命OS  Philip Sun Oct-2025 to Dec 2026/` | stays in `Notion/` | — | Life OS (PRIMARY) |

---

## Phase 3 — Pre-count (run before moving anything)

```bash
# Count Notion/ non-Life-OS files to track before/after
find "Notion/" -not -path "*/生命OS*" -name "*.md" | wc -l

# Count Life OS files to verify unchanged after migration
find "Notion/生命OS*" -type f | wc -l   # save this number
```

---

## Phase 4 — Tag Audit

After all moves:
1. Run linter (obsidian-linter) to standardize frontmatter formatting
2. Verify all moved notes have `type:` field: `grep -rL "^type:" <moved-files>` should return 0 results
3. Verify sensitive notes excluded from Bases: open each `.base` file in `Notion/生命OS*/目录/` and confirm none have `type = sensitive` in their filter criteria — this is a manual verification step
4. **Phase 4 is complete when:** grep for notes missing `type:` field returns 0 results AND sensitive notes are confirmed absent from all `.base` query results

---

## Utility Folder Content Reference

| Folder | Pre-existing content | New intake during migration |
|---|---|---|
| `_Assets/` | Images referenced in vault notes | None — existing attachments only |
| `_Excalidraw/` | 2 drawings + 4 Sketch notes from Apple Notes | Phase 2 Sketch files |
| `_Tags/` | make-md `.space/context.mdb` files for `#type`, `#topic`, `#status`, `#rent` | None |
| `_data/` | mood-tracker-data.json + 2 blank/archive notes | Phase 2 blank notes (`New Note.md`, `Miscellaneous.md`) |
| `_docs/` | superpowers docs | None — pre-existing content only |

---

## Plugins — Already Installed, No Action Needed

All required plugins are enabled:
- `templater-obsidian`, `dataview`, `calendar`, `periodic-notes`, `obsidian-tasks-plugin`, `homepage`, `obsidian-linter`, `make-md`

**One manual step:** Set homepage to `Notion/生命OS Philip Sun Oct-2025 to Dec 2026/生命OS Philip Sun Oct-2025 to Dec 2026.md` via Obsidian Settings → Homepage.

---

## Edge Cases

| Scenario | Resolution |
|---|---|
| Duplicate filename at destination | Halt, surface conflict to user, rename source with `-imported` suffix before retrying |
| Note has no clear category | Assign `type: knowledge`, `#status/inbox`, route to `3.知识文件/` for manual review |
| iCloud ghost file / sync conflict | Abort phase, wait for sync to settle, re-verify file list before resuming |
| Wiki-link breaks after folder rename | Run grep for `[[Tags/`, `[[Assets/`, `[[data/`, `[[docs/` across vault; update to `[[_Tags/`, etc. |
| File is 0 bytes at source | Skip move, log as anomaly, do not count as migrated |

---

## Success Criteria

- [ ] `find "Apple Notes/" -name "*.md" | wc -l` = 0
- [ ] `Apple Notes/` directory does not exist
- [ ] 4 sensitive notes confirmed in `8.个人Personal/sensitive/` — grep confirms no sensitive filenames elsewhere
- [ ] `find "Notion/" -not -path "*/生命OS*" -name "*.md" | wc -l` = 0
- [ ] `find "Notion/生命OS*" -type f | wc -l` matches pre-migration count (Life OS untouched)
- [ ] All 5 `_`-prefixed utility folders exist: `_Assets`, `_Excalidraw`, `_Tags`, `_data`, `_docs`
- [ ] `grep -rL "^type:" <all-moved-notes>` returns 0 results
- [ ] No `[[Assets/`, `[[Excalidraw/`, `[[Tags/`, `[[data/`, `[[docs/` patterns remain in vault (updated to `_` prefix)
- [ ] Life OS dashboard opens: all `.base` embeds render, no "file not found" banners in Obsidian
