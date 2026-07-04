/* ==========================================================================
   js/data.js — Gallery Image Data
   --------------------------------------------------------------------------
   Defines the GALLERY_ITEMS array consumed by script.js.

   ITEM SCHEMA
   -----------
   Each object must have:
     id    {number}  — unique index, must match position in i18n/xx.json "items"
     cat   {string}  — category key; must match a data-filter value in index.html
                       Valid values: "nature" | "architecture" | "portraits" | "abstract"
     src   {string}  — image path (relative) or URL
     w     {number}  — natural image width  in px (prevents layout shift / CLS)
     h     {number}  — natural image height in px (prevents layout shift / CLS)

   NOTE: titles are NOT stored here — they live in i18n/en.json and i18n/it.json
   so they can be translated. The id links each item to its translated title.

   HOW TO ADD YOUR OWN IMAGES
   --------------------------
   1. Drop your photo in the project root (e.g. images/my-photo.jpg)
   2. Add an entry below with the correct cat, src, w, h
   3. Add a matching title object in both i18n/en.json and i18n/it.json
      (same array position as the id)
   ========================================================================== */

const GALLERY_ITEMS = [

  /* ── NATURE ────────────────────────────────────────────────────────────── */
  { id: 0,  cat: "nature",        src: "https://picsum.photos/seed/forest1/600/800", w: 600, h: 800 },
  { id: 1,  cat: "nature",        src: "https://picsum.photos/seed/sea3/600/400",    w: 600, h: 400 },
  { id: 2,  cat: "nature",        src: "https://picsum.photos/seed/mnt7/600/900",    w: 600, h: 900 },
  { id: 3,  cat: "nature",        src: "https://picsum.photos/seed/flo11/600/450",   w: 600, h: 450 },
  { id: 4,  cat: "nature",        src: "https://picsum.photos/seed/sun15/700/450",   w: 700, h: 450 },

  /* ── ARCHITECTURE ──────────────────────────────────────────────────────── */
  { id: 5,  cat: "architecture",  src: "https://picsum.photos/seed/arch2/700/500",   w: 700, h: 500 },
  { id: 6,  cat: "architecture",  src: "https://picsum.photos/seed/urban5/600/600",  w: 600, h: 600 },
  { id: 7,  cat: "architecture",  src: "https://picsum.photos/seed/arch10/500/700",  w: 500, h: 700 },
  { id: 8,  cat: "architecture",  src: "https://picsum.photos/seed/arch14/600/800",  w: 600, h: 800 },

  /* ── PORTRAITS ─────────────────────────────────────────────────────────── */
  { id: 9,  cat: "portraits",     src: "https://picsum.photos/seed/port4/500/700",   w: 500, h: 700 },
  { id: 10, cat: "portraits",     src: "https://picsum.photos/seed/port8/500/600",   w: 500, h: 600 },
  { id: 11, cat: "portraits",     src: "https://picsum.photos/seed/port12/500/650",  w: 500, h: 650 },
  { id: 12, cat: "portraits",     src: "https://picsum.photos/seed/port16/500/750",  w: 500, h: 750 },

  /* ── ABSTRACT ──────────────────────────────────────────────────────────── */
  { id: 13, cat: "abstract",      src: "https://picsum.photos/seed/abs6/700/500",    w: 700, h: 500 },
  { id: 14, cat: "abstract",      src: "https://picsum.photos/seed/abs9/700/400",    w: 700, h: 400 },
  { id: 15, cat: "abstract",      src: "https://picsum.photos/seed/abs13/700/700",   w: 700, h: 700 },
];
