# lecture

Lecture-delivery workspace for REMI Lab courses.

## Purpose
- Manage lecture authoring assets and delivery-side materials
- Keep general lecture assets aligned with specialized course-site subprojects
- Preserve reproducible teaching entry points for students and TAs

## Read first
- `AGENTS.md`
- `CLAUDE.md`
- `docs/agent-memory/index.md`
- `docs/agent-memory/current-role.md`
- `docs/agent-memory/course-sites.md`
- `docs/agent-memory/deploy-boundaries.md`
- `docs/agent-memory/do-not-repeat.md`

## Important structure
- `docs/` — stable teaching memory and release/deploy boundaries
- interactive labs content now lives in the sibling repo `../remilab-labs/`
- major course repos such as `../grad-radar-ai/` now live as sibling teaching repos, not nested subprojects

## Working rule
- Treat this repo as a lecture-authoring and lecture-delivery workspace, not a generic asset dump.
- When work actually targets a sibling course repo such as `../grad-radar-ai/`, switch into that repo and follow its own guidance there.
- Keep source-vs-generated and deploy-vs-authoring boundaries explicit.
