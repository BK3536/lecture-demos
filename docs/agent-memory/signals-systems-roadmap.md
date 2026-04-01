# Signals & Systems Roadmap

## Purpose
This note is the canonical repo-local version of the former runtime-only signals-and-systems module plan, its gap check, and its open questions.

## Audience and posture
- 2nd–3rd year EE students
- Communications / RF / circuit orientation
- Practical, lab-friendly, simulation-capable delivery

## Target curriculum shape
The intended teaching arc is an **11-module interactive roadmap**:

1. signals in engineering systems
2. periodic vs aperiodic / energy vs power
3. sampling basics and aliasing
4. LTI systems and convolution intuition
5. first-order circuits as systems
6. sinusoids, phase, and phasor view
7. frequency response and Bode plots
8. Fourier series
9. Fourier transform / FFT / leakage
10. modulation basics
11. noise, SNR, and signal-conditioning mini-lab

Each module should include:
- prerequisites
- learning outcomes
- one interactive demo concept
- one measurable assignment

## Current implementation status in this repo
The current demo set under `demos/signals-and-systems/` covers a strong analytic core:

- `01-sinusoidal.html`
- `02-convolution.html`
- `03-fourier-series.html`
- `04-fourier-transform-filtering.html`
- `05-sampling.html`
- `06-dft.html`
- `07-z-transform.html`
- `08-laplace-transform.html`

### Interpretation
- The current repo already supports the central transform-and-systems spine.
- The full 11-module blueprint remains useful because it adds missing delivery-level structure for:
  - energy / power framing
  - first-order circuit labs
  - phasor / phase intuition
  - frequency-response sequencing
  - modulation and SNR mini-labs

## Stable planning conclusions
- The roadmap is structurally sound for a low-to-mid difficulty course.
- Interactive demos should remain tied to engineering interpretation, not abstract proof-first exposition.
- Assignments should stay lab-friendly with a Python/simulation fallback.

## Resolved gap-check outcome
The original runtime gap check concluded that the plan was actionable:
- 10–12 module target was satisfied
- prerequisites / outcomes / interactive plots / assignments were all specified
- delivery remained practical for communications / RF / circuit students

## Open questions that still matter
1. What is the weekly contact format?
   - e.g. lecture + lab vs block format
2. Is physical RF lab hardware guaranteed for all cohorts, or should **simulation-first** be the default?

## Default assumptions until explicitly changed
- Use **simulation-first** as the safe baseline.
- Treat hardware labs as an enhancement layer rather than a universal assumption.

## Maintenance rule
If more signals-and-systems demos are added, update this roadmap so the full 11-module structure and the currently implemented demo subset remain aligned.
