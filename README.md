# Visual Gallery

A responsive, multilingual image gallery built with vanilla HTML, CSS, and JavaScript.  
No frameworks, no build tools, no dependencies beyond Google Fonts.

---

## Features

| Feature | Detail |
|---|---|
| **Masonry layout** | Fluid multi-column grid via CSS `columns` — no JS layout engine |
| **Category filters** | Filter by Nature, Architecture, Portraits, Abstract |
| **Hover overlays** | Title + category reveal with animated gold underline |
| **Lightbox** | Full-screen viewer with prev / next navigation |
| **Keyboard support** | `←` `→` to navigate, `Esc` to close |
| **Lazy loading** | Images load only when they enter the viewport |
| **i18n (EN / IT)** | Auto-detects browser language; manual toggle in the header |
| **Language persistence** | User choice saved to `localStorage` across sessions |
| **Favicon** | SVG (modern browsers) + ICO 16/32/48 px (legacy browsers) |
| **Fully responsive** | 1 column on mobile → 4+ columns on wide screens |

---

## Project Structure

```
image-gallery/
├── index.html              → HTML structure, semantic markup, i18n hooks
│
├── css/
│   └── style.css           → All styles and design tokens
│
├── js/
│   ├── data.js             → Image data array (edit this to add your photos)
│   └── script.js           → All interactivity: i18n, filtering, lightbox
│
├── i18n/
│   ├── en.json             → English translations
│   └── it.json             → Italian translations
│
├── assets/
│   └── favicon/
│       ├── favicon.svg     → Vector favicon (modern browsers)
│       └── favicon.ico     → Raster favicon 16×16 / 32×32 / 48×48 (legacy)
│
└── README.md               → This file
```

---

## Getting Started

No installation or build step required.

> **Important:** the i18n system uses `fetch()` to load JSON files.  
> `fetch()` is blocked by browsers on the `file://` protocol.  
> Always serve the project through a local HTTP server.

```bash
# Option 1 — Python (built in on macOS / Linux / Windows with Python 3)
cd image-gallery
python3 -m http.server 8080
# → open http://localhost:8080

# Option 2 — VS Code Live Server extension
# Right-click index.html → "Open with Live Server"

# Option 3 — Node.js
npx serve .
```

---

## How i18n Works

```
startup
  └─ detectLanguage()
       1. localStorage key "gallery_lang"   ← user's saved choice
       2. navigator.language                ← browser / OS setting
       3. fallback → "en"
  └─ setLanguage(lang)
       └─ fetch("i18n/en.json")  or  fetch("i18n/it.json")
       └─ applyTranslations(t)
            └─ finds every [data-i18n="key"] element in the DOM
            └─ sets its textContent to the matching translation string
       └─ buildCards()   ← re-renders cards with translated titles
```

The **language toggle button** (top-right of the header) calls `setLanguage()` with the opposite language and saves the choice to `localStorage`.

---

## Adding Your Own Images

### 1. Add the image file

Place your photo anywhere reachable by the browser, e.g. an `images/` folder:

```
image-gallery/
└── images/
    └── my-photo.jpg
```

### 2. Register it in `js/data.js`

```js
{ id: 16, cat: "nature", src: "images/my-photo.jpg", w: 1200, h: 800 }
```

> `id` must be a unique integer. `w` and `h` should match the natural image dimensions — they prevent layout shift (CLS) before the image loads.

### 3. Add translated titles in both JSON files

**i18n/en.json** — add at position matching the `id`:
```json
{ "title": "My Photo Title" }
```

**i18n/it.json** — same position:
```json
{ "title": "Titolo della Mia Foto" }
```

---

## Adding a New Category

1. **Add a filter button** in `index.html`:

```html
<button class="filter-btn" data-filter="travel" data-i18n="filter-travel">Travel</button>
```

2. **Add the translation key** to both JSON files:

```json
"filterTravel": "Travel"   // en.json
"filterTravel": "Viaggio"  // it.json
```

3. **Apply the key** in `applyTranslations()` inside `js/script.js`:

```js
'filter-travel': t.filterTravel,
```

4. **Use the new category** in `js/data.js`:

```js
{ id: 17, cat: "travel", src: "images/santorini.jpg", w: 900, h: 600 }
```

---

## Customisation

All visual design tokens live in the `:root {}` block at the top of `css/style.css`:

```css
:root {
  --bg:    #0d0d0d;   /* page background */
  --gold:  #c9a84c;   /* accent colour   */
  --text:  #f0ede6;   /* primary text    */
  /* … */
}
```

Change these values to reskin the entire gallery instantly.

---

## Browser Support

Requires a local HTTP server (see Getting Started). Works in all modern browsers.

| Feature | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| CSS Masonry (`columns`) | ✅ | ✅ | ✅ | ✅ |
| `fetch()` + JSON i18n | ✅ | ✅ | ✅ | ✅ |
| `loading="lazy"` | ✅ | ✅ | ✅ | ✅ |
| SVG favicon | ✅ | ✅ | ✅ | ✅ |
| `backdrop-filter` | ✅ | ✅ | ✅ | ✅ |

---

## File Reference

### `index.html`
Semantic HTML5. Every translatable text node carries a `data-i18n="key"` attribute — `script.js` uses these to apply translations without touching the HTML structure.

### `css/style.css`
Organised into 12 commented sections. All colours and speeds are CSS variables in `:root`.

### `js/data.js`
Exports the `GALLERY_ITEMS` global array. Item titles are **not** stored here — they live in the JSON files to keep data and translations separate.

### `js/script.js`
Eight sections:
1. **i18n** — detect, load, apply, toggle
2. **DOM references** — cached selectors
3. **Gallery state** — `visibleItems`, `currentIndex`, `activeFilter`
4. **buildCards()** — renders cards from data + translations
5. **filterCards()** — shows / hides cards, rebuilds visible index
6. **Lightbox** — open / close / navigate
7. **Keyboard navigation** — Arrow keys + Escape
8. **Init** — async IIFE that calls `setLanguage()` on load

### `i18n/en.json` / `i18n/it.json`
Flat key-value objects plus an `items` array for image titles.  
Add a new language by creating a new JSON file and extending `SUPPORTED_LANGS` in `script.js`.

### `assets/favicon/favicon.svg`
Gold camera-aperture icon on a dark rounded background. Scales perfectly at any size.

### `assets/favicon/favicon.ico`
Multi-resolution ICO containing 16×16, 32×32, and 48×48 px frames. Generated with Python Pillow.

---

## License

MIT — free to use, modify, and distribute.
