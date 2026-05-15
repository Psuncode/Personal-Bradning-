# write-blog-post skill

Project-scoped Claude Code skill that drafts an engaging blog post end-to-end. The `SKILL.md` in this folder is the source of truth — committed so future clones get it.

## Activation

Claude Code harnesses read skills from `~/.claude/skills/` or `<repo>/.claude/skills/`. On this machine, `.claude` is symlinked to `.workspace/claude`; on a fresh clone, either:

```bash
# Per-project install
mkdir -p .claude/skills
cp -r skills/write-blog-post .claude/skills/

# OR (if you prefer to keep them DRY)
mkdir -p .claude/skills
ln -s ../../skills/write-blog-post .claude/skills/write-blog-post
```

Once registered, trigger with `/write-blog-post` or any natural-language phrase like "draft a blog post about X."

## What it does

See `SKILL.md`. In short: 5–7 question interview → internal Pip Decks framework recommendation → mandatory handoff to `/storyteller-writing-assistant` to lock purpose + outline → drafts MDX with editorial shortcodes placed at narrative pivots → writes to `content/blog/<slug>/index.mdx` with `published: false`.
