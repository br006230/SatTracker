# SatTracker

A small personal web app for monitoring specific satellites in low Earth orbit
on an interactive 3D globe. Built with React + Vite + CesiumJS (via Resium)
+ satellite.js. TLEs are fetched from CelesTrak; orbital propagation runs in
the browser.

The app ships with a pre-populated monitoring list (WorldView-1/-2/-3,
GeoEye-1, WorldView Legion 1-6). Satellites can be added by NORAD ID or name,
removed, and focused. The list persists in `localStorage`.

This app was developed using Auggie AI SDLC by Brendan McDonald. 

## Run locally

```
npm install
npm run dev
```

Then open the URL printed by Vite (typically `http://localhost:5173`).

## Other scripts

| Command         | Purpose                                       |
|-----------------|-----------------------------------------------|
| `npm run dev`   | Start the dev server with hot reload          |
| `npm test`      | Run the unit test suite (Vitest, headless)    |
| `npm run build` | Produce a static, deployable bundle in `dist/`|
| `npm run preview` | Serve the built bundle locally to verify it |
| `npm run lint`  | Run ESLint                                    |

## Deploy

`npm run build` produces a fully static `dist/` directory (HTML, JS, CSS, and
Cesium's asset folders). Drop it on any static host — GitHub Pages, Netlify,
Vercel, S3, an Nginx box, etc. No backend or server-side code.

## Notes

- Imagery uses OpenStreetMap tiles so no Cesium Ion access token is required.
- TLEs are fetched on first load. Click **⟳ Refresh TLEs** in the toolbar to
  re-fetch on demand.
- Position updates run at ~1 Hz.

