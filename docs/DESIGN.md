# DESIGN — Evermore

## 1. Idea

Not a dashboard about a life — a **night sky** that happens to hold one.
Dark, quiet, sparse. Warm cream type, one cold blue accent, no decoration that
does not mean something. The interface should recede so the words stay.

References in spirit: an observatory at 2 a.m., a letterpress title page,
the constellation plate at the front of an old star atlas.

## 2. Palette (locked)

Six colours. Nothing outside this list is introduced anywhere in `src/`.

| Token | Hex | Use |
| --- | --- | --- |
| `void` | `#080D14` | Base surface, the night itself |
| `deep` | `#111827` | Raised surfaces: sheets, toasts, second appearance |
| `starlight` | `#E6D9B8` | Primary text, primary button fill |
| `eighth` | `#7EA6C6` | The single accent: active nav, focus ring, the eighth star |
| `dust` | `#A2A5AE` | Secondary text, labels, metadata |
| `divider` | `#29313D` | Hairlines, borders, scrollbar thumb |

Derived use is by opacity only (`text-dust/55`, `border-divider/60`), never by
new hue. Placeholder grey is `#6D727C`, permitted for placeholders and nothing
else.

**Appearance presets** swap one CSS variable, `--app-surface`:
`void` (default) and `deep`. Both are applied via `html[data-appearance]`, and
`theme-color` follows so the phone's status bar matches.

## 3. Typography

- Display: **Playfair Display Variable** — titles, month labels, the wordmark.
  Set with tracking between `0.01em` and `0.06em`; never bold, never all-caps
  except in the wordmark.
- Text: **Inter Variable** — body, labels, metadata. Body copy at 15 px with
  `line-height: 2.05` in reading views, because entries are read slowly.
- Micro-labels: 9.5–11 px, uppercase, tracking `0.18em`–`0.42em`, `dust`.
  This is the app's connective tissue: dates, worlds, counts.
- Numerals in metadata use `tabular-nums` so counts do not jitter.

## 4. Space and surface

- Content column: max 720 px, centred, 24 px gutters on phones, 48 px on
  desktop, 64 px top on desktop.
- Desktop adds a 228 px fixed left rail; phones get a 5-item bottom bar with
  `env(safe-area-inset-bottom)` padding. Nothing floats over content.
- Separation is a 1 px `divider` hairline, never a shadow. Shadows appear only
  on sheets and toasts, and are large, soft and almost invisible.
- Corners: `2px` on cards and buttons. Chips are the only fully round shape.

## 5. Motion

Everything is CSS or SVG animation; there is no animation library.

| Motion | Duration | Notes |
| --- | --- | --- |
| Intro: cluster settles, name arrives, hint fades in | 1.8 s / 1.6 s / 1.2 s | Sequenced at 0.42 s, 1.7 s, 3.3 s; auto-advances at 4.7 s |
| Star twinkle | 7 s loop | Per-star delays; the eighth star has a blue `drop-shadow` |
| Page fade | 0.9 s | `animate-fade`, applied once per screen |
| Sheet rise / toast rise | 0.8 s | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Hover / focus colour | 0.3 s | Line and colour only; no movement, no scale |

`prefers-reduced-motion: reduce` collapses every animation and transition to
0.001 ms — the intro still advances on its timers, it just does not animate.

## 6. The mark

Seven stars of the Great Bear, drawn as plain circles in `starlight`, plus an
**eighth** in `eighth` blue that belongs just as much. It appears in the
opening, the 404 page and the app icon; the eighth star is the only place the
accent colour is allowed to be purely decorative. Icons are generated from the
same coordinates by `scripts/make-icons.mjs`.

## 7. Components

| Component | Rule |
| --- | --- |
| `Button` | Four variants: `primary` (starlight fill), `ghost` (hairline), `quiet` (text only), `link` (underline). Uppercase 11.5 px, tracking `0.22em` |
| `Chip` / `MetaChip` | Round, hairline, 11.5 px. `active` uses `starlight/10` fill and an `starlight/40` border |
| `Field` | Borderless input on a single hairline that turns `eighth` on focus |
| `Sheet` | Bottom sheet on phones, centred dialog from `sm`. Escape and backdrop close it; body scroll is locked while open |
| `ConfirmDialog` | A `Sheet` with one sentence and Cancel / confirm |
| `EmptyState` | One display-font line and one optional sentence; no illustration |
| `Toast` | Bottom-centre, above the tab bar, 2.6 s, `aria-live="polite"` |
| `EntryCard` | Optional 68 px thumbnail, display title, two-line preview, meta line |

## 8. Screens

1. **Welcome** — night field, cluster, wordmark, tagline, "Tap anywhere to
   continue". Skippable; plays once per session.
2. **Universe** — "Your Universe" eyebrow, four worlds as hairline rows with
   their line of copy and a count.
3. **Timeline** — title, filter chips (All + four worlds), month headings on
   hairline rules, entry cards. Filter is in the URL (`?category=`).
4. **Create / Edit** — the question, an untitled body that grows with the text,
   a collapsed *Add details* panel (date, place, people, world, photos), Save.
   `⌘/Ctrl + Enter` saves. Editing prefills and keeps photos.
5. **Entry detail** — back link, meta line, display title, object chips, body
   at reading width, photo grid, quiet footer with Edit and Delete.
6. **Explore** — four kinds with a preview of names and a count.
7. **Explore kind** — list of objects with counts; opening one shows its name,
   its entries and a quiet Remove.
8. **Profile** — sections on hairlines: Language, Appearance, Data, Storage,
   Privacy, Account, About.
9. **Not found** — the cluster, one sentence, a way back.

## 9. Voice

Second person, present tense, short. Never congratulates, never nags, never
counts down. Empty states are invitations, not errors.

- "What would you like to remember?"
- "Write freely. Nothing is required."
- "Nothing here yet. Your story begins whenever you are ready."
- "It may have drifted off. The universe is still where you left it."

Chinese copy is written, not translated: 珍视，珍实 for the tagline, 循此苦旅，以达天际
for Journey. The two dictionaries must contain exactly the same keys — the type
system enforces it (`Record<MessageKey, string>`).

## 10. Accessibility

- Every interactive element is a real `button`, `a`, `label` or input.
- Focus is visible: 1 px `eighth` outline, 3 px offset, on `:focus-visible`.
- Contrast: `starlight` on `void` ≈ 12:1; `dust` on `void` ≈ 7:1. Micro-labels
  never carry more than a date or a count, and reading text never drops below
  `starlight/85` or `dust/70`.
- Sheets are `role="dialog"` with `aria-modal`, closed by Escape.
- Toasts announce politely; the intro is skippable by tap or key.
- Reduced motion is honoured globally.

