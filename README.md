# Evermore

**A Universe of One's Own**

A private, no-account place to keep a life: the days, the people, the places,
the things and the ideas worth not losing. Everything is written to this
browser's own storage. Nothing is uploaded, nothing is tracked, and there is
no server that could read it.

<!-- __CONTINUE__ -->

## What is here

- **Universe** — the home screen: four worlds (Wealth, Health, Journey,
  Memories), each showing how much of it you have kept.
- **Timeline** — every entry, newest first, grouped by month, filterable by
  world.
- **Create** — one honest question (*What would you like to remember?*),
  a title if you want one, the details that matter (date, place, people,
  world, photos) only when you ask for them.
- **Explore** — the people, places, things and ideas your entries are made
  of, and everything you wrote about each one.
- **Profile** — language (English / 中文), appearance (Void / Deep),
  export and restore, storage status, and the privacy statement in full.

Entries can carry up to six photos. Each photo is resized on the device
(1600 px full, 320 px thumbnail) before it is stored, which keeps a phone's
worth of memories inside a browser quota.

## Privacy, honestly stated

- There are no accounts, no analytics, no third-party requests.
- Data lives in IndexedDB on this device, in this browser, unencrypted.
  Anyone who can use the device can open it, and clearing site data erases it.
- The app asks the browser for *persistent* storage, but that is a request,
  not a guarantee. **Export a backup** now and then: Profile → Export
  everything. One JSON file, photos included.

## Develop

```powershell
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build into dist/
npm run preview    # serve the built output
npm run icons      # regenerate the PWA icons from the star cluster
```

Node 22 or newer is expected (developed on Node 26).

## Deploy to GitHub Pages

The build emits `404.html` alongside `index.html`, so deep links such as
`/timeline` survive a page reload on Pages. The base path is set at build time:

```powershell
$env:VITE_BASE = '/evermore/'   # use '/<repo-name>/' for a project page
npm run build
```

Then publish the contents of `dist/` (any static host works). A ready-made
workflow lives in `.github/workflows/deploy.yml`: push to `main`, and
Settings → Pages → Source must be set to *GitHub Actions* once.

## Project layout

```
src/
  components/    ui primitives, brand marks, layout shell, entry widgets
  data/          IndexedDB schema, repository, React context, types
  features/      photo processing, attachment URLs, backup import/export
  i18n/          hand-rolled en / zh dictionaries and provider
  lib/           date helpers, small utilities
  pages/         Welcome, Universe, Timeline, Create, Entry detail,
                 Explore, ExploreKind, Profile, NotFound
  theme/         appearance provider (Void / Deep)
docs/            PRD, DESIGN, ARCHITECTURE, TASKS, CHANGELOG
scripts/         icon generator (no image dependencies)
```

## Documentation

- [docs/PRD.md](docs/PRD.md) — who this is for and what it must do
- [docs/DESIGN.md](docs/DESIGN.md) — palette, type, motion, screens, voice
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — data model, storage, routing
- [docs/TASKS.md](docs/TASKS.md) — what is done and what remains
- [docs/CHANGELOG.md](docs/CHANGELOG.md) — release notes

