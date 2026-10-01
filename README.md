# UTZLINE Sub Orders — installable app

**Current version: v9** (its own independent version line, separate from every other app in the family — bump this line, and add a dated entry below, every time a new build ships.)

**v9 (2026-10-01) — RC 1.0: code-only file names -- joinery codes, not descriptions, in every file and folder name (path-limit round, fourth build).**

- Andrew: *"have a real good think about how we can minimise filepaths, maybe we need to lose the joinery descriptions and just have joinery codes. give me a solid solution"* -- then *"I have no actual current files so dont care if I need to start again"*. Every folder and file kept for ONE joinery item is now named by the item's **file name** -- its joinery code (e.g. `JG.33.1`; a second item with the same code is `JG.33.1 (2)`), chosen once by UTZLINE Projects when the item is made or imported and saved on the item in `joinery-items.json` (`fileKey`), never changed afterwards -- instead of `<Level> - <Room> - <Code>` (64 characters for the pilot's `Ground Floor - G.33 - Change Cubical & Patient Consent - JG.33.1`). The level, room and description stay inside the records and `joinery-items.json`, so every screen still shows them.
- Records carry the author's **initials** and a two-digit-year stamp (`JG.33.1 -- AU - 26-10-01 16-25-35-281 - set.json`, in a level folder cut to 30 characters); imported files are **renamed** on the way in (the name they came in with is kept in the record or the `.json` beside the file and is what the screen shows). On the pilot's own folder (88 characters) the longest path is now 121 of the 163 the project folder leaves -- project folders up to about 130 characters deep work.
- **Clean break:** nothing is read under the old long names. Set the project up again in UTZLINE Projects (it gives every item its file name when the project is opened) -- the other apps pick the names up from `joinery-items.json`.
- Sub Orders: An item's orders file is `Orders/<code>.json`; a dropped file is saved as `Files/Order - <yyyy-mm-dd hh-mm-ss> - <code or first 8 of its id>.<ext>` (the original name stays in the order and is what the screen shows).

**v8 (2026-10-01, RC 1.0):** Light mode: the header still had its dark background hard-coded (Andrew: *"not all stuff changes to light mode"*); it follows the theme now.

**v7 (2026-09-30, RC 1.0):** Day / night mode (Andrew: *"give me day / noght mode for all apps"*). The shared `UtzTheme` module adds a sun / moon button to the header; the choice is kept in `localStorage` as `utzline-theme` and shared by every UTZLINE app on the device, defaulting to the device's own light / dark setting. A light palette was added for every colour the app uses. No data-format changes.

**v6 (2026-09-27):** Hides the **Schedule Backups** folder from the project list. Scheduler v29 now keeps its daily spreadsheet backups in that folder, directly in the main Projects folder (Andrew: *"a schedule backups folder directly in the main folder ... I meant in the main folder. Not the individual projects folder."*). Every app lists every folder in the main folder as a project, so each one now leaves that folder out: `isReservedRootFolderName`, the same one-line rule in every app. Tested across all 11 apps by `pdftest-projects/run_schedule_backups_folder_hidden.js`, which fails on every app's previous build and passes on the new ones.

**v5 (2026-09-27, same day) — bug fix: `setOrderReceived()` was dropping `typeLabel`.** Found while wiring "mark as received" into the other family apps' own new Sub orders cards (see `UTZLINE-Projects`, `UTZLINE-Scheduler` and the Site Measure/Viewer/ITP apps' own changelogs the same day). `setOrderReceived()`'s field allowlist predated `typeLabel` (v4), so ticking **Received** on any order in this app's own View Orders list silently reverted a custom order type's chip back to its raw storage key (e.g. `"glass"` instead of `"Glass"`) — visible here and in every downstream reader. Fixed to rebuild the record with a shallow copy (`Object.assign({}, o, {...})`) instead of an explicit field list, so no future field can be missed the same way again. No behaviour change to the receive/unreceive toggle itself. New assertion in `run_sub_orders_v1.js`: mark a custom-type order received, re-read it, confirm `typeLabel` survived. **Second fix in the same build (found while reviewing the other apps' writers):** `readAttachedOrders()` — the read behind every attach, unattach and mark-received — used to turn a file that exists but won't read or parse (Dropbox mid-sync, truncated) into an empty list, so the next write would have replaced every order on that item with just the one change. It now uses the strict reader this app already had (`readJsonArrayFileStrict`): a missing file still means "no orders yet", anything else retries once and then stops with "couldn't read this item's orders (still syncing?) — nothing was changed." Marking received on an order that was unattached from another device meanwhile now writes nothing too. Covered by two new checks in `run_sub_orders_v1.js` (a truncated file is left exactly as it was; a vanished order leaves the file untouched).

**v4 (2026-09-27, same day) — custom order types, saved supplier names.** Andrew, two follow-up requests: *"orders app, need to be able to add more sub catergories manually, but ensure no duplicates"* and, right after, *"and supplier names get saved, also no duplicates."*

- **Custom order types.** The Attach modal's Type select now has a trailing **"+ Add new type…"** option, opening a small prompt for a new category name. New types are stored root-level (`Projects/Sub Orders Types.json`, shared across every project — same precedent as `company-logo.png`), not per-project, since a subcontractor category is a fact about the business rather than one job.
- **No duplicates, by construction.** Every type name is slugified (lowercase, trimmed, non-alphanumeric collapsed to hyphens) into its storage key, so `"Glass"`, `"glass"` and `" Glass "` all resolve to the same key — a second, separate entry can never be created. Trying to add one that already exists (base or custom) just selects the existing match instead of erroring.
- **Colour.** A custom type deliberately gets **no new hue** — the base four already sit right at the `dataviz` validator's own documented colour-safety ceiling (see the v1 notes below) — so every custom type renders with one neutral chip style instead, identified by its text label alone.
- **Saved supplier names.** The Supplier field now autocompletes (via a `<datalist>`) from a root-level, deduped list (`Projects/Sub Orders Suppliers.json`). A successful attach saves that order's supplier name if it isn't already on the list (case/whitespace-insensitive match) — free typing is never blocked; the list only ever suggests previously-used names.
- New regression coverage for adding a custom type (including the duplicate-rejection path, base and custom, with case/whitespace variants), the type's neutral chip rendering, and the supplier autocomplete/dedup behaviour — all checks pass.

**v3 (2026-09-27, same day) — Levels/Rooms/Items hierarchy, "mark as received."** Andrew, two follow-up requests right after seeing v2: *"and the orders app needs the same folder hierachy (projects / levels / rooms / joinery items)"* and *"we also need to be able to mark it as recieved on the orders app."*

- **Navigation.** The project screen used to show every joinery item as one long, filterable, level/room-grouped list. It's now a proper drill-down — **Levels → Rooms → Items** — matching the exact same navigation every sibling app already uses (Site Measure/Viewer/ITP/UTZLINE Projects). The Order inbox stays on the Levels screen (the project's own landing screen), since a dropped file isn't tied to any level/room/item until it's attached to one. Each Levels/Rooms row shows how many rooms/items it contains and an order-count badge, same style as everywhere else in the app.
- **Consequence, on purpose:** the inbox and the item rows are no longer ever on the same screen together, so literal drag-and-drop of an inbox card onto an item row (the v1 desktop path) isn't physically possible any more — there's nothing to drag onto three screens away. The tap-select-then-tap-item fallback (already built in v1 for touchscreens, since native drag doesn't work well there either) is now the *only* way to attach a pending inbox order, and the select-bar is now a persistent bar (not tied to one screen) so it keeps reminding you what's selected while you drill down. Dropping a file straight from the OS onto an item row (v2) is unaffected.
- **Mark as received.** An already-attached order (View orders modal) now has a **Received** checkbox + date, same non-destructive toggle as Install ITP's own "Received back on site" rework checkbox — ticking auto-fills today's date (editable after), unticking clears both fields, and it can be flipped back and forth freely.
- New regression coverage for the Levels/Rooms/Items drill-down and the received toggle — all checks pass.

**v2 (2026-09-27, same day) — drag straight onto the joinery item.** Andrew asked, right after seeing v1: *"can we drag in straight onto the joinery item"* — v1 always needed a file to land in the Order inbox first, then be dragged (or tap-selected) onto an item as a second step. v2 adds a third path: drop a file directly from the OS onto a joinery item row and the **Attach order** dialog opens immediately for that item, no inbox step in between. Under the hood it's still the same write as any other drop — the file genuinely lands in the inbox first — so cancelling the dialog loses nothing; the file just sits in the inbox instead. Dropping several files onto one item opens the dialog for the first, and the rest wait in the inbox for their own turn. New regression coverage added to the same test file for this path (dropping onto an item directly, verified end-to-end against the real on-disk write) — all checks pass.

**v1 (2026-09-27) — first release.** Andrew, verbatim: *"we need a sub contractor orders app. where we can drag and drop orders into it, utilise the same menu style as all others, drag orders onto a joinery item and it asks what is it (steel, upholstery, timber, aluminium) and a required by date. this then attaches the order to the joinery item page. (build this app first before we add this to the others)"*

Read as two deliberately separate steps: this standalone app now, and — as a later, separate round, once this one is confirmed working — wiring the same drag-onto-a-joinery-item interaction into the other family apps' own joinery item pages (Site Measure/Viewer/ITP). That second step is **not built yet**, on purpose.

Scope settled via three clarifying questions before building:

- **"Drag and drop orders into it"** means dragging actual **files** (a PDF, photo, email export — whatever the order confirmation is) onto the app, which creates a pending order record from that file. Not an in-app form with no file involved.
- Attaching an order onto a joinery item **writes into the shared Projects-root folder** every other family app already reads/writes — not a separate store only this app can see — so the data is sitting on that item's own page, ready for the later cross-app round to read.
- Each order record captures: **type** (steel/upholstery/timber/aluminium — the four Andrew named), **required-by date**, **supplier/subcontractor name**, **PO/order number**, and **notes**. Cost/dollar value was considered and explicitly left out of v1.

### How it works

1. Open a project. Its **Order inbox** has a drop zone — drag an order file onto it (or use **+ Add order file** for a normal file picker) to add a pending order.
2. Drag that inbox card onto the joinery item it belongs to (or, on a touchscreen where native file drag isn't practical, **tap the card to select it**, then tap a joinery item row — a highlighted bar shows which file you're attaching). Either path opens the same **Attach order** dialog: type and required-by date are required; supplier, PO number and notes are optional.
3. Attaching writes the order onto that item's own page and clears it from the inbox. Each item shows an "N orders" badge — tap it (or the item, once it has orders) to see everything attached, open the original file, or **Unattach** an order (moves it back to the inbox — the file is kept, nothing is deleted). **Remove** on an inbox card, by contrast, is a real, permanent delete, since a file that was never attached to anything is very likely just a wrongly-dropped one.

### Data model / folder convention

Everything lives under each project's own folder, alongside every other app's data:

```
<Project>/Project Saves/UTZLINE Sub Orders/
  Inbox/<id>.json     -- pending orders, not yet attached to anything
  Files/<id>-<name>    -- the raw bytes of every dropped file (kept whether pending or attached)
  Orders/<Level> - <Room> - <JoineryId>.json
                       -- one JSON array per joinery item: every order ever attached to it
```

This is a brand-new folder with no legacy predecessor, so it always uses this one flat `"<Level> - <Room> - <JoineryId>.json"` naming — unlike Install ITP's rework files, there's no flat-vs-legacy branching to worry about here.

### Interaction notes

- **Native drag-and-drop** is the primary path on desktop (drag a file from the OS onto the inbox; drag an inbox card onto a joinery item row).
- Native drag doesn't work well on touchscreens, and this family's apps are also used on Android tablets onsite — so every drag path has a **tap-based fallback** that does exactly the same thing under the hood.
- The four order-type chips are colour-coded (steel/upholstery/timber/aluminium) but **always carry their text label too** — running the `dataviz` skill's own validator against the four fixed slots (`validate_palette.js "#3987e5,#d95926,#199e70,#c98500" --mode dark --surface "#241522" --pairs all`) fails past the 3rd slot (aluminium's yellow sits too close to upholstery's orange under simultaneous comparison). Rather than drop a category, every chip uses the skill's own documented exception: colour plus an always-present label, so identity never depends on colour alone.

### Own folder picker

Own IndexedDB (`utzline-sub-orders-db`), same remember-the-handle-and-reconnect pattern as every sibling app, requesting **"readwrite"** from the start (this app writes, unlike the read-only `$` Summary app).

### Tests

New app, so test coverage starts from v1: `pdftest-sub-orders/run_sub_orders_v1.js` exercises the real read/write pipeline end-to-end against an in-memory fake File System Access tree (supports `create:true`/`createWritable`, not just reads) — dropping real files via a synthetic `DataTransfer`, both the native-drag and tap-fallback attach paths, the exact JSON/file structure written to disk, unattach (order kept, moved to inbox) vs. remove (permanently deleted), and the Home screen's per-project "waiting" badge. All checks pass, 0 page errors; the project-detail, select, attach-modal and view-orders screens were also visually confirmed via screenshot.

Does not touch `source.html`, Site Measure, Viewer, Install ITP, Manufacture ITP, Delivery ITP, UTZLINE Projects, Scheduler, Machine Schedule, Solid Surface Schedule, or `$` Summary in any way — reads only `project-meta.json`/`joinery-items.json` (same as every reading sibling) and writes only its own new `Project Saves/UTZLINE Sub Orders/` folder, which no other app reads yet.
