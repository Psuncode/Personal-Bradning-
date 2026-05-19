# Obsidian Vault Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Obsidian vault so the Life OS dashboard is the primary interface, numbered folders (0–10) are the physical filing system, all imported notes are tagged and classified, and utility folders are cleanly separated with `_` prefix.

**Architecture:** Shell `mv` for all file/folder operations (never `rm` until empty); Python for frontmatter injection; grep for wiki-link verification. Every move is confirmed per-file before proceeding. Dry-run gate before each phase.

**Tech Stack:** bash, Python 3, Obsidian (Life OS + Bases), obsidian-linter plugin

**Spec:** `docs/superpowers/specs/2026-03-25-obsidian-vault-restructure-design.md`

---

## Variable Reference

All tasks use this shell variable — set it once at the start of each session:

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
```

---

## Task 0: Pre-flight Checks

**Purpose:** Verify safe conditions before touching anything.

- [ ] **Step 0.1: Set vault variable**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
echo "Vault: $VAULT"
```

Expected: prints the path with no errors.

- [ ] **Step 0.2: Check iCloud sync is complete**

```bash
find "$VAULT" -name "*.icloud" | wc -l
```

Expected: `0`. If non-zero, stop — iCloud has pending downloads. Wait and re-run until 0.

- [ ] **Step 0.3: Record Life OS file count (baseline)**

```bash
find "$VAULT/Notion/生命OS Philip Sun Oct-2025 to Dec 2026" -type f | wc -l
```

Save this number. It must match exactly after migration.

- [ ] **Step 0.4: Record Notion non-Life-OS file count**

```bash
find "$VAULT/Notion" -not -path "*/生命OS*" -name "*.md" | wc -l
find "$VAULT/Notion" -not -path "*/生命OS*" -name "*.md"
```

Save this count and list. These are the files Phase 3 will move.

- [ ] **Step 0.5: Verify Apple Notes source files**

```bash
find "$VAULT/Apple Notes" -name "*.md" | sort
```

Expected: 33 files, all in `Apple Notes/Archive/`.

- [ ] **Step 0.6: Verify numbered destination folders exist**

```bash
ls "$VAULT" | grep -E "^[0-9]"
```

Expected: 11 folders (0–10). If any are missing, stop and report.

- [ ] **Step 0.7: Create local backup (REQUIRED before any changes)**

```bash
BACKUP=~/Desktop/vault-backup-$(date +%Y%m%d-%H%M%S)
cp -r "$VAULT" "$BACKUP"
echo "Backup created at: $BACKUP"
du -sh "$BACKUP"
```

Expected: backup folder exists on Desktop with non-zero size. Do not proceed without this.

---

## Task 1: Phase 1 Dry-Run — Rename Utility Folders

**Purpose:** Preview all 5 folder renames before executing. No files move yet.

- [ ] **Step 1.1: Print dry-run manifest**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
echo "=== PHASE 1 DRY-RUN: Folder Renames ==="
echo "mv '$VAULT/Assets'     -> '$VAULT/_Assets'"
echo "mv '$VAULT/Excalidraw' -> '$VAULT/_Excalidraw'"
echo "mv '$VAULT/Tags'       -> '$VAULT/_Tags'"
echo "mv '$VAULT/data'       -> '$VAULT/_data'"
echo "mv '$VAULT/docs'       -> '$VAULT/_docs'"
echo ""
echo "Verifying sources exist:"
for d in "Assets" "Excalidraw" "Tags" "data" "docs"; do
  [ -d "$VAULT/$d" ] && echo "  OK: $d" || echo "  MISSING: $d"
done
echo ""
echo "Verifying destinations are clear:"
for d in "_Assets" "_Excalidraw" "_Tags" "_data" "_docs"; do
  [ -d "$VAULT/$d" ] && echo "  CONFLICT: $d already exists" || echo "  OK: $d is free"
done
```

Expected: all 5 sources exist, all 5 destinations are free.

- [ ] **Step 1.2: USER APPROVAL GATE**

Review dry-run output. Only proceed when you confirm: "looks good, run Phase 1."

---

## Task 2: Phase 1 Execute — Rename Utility Folders

**Purpose:** Perform the 5 renames with per-folder confirmation.

- [ ] **Step 2.1: Rename Assets**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
mv "$VAULT/Assets" "$VAULT/_Assets"
[ -d "$VAULT/_Assets" ] && echo "OK: _Assets exists" || echo "FAIL: _Assets missing"
[ -d "$VAULT/Assets" ] && echo "WARN: old Assets still exists" || echo "OK: old Assets gone"
```

- [ ] **Step 2.2: Rename Excalidraw**

```bash
mv "$VAULT/Excalidraw" "$VAULT/_Excalidraw"
[ -d "$VAULT/_Excalidraw" ] && echo "OK" || echo "FAIL"
```

- [ ] **Step 2.3: Rename Tags**

```bash
mv "$VAULT/Tags" "$VAULT/_Tags"
[ -d "$VAULT/_Tags" ] && echo "OK" || echo "FAIL"
```

- [ ] **Step 2.4: Rename data**

```bash
mv "$VAULT/data" "$VAULT/_data"
[ -d "$VAULT/_data" ] && echo "OK" || echo "FAIL"
```

- [ ] **Step 2.5: Rename docs**

```bash
mv "$VAULT/docs" "$VAULT/_docs"
[ -d "$VAULT/_docs" ] && echo "OK" || echo "FAIL"
```

- [ ] **Step 2.6: Check for broken wiki-links from renames**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
echo "=== Wiki-link check for old folder names ==="
grep -rl "\[\[Assets/" "$VAULT" --include="*.md" | grep -v "_Assets"
grep -rl "\[\[Excalidraw/" "$VAULT" --include="*.md" | grep -v "_Excalidraw"
grep -rl "\[\[Tags/" "$VAULT" --include="*.md"
grep -rl "\[\[data/" "$VAULT" --include="*.md"
grep -rl "\[\[docs/" "$VAULT" --include="*.md"
```

- [ ] **Step 2.7: Fix any broken wiki-links found**

For each file returned in Step 2.6, replace old folder name with `_` prefix (`.bak` backup created automatically):

```bash
# Run per-file for each result from Step 2.6
# sed -i.bak creates a .bak backup of each edited file
sed -i.bak 's/\[\[Assets\//[[_Assets\//g' "<file>"
sed -i.bak 's/\[\[Excalidraw\//[[_Excalidraw\//g' "<file>"
sed -i.bak 's/\[\[Tags\//[[_Tags\//g' "<file>"
sed -i.bak 's/\[\[data\//[[_data\//g' "<file>"
sed -i.bak 's/\[\[docs\//[[_docs\//g' "<file>"
```

If no files returned in Step 2.6, skip this step.

- [ ] **Step 2.8: Verify no stale patterns remain after sed**

```bash
for pattern in "\[\[Assets/" "\[\[Excalidraw/" "\[\[Tags/" "\[\[data/" "\[\[docs/"; do
  count=$(grep -rl "$pattern" "$VAULT" --include="*.md" | wc -l)
  echo "$pattern -> $count files remaining (expected 0)"
done
```

Expected: all show `0`.

---

## Task 3: Phase 2 Dry-Run — Apple Notes Frontmatter + Move

**Purpose:** Preview all 33 Apple Notes classifications before touching files.

- [ ] **Step 3.1: Create the sensitive destination folder**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
mkdir -p "$VAULT/8.个人Personal/sensitive"
echo "OK: sensitive folder exists"
```

- [ ] **Step 3.2: Print full dry-run manifest**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
SRC="$VAULT/Apple Notes/Archive"

echo "=== PHASE 2 DRY-RUN: Apple Notes Classification ==="
echo ""
echo "SENSITIVE (type: sensitive):"
ls "$SRC" | grep -E "BOA Information|卡号|Bank\.md|Wire transfer"
echo "  -> $VAULT/8.个人Personal/sensitive/"
echo ""
echo "CONTACTS (type: contact):"
ls "$SRC" | grep -E "Chat with Emma|Naba"
echo "  -> $VAULT/2.联系人文件Contact/"
echo ""
echo "SKETCHES (no frontmatter):"
ls "$SRC" | grep "Sketch"
echo "  -> $VAULT/_Excalidraw/"
echo ""
echo "JOURNALS (type: journal):"
ls "$SRC" | grep -E "My arm can always|Rim\.md|Deli\.md|Tithe|准\.md|儿"
echo "  -> various numbered folders"
echo ""
echo "KNOWLEDGE (type: knowledge):"
ls "$SRC" | grep -E "362|Discretion|Midas|Software|Builder|Story1|2 Intro|Scholar|X2-3|maven|youtube|google.com"
echo "  -> various numbered folders"
echo ""
echo "ARCHIVE/BLANK:"
ls "$SRC" | grep -E "New Note|Miscellaneous"
echo "  -> $VAULT/_data/"
```

- [ ] **Step 3.3: USER APPROVAL GATE**

Review the manifest. Confirm: "looks good, run Phase 2."

---

## Task 4: Phase 2 Execute — Add Frontmatter and Move Apple Notes

**Purpose:** Inject YAML frontmatter into each Apple Note and move to destination.

**Helper script — save as `/tmp/inject_frontmatter.py`:**

- [ ] **Step 4.1: Write the frontmatter helper**

```bash
cat > /tmp/inject_frontmatter.py << 'EOF'
#!/usr/bin/env python3
"""Prepend YAML frontmatter to a note if not already present. Uses atomic write."""
import sys, os, tempfile

def inject(filepath, type_val, tags, date_val, source="apple-notes"):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    if content.startswith('---'):
        print(f"  SKIP (has frontmatter): {os.path.basename(filepath)}")
        return
    tags_str = ", ".join(tags)
    fm = f"---\ntype: {type_val}\ntags: [{tags_str}]\ndate: {date_val}\nsource: {source}\n---\n\n"
    new_content = fm + content
    # Atomic write: write to temp file in same dir, then rename
    dirpath = os.path.dirname(filepath)
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8',
                                     dir=dirpath, delete=False, suffix='.tmp') as tmp:
        tmp.write(new_content)
        tmp_path = tmp.name
    os.replace(tmp_path, filepath)  # atomic on POSIX
    print(f"  OK: {os.path.basename(filepath)}")

if __name__ == "__main__":
    # args: filepath type tag1,tag2 date [source]
    source = sys.argv[5] if len(sys.argv) > 5 else "apple-notes"
    inject(sys.argv[1], sys.argv[2], sys.argv[3].split(","), sys.argv[4], source)
EOF
chmod +x /tmp/inject_frontmatter.py
echo "Helper written"
```

- [ ] **Step 4.1b: Validate helper syntax**

```bash
python3 -m py_compile /tmp/inject_frontmatter.py && echo "OK: syntax valid" || echo "FAIL: syntax error"
```

- [ ] **Step 4.2: Pre-create all destination directories**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
mkdir -p \
  "$VAULT/8.个人Personal/sensitive" \
  "$VAULT/2.联系人文件Contact" \
  "$VAULT/1.日记文件" \
  "$VAULT/7.学校School" \
  "$VAULT/3.知识文件" \
  "$VAULT/9.成长Career & Growth" \
  "$VAULT/8.个人Personal" \
  "$VAULT/10.AI构建" \
  "$VAULT/6.工作" \
  "$VAULT/_Excalidraw" \
  "$VAULT/_data"
echo "All destination directories confirmed"
```

- [ ] **Step 4.2b: Move-with-confirm helper function**

```bash
# Paste this function into your terminal session
move_note() {
  local src="$1" dst_dir="$2"
  local fname="$(basename "$src")"
  local dst="$dst_dir/$fname"

  # Collision check
  if [ -f "$dst" ]; then
    echo "CONFLICT: $fname already exists at $dst_dir"
    echo "Halting. Resolve manually then re-run."
    return 1
  fi

  # Zero-byte check
  if [ ! -s "$src" ]; then
    echo "SKIP (0 bytes): $fname"
    return 0
  fi

  mv "$src" "$dst"

  # Confirm destination AND source gone
  if [ -f "$dst" ] && [ -s "$dst" ] && [ ! -e "$src" ]; then
    echo "OK: $fname -> $dst_dir"
  elif [ -e "$src" ] && [ -f "$dst" ]; then
    echo "WARN: $fname copied but source still exists (possible iCloud issue)"
    return 1
  else
    echo "FAIL: $fname did not arrive at $dst_dir"
    return 1
  fi
}
```

- [ ] **Step 4.3: Process sensitive notes**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
SRC="$VAULT/Apple Notes/Archive"
DST="$VAULT/8.个人Personal/sensitive"
TODAY="2026-03-25"

python3 /tmp/inject_frontmatter.py "$SRC/BOA Information.md" sensitive "personal,finance" "$TODAY"
move_note "$SRC/BOA Information.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/卡号：PEjDGogi@ncps.cc密码KlpFEmZx.md" sensitive "personal" "$TODAY"
move_note "$SRC/卡号：PEjDGogi@ncps.cc密码KlpFEmZx.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/2023-02-09 Bank.md" sensitive "personal,finance" "$TODAY"
move_note "$SRC/2023-02-09 Bank.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/2024-08-01 Wire transfer.md" sensitive "personal,finance" "$TODAY"
move_note "$SRC/2024-08-01 Wire transfer.md" "$DST"
```

- [ ] **Step 4.4: Process contacts**

```bash
DST="$VAULT/2.联系人文件Contact"

python3 /tmp/inject_frontmatter.py "$SRC/2024-02-02 Chat with Emma.md" contact "personal" "$TODAY"
move_note "$SRC/2024-02-02 Chat with Emma.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/2023-12-05 Naba.md" contact "personal" "$TODAY"
move_note "$SRC/2023-12-05 Naba.md" "$DST"
```

- [ ] **Step 4.5: Process sketch/drawing files (no frontmatter)**

```bash
DST="$VAULT/_Excalidraw"

move_note "$SRC/2023-01-13 Sketch.md" "$DST"
move_note "$SRC/2022-11-22 Sketch.md" "$DST"
move_note "$SRC/2022-03-06 Sketch.md" "$DST"
move_note "$SRC/2022-11-26 Sketch.md" "$DST"
```

- [ ] **Step 4.6: Process journal notes**

```bash
python3 /tmp/inject_frontmatter.py "$SRC/2022-04-17 My arm can always.md" journal "personal" "$TODAY"
move_note "$SRC/2022-04-17 My arm can always.md" "$VAULT/1.日记文件"

python3 /tmp/inject_frontmatter.py "$SRC/2021-12-26 Rim.md" journal "personal" "$TODAY"
move_note "$SRC/2021-12-26 Rim.md" "$VAULT/8.个人Personal"

python3 /tmp/inject_frontmatter.py "$SRC/2022-01-19 Deli.md" journal "personal" "$TODAY"
move_note "$SRC/2022-01-19 Deli.md" "$VAULT/8.个人Personal"

python3 /tmp/inject_frontmatter.py "$SRC/2022-03-12 Tithe..md" journal "spiritual" "$TODAY"
move_note "$SRC/2022-03-12 Tithe..md" "$VAULT/8.个人Personal"

python3 /tmp/inject_frontmatter.py "$SRC/2022-03-13 准.md" journal "personal" "$TODAY"
move_note "$SRC/2022-03-13 准.md" "$VAULT/8.个人Personal"

python3 /tmp/inject_frontmatter.py "$SRC/2023-02-27 __儿'N.md" journal "personal" "$TODAY"
move_note "$SRC/2023-02-27 __儿'N.md" "$VAULT/8.个人Personal"
```

- [ ] **Step 4.7: Process school notes**

```bash
python3 /tmp/inject_frontmatter.py "$SRC/2022-01-05 2 Intro.md" knowledge "school" "$TODAY"
move_note "$SRC/2022-01-05 2 Intro.md" "$VAULT/7.学校School"

python3 /tmp/inject_frontmatter.py "$SRC/2022-01-05 Scholar. Google.com.md" knowledge "school" "$TODAY"
move_note "$SRC/2022-01-05 Scholar. Google.com.md" "$VAULT/7.学校School"

python3 /tmp/inject_frontmatter.py "$SRC/2022-03-24 X2-3+0.9(3.3-x2)1-2sin(apex) X2-3+0.9(3.3-x2)1-2sin(apex) X….md" knowledge "school" "$TODAY"
move_note "$SRC/2022-03-24 X2-3+0.9(3.3-x2)1-2sin(apex) X2-3+0.9(3.3-x2)1-2sin(apex) X….md" "$VAULT/7.学校School"
```

- [ ] **Step 4.8: Process knowledge notes (3.知识文件)**

```bash
DST="$VAULT/3.知识文件"

python3 /tmp/inject_frontmatter.py "$SRC/2025-06-02 Discretion.md" knowledge "personal" "$TODAY"
move_note "$SRC/2025-06-02 Discretion.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/2025-05-29 Midas—.md" knowledge "personal" "$TODAY"
move_note "$SRC/2025-05-29 Midas—.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/2023-07-21 Story1.md" knowledge "personal" "$TODAY"
move_note "$SRC/2023-07-21 Story1.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/2025-02-09 https--youtube.com-shorts-4xgmifQ4R3Usi=Aqets6BhhUW6r_jJ.md" knowledge "inbox" "$TODAY"
move_note "$SRC/2025-02-09 https--youtube.com-shorts-4xgmifQ4R3Usi=Aqets6BhhUW6r_jJ.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/2024-02-27 https--docs.google.com-forms-d-e-1FAIpQLScmKFAYzV_UuguNw8dMR9p10VUF5QtVO8h3z4Lw….md" knowledge "inbox" "$TODAY"
move_note "$SRC/2024-02-27 https--docs.google.com-forms-d-e-1FAIpQLScmKFAYzV_UuguNw8dMR9p10VUF5QtVO8h3z4Lw….md" "$DST"
```

- [ ] **Step 4.9: Process career/growth notes**

```bash
DST="$VAULT/9.成长Career & Growth"

python3 /tmp/inject_frontmatter.py "$SRC/2023-10-31 Stipend.md" finance "career" "$TODAY"
move_note "$SRC/2023-10-31 Stipend.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/2023-11-16 Builder.I'm.md" knowledge "career" "$TODAY"
move_note "$SRC/2023-11-16 Builder.I'm.md" "$DST"

python3 /tmp/inject_frontmatter.py "$SRC/2025-04-07 https--maven.com-lightning-lessonstopic=Product.md" knowledge "career" "$TODAY"
move_note "$SRC/2025-04-07 https--maven.com-lightning-lessonstopic=Product.md" "$DST"
```

- [ ] **Step 4.10: Process personal project + AI notes**

```bash
python3 /tmp/inject_frontmatter.py "$SRC/2024-04-20 Sorato DJ.md" project "personal" "$TODAY"
move_note "$SRC/2024-04-20 Sorato DJ.md" "$VAULT/8.个人Personal"

python3 /tmp/inject_frontmatter.py "$SRC/2023-10-22 Lds casting.md" project "personal,spiritual" "$TODAY"
move_note "$SRC/2023-10-22 Lds casting.md" "$VAULT/8.个人Personal"

python3 /tmp/inject_frontmatter.py "$SRC/2024-03-03 362.md" knowledge "personal" "$TODAY"
move_note "$SRC/2024-03-03 362.md" "$VAULT/8.个人Personal"

python3 /tmp/inject_frontmatter.py "$SRC/2023-12-07 Software.md" knowledge "ai" "$TODAY"
move_note "$SRC/2023-12-07 Software.md" "$VAULT/10.AI构建"
```

- [ ] **Step 4.11: Process blank/archive notes**

```bash
DST="$VAULT/_data"
move_note "$SRC/2023-06-09 New Note.md" "$DST"
move_note "$SRC/Miscellaneous.md" "$DST"
```

- [ ] **Step 4.12: Verify Apple Notes is now empty**

```bash
find "$VAULT/Apple Notes" -name "*.md" | wc -l
```

Expected: `0`. If non-zero, list the remaining files and route them manually.

- [ ] **Step 4.13: Remove empty Apple Notes folder**

Only run this if Step 4.12 returned 0. Use `rmdir` (safe — refuses to delete non-empty folders):

```bash
# First verify truly empty (including hidden files)
find "$VAULT/Apple Notes" -type f | wc -l
find "$VAULT/Apple Notes" -name ".*" | wc -l  # hidden files
```

If both return 0:

```bash
rmdir "$VAULT/Apple Notes/Archive"
rmdir "$VAULT/Apple Notes/Quick Notes"
rmdir "$VAULT/Apple Notes/Storybank"
rmdir "$VAULT/Apple Notes"
[ ! -d "$VAULT/Apple Notes" ] && echo "OK: Apple Notes folder removed" || echo "FAIL: not empty or rmdir refused"
```

If `rmdir` fails (non-empty), inspect remaining files and route manually before retrying.

---

## Task 5: Phase 3 Dry-Run + Execute — Notion Misc Notes

**Purpose:** Move non-Life-OS notes out of `Notion/` into numbered folders.

- [ ] **Step 5.1: Print dry-run manifest**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
NOTION="$VAULT/Notion"
TODAY="2026-03-25"

echo "=== PHASE 3 DRY-RUN: Notion Misc Notes ==="
echo ""
echo "TO 7.学校School/:"
ls "$NOTION" | grep -E "Essay|Draft|Literature|Ethic|Filibuster|Lesson|IGEM"
echo ""
echo "TO 8.个人Personal/ (spiritual):"
ls "$NOTION" | grep -E "Obedience"
echo ""
echo "TO 8.个人Personal/sensitive/ (tax):"
ls "$NOTION" | grep "Campion"
echo ""
echo "TO 6.工作/ (work):"
ls "$NOTION" | grep -E "Awardco|China Conference"
echo ""
echo "TO 8.个人Personal/General Conference/ (folder move):"
ls "$NOTION" | grep "General Conference"
echo ""
echo "STAYS in Notion/ (Life OS):"
ls "$NOTION" | grep "生命OS"
echo ""
echo "Other items staying in Notion/:"
ls "$NOTION" | grep -vE "Essay|Draft|Literature|Ethic|Filibuster|Lesson|IGEM|Obedience|Campion|Awardco|China|General Conference|生命OS"
```

- [ ] **Step 5.2: USER APPROVAL GATE**

Review manifest. Confirm before executing.

- [ ] **Step 5.3: Create destination for General Conference**

```bash
mkdir -p "$VAULT/8.个人Personal/General Conference"
```

- [ ] **Step 5.4: Move school notes**

```bash
NOTION="$VAULT/Notion"
SCH="$VAULT/7.学校School"

python3 /tmp/inject_frontmatter.py "$NOTION/Essay Outline The Civil Rights Movement and the Ideal of Equality under the Law.md" knowledge "school" "$TODAY" source=notion-import
move_note "$NOTION/Essay Outline The Civil Rights Movement and the Ideal of Equality under the Law.md" "$SCH"

python3 /tmp/inject_frontmatter.py "$NOTION/Draft 2 Literature Review.md" knowledge "school" "$TODAY"
move_note "$NOTION/Draft 2 Literature Review.md" "$SCH"

python3 /tmp/inject_frontmatter.py "$NOTION/Literature review.md" knowledge "school" "$TODAY"
move_note "$NOTION/Literature review.md" "$SCH"

for f in "Ethic 1.5.md" "Ethic 1.7.md" "ethics 1.6.md" "Filibuster.md" "Lesson 1.md" "Lesson 2.md"; do
  python3 /tmp/inject_frontmatter.py "$NOTION/$f" knowledge "school" "$TODAY"
  move_note "$NOTION/$f" "$SCH"
done
```

- [ ] **Step 5.5: Move IGEM folder**

```bash
mv "$NOTION/IGEM" "$VAULT/7.学校School/IGEM"
[ -d "$VAULT/7.学校School/IGEM" ] && echo "OK" || echo "FAIL"
```

- [ ] **Step 5.6: Move spiritual/personal notes**

```bash
python3 /tmp/inject_frontmatter.py "$NOTION/2.1 Obedience.md" knowledge "spiritual" "$TODAY"
move_note "$NOTION/2.1 Obedience.md" "$VAULT/8.个人Personal"

python3 /tmp/inject_frontmatter.py "$NOTION/43 Campion Court Tax.md" sensitive "finance" "$TODAY"
move_note "$NOTION/43 Campion Court Tax.md" "$VAULT/8.个人Personal/sensitive"
```

- [ ] **Step 5.7: Move General Conference folder**

```bash
mv "$NOTION/General Conference" "$VAULT/8.个人Personal/General Conference"
[ -d "$VAULT/8.个人Personal/General Conference" ] && echo "OK" || echo "FAIL"
```

- [ ] **Step 5.8: Move work notes**

```bash
python3 /tmp/inject_frontmatter.py "$NOTION/Awardco Shadowing.md" knowledge "work" "$TODAY"
move_note "$NOTION/Awardco Shadowing.md" "$VAULT/6.工作"

python3 /tmp/inject_frontmatter.py "$NOTION/China Conference Quick Planning.md" project "work" "$TODAY"
move_note "$NOTION/China Conference Quick Planning.md" "$VAULT/6.工作"
```

- [ ] **Step 5.9: Verify Notion/ contains only Life OS**

```bash
find "$VAULT/Notion" -not -path "*/生命OS*" -name "*.md" | wc -l
```

Expected: `0`. List any remaining files and decide manually.

- [ ] **Step 5.10: Verify Life OS file count unchanged**

```bash
find "$VAULT/Notion/生命OS Philip Sun Oct-2025 to Dec 2026" -type f | wc -l
```

Must match the baseline from Step 0.3.

---

## Task 6: Phase 4 — Tag Audit and Wiki-Link Verification

**Purpose:** Ensure all moved notes have `type:` field and no stale wiki-links remain.

- [ ] **Step 6.1: Find moved notes missing type: field**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"

echo "=== Notes missing type: field ==="
for dir in "1.日记文件" "2.联系人文件Contact" "3.知识文件" "6.工作" "7.学校School" "8.个人Personal" "9.成长Career & Growth" "10.AI构建"; do
  grep -rL "^type:" "$VAULT/$dir" --include="*.md" 2>/dev/null
done
```

Expected: no output. For any file returned, add frontmatter manually:

```bash
python3 /tmp/inject_frontmatter.py "<filepath>" knowledge "inbox" "2026-03-25"
```

- [ ] **Step 6.2: Confirm sensitive notes are isolated**

```bash
echo "=== Sensitive notes location ==="
find "$VAULT/8.个人Personal/sensitive" -name "*.md"
echo ""
echo "=== Sensitive content outside sensitive/ ==="
grep -rl "type: sensitive" "$VAULT" --include="*.md" | grep -v "sensitive/"
```

Expected: second grep returns empty.

- [ ] **Step 6.3: Check for stale wiki-links**

```bash
echo "=== Stale wiki-links (should all be empty) ==="
grep -rl "\[\[Assets/" "$VAULT" --include="*.md"
grep -rl "\[\[Excalidraw/" "$VAULT" --include="*.md"
grep -rl "\[\[Tags/" "$VAULT" --include="*.md"
grep -rl "\[\[data/" "$VAULT" --include="*.md"
grep -rl "\[\[docs/" "$VAULT" --include="*.md"
```

Fix any found with `sed -i '' 's/\[\[OLD\//[[_OLD\//g' "<file>"`.

- [ ] **Step 6.4: Final structure verification**

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
echo "=== Final vault structure ==="
ls "$VAULT"
echo ""
echo "=== Utility folders (should have _ prefix) ==="
ls "$VAULT" | grep "^_"
echo ""
echo "=== Apple Notes folder (should not exist) ==="
[ -d "$VAULT/Apple Notes" ] && echo "FAIL: still exists" || echo "OK: removed"
echo ""
echo "=== Sensitive notes ==="
find "$VAULT/8.个人Personal/sensitive" -name "*.md" | wc -l
```

Expected:
- 5 `_`-prefixed folders visible
- `Apple Notes` folder absent
- 5 sensitive notes in `8.个人Personal/sensitive/` (4 Apple Notes + 1 Notion tax file)

---

## Task 7: Manual Step — Set Life OS as Homepage

**Purpose:** Make Life OS the first screen when opening Obsidian.

- [ ] **Step 7.1: Configure homepage plugin**

In Obsidian: Settings → Community Plugins → Homepage → Options

Set **Homepage** to:
```
Notion/生命OS Philip Sun Oct-2025 to Dec 2026/生命OS  Philip Sun Oct-2025 to Dec 2026
```

(Use the file picker — search for "生命OS" and select the main dashboard file.)

- [ ] **Step 7.2: Verify**

Close and reopen Obsidian. Confirm the Life OS dashboard opens automatically.

---

## Final Checklist

Run these after all tasks complete:

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"

echo "1. Apple Notes empty:"
[ ! -d "$VAULT/Apple Notes" ] && echo "PASS" || echo "FAIL"

echo "2. Utility folders renamed:"
for d in "_Assets" "_Excalidraw" "_Tags" "_data" "_docs"; do
  [ -d "$VAULT/$d" ] && echo "  PASS: $d" || echo "  FAIL: $d"
done

echo "3. Notion non-Life-OS notes moved:"
find "$VAULT/Notion" -not -path "*/生命OS*" -name "*.md" | wc -l
echo "  (expected: 0)"

echo "4. Sensitive notes count:"
find "$VAULT/8.个人Personal/sensitive" -name "*.md" | wc -l
echo "  (expected: 5)"

echo "5. Notes missing type: field:"
grep -rl "" "$VAULT" --include="*.md" -l | xargs grep -L "^type:" 2>/dev/null | grep -vE "Notion/生命OS|_Tags|_data|_docs" | wc -l
echo "  (expected: 0 for moved notes)"
```

- [ ] All checks pass → migration complete
- [ ] Open Life OS dashboard → verify all `.base` views load without errors

---

## Post-Migration Reconciliation Count

Run this final count to confirm total files are accounted for:

```bash
VAULT="/Users/philipsun/Library/Mobile Documents/iCloud~md~obsidian/Documents/School"
echo "=== File count reconciliation ==="
echo "Sensitive:"
find "$VAULT/8.个人Personal/sensitive" -name "*.md" | wc -l
echo "Contacts:"
find "$VAULT/2.联系人文件Contact" -name "*.md" | wc -l
echo "School:"
find "$VAULT/7.学校School" -name "*.md" -not -path "*/IGEM/*" | wc -l
echo "Knowledge:"
find "$VAULT/3.知识文件" -name "*.md" | wc -l
echo "Personal:"
find "$VAULT/8.个人Personal" -name "*.md" -not -path "*/sensitive/*" | wc -l
echo "Career:"
find "$VAULT/9.成长Career & Growth" -name "*.md" | wc -l
echo "Journal:"
find "$VAULT/1.日记文件" -name "*.md" | wc -l
echo "AI:"
find "$VAULT/10.AI构建" -name "*.md" | wc -l
echo "Work:"
find "$VAULT/6.工作" -name "*.md" | wc -l
echo "Archived to _data:"
find "$VAULT/_data" -name "*.md" | wc -l
echo "Sketches to _Excalidraw:"
find "$VAULT/_Excalidraw" -name "*.md" | wc -l
echo "--- Total should account for all moved files ---"
```

Cross-check: (33 Apple Notes) + (Notion misc count from Step 0.4) = sum of all the above.
