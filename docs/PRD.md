# PRD — Evermore

## 1. The problem

Most journaling apps want an account, a subscription and a server. They ask you
to trust a company with the most private text you will ever write, and they
shape the writing around engagement metrics. A person who simply wants to keep
a record of their own life ends up with a notes app that resets its formatting,
or a notebook that is never at hand.

## 2. Who this is for

One person, by name, receiving this as a gift. They write in Chinese and read
English comfortably. They use an Android phone all day and a laptop in the
evening. They are not interested in productivity systems; they are interested
in not losing things.

Design consequences:

- No onboarding beyond a five-second opening. No tutorial, no empty dashboard
  of charts.
- Two languages, switchable at any time, with the choice remembered.
- Everything reachable with a thumb on a phone; the desktop layout is the same
  app with more air.
- Nothing that looks like a streak, a target or a score.

## 3. Goals

1. Capture a memory in under twenty seconds, with no required fields.
2. Let the person find it again: by day, by world, or by the people, places,
   things and ideas in it.
3. Be honest about privacy: local-only storage, plainly explained, with a
   one-file backup that includes photos.
4. Feel like an artefact worth keeping, not a form.

## 4. Non-goals

- Accounts, sync, sharing, collaboration, public profiles.
- Server-side anything: no API, no analytics, no crash reporting.
- Editing rich text, tables, checklists. Plain text and a title is the format.
- Importing from other apps.
- Encryption at rest (documented as a limitation rather than pretended away).
- Gamification, reminders, notifications.

## 5. Scope (shipped in 1.0)

| Area | Requirement |
| --- | --- |
| Entry | Title (optional), body, date (optional, defaults to today), place, world (optional), links to objects, up to 6 photos |
| Worlds | Wealth / Health / Journey / Memories — each with a fixed line of copy and a live count |
| Timeline | Reverse-chronological, grouped by month, filter by world via URL |
| Explore | Four object kinds (person, place, thing, idea); create, rename by re-adding, remove; per-object entry list |
| Detail | Reading view, photo lightbox, edit, delete with confirmation |
| Profile | Language, appearance, export, restore, storage estimate, persistence status, privacy copy, replay intro |
| Offline | Installable PWA, full app shell precached, works with no network |
| Data | IndexedDB, export/import round-trip, photos embedded as base64 in the backup |

## 6. Acceptance criteria

- A first-time visitor sees the opening once per session and lands on Universe.
- Writing "今天很累" with no other field and pressing Save creates an entry that
  appears at the top of the Timeline and opens cleanly.
- Editing an entry preserves its photos; deleting asks first and cannot be undone.
- Photos survive a reload, and a restored backup reproduces entries, objects and
  images exactly.
- Every string exists in both languages; switching reloads no page.
- The app installs to an Android home screen, launches full-screen with the
  dark theme colour, and opens with the network disabled.
- No request leaves the origin other than the initial asset load.

## 7. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Browser evicts storage | Request persistence, show the status plainly, make export one tap |
| User clears site data | Privacy copy states it; backup is in the same panel |
| Device quota fills with photos | Downscale to 1600 px / 320 px, cap 6 per entry, reject > 20 MB |
| Loss of a single-device world | Export reminds; the README repeats it |
| iOS storage eviction (if used there) | Same copy; the app never promises otherwise |
