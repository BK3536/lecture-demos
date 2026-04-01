# Radar Signal Processing Roadmap

## Purpose
This note is the canonical repo-local version of the former runtime-only radar signal processing module plan, its gap check, and its open questions.

## Audience and posture
- Beginner engineering students with RF / communications background
- Low-to-mid difficulty progression
- Equation-backed intuition with interactive demos and mini-labs

## Target curriculum shape
The intended teaching arc is an **11-module beginner roadmap**:

1. radar signal chain and terminology
2. pulse / CW / FMCW waveform intuition
3. sampling, I/Q, aliasing
4. range estimation from delay and beat frequency
5. matched filtering and pulse compression
6. Doppler shift and velocity estimation
7. FFT basics for radar
8. range–Doppler map construction
9. noise, clutter, and intro CFAR
10. angle estimation basics
11. integrated radar mini-project

Each module should include:
- learning outcomes
- compact key equations
- one interactive demo concept
- one lab-friendly mini-lab

## Current implementation status in this repo
The current demo set under `demos/radar/` already covers a strong practical subset and adjacent extensions:

- `01-radar-equation.html`
- `02-matched-filter.html`
- `03-fmcw-radar.html`
- `04-doppler-effect.html`
- `05-ambiguity-function.html`
- `06-cfar.html`
- `07-mti-pulse-doppler.html`
- `08-beamforming.html`
- `09-sar-imaging.html`
- `10-rcs-swerling.html`
- `11-target-tracking.html`
- `12-radar-cube.html`

### Interpretation
- The repo already has enough demo surface to support the planned beginner roadmap.
- The current demos slightly exceed the original beginner blueprint by including ambiguity, SAR, RCS/Swerling, tracking, and radar-cube topics.
- The roadmap should therefore be used as the **pedagogical sequencing reference**, not as a hard cap on available demos.

## Stable planning conclusions
- Keep the course beginner-first.
- Prefer simulation-first mini-labs with optional hardware extension.
- Use interactive demos to create intuition before more equation-heavy treatment.
- Avoid long derivation-first delivery.

## Resolved gap-check outcome
The original runtime gap check concluded that the plan was structurally sound:
- requested 10–12 module scope was satisfied
- learning outcomes / equations / demo / mini-lab structure was complete
- low-to-mid difficulty target was preserved

## Open questions that still matter
1. Should **FMCW** be the primary running example, or should pulse radar receive equal emphasis?
2. What is the expected per-module contact format:
   - single lecture
   - lecture + lab
   - flipped delivery

## Default assumptions until explicitly changed
- FMCW may act as the main running example because it aligns well with the current demo inventory.
- Simulation-first delivery is acceptable for mini-labs unless a hardware-backed section is explicitly planned.

## Maintenance rule
If the demo inventory changes, update this roadmap before deleting or renaming major topic demos so future teaching cleanup does not lose the intended sequencing logic.
