# Folder Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the repository root so active app code stays prominent while references, docs, and local workspace state are grouped by purpose.

**Architecture:** Keep the live Next.js app structure unchanged at the root, add `reference/` for design artifacts, add `.workspace/` for local tool state, and group loose documents under `docs/`. Before moving anything, scan for root-relative path assumptions and update only the references that are actually used in-repo.

**Tech Stack:** Next.js repository structure, zsh shell commands, git move semantics, ripgrep for reference checks

---

### Task 1: Create Destination Directories

**Files:**
- Create: `reference/personal-website-design/`
- Create: `docs/audits/`
- Create: `docs/operations/`
- Create: `.workspace/logs/`

- [ ] **Step 1: Create the destination directories**

```bash
mkdir -p reference/personal-website-design docs/audits docs/operations .workspace/logs
```

- [ ] **Step 2: Verify the directories exist**

Run: `find reference docs .workspace -maxdepth 2 -type d | sort`
Expected: output includes `reference/personal-website-design`, `docs/audits`, `docs/operations`, and `.workspace/logs`

- [ ] **Step 3: Commit**

```bash
git add reference docs .workspace
git commit -m "chore: add folder organization destinations"
```

### Task 2: Scan For Root-Relative Path Assumptions

**Files:**
- Modify: no files expected unless references are found

- [ ] **Step 1: Search for references to moved workspace folders**

```bash
rg -n --hidden --glob '!node_modules' --glob '!.git' --glob '!.next' '\.agents|\.claude-flow|\.claude|\.planning|\.vscode|AUDIT_SUMMARY\.txt|CALENDAR_SETUP\.md|build_output\.log|Personal Website Design|Personal Website Strategy and Design\.docx|Personal Website design\.md' .
```

- [ ] **Step 2: Review the matches and classify them**

Run: the command from Step 1
Expected: a small set of path references is identified; only real in-repo path assumptions will need updates

- [ ] **Step 3: If no references are found, record that no code/doc updates are needed**

```text
No file edits are needed when search results show only the moved files themselves or irrelevant binary/lock data.
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify folder reorganization path assumptions"
```

### Task 3: Move Reference Materials

**Files:**
- Modify: `Personal Website Design/` -> `reference/personal-website-design/design-app/`
- Modify: `Personal Website Strategy and Design.docx` -> `reference/personal-website-design/Personal Website Strategy and Design.docx`
- Modify: `Personal Website design.md` -> `reference/personal-website-design/Personal Website design.md`

- [ ] **Step 1: Move the duplicate design project**

```bash
mv "Personal Website Design" "reference/personal-website-design/design-app"
```

- [ ] **Step 2: Move the loose design reference files**

```bash
mv "Personal Website Strategy and Design.docx" "reference/personal-website-design/"
mv "Personal Website design.md" "reference/personal-website-design/"
```

- [ ] **Step 3: Verify the reference area contents**

Run: `find reference/personal-website-design -maxdepth 2 | sort | sed -n '1,80p'`
Expected: output includes `design-app`, `Personal Website Strategy and Design.docx`, and `Personal Website design.md`

- [ ] **Step 4: Commit**

```bash
git add reference
git commit -m "chore: move design materials into reference area"
```

### Task 4: Move Workspace State And Logs

**Files:**
- Modify: `.agents/` -> `.workspace/agents/`
- Modify: `.claude/` -> `.workspace/claude/`
- Modify: `.claude-flow/` -> `.workspace/claude-flow/`
- Modify: `.planning/` -> `.workspace/planning/`
- Modify: `.vscode/` -> `.workspace/vscode/`
- Modify: `build_output.log` -> `.workspace/logs/build_output.log`

- [ ] **Step 1: Create the parent workspace directory**

```bash
mkdir -p .workspace
```

- [ ] **Step 2: Move workspace folders**

```bash
mv .agents .workspace/agents
mv .claude .workspace/claude
mv .claude-flow .workspace/claude-flow
mv .planning .workspace/planning
mv .vscode .workspace/vscode
```

- [ ] **Step 3: Move the loose build log**

```bash
mv build_output.log .workspace/logs/build_output.log
```

- [ ] **Step 4: Verify workspace contents**

Run: `find .workspace -maxdepth 2 -type d | sort`
Expected: output includes `.workspace/agents`, `.workspace/claude`, `.workspace/claude-flow`, `.workspace/planning`, `.workspace/vscode`, and `.workspace/logs`

- [ ] **Step 5: Commit**

```bash
git add .workspace
git commit -m "chore: consolidate local workspace folders"
```

### Task 5: Move Operational Docs And Audit Artifacts

**Files:**
- Modify: `AUDIT_SUMMARY.txt` -> `docs/audits/AUDIT_SUMMARY.txt`
- Modify: `CALENDAR_SETUP.md` -> `docs/operations/CALENDAR_SETUP.md`

- [ ] **Step 1: Move the audit summary**

```bash
mv AUDIT_SUMMARY.txt docs/audits/AUDIT_SUMMARY.txt
```

- [ ] **Step 2: Move the calendar setup doc**

```bash
mv CALENDAR_SETUP.md docs/operations/CALENDAR_SETUP.md
```

- [ ] **Step 3: Verify docs placement**

Run: `find docs -maxdepth 2 | sort`
Expected: output includes `docs/audits/AUDIT_SUMMARY.txt` and `docs/operations/CALENDAR_SETUP.md`

- [ ] **Step 4: Commit**

```bash
git add docs
git commit -m "chore: group operational docs and audit artifacts"
```

### Task 6: Update Any Real Path References

**Files:**
- Modify: only files returned by Task 2 that contain true root-relative path assumptions

- [ ] **Step 1: Re-run the reference scan after moves**

```bash
rg -n --hidden --glob '!node_modules' --glob '!.git' --glob '!.next' '\.agents|\.claude-flow|\.claude|\.planning|\.vscode|AUDIT_SUMMARY\.txt|CALENDAR_SETUP\.md|build_output\.log|Personal Website Design|Personal Website Strategy and Design\.docx|Personal Website design\.md' .
```

- [ ] **Step 2: Update only true stale references**

```text
For each real stale reference, replace the old path with the new destination path from the approved design.
```

- [ ] **Step 3: Re-run the scan to confirm cleanup**

Run: the command from Step 1
Expected: no stale in-repo references remain, aside from historical/spec/plan files that intentionally describe the reorganization

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: update references for folder reorganization"
```

### Task 7: Final Verification

**Files:**
- Modify: no files expected

- [ ] **Step 1: Inspect top-level layout**

Run: `find . -maxdepth 1 -mindepth 1 | sort`
Expected: root prominently contains app directories and grouped support areas, including `docs`, `reference`, and `.workspace`

- [ ] **Step 2: Review git status**

Run: `git status --short`
Expected: intended moves and any required path updates are visible; unrelated pre-existing code changes remain untouched

- [ ] **Step 3: Inspect a compact tree of the reorganized areas**

Run: `find .workspace docs reference -maxdepth 2 | sort`
Expected: moved items appear in the approved destination folders

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: finalize folder organization cleanup"
```
