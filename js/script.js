/* ==========================================================================
   js/script.js — Visual Gallery — Main Logic
   --------------------------------------------------------------------------
   Responsibilities:
     1. i18n — detect language, load translations, apply to DOM, toggle
     2. Build card grid from GALLERY_ITEMS (js/data.js)
     3. Filter cards by category
     4. Lightbox — open / close / navigate (prev, next, keyboard)

   Load order (see index.html):
     js/data.js  →  js/script.js

   External dependencies: none (vanilla JS only)
   ========================================================================== */


/* ==========================================================================
   1. INTERNATIONALISATION (i18n)
   --------------------------------------------------------------------------
   Language resolution priority (highest → lowest):
     1. Value stored in localStorage ("gallery_lang")
     2. navigator.language — the browser / OS language
     3. Fallback: "en"

   Supported languages: "en" | "it"
   Translation files:   i18n/en.json | i18n/it.json
   ========================================================================== */

/** Key used to persist the user's language choice across sessions. */
const STORAGE_KEY = 'gallery_lang';

/** Languages supported by the app. */
const SUPPORTED_LANGS = ['en', 'it'];

/**
 * detectLanguage()
 * Returns the language code to use on startup.
 * Checks localStorage first, then navigator.language, then falls back to "en".
 * @returns {string} — "en" or "it"
 */
function detectLanguage() {
  // 1. Persisted user choice
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

  // 2. Browser / OS language (navigator.language returns e.g. "it-IT", "en-US")
  const browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

  // 3. Default
  return 'en';
}

/**
 * loadTranslations(lang)
 * Fetches the JSON translation file for the given language.
 * @param   {string} lang — "en" or "it"
 * @returns {Promise<Object>} — parsed translations object
 */
async function loadTranslations(lang) {
  const response = await fetch(`i18n/${lang}.json`);
  if (!response.ok) throw new Error(`Could not load i18n/${lang}.json`);
  return response.json();
}

/**
 * applyTranslations(t)
 * Updates every translatable DOM node using the loaded translations object.
 * Uses data-i18n attributes to identify elements.
 * @param {Object} t — translations object from the JSON file
 */
function applyTranslations(t) {
  // Map data-i18n key → translation string
  const map = {
    'site-label':          t.siteLabel,
    'site-title':          t.siteTitle,
    'site-title-em':       t.siteTitleEm,
    'filter-all':          t.filterAll,
    'filter-nature':       t.filterNature,
    'filter-architecture': t.filterArchitecture,
    'filter-portraits':    t.filterPortraits,
    'filter-abstract':     t.filterAbstract,
    'lb-close-label':      t.lbClose,
    'lb-prev-label':       t.lbPrev,
    'lb-next-label':       t.lbNext,
    'footer-text':         t.footerText,
  };

  // Apply textContent to every element with a matching data-i18n attribute
  Object.entries(map).forEach(([key, value]) => {
    document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => {
      el.textContent = value;
    });
  });

  // Update the lang toggle button label and aria-label
  const toggleBtn = document.getElementById('lang-toggle');
  if (toggleBtn) {
    toggleBtn.textContent  = t.langToggleLabel;
    toggleBtn.setAttribute('aria-label', t.langToggleLabel);
  }

  // Update the <html lang=""> attribute for accessibility / SEO
  document.documentElement.lang = currentLang;
}

/**
 * setLanguage(lang)
 * Full language switch: saves to localStorage, loads translations,
 * applies them to the DOM, then rebuilds the card grid with new titles.
 * @param {string} lang — "en" or "it"
 */
async function setLanguage(lang) {
  currentLang         = lang;
  localStorage.setItem(STORAGE_KEY, lang);

  currentTranslations = await loadTranslations(lang);
  applyTranslations(currentTranslations);

  // Rebuild cards so translated titles appear in overlays
  buildCards();
  filterCards(activeFilter);
}

/* Mutable state: current language and loaded translations */
let currentLang         = detectLanguage();
let currentTranslations = null;  // populated by setLanguage() on init


/* ==========================================================================
   2. DOM REFERENCES
   Cached once at startup to avoid repeated querySelector calls.
   ========================================================================== */

const galleryEl  = document.getElementById('gallery');   // masonry grid
const lightboxEl = document.getElementById('lightbox');  // overlay

/* Lightbox inner elements */
const lbImgEl   = document.getElementById('lb-img');
const lbTitleEl = document.getElementById('lb-title');
const lbCatEl   = document.getElementById('lb-cat');
const lbCloseEl = document.getElementById('lb-close');
const lbPrevEl  = document.getElementById('lb-prev');
const lbNextEl  = document.getElementById('lb-next');

/* Language toggle button */
const langToggleEl = document.getElementById('lang-toggle');


/* ==========================================================================
   3. GALLERY STATE
   ========================================================================== */

/**
 * visibleItems — indices (into GALLERY_ITEMS) of currently shown cards.
 * Rebuilt on every filter change and used by the lightbox for prev/next.
 */
let visibleItems = [];

/** currentIndex — position of the open image within visibleItems. */
let currentIndex = 0;

/** activeFilter — the currently selected category key ("all", "nature", …). */
let activeFilter = 'all';


/* ==========================================================================
   4. BUILD CARDS
   --------------------------------------------------------------------------
   Reads GALLERY_ITEMS (js/data.js) and the loaded translations to inject
   one .card element per item into the #gallery container.
   ========================================================================== */

/**
 * buildCards()
 * Clears and re-renders all card elements.
 * Called on init and every time the language changes.
 */
function buildCards() {
  galleryEl.innerHTML = '';

  GALLERY_ITEMS.forEach((item) => {

    /* Resolve the translated title for this item.
       Falls back to the item's id if translations aren't loaded yet. */
    const titleText = currentTranslations?.items?.[item.id]?.title ?? `#${item.id}`;

    /* --- Create card wrapper --- */
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'listitem');
    card.dataset.cat   = item.cat;   // used by filterCards()
    card.dataset.index = item.id;    // maps back to GALLERY_ITEMS

    /* --- Card inner HTML ---
         .card
           img               ← the photo (lazy-loaded)
           .card-overlay     ← hover overlay: category + title
           .card-tag         ← top-right category badge (on hover)
    */
    card.innerHTML = `
      <img
        src="${item.src}"
        alt="${titleText}"
        loading="lazy"
        width="${item.w}"
        height="${item.h}"
      />
      <div class="card-overlay">
        <span class="card-cat">${item.cat}</span>
        <span class="card-title">${titleText}</span>
      </div>
      <span class="card-tag">${item.cat}</span>
    `;

    /* Open lightbox when the card is clicked */
    card.addEventListener('click', () => openLightbox(item.id));

    galleryEl.appendChild(card);
  });
}


/* ==========================================================================
   5. FILTER CARDS
   --------------------------------------------------------------------------
   Shows / hides cards by toggling the .hidden CSS class.
   Rebuilds visibleItems for the lightbox after every filter change.
   ========================================================================== */

/**
 * filterCards(cat)
 * @param {string} cat — category to show, or "all" to show everything
 */
function filterCards(cat) {
  activeFilter = cat;
  visibleItems = [];

  document.querySelectorAll('.card').forEach(card => {
    const matches = (cat === 'all') || (card.dataset.cat === cat);

    if (matches) {
      card.classList.remove('hidden');
      // Store the original item id so lightbox can look up the right item
      visibleItems.push(parseInt(card.dataset.index, 10));
    } else {
      card.classList.add('hidden');
    }
  });
}

/* Wire up filter buttons */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active pill style
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    filterCards(btn.dataset.filter);
  });
});


/* ==========================================================================
   6. LIGHTBOX
   --------------------------------------------------------------------------
   Opens a full-screen overlay with the enlarged image.
   Supports prev / next navigation within the currently visible set.
   ========================================================================== */

/**
 * openLightbox(itemId)
 * @param {number} itemId — id of the clicked item in GALLERY_ITEMS
 */
function openLightbox(itemId) {
  // Find position inside the currently visible subset
  currentIndex = visibleItems.indexOf(itemId);
  if (currentIndex === -1) currentIndex = 0;

  showLightboxItem();

  lightboxEl.classList.add('open');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

/**
 * showLightboxItem()
 * Swaps image, title, and category label for the current index.
 */
function showLightboxItem() {
  const id   = visibleItems[currentIndex];
  const item = GALLERY_ITEMS[id];
  const titleText = currentTranslations?.items?.[id]?.title ?? `#${id}`;

  lbImgEl.src           = item.src;
  lbImgEl.alt           = titleText;
  lbTitleEl.textContent = titleText;
  lbCatEl.textContent   = item.cat;
}

/**
 * closeLightbox()
 * Hides the overlay and re-enables body scroll.
 */
function closeLightbox() {
  lightboxEl.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * goToPrev() — navigate to the previous image (wraps around).
 */
function goToPrev() {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  showLightboxItem();
}

/**
 * goToNext() — navigate to the next image (wraps around).
 */
function goToNext() {
  currentIndex = (currentIndex + 1) % visibleItems.length;
  showLightboxItem();
}

/* Lightbox button events */
lbCloseEl.addEventListener('click', closeLightbox);
lbPrevEl.addEventListener('click',  goToPrev);
lbNextEl.addEventListener('click',  goToNext);

/* Click on the dark backdrop (outside lb-inner) closes the lightbox */
lightboxEl.addEventListener('click', event => {
  if (event.target === lightboxEl) closeLightbox();
});


/* ==========================================================================
   7. KEYBOARD NAVIGATION
   Active only while the lightbox is open.
     Escape     → close
     ArrowLeft  → previous image
     ArrowRight → next image
   ========================================================================== */

document.addEventListener('keydown', event => {
  if (!lightboxEl.classList.contains('open')) return;

  switch (event.key) {
    case 'Escape':     closeLightbox(); break;
    case 'ArrowLeft':  goToPrev();      break;
    case 'ArrowRight': goToNext();      break;
  }
});


/* ==========================================================================
   8. LANGUAGE TOGGLE
   Clicking the toggle button switches between "en" and "it".
   ========================================================================== */

if (langToggleEl) {
  langToggleEl.addEventListener('click', () => {
    // Flip between the two supported languages
    const nextLang = currentLang === 'en' ? 'it' : 'en';
    setLanguage(nextLang);
  });
}


/* ==========================================================================
   INIT — Runs on page load
   ========================================================================== */

(async () => {
  // Load translations for the detected language and render everything
  await setLanguage(currentLang);
})();
