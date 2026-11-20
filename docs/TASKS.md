# TASKS

## Done

### Foundation
- [x] Vite 8 + React 19 + TypeScript 7 project, Tailwind 4 through the Vite plugin
- [x] `@theme` design tokens; Playfair Display + Inter via fontsource
- [x] Tooling: portable Node, local npm cache, `typecheck` / `build` / `preview`
- [x] `vite-plugin-pwa` manifest + Workbox precache; `spaFallback()` → `404.html`
- [x] PNG icon generator with no image dependencies (`npm run icons`)

### Data
- [x] Types and guards (`Entry`, `EverObject`, `Attachment`, `ExportBundle`)
- [x] IndexedDB schema v1 with stores + indexes; memoised open with retry
- [x] Repository interface + IndexedDB adapter; entry delete cascades attachments
- [x] Object delete strips ids from entries; names de-duplicated
- [x] `AppData` context: cached entries/objects, refresh after every mutation
- [x] Export / import round-trip with photos; confirmation before restore
- [x] Persistent-storage request and storage estimate

### Interface
- [x] UI primitives: Button, Chip/MetaChip, Field, Sheet, ConfirmDialog, EmptyState, Toast
- [x] Brand: `StarCluster` (seven + one) and `Wordmark`
- [x] `AppShell`: desktop rail, mobile tab bar, safe-area padding
- [x] Welcome opening, sequenced and skippable, once per session
- [x] Universe, Timeline (world filter in URL), Create/Edit, Entry detail, Explore,
      Explore kind, Profile, Not found
- [x] Photo field: 6-photo cap, client-side resize, thumbnail grid, lightbox
- [x] Appearance (Void / Deep) and language (en / zh) providers, both remembered
- [x] Full en + zh dictionaries, key-complete by type

### Verification
- [x] `tsc --noEmit` clean
- [x] `vite build` succeeds; `dist/` contains `index.html`, `404.html`, icons,
      manifest and a precache manifest
- [x] Dev server answers `200` on `http://localhost:5173`
- [x] `npm run icons` regenerates all three PNGs

## Remaining

### Release
- [ ] Screen-by-screen QA at 1440 / 768 / 390 px
- [ ] Manual pass: create → edit → delete an entry; add/remove photos
- [ ] Manual pass: language switch, appearance switch, intro replay
- [ ] Manual pass: export, then restore into an emptied browser
- [ ] Install on the recipient's Android device; verify offline launch
- [ ] Production build with `VITE_BASE=/<repo>/`, `npm run preview`, deep-link reload
- [ ] Create the GitHub repository, push `main`, enable Pages (Source: GitHub Actions)
- [ ] Send the URL with the two line note: bookmark it, export a backup now and then

### Known limits to state, not fix
- Single device, single browser; no sync
- Unencrypted at rest; clearing site data erases everything
- No custom object kinds; no rich text; no reminders

### Later, if it earns it
- [ ] Search across entries
- [ ] Optional passphrase encryption (WebCrypto) behind a Profile toggle
- [ ] Automatic daily export reminder when the last backup is over 30 days old
- [ ] Vitest suites for `date.ts`, `backup.ts`, and the repository round-trip

## Acceptance walk-through

1. Open the URL on the phone → the opening plays once → Universe.
2. Create an entry with only a body. Save. It is at the top of the Timeline.
3. Add a photo, a place and a person from a second entry; open it, open the
   photo, edit it, delete it.
4. Switch to 中文, check every screen, switch back. Toggle Void / Deep.
5. Profile → Export everything. Clear site data. Reload, Profile → Restore.
   Entries, objects and photos return.
6. Turn off the network, reopen from the home screen. Everything still opens.
