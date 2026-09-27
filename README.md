# UTZLINE Sub Orders — installable app

**Current version: v1** (its own independent version line, separate from every other app in the family — bump this line, and add a dated entry below, every time a new build ships.)

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
