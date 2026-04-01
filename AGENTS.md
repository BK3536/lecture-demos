# AGENTS.md - lecture

## Scope
This file governs `teaching/lecture/` unless a deeper file overrides it.

## Read first
- `docs/agent-memory/index.md`
- `docs/agent-memory/current-role.md`
- `docs/agent-memory/course-sites.md`
- `docs/agent-memory/deploy-boundaries.md`
- `docs/agent-memory/do-not-repeat.md`

## Project posture
- This repo is a lecture-authoring and lecture-delivery workspace, not just a static asset dump.
- Large course repos such as `../grad-radar-ai/` are separate sibling repos now; do not treat them as nested subprojects of `teaching/lecture/`.
- Interactive labs content belongs in the sibling repo `../remilab-labs/`, not under this repo.

## Mandatory discipline
- Keep authoring sources, generated lecture assets, and deployed course-site assumptions aligned.
- Preserve the distinction between general lecture repo concerns and sibling course-repo concerns.

## Safety
- Do not overwrite deployed lecture sites without checking the target course repo’s own deploy discipline.
- Do not treat generated visual assets as detached from their source scripts.

## Verification
- Verify builds, rendered lecture pages, and deployment assumptions before calling teaching-site work complete.
