// UTZLINE Sub Orders offline service worker.
//
// This is a NEW, SEPARATE, standalone app in the UTZLINE family --
// requested directly by Andrew (2026-09-27): "we need a sub contractor
// orders app. where we can drag and drop orders into it, utilise the
// same menu style as all others, drag orders onto a joinery item and it
// asks what is it (steel, upholstery, timber, aluminium) and a required
// by date. this then attaches the order to the joinery item page. (build
// this app first before we add this to the others)" -- so this app is
// step one of a two-step plan: a standalone place to log and attach
// subcontractor orders, with drag-and-drop into the other family apps
// (Site Measure/Viewer/ITP joinery item pages) as a later, separate
// round once this is confirmed working.
//
// v1 (2026-09-27): first release.
//   - Drag an order file (PDF/photo/email export/anything) onto the
//     app's "Order inbox" drop zone (or use the "+ Add order file"
//     button) to create a pending, unattached order in that project's
//     inbox.
//   - Drag an inbox order card onto a joinery item row (or, on a
//     touchscreen where native file drag isn't practical, tap the card
//     to select it, then tap a joinery item row) to attach it -- a modal
//     asks for the order type (steel/upholstery/timber/aluminium,
//     required), a required-by date (required), supplier/subcontractor
//     name, PO/order number and notes (all three optional).
//   - Attaching WRITES into the shared Projects-root folder every other
//     family app already reads/writes, under each project's own
//     `Project Saves/UTZLINE Sub Orders/` folder -- Inbox/ (pending,
//     unattached orders), Files/ (the raw dropped file bytes) and
//     Orders/ (one JSON array per joinery item, keyed by
//     "<Level> - <Room> - <JoineryId>.json", holding every order
//     attached to that item). This is a brand-new folder with no legacy
//     predecessor, so it always uses this one flat naming convention --
//     no isFlatProject branching needed the way Install ITP's rework
//     files need it.
//   - "Unattach" on a viewed order moves it back to the inbox (the file
//     is kept, nothing is silently deleted) rather than a permanent
//     delete, matching this family's usual non-destructive-correction
//     convention (reworks are "closed" not deleted; ITP entries are
//     forward-only).
//   - Own folder picker + IndexedDB persistence
//     ("utzline-sub-orders-db"), "readwrite" mode from the start (unlike
//     the read-only $ Summary app) since attaching an order is a write.
//   - Same header/menu visual language as every sibling app -- own
//     accent color (magenta/rose, #d1408f, the one hue not already used
//     by a sibling app).
//
// Does NOT touch source.html, Site Measure, Viewer, Install ITP,
// Manufacture ITP, Delivery ITP, Projects, Scheduler, Machine Schedule,
// Solid Surface Schedule, or $ Summary in any way -- this app only reads
// project-meta.json/joinery-items.json and writes its own new
// `Project Saves/UTZLINE Sub Orders/` folder, which no other app reads
// yet (that integration is the deliberately separate next round Andrew
// asked for).
//
// v2 (2026-09-27, same day): "can we drag in straight onto the joinery
// item" -- added a third path alongside the inbox-then-attach flow:
// drop a file directly from the OS onto a joinery item row and the
// Attach order dialog opens immediately, no inbox step in between
// (though the file still lands in the inbox for real under the hood, so
// cancelling the dialog loses nothing).
var ICON_VERSION = "v1";
var CACHE_NAME = "utzline-sub-orders-cache-v2";

var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json?v=" + ICON_VERSION,
  "./icons/icon-192.png?v=" + ICON_VERSION,
  "./icons/icon-512.png?v=" + ICON_VERSION,
  "./icons/icon-192-maskable.png?v=" + ICON_VERSION,
  "./icons/icon-512-maskable.png?v=" + ICON_VERSION
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(PRECACHE_URLS);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event){
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      var networkFetch = fetch(event.request).then(function(response){
        if (response && response.status === 200){
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        }
        return response;
      }).catch(function(){
        return cached;
      });
      return cached || networkFetch;
    })
  );
});
