# CHANGELOG

All notable changes to Evermore. This project follows a plain
`Added / Changed / Fixed` structure and dates in `YYYY-MM-DD`.

## 1.0.0 — 2026-11-20

First release. Private, single-device, installable.

### Added

- **The opening** — a night field, the seven stars of the Great Bear and an
  eighth in blue, the name, the dedication *致珍珍，我的挚爱*, the line
  *爱是宇宙的终极*, and a way in. Plays once per session, skippable, replayable
  from Profile.
- **Universe** — four worlds (Wealth, Health, Journey, Memories), each with
  its own line of copy, and the running total of everything written.
- **Timeline** — every entry newest first, grouped under month headings, with
  world filters carried in `?category=`.
- **Writing** — one question and a growing text area. Title optional. Details
  (date, place, people, world, photos) folded away until asked for.
  `⌘/Ctrl + Enter` saves.
- **Entry detail** — reading view, object chips, photo grid, lightbox, edit and
  delete with confirmation.
- **Explore** — people, places, things and ideas gathered from entries; open one to
  see everything written about it. A place typed into an entry is linked as a
  place object, and shown once.
- **Photos** — up to six per entry, resized on device to WebP at 1600 px and
  320 px, with thumbnails used everywhere except the lightbox.
- **Two languages** — English and 中文, switched live, remembered.
- **Two appearances** — Void (the default night) and Deep.
- **Backup** — export everything (entries, objects, photos) to one JSON file;
  restore replaces the library after a confirmation.
- **Storage panel** — usage estimate, persistence status, and the privacy
  statement in full.
- **PWA** — installable, standalone, offline after first load; generated
  192/512/maskable icons; `404.html` fallback so deep links survive reloads on
  GitHub Pages.

### Changed

- Photos are stored as blobs rather than base64; backups convert on the fly.
- A back-dated entry is grouped and sorted by its own day, not by when it was
  written.
- A place typed into an entry becomes a place object, so Explore's Places stay in
  step with what was written; the entry shows it once, as a link.
- The writing screen keeps a single Save at the end of the form instead of one at
  the top as well.
- Explore prints a count only where there is something to count, so four empty
  categories stay quiet instead of showing four zeros.
- The old tagline is replaced by the dedication 致珍珍，我的挚爱, and 爱是宇宙的终极
  now closes both the opening and the Universe; the manifest, the meta
  description and the sidebar carry the dedication too.

### Fixed

- Sheets and confirmations are drawn over the whole screen rather than inside the
  page, so on a phone their buttons no longer hide behind the bottom navigation.
- Photo selection now stops at six within the file picker itself, instead of
  accepting the whole selection and discarding the overflow.
- Object URLs for attachments are revoked on unmount, so long browsing sessions
  do not accumulate decoded images.

### Notes

- Data lives in IndexedDB on one device, unencrypted. Export a backup.
- `VITE_BASE` must match the Pages path at build time (`/<repo>/` for a project
  page, `/` for a user page); the bundled workflow does this automatically.
