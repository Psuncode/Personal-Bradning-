# Folder Organization Design

Date: 2026-04-05
Topic: Repository root cleanup and reference/workspace consolidation

## Goal

Reduce root-level noise in this repository without changing the live Next.js app architecture. The active application should remain easy to recognize from the repo root, while reference materials, local workflow state, and generated artifacts are grouped by purpose.

## Scope

In scope:
- Consolidate duplicate design/reference materials under a dedicated `reference/` area
- Consolidate local agent/editor/planning folders under a single `.workspace/` area
- Group loose documentation, reports, and logs into `docs/` or `.workspace/`
- Preserve the active Next.js app structure documented in `CLAUDE.md`

Out of scope:
- Refactoring application code under `src/`
- Renaming or restructuring runtime directories like `src/`, `public/`, `content/`, `drizzle/`
- Deleting reference material unless it is an obvious generated artifact that should live under workspace/log storage
- Cleaning generated directories like `.next/` or `node_modules/`

## Current Structure Problems

The repository already has a coherent application structure under `src/`, `public/`, `content/`, and top-level config files. The disorder is concentrated at the root:

- Duplicate design project: `Personal Website Design/`
- Loose design/reference files: `Personal Website Strategy and Design.docx`, `Personal Website design.md`
- Loose operational/report artifacts: `AUDIT_SUMMARY.txt`, `CALENDAR_SETUP.md`, `build_output.log`
- Local workflow folders scattered at root: `.agents/`, `.claude/`, `.claude-flow/`, `.planning/`, `.vscode/`

This makes the root look like a mix of active app code, archives, and local machine state.

## Chosen Approach

Use a purpose-based root cleanup:

- Keep active app/runtime/config files at the root
- Move design/reference materials into `reference/`
- Move loose documentation into `docs/`
- Move local workflow/tooling state into `.workspace/`

This approach improves clarity while minimizing risk to the live app.

## Target Structure

Root should continue to emphasize the live app:

- `src/`
- `public/`
- `content/`
- `drizzle/`
- `.github/`
- core config and package files
- `docs/`
- `reference/`
- `.workspace/`

### Reference Area

Create:

- `reference/personal-website-design/`

Move into that area:

- `Personal Website Design/` -> `reference/personal-website-design/design-app/`
- `Personal Website Strategy and Design.docx` -> `reference/personal-website-design/`
- `Personal Website design.md` -> `reference/personal-website-design/`

This keeps design artifacts available without competing with the live application.

### Workspace Area

Create:

- `.workspace/agents/`
- `.workspace/claude/`
- `.workspace/claude-flow/`
- `.workspace/planning/`
- `.workspace/vscode/`
- `.workspace/logs/`

Move:

- `.agents/` -> `.workspace/agents/`
- `.claude/` -> `.workspace/claude/`
- `.claude-flow/` -> `.workspace/claude-flow/`
- `.planning/` -> `.workspace/planning/`
- `.vscode/` -> `.workspace/vscode/`
- `build_output.log` -> `.workspace/logs/`

This treats these folders as local workflow infrastructure rather than application content.

### Documentation Area

Create:

- `docs/audits/`
- `docs/operations/`

Move:

- `AUDIT_SUMMARY.txt` -> `docs/audits/`
- `CALENDAR_SETUP.md` -> `docs/operations/`

Existing docs already under `docs/` remain in place unless a more specific subfolder is clearly appropriate.

## Guardrails

- Do not move `.github/`, `.gitignore`, `README.md`, `CLAUDE.md`, package/config files, env files, or application source directories
- Do not modify files with active code changes unless a path update is required by the reorganization
- Before moving workspace folders, scan the repository for references to their current root-relative paths
- If any path assumptions are found, update those references as part of the same change

## Implementation Notes

Implementation should proceed in this order:

1. Create target directories under `reference/`, `docs/`, and `.workspace/`
2. Scan repo files for references to `.agents`, `.claude`, `.claude-flow`, `.planning`, `.vscode`, and moved docs
3. Move files/folders into their new locations
4. Update any internal references that depend on the old paths
5. Verify the root contains only active app items plus clearly grouped support areas

## Testing And Verification

Verification should focus on structure and references, not app behavior:

- Confirm the expected top-level layout after moves
- Search for stale references to old root-relative workspace paths
- Check `git status --short` to verify intended moves are represented cleanly

If path references are updated, run only the smallest relevant verification commands needed for those changes.

## Risks

Primary risk: local tools or personal workflows may assume `.claude/`, `.planning/`, or related folders live at the repo root.

Mitigation:

- Search for path references before moving
- Limit changes to directory organization
- Avoid touching generated directories and active app code unless path updates are required

## Success Criteria

The repository root is understandable at a glance:

- active app code is visually distinct
- design materials live under `reference/`
- operational docs and reports live under `docs/`
- local workflow/tooling state lives under `.workspace/`
- no known internal references still point at the old locations
