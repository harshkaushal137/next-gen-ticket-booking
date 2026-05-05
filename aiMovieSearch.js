/**
 * ================================================================
 *  aiMovieSearch.js  — Frontend AI Movie Search Module
 *  PrepMyShow × Journey to Smile Cabs
 * ----------------------------------------------------------------
 *  Drop this file next to script.js and add to index.html:
 *    <script src="aiMovieSearch.js"></script>
 *  (AFTER script.js and AFTER GSAP CDN)
 *
 *  This module:
 *    • Hooks into your existing APP state (reads APP.city)
 *    • Calls your backend /api/movies/search
 *    • Renders results with GSAP stagger entrance animations
 *    • Handles blocked queries, errors, loading states
 *    • Provides openAIMovieDetails() to fetch & show full detail
 * ================================================================
 */

'use strict';

/* ── Config ────────────────────────────────────────────────────────────────── */
const AI_SEARCH_CONFIG = {
  // Use local backend during development, and relative path when served from the same host.
  API_BASE: (() => {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:3001/api/movies';
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api/movies';
    }
    return 'https://web-production-e76af.up.railway.app/api/movies';
  })(),

  STAGGER_DELAY  : 0.08,
  CARD_DURATION  : 0.45,
  EXIT_DURATION  : 0.25,
  DEBOUNCE_MS    : 600,
};


/* ── State ─────────────────────────────────────────────────────────────────── */
const AI_SEARCH_STATE = {
  loading      : false,
  lastQuery    : '',
  results      : [],
  debounceTimer: null,
};


/* ══════════════════════════════════════════════════════════════
   INIT — call once after DOM is ready
   Attaches search box listeners and injects the results container
══════════════════════════════════════════════════════════════ */
function initAIMovieSearch() {
  // ── Inject search UI into your dashboard if not already present ──
  injectSearchUI();

  // ── Wire up search input ─────────────────────────────────────────
  const input = document.getElementById('ai-search-input');
  const btn   = document.getElementById('ai-search-btn');

  if (!input || !btn) {
    console.warn('[aiMovieSearch] Search input/button not found. Ensure injectSearchUI() ran.');
    return;
  }

  // Search on button click
  btn.addEventListener('click', () => triggerSearch(input.value));

  // Search on Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') triggerSearch(input.value);
  });

  // Debounced "search as you type" (optional — remove if not desired)
  input.addEventListener('input', () => {
    clearTimeout(AI_SEARCH_STATE.debounceTimer);
    if (input.value.length < 3) return; // don't fire on very short strings
    AI_SEARCH_STATE.debounceTimer = setTimeout(
      () => triggerSearch(input.value),
      AI_SEARCH_CONFIG.DEBOUNCE_MS
    );
  });

  console.log('[aiMovieSearch] Initialized ✅');
}


/* ══════════════════════════════════════════════════════════════
   INJECT SEARCH UI
   Creates the search bar + results container in the dashboard.
   Looks for an element with id="ai-search-mount" — if it doesn't
   exist, appends after the hero slideshow section.
══════════════════════════════════════════════════════════════ */
function injectSearchUI() {
  if (document.getElementById('ai-search-section')) return; // already injected

  const mountPoint =
    document.getElementById('ai-search-mount') ||
    document.querySelector('.hero-section') ||
    document.querySelector('.dashboard-main') ||
    document.body;

  const section = document.createElement('section');
  section.id        = 'ai-search-section';
  section.className = 'ai-search-section px-6 py-6';
  section.innerHTML = `
    <div class="ai-search-header">
      <h2 class="ai-search-title">
        <span class="ai-spark">✨</span>
        AI Movie Search
        <span class="ai-badge">Powered by Gemini</span>
      </h2>
      <p class="ai-search-subtitle">
        Describe a movie, type a title, or say something like
        <em>"a movie about a robot falling in love"</em>
      </p>
    </div>

    <div class="ai-search-bar-wrap">
      <div class="ai-search-bar">
        <span class="ai-search-icon">🔍</span>
        <input
          id="ai-search-input"
          type="text"
          class="ai-search-input"
          placeholder="e.g. &quot;magical train to wizard school&quot; or &quot;Inception&quot;"
          autocomplete="off"
          maxlength="300"
        />
        <button id="ai-search-btn" class="ai-search-submit-btn">
          <span class="ai-btn-text">Search</span>
          <span class="ai-btn-loader hidden">⟳</span>
        </button>
      </div>
    </div>

    <!-- Status bar: shows "Gemini interpreted as: ..." -->
    <div id="ai-search-status" class="ai-search-status hidden"></div>

    <!-- Results grid -->
    <div id="ai-results-grid" class="ai-results-grid"></div>

    <!-- Empty / error state -->
    <div id="ai-results-empty" class="ai-results-empty hidden"></div>
  `;

  // Insert AFTER mount point when possible. If the mount point is document.body,
  // append inside body to avoid invalid DOM placement.
  if (mountPoint === document.body) {
    document.body.appendChild(section);
  } else {
    mountPoint.insertAdjacentElement('afterend', section);
  }
}


/* ══════════════════════════════════════════════════════════════
   TRIGGER SEARCH  — main entry point
══════════════════════════════════════════════════════════════ */
async function triggerSearch(rawQuery) {
  const query = (rawQuery || '').trim();

  if (!query) {
    showSearchEmpty('Please type something to search 🎬');
    return;
  }
  if (query === AI_SEARCH_STATE.lastQuery) return; // same query, skip
  if (AI_SEARCH_STATE.loading) return;

  AI_SEARCH_STATE.lastQuery = query;
  setSearchLoading(true);
  clearResults();
  hideStatus();

  try {
    const data = await callSearchAPI(query);

    if (data.status === 'blocked') {
      setSearchLoading(false);
      showSearchEmpty(data.message, 'blocked');
      return;
    }

    if (data.status !== 'success') {
      throw new Error(data.message || 'Unexpected response from server.');
    }

    // Show what Gemini interpreted the query as
    if (data.query.interpreted && data.query.interpreted !== query) {
      showStatus(data.query);
    }

    AI_SEARCH_STATE.results = data.results;
    setSearchLoading(false);

    if (data.results.length === 0) {
      showSearchEmpty(`No movies found for "${data.query.interpreted}". Try a different description.`);
      return;
    }

    renderResults(data.results);

  } catch (err) {
    console.error('[aiMovieSearch] Search error:', err);
    setSearchLoading(false);
    showSearchEmpty('⚠️ Could not connect to the server. Is the backend running?', 'error');
  }
}


/* ══════════════════════════════════════════════════════════════
   API CALL
══════════════════════════════════════════════════════════════ */
async function callSearchAPI(query) {
  const res = await fetch(`${AI_SEARCH_CONFIG.API_BASE}/search`, {
    method  : 'POST',
    headers : { 'Content-Type': 'application/json' },
    body    : JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}


/* ══════════════════════════════════════════════════════════════
   RENDER RESULTS  — with GSAP stagger animation
══════════════════════════════════════════════════════════════ */
function renderResults(movies) {
  const grid = document.getElementById('ai-results-grid');
  if (!grid) return;

  grid.innerHTML = ''; // clear existing

  movies.forEach((movie, i) => {
    const card = buildMovieCard(movie, i);
    grid.appendChild(card);
  });

  const cards = grid.querySelectorAll('.ai-movie-card');

  // GSAP stagger entrance
  if (window.gsap) {
    gsap.fromTo(
      cards,
      {
        opacity  : 0,
        y        : 40,
        scale    : 0.92,
      },
      {
        opacity  : 1,
        y        : 0,
        scale    : 1,
        duration : AI_SEARCH_CONFIG.CARD_DURATION,
        ease     : 'power3.out',
        stagger  : {
          amount : AI_SEARCH_CONFIG.STAGGER_DELAY * movies.length,
          from   : 'start',   // cards fly in left → right
        },
        clearProps: 'transform', // clean up after animation
      }
    );
  } else {
    // No GSAP fallback — just show them
    cards.forEach(c => { c.style.opacity = '1'; });
  }
}


/* ── Build a single movie card DOM element ─────────────────────────────────── */
function buildMovieCard(movie, index) {
  const card = document.createElement('div');
  card.className    = 'ai-movie-card';
  card.style.opacity = '0'; // hidden until GSAP animates it in
  card.dataset.tmdbId = movie.tmdbId;

  const stars    = ratingToStars(movie.rating);
  const yearTag  = movie.year ? `<span class="ai-card-year">${movie.year}</span>` : '';
  const langTag  = movie.language ? `<span class="ai-card-lang">${movie.language.toUpperCase()}</span>` : '';
  const ratingEl = movie.rating
    ? `<span class="ai-card-rating">${stars} ${movie.rating}/10</span>`
    : '';
  const overview = movie.overview?.length > 120
    ? movie.overview.slice(0, 120) + '…'
    : (movie.overview || '');

  card.innerHTML = `
    <div class="ai-card-poster-wrap">
      <img
        src="${movie.posterURL}"
        alt="${escapeHTML(movie.title)} poster"
        class="ai-card-poster"
        loading="${index < 3 ? 'eager' : 'lazy'}"
        onerror="this.src='https://placehold.co/500x750/111118/facc15?text=No+Poster'"
      />
      <div class="ai-card-poster-overlay">
        <button class="ai-card-book-btn" onclick="aiBookMovie(${movie.tmdbId})">
          🎟️ Book Now
        </button>
        <button class="ai-card-detail-btn" onclick="openAIMovieDetails(${movie.tmdbId})">
          ℹ️ Details
        </button>
      </div>
    </div>
    <div class="ai-card-info">
      <div class="ai-card-tags">${yearTag}${langTag}</div>
      <h3 class="ai-card-title">${escapeHTML(movie.title)}</h3>
      ${ratingEl}
      <p class="ai-card-overview">${escapeHTML(overview)}</p>
    </div>
  `;

  // Hover animation via GSAP
  if (window.gsap) {
    card.addEventListener('mouseenter', () =>
      gsap.to(card, { y: -6, scale: 1.02, duration: 0.2, ease: 'power2.out' })
    );
    card.addEventListener('mouseleave', () =>
      gsap.to(card, { y: 0,  scale: 1,    duration: 0.2, ease: 'power2.out' })
    );
  }

  return card;
}


/* ══════════════════════════════════════════════════════════════
   OPEN FULL MOVIE DETAILS  (modal or navigate to detail screen)
══════════════════════════════════════════════════════════════ */
async function openAIMovieDetails(tmdbId) {
  try {
    const res = await fetch(`${AI_SEARCH_CONFIG.API_BASE}/${tmdbId}`);
    const data = await res.json();

    if (data.status !== 'success') {
      showToast?.('❌ Could not load movie details.');
      return;
    }

    renderMovieDetailModal(data.movie);
  } catch (err) {
    console.error('[aiMovieSearch] openAIMovieDetails error:', err);
    showToast?.('❌ Failed to load movie details. Check connection.');
  }
}


/* ── Movie detail modal ─────────────────────────────────────────────────────── */
function renderMovieDetailModal(movie) {
  document.getElementById('ai-detail-modal')?.remove();

  const modal = document.createElement('div');
  modal.id        = 'ai-detail-modal';
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';

  const genres  = (movie.genres || []).join(' · ');
  const cast    = (movie.cast || []).map(c =>
    `<div class="ai-cast-chip"><img src="${c.photo}" onerror="this.src='https://placehold.co/60x60/111118/facc15?text=?'" /><span>${c.name}</span></div>`
  ).join('');

  modal.innerHTML = `
    <div class="modal-box ai-detail-box">
      <button class="modal-close-btn" onclick="closeAIDetailModal()">✕</button>

      <!-- Backdrop -->
      ${movie.backdropURL
        ? `<div class="ai-detail-backdrop" style="background-image:url('${movie.backdropURL}')"></div>`
        : ''}

      <div class="ai-detail-body">
        <!-- Poster + info column -->
        <div class="ai-detail-left">
          <img src="${movie.posterSet?.standard || movie.posterURL}"
               class="ai-detail-poster"
               onerror="this.src='https://placehold.co/300x450/111118/facc15?text=No+Poster'" />
          <button class="btn-primary mt-3 w-full" onclick="aiBookMovie(${movie.tmdbId})">
            🎟️ Book Tickets
          </button>
          ${movie.trailerURL
            ? `<a href="${movie.trailerURL}" target="_blank" rel="noopener"
                 class="btn-ghost mt-2 w-full text-center block">▶ Watch Trailer</a>`
            : ''}
        </div>

        <!-- Info column -->
        <div class="ai-detail-right">
          <h2 class="ai-detail-title">${escapeHTML(movie.title)}</h2>
          ${movie.tagline ? `<p class="ai-detail-tagline">"${escapeHTML(movie.tagline)}"</p>` : ''}

          <div class="ai-detail-meta">
            ${movie.year       ? `<span>📅 ${movie.year}</span>` : ''}
            ${movie.runtime    ? `<span>⏱ ${movie.runtime} min</span>` : ''}
            ${movie.rating     ? `<span>⭐ ${movie.rating}/10 (${movie.voteCount?.toLocaleString()} votes)</span>` : ''}
            ${movie.certification ? `<span>🔖 ${movie.certification}</span>` : ''}
          </div>

          ${genres ? `<p class="ai-detail-genres">${genres}</p>` : ''}

          <p class="ai-detail-overview">${escapeHTML(movie.overview || '')}</p>

          ${movie.director ? `<p class="ai-detail-director">🎬 Directed by <strong>${movie.director.name}</strong></p>` : ''}

          ${cast ? `<div class="ai-cast-row">${cast}</div>` : ''}
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);

  if (window.gsap) {
    gsap.fromTo('.ai-detail-box',
      { opacity: 0, scale: 0.88, y: 30 },
      { opacity: 1, scale: 1,    y: 0,  duration: 0.4, ease: 'back.out(1.5)' }
    );
  }
}

function closeAIDetailModal() {
  const modal = document.getElementById('ai-detail-modal');
  if (!modal) return;
  if (window.gsap) {
    gsap.to('.ai-detail-box', {
      opacity: 0, scale: 0.9, y: 20, duration: 0.25,
      onComplete: () => modal.remove()
    });
  } else {
    modal.remove();
  }
}

/* Close modal on backdrop click */
document.addEventListener('click', (e) => {
  if (e.target?.id === 'ai-detail-modal') closeAIDetailModal();
});


/* ══════════════════════════════════════════════════════════════
   BOOK MOVIE from AI results
   Bridges into your existing APP / goToScreen flow
══════════════════════════════════════════════════════════════ */
async function aiBookMovie(tmdbId) {
  try {
    const res  = await fetch(`${AI_SEARCH_CONFIG.API_BASE}/${tmdbId}`);
    const data = await res.json();
    if (data.status !== 'success') throw new Error('Failed to load movie');

    const m = data.movie;

    // Bridge into your existing openMovieBooking() from script.js
    if (typeof openMovieBooking === 'function') {
      closeAIDetailModal();
      openMovieBooking({
        title   : m.title,
        format  : m.runtime ? `${m.runtime} min` : '2D',
        rating  : m.rating,
        poster  : m.posterURL,
        tmdbId  : m.tmdbId,
        overview: m.overview,
      });
    } else {
      showToast?.(`🎟️ Booking: ${m.title}`);
    }
  } catch (err) {
    console.error('[aiMovieSearch] aiBookMovie error:', err);
    showToast?.('❌ Could not start booking. Try again.');
  }
}


/* ══════════════════════════════════════════════════════════════
   UI HELPERS
══════════════════════════════════════════════════════════════ */
function setSearchLoading(isLoading) {
  AI_SEARCH_STATE.loading = isLoading;
  const btn    = document.getElementById('ai-search-btn');
  const loader = btn?.querySelector('.ai-btn-loader');
  const text   = btn?.querySelector('.ai-btn-text');
  const input  = document.getElementById('ai-search-input');

  if (!btn) return;

  if (isLoading) {
    btn.disabled    = true;
    loader?.classList.remove('hidden');
    text?.classList.add('hidden');
    input && (input.disabled = true);

    // GSAP spinner rotation
    if (window.gsap && loader) {
      gsap.to(loader, { rotation: 360, repeat: -1, duration: 0.7, ease: 'none' });
    }
  } else {
    btn.disabled = false;
    loader?.classList.add('hidden');
    text?.classList.remove('hidden');
    input && (input.disabled = false);
    if (window.gsap && loader) gsap.killTweensOf(loader);
  }
}

function clearResults() {
  const grid  = document.getElementById('ai-results-grid');
  const empty = document.getElementById('ai-results-empty');
  if (!grid) return;

  const existing = grid.querySelectorAll('.ai-movie-card');
  if (existing.length > 0 && window.gsap) {
    gsap.to(existing, {
      opacity : 0,
      y       : -20,
      stagger : 0.03,
      duration: AI_SEARCH_CONFIG.EXIT_DURATION,
      onComplete: () => { grid.innerHTML = ''; }
    });
  } else {
    grid.innerHTML = '';
  }

  if (empty) { empty.classList.add('hidden'); empty.innerHTML = ''; }
}

function showStatus(queryInfo) {
  const status = document.getElementById('ai-search-status');
  if (!status) return;
  status.innerHTML = `
    <span class="ai-status-icon">🤖</span>
    Gemini interpreted your search as:
    <strong>"${escapeHTML(queryInfo.interpreted)}"</strong>
    ${queryInfo.year ? `(${queryInfo.year})` : ''}
    <span class="ai-status-confidence ai-confidence-${queryInfo.confidence}">
      ${queryInfo.confidence} confidence
    </span>`;
  status.classList.remove('hidden');

  if (window.gsap) {
    gsap.fromTo(status, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.35 });
  }
}

function hideStatus() {
  const status = document.getElementById('ai-search-status');
  status?.classList.add('hidden');
}

function showSearchEmpty(message, type = 'info') {
  const empty = document.getElementById('ai-results-empty');
  if (!empty) return;

  const icons = { info: 'ℹ️', blocked: '🚫', error: '⚠️' };
  empty.innerHTML = `
    <div class="ai-empty-icon">${icons[type] || 'ℹ️'}</div>
    <p>${escapeHTML(message)}</p>`;
  empty.classList.remove('hidden');
  empty.dataset.type = type;

  if (window.gsap) {
    gsap.fromTo(empty, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3 });
  }
}

/* ── Utilities ──────────────────────────────────────────────────────────────── */
function ratingToStars(rating) {
  if (!rating) return '';
  const filled = Math.round(rating / 2);
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* ══════════════════════════════════════════════════════════════
   AUTO-INIT on DOMContentLoaded
   Remove this block if you want to call initAIMovieSearch()
   manually from your own script.js DOMContentLoaded handler.
══════════════════════════════════════════════════════════════ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAIMovieSearch);
} else {
  initAIMovieSearch();
}


/* ── Expose to global scope for onclick= attributes ────────────────────────── */
window.triggerSearch        = triggerSearch;
window.openAIMovieDetails   = openAIMovieDetails;
window.closeAIDetailModal   = closeAIDetailModal;
window.aiBookMovie          = aiBookMovie;
window.initAIMovieSearch    = initAIMovieSearch;