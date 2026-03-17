# Task snapshot: labs page cleanup + review

## Task statement
Remove the DSP & Signal Analysis section and its 3 demos from labs.remilab.ai. Remove the Real Sentinel-1 SAR Pipeline demo because image-only presentation is hard to understand. After cleanup, run a 5-person team review of the labs page.

## Desired outcome
- Live catalog shows only 3 course sections: Signals and Systems, Wireless Communication, Radar Signal Processing.
- Radar section count is 12 demos.
- DSP section and its 3 demo pages are gone.
- Real Sentinel-1 SAR Pipeline page and asset are gone.
- Provide a synthesized review across academic/pedagogical, information architecture/UX, frontend/technical quality, performance/operations, and security/trust perspectives.

## Known facts / evidence
- Source repo: teaching/lecture/demos
- Updated locally: index.html, preview catalog pages regenerated.
- Deleted locally: dsp-signal-analysis/*.html, radar/13-real-sentinel1-pipeline.html, radar/assets/real_sar_pipeline_d453.json, deploy/build_real_sar_pipeline_assets.py
- Local verification passed: no stale references in current catalog or preview HTML, course count = 3, radar count = 12.
- Live check via curl on 2026-03-17 UTC showed removed references are absent from https://labs.remilab.ai/ and Last-Modified updated.

## Constraints
- Focus on review, not further implementation unless a critical issue must be called out.
- Review should be evidence-based and concise.
- Cover multiple lenses: academic usefulness, site technology, UX/IA, security/trust, maintainability.

## Unknowns / open questions
- Which next improvements are highest priority for the professor.
- Whether deeper analytics, search, or experiment instrumentation is desired.

## Likely touchpoints
- teaching/lecture/demos/index.html
- teaching/lecture/demos/previews/catalog-options/*.html
- teaching/lecture/demos/theme.css
- teaching/lecture/demos/theme.js
- representative demo pages under signals-and-systems/, wireless-comm/, radar/
