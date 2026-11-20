# StudySpot — site vitrine

Landing page for **StudySpot**, the iPhone app that finds the quietest places to study in Paris: live free seats, live noise level in decibels, booking in three steps and a Focus timer.

**Live:** https://annitarik0.github.io/studyspot/ · **App code:** https://github.com/annitarik0/studyspot-app

## What's on the page

- A WebGL "noise field" hero (Three.js): the city as a sound equaliser that goes quiet and green where you point.
- A CSS 3D iPhone showing real app screens, tilting with the cursor.
- A sticky scroll story (Explorer → Réserver → Pass QR), a decibel slider that filters spots, a 3D cover-flow gallery, a feature grid and a working Focus timer demo.

## Run locally

No install needed:

```
node serve.mjs
```

Then open http://localhost:5173.

## Notes

- Libraries load from CDNs: Three.js 0.160.0 (jsDelivr), GSAP 3.12.5 (cdnjs), Lenis 1.1.13 (unpkg).
- Respects `prefers-reduced-motion` with a calm mode (3D follows the mouse, no autonomous motion).
- The waitlist form is front-end only and does not store emails.
- `build-artifact.mjs` writes `artifact.html`, a copy without the document wrapper for hosting as a claude.ai Artifact.
