# CHANGELOG

All notable changes to Evermore. This project follows a plain
`Added / Changed / Fixed` structure and dates in `YYYY-MM-DD`.

## 1.0.0 — 2026-11-20

First release. Private, single-device, installable.

### Added

- **The opening** — a night field, the seven stars of the Great Bear and an
  eighth in blue, the name, and the line *A Universe of One's Own*. Plays once
  per session, skippable, replayable from Profile.
- **Universe** — four worlds (Wealth, Health, Journey, Memories), each with
  its own line of copy and a live count.
- **Timeline** — every entry newest first, grouped under month headings, with
  world filters carried in `?category=`.
- **Writing** — one question and a growing text area. Title optional. Details
  (date, place, people, world, photos) folded away until asked for.
  `⌘/Ctrl + Enter` saves.
- **Entry detail** — reading view, object chips, photo grid, lightbox, edit and
  delete with confirmation.
- **Explore** — people, places, things and ideas gathered automatically from
  entries; open one to see everything written about it.
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

### Fixed

- Photo selection now stops at six within the file picker itself, instead of
  accepting the whole selection and discarding the overflow.
- Object URLs for attachments are revoked on unmount, so long browsing sessions
  do not accumulate decoded images.

### Notes

- Data lives in IndexedDB on one device, unencrypted. Export a backup.
- `VITE_BASE` must match the Pages path at build time (`/<repo>/` for a project
  page, `/` for a user page); the bundled workflow does this automatically.
