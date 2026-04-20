/* ═══════════════════════════════════════════════════════════
   PREP MYSHOW — COMPLETE SPA LOGIC
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─────────────────────── DATA ───────────────────────
const MOVIES = [
  { id: 1, title: "Dune: Part Two", img: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg", rating: "9.1", genre: "Sci-Fi", price: 380 },
  { id: 2, title: "Oppenheimer", img: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", rating: "8.8", genre: "Drama", price: 340 },
  { id: 3, title: "Avengers: Secret Wars", img: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", rating: "8.5", genre: "Action", price: 420 },
  { id: 4, title: "Deadpool & Wolverine", img: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", rating: "8.2", genre: "Action", price: 360 },
  { id: 5, title: "Inside Out 2", img: "https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg", rating: "7.9", genre: "Animation", price: 300 },
  { id: 6, title: "Godzilla x Kong", img: "https://image.tmdb.org/t/p/w500/tMefBSflR6PGQLv7WvFPpef0YAp.jpg", rating: "7.5", genre: "Action", price: 350 },
  { id: 7, title: "Civil War", img: "https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg", rating: "7.8", genre: "Thriller", price: 320 },
  { id: 8, title: "Kingdom of the Planet", img: "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg", rating: "7.6", genre: "Sci-Fi", price: 340 },
  { id: 9, title: "Alien: Romulus", img: "https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg", rating: "7.4", genre: "Horror", price: 330 },
  { id: 10, title: "Twisters", img: "https://image.tmdb.org/t/p/w500/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg", rating: "7.1", genre: "Action", price: 290 },
  { id: 11, title: "Furiosa", img: "https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg", rating: "7.9", genre: "Action", price: 360 },
  { id: 12, title: "A Quiet Place: Day One", img: "https://image.tmdb.org/t/p/w500/yrpPYKijwdMHyTGIOd1iK1h0Xno.jpg", rating: "7.3", genre: "Horror", price: 310 },
];

const STREAM_DATA = [
  { id: 101, title: "The Bear — Season 3", img: "https://image.tmdb.org/t/p/w500/sHFlbKS3WLqMnp9t2GdtRCC3Dkb.jpg", rating: "9.2", genre: "Drama", price: 199 },
  { id: 102, title: "Shogun", img: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1agbN.jpg", rating: "9.0", genre: "Historical", price: 199 },
  { id: 103, title: "3 Body Problem", img: "https://image.tmdb.org/t/p/w500/3bHp5cbkZKnpGBeMiLqiTfBlXEP.jpg", rating: "8.4", genre: "Sci-Fi", price: 199 },
  { id: 104, title: "Fallout", img: "https://image.tmdb.org/t/p/w500/AnsSKR1cnFmQBJpIR9G2M7F0vay.jpg", rating: "8.5", genre: "Sci-Fi", price: 199 },
  { id: 105, title: "House of the Dragon S2", img: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg", rating: "8.3", genre: "Fantasy", price: 199 },
  { id: 106, title: "The Rings of Power S2", img: "https://image.tmdb.org/t/p/w500/mYLOqiStMxDK3fYZFirgrMt8z5d.jpg", rating: "7.6", genre: "Fantasy", price: 199 },
  { id: 107, title: "Severance S2", img: "https://image.tmdb.org/t/p/w500/lE5E6rcq59LlFMDKs1DG6IjZfHi.jpg", rating: "8.8", genre: "Thriller", price: 199 },
  { id: 108, title: "Slow Horses S4", img: "https://image.tmdb.org/t/p/w500/2GkHvzJGdTvxJJzSl9s8EJp5UaH.jpg", rating: "8.6", genre: "Spy", price: 199 },
];

const SNACKS = [
  { id: 1, name: "Large Popcorn", emoji: "🍿", desc: "Butter-drizzled classic", price: 280 },
  { id: 2, name: "Cheese Popcorn", emoji: "🧀", desc: "Extra cheese loaded", price: 320 },
  { id: 3, name: "Caramel Popcorn", emoji: "🍬", desc: "Sweet & crunchy", price: 300 },
  { id: 4, name: "Pepsi Large", emoji: "🥤", desc: "Ice cold fizz", price: 160 },
  { id: 5, name: "Coke Zero", emoji: "🫙", desc: "Zero sugar delight", price: 160 },
  { id: 6, name: "Sprite", emoji: "💚", desc: "Lemon-lime refresh", price: 140 },
  { id: 7, name: "Mineral Water", emoji: "💧", desc: "500ml chilled", price: 60 },
  { id: 8, name: "Nachos + Dip", emoji: "🌮", desc: "Salsa & cheese dip", price: 240 },
  { id: 9, name: "Veg Burger", emoji: "🍔", desc: "Double patty", price: 280 },
  { id: 10, name: "Chicken Wings", emoji: "🍗", desc: "6 pcs, spicy BBQ", price: 360 },
  { id: 11, name: "French Fries", emoji: "🍟", desc: "Crispy & salted", price: 180 },
  { id: 12, name: "Peri Peri Fries", emoji: "🌶️", desc: "Spicy African rub", price: 200 },
  { id: 13, name: "Hot Dog", emoji: "🌭", desc: "Grilled with mustard", price: 220 },
  { id: 14, name: "Pizza Slice", emoji: "🍕", desc: "Margherita, fresh", price: 260 },
  { id: 15, name: "Brownie", emoji: "🍫", desc: "Warm choco fudge", price: 180 },
  { id: 16, name: "Ice Cream", emoji: "🍨", desc: "Vanilla / Choco", price: 140 },
  { id: 17, name: "Coffee", emoji: "☕", desc: "Hot espresso shot", price: 120 },
  { id: 18, name: "Masala Chai", emoji: "🫖", desc: "Spiced Indian tea", price: 80 },
  { id: 19, name: "Combo 1 (Pop+Coke)", emoji: "🎉", desc: "Large Popcorn + Coke", price: 400 },
  { id: 20, name: "Combo 2 (Full Meal)", emoji: "🥗", desc: "Burger+Fries+Drink", price: 580 },
  { id: 21, name: "Kids Combo", emoji: "🧒", desc: "Small pop + juice", price: 250 },
  { id: 22, name: "Choco Lava Cake", emoji: "🎂", desc: "Gooey center delight", price: 200 },
];

const IPL_MATCHES = [
  { teams: "MI vs CSK", date: "April 22, 2026", venue: "Wankhede Stadium, Mumbai", time: "7:30 PM" },
  { teams: "RCB vs KKR", date: "April 24, 2026", venue: "Chinnaswamy, Bangalore", time: "7:30 PM" },
  { teams: "DC vs SRH", date: "April 26, 2026", venue: "Arun Jaitley Stadium, Delhi", time: "3:30 PM" },
  { teams: "GT vs PBKS", date: "April 28, 2026", venue: "Narendra Modi Stadium, Ahmedabad", time: "7:30 PM" },
];

const THEATERS = [
  { name: "PVR IMAX — Phoenix Mall", amenities: ["IMAX", "Dolby Atmos", "4K"], times: [{ t: "10:30 AM", avail: "Fast Filling" }, { t: "1:45 PM", avail: "Available" }, { t: "5:15 PM", avail: "Filling Fast" }, { t: "9:30 PM", avail: "Available" }] },
  { name: "INOX — R-City Mall", amenities: ["4DX", "Dolby", "Laser"], times: [{ t: "11:00 AM", avail: "Available" }, { t: "2:30 PM", avail: "Almost Full" }, { t: "6:45 PM", avail: "Available" }, { t: "10:00 PM", avail: "Available" }] },
  { name: "Cinepolis — Oberoi", amenities: ["3D", "Recliner", "Luxury"], times: [{ t: "12:15 PM", avail: "Available" }, { t: "3:30 PM", avail: "Available" }, { t: "7:00 PM", avail: "Filling Fast" }, { t: "10:30 PM", avail: "Available" }] },
];

const BAD_WORDS = ["idiot", "stupid", "dumb", "moron", "damn", "crap", "hell", "bloody", "fool", "jerk", "loser", "hate", "awful", "terrible", "worst", "garbage", "trash", "useless", "pathetic"];

// ─────────────────────── STATE ───────────────────────
let state = {
  currentScreen: 'screen-welcome',
  user: null,
  otpValue: '',
  otpExpiry: null,
  otpTimerInterval: null,
  botVerified: false,
  isLoginMode: false,
  selectedMovie: null,
  selectedDate: null,
  selectedTheater: null,
  selectedTime: null,
  selectedSeats: [],
  snackCounts: {},
  paymentMethod: 'upi',
  selectedUPI: '',
  qrTimerInterval: null,
  upiOtpTimerInterval: null,
  starRating: 0,
  currentSlide: 0,
  slideInterval: null,
  liveUserInterval: null,
  graphInterval: null,
  graphData: [],
  popupSeat: null,
  paymentSimulated: false,
};

// ─────────────────────── INIT ───────────────────────
window.addEventListener('DOMContentLoaded', () => {
  createParticles();
  startWelcomeAnimation();
  checkAutoLogin();
});

function checkAutoLogin() {
  const saved = localStorage.getItem('prepMyShowUser');
  if (saved) {
    state.user = JSON.parse(saved);
    // After welcome animation, skip auth
  }
}

// ─────────────────────── SCREEN TRANSITIONS ───────────────────────
function showScreen(id) {
  // Close all dropdowns
  closeAllDropdowns();

  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });

  const target = document.getElementById(id);
  if (!target) return;
  target.style.display = 'flex';
  requestAnimationFrame(() => {
    target.classList.add('active');
    target.classList.add('fade-in');
    setTimeout(() => target.classList.remove('fade-in'), 700);
  });
  state.currentScreen = id;

  // Screen init hooks
  if (id === 'screen-dashboard') initDashboard();
  if (id === 'screen-seats') initSeatMap();
  if (id === 'screen-snacks') initSnacks();
  if (id === 'screen-payment') initPayment();
  if (id === 'screen-ticket') initTicket();
}

// ─────────────────────── SCREEN 1: WELCOME ───────────────────────
function startWelcomeAnimation() {
  const titleEl = document.getElementById('welcomeTitle');
  const taglineEl = document.getElementById('welcomeTagline');
  const bar = document.getElementById('loadingBar');
  const pct = document.getElementById('loadingPercent');
  const nextBtn = document.getElementById('welcomeNextBtn');

  const title = "Prep MyShow";
  const tagline = "A Next-gen booking for next level movies";

  // Letter by letter title
  titleEl.innerHTML = '';
  let i = 0;
  const titleTimer = setInterval(() => {
    if (i < title.length) {
      const span = document.createElement('span');
      span.textContent = title[i] === ' ' ? '\u00A0' : title[i];
      span.style.opacity = '0';
      span.style.animation = `fadeLetterIn 0.4s ease ${i * 0.06}s forwards`;
      span.style.display = 'inline-block';
      titleEl.appendChild(span);
      i++;
    } else {
      clearInterval(titleTimer);
      // Tagline
      let j = 0;
      const tagTimer = setInterval(() => {
        if (j < tagline.length) {
          taglineEl.textContent = tagline.slice(0, j + 1);
          j++;
        } else {
          clearInterval(tagTimer);
          startLoadingBar();
        }
      }, 28);
    }
  }, 60);

  // Add letter animation keyframe
  if (!document.querySelector('#letterKeyframe')) {
    const style = document.createElement('style');
    style.id = 'letterKeyframe';
    style.textContent = `
      @keyframes fadeLetterIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  function startLoadingBar() {
    let progress = 0;
    const interval = setInterval(() => {
      const increment = Math.random() * 3 + 0.5;
      progress = Math.min(100, progress + increment);
      bar.style.width = progress + '%';
      pct.textContent = Math.floor(progress) + '%';
      if (progress >= 100) {
        clearInterval(interval);
        pct.textContent = '100%';
        setTimeout(() => {
          nextBtn.style.display = 'flex';
          nextBtn.style.animation = 'screenIn 0.5s ease forwards';
          // Auto-skip to dashboard if logged in
          if (state.user) {
            setTimeout(() => showScreen('screen-dashboard'), 800);
          }
        }, 300);
      }
    }, 40);
  }
}

function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 8 + 6}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${Math.random() * 0.5 + 0.1};
    `;
    container.appendChild(p);
  }
}

// ─────────────────────── SCREEN 2: AUTH ───────────────────────
function triggerBotCheck() {
  const box = document.getElementById('botCheckBox');
  const spinner = document.getElementById('botSpinner');
  const tick = document.getElementById('botTick');
  const idle = document.getElementById('botIdle');
  const label = document.getElementById('botLabel');

  if (state.botVerified) return;

  idle.style.display = 'none';
  spinner.style.display = 'block';
  label.textContent = 'Verifying...';

  setTimeout(() => {
    spinner.style.display = 'none';
    tick.style.display = 'block';
    box.classList.add('success');
    label.textContent = 'Verification successful';
    state.botVerified = true;
    document.getElementById('sendOtpBtn').disabled = false;
  }, 3000);
}

function sendOTP() {
  const fn = document.getElementById('firstName').value.trim();
  const ln = document.getElementById('lastName').value.trim();
  const em = document.getElementById('email').value.trim();
  const ct = document.getElementById('contact').value.trim();

  if (!fn || !ln || !em || !ct) {
    flashError('Please fill all required fields.');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(em)) {
    flashError('Please enter a valid email address.');
    return;
  }
  if (!state.botVerified) {
    flashError('Please complete the bot verification.');
    return;
  }

  // Generate OTP
  state.otpValue = Math.floor(100000 + Math.random() * 900000).toString();
  state.otpExpiry = Date.now() + 2 * 60 * 1000;
  console.log('%c🔑 OTP for Prep MyShow: ' + state.otpValue, 'color: gold; font-size: 1.2rem; font-weight: bold;');

  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginLink').style.display = 'none';
  document.getElementById('otpForm').style.display = 'block';

  startOTPTimer();
  initOTPInputs();
}

function startOTPTimer() {
  clearInterval(state.otpTimerInterval);
  const timerEl = document.getElementById('otpTimer');
  state.otpTimerInterval = setInterval(() => {
    const remaining = state.otpExpiry - Date.now();
    if (remaining <= 0) {
      clearInterval(state.otpTimerInterval);
      timerEl.textContent = 'OTP Expired';
      timerEl.style.color = '#ff6b6b';
      return;
    }
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `Valid for: ${mins}:${secs.toString().padStart(2, '0')}`;
  }, 500);
}

function initOTPInputs() {
  const inputs = document.querySelectorAll('#otpForm .otp-digit');
  inputs.forEach((inp, i) => {
    inp.value = '';
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/, '');
      if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
    });
  });
  inputs[0].focus();
}

function verifyOTP() {
  if (Date.now() > state.otpExpiry) {
    flashError('OTP has expired. Please request a new one.');
    return;
  }
  const inputs = document.querySelectorAll('#otpForm .otp-digit');
  const entered = Array.from(inputs).map(i => i.value).join('');
  if (entered === state.otpValue) {
    // Save user
    const userData = {
      firstName: document.getElementById('firstName').value.trim(),
      middleName: document.getElementById('middleName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      contact: document.getElementById('contact').value.trim(),
    };
    state.user = userData;
    localStorage.setItem('prepMyShowUser', JSON.stringify(userData));
    clearInterval(state.otpTimerInterval);
    showScreen('screen-dashboard');
  } else {
    flashError('Incorrect OTP. Please try again.');
    const inputs2 = document.querySelectorAll('#otpForm .otp-digit');
    inputs2.forEach(i => { i.value = ''; i.style.borderColor = '#ff6b6b'; });
    setTimeout(() => inputs2.forEach(i => i.style.borderColor = ''), 1000);
    inputs2[0].focus();
  }
}

function resendOTP() {
  state.otpValue = Math.floor(100000 + Math.random() * 900000).toString();
  state.otpExpiry = Date.now() + 2 * 60 * 1000;
  console.log('%c🔑 New OTP: ' + state.otpValue, 'color: gold; font-size: 1.2rem;');
  startOTPTimer();
  document.getElementById('otpTimer').style.color = '';
  initOTPInputs();
  showToast('OTP resent! Check console.');
}

function showLoginMode() {
  // Simple login mode - just ask for email + OTP
  const fn = document.getElementById('firstName');
  fn.value = 'Returning';
  const ln = document.getElementById('lastName');
  ln.value = 'Member';
  const em = document.getElementById('email');
  em.value = state.user ? state.user.email : '';
  const ct = document.getElementById('contact');
  ct.value = state.user ? state.user.contact : '';
  if (state.botVerified) document.getElementById('sendOtpBtn').disabled = false;
}

function flashError(msg) {
  showToast(msg, true);
}

function showToast(msg, isError = false) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  t.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: ${isError ? '#2a0a0a' : '#0a2a0a'}; color: ${isError ? '#ff8080' : '#80ff80'};
    border: 1px solid ${isError ? '#8b1a1a' : '#1a4a1a'}; border-radius: 8px;
    padding: 12px 24px; font-size: 0.85rem; z-index: 9999;
    animation: toastIn 0.3s ease; pointer-events: none;
  `;
  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn { from { opacity:0; transform: translate(-50%,20px); } to { opacity:1; transform: translate(-50%,0); } }`;
  document.head.appendChild(style);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function logout() {
  localStorage.removeItem('prepMyShowUser');
  state.user = null;
  stopDashboardIntervals();
  showScreen('screen-auth');
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('otpForm').style.display = 'none';
  document.getElementById('loginLink').style.display = 'block';
  closeAllDropdowns();
}

// ─────────────────────── DASHBOARD ───────────────────────
function initDashboard() {
  updateProfileUI();
  renderMovies();
  renderStreamMovies();
  renderIPLMatches();
  startSlideshow();
  startLiveGraph();
  startLiveUserCounter();
}

function updateProfileUI() {
  if (!state.user) return;
  const initials = ((state.user.firstName[0] || '') + (state.user.lastName[0] || '')).toUpperCase();
  document.getElementById('profileCircle').textContent = initials;
  const nameEl = document.getElementById('profileMenuName');
  if (nameEl) nameEl.textContent = state.user.firstName + ' ' + state.user.lastName;
}

function stopDashboardIntervals() {
  clearInterval(state.slideInterval);
  clearInterval(state.liveUserInterval);
  clearInterval(state.graphInterval);
}

function renderMovies() {
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '';
  MOVIES.forEach(m => grid.appendChild(createMovieCard(m, false)));
}

function renderStreamMovies() {
  const grid = document.getElementById('streamGrid');
  grid.innerHTML = '';
  STREAM_DATA.forEach(m => grid.appendChild(createMovieCard(m, true)));
}

function createMovieCard(movie, isStream) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.innerHTML = `
    <div class="movie-poster-wrap">
      <img class="movie-poster" src="${movie.img}" alt="${movie.title}"
        onerror="this.src='https://via.placeholder.com/300x450/0d0d1a/c8a035?text=${encodeURIComponent(movie.title)}'" />
      <div class="movie-overlay">
        <div class="movie-overlay-rating">⭐ ${movie.rating}</div>
      </div>
    </div>
    <div class="movie-info">
      <div class="movie-title">${movie.title}</div>
      <div class="movie-meta">
        <span class="badge badge-gold">⭐ ${movie.rating}</span>
        <span class="badge">${movie.genre}</span>
      </div>
      <button class="btn-book" onclick="openMovieDetail(${movie.id}, ${isStream})">🎟️ Book Ticket</button>
    </div>
  `;
  return card;
}

function filterMovies() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const allMovies = [...MOVIES, ...STREAM_DATA];
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '';
  const filtered = allMovies.filter(m => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q));
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="color:var(--text-dim);padding:20px;grid-column:1/-1">No movies found for "${q}"</div>`;
  } else {
    filtered.forEach(m => grid.appendChild(createMovieCard(m, false)));
  }
}

function updateCity() {
  const city = document.getElementById('citySelect').value;
  if (city) showToast(`📍 Location set to ${city}`);
}

function setSubNav(el, section) {
  document.querySelectorAll('.sub-nav-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  const sections = ['movies', 'stream', 'events', 'plays', 'sports', 'activities', 'ipl'];
  sections.forEach(s => {
    const el2 = document.getElementById('content' + s.charAt(0).toUpperCase() + s.slice(1));
    if (el2) el2.style.display = s === section ? 'block' : 'none';
  });
}

function toggleProfileMenu() {
  const menu = document.getElementById('profileMenu');
  const notif = document.getElementById('notifMenu');
  notif.style.display = 'none';
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
function toggleNotifMenu() {
  const menu = document.getElementById('notifMenu');
  const prof = document.getElementById('profileMenu');
  prof.style.display = 'none';
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
function closeAllDropdowns() {
  const els = document.querySelectorAll('.dropdown-menu');
  els.forEach(e => e.style.display = 'none');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-right')) closeAllDropdowns();
});

function showBookings() {
  showToast('📋 Your bookings will appear here after your first booking!');
  closeAllDropdowns();
}
function showRewards() {
  showToast('⭐ You have 500 reward points! Redeem them on your next booking.');
  closeAllDropdowns();
}

// Slideshow
function startSlideshow() {
  clearInterval(state.slideInterval);
  state.slideInterval = setInterval(() => {
    const nextSlide = (state.currentSlide + 1) % 3;
    goToSlide(nextSlide);
  }, 4000);
}

function goToSlide(idx) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slide-dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  state.currentSlide = idx;
}

// Live Graph
function startLiveGraph() {
  const canvas = document.getElementById('graphCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  state.graphData = Array.from({ length: 30 }, () => Math.random() * 60 + 40);

  function draw() {
    ctx.clearRect(0, 0, 300, 120);
    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, 120);
    grad.addColorStop(0, 'rgba(76,200,100,0.3)');
    grad.addColorStop(1, 'rgba(76,200,100,0)');
    ctx.beginPath();
    state.graphData.forEach((v, i) => {
      const x = (i / (state.graphData.length - 1)) * 300;
      const y = 120 - v;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(300, 120); ctx.lineTo(0, 120); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    // Line
    ctx.beginPath();
    state.graphData.forEach((v, i) => {
      const x = (i / (state.graphData.length - 1)) * 300;
      const y = 120 - v;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#4cc860'; ctx.lineWidth = 2; ctx.stroke();
  }

  draw();
  state.graphInterval = setInterval(() => {
    state.graphData.shift();
    state.graphData.push(Math.random() * 60 + 40);
    draw();
  }, 500);
}

function startLiveUserCounter() {
  let users = 2347;
  state.liveUserInterval = setInterval(() => {
    users += Math.floor(Math.random() * 7) - 2;
    users = Math.max(2000, users);
    const el = document.getElementById('liveUserCount');
    if (el) el.textContent = users.toLocaleString('en-IN');
  }, 1200);
}

function renderIPLMatches() {
  const container = document.getElementById('iplMatches');
  if (!container) return;
  container.innerHTML = '';
  IPL_MATCHES.forEach(m => {
    const card = document.createElement('div');
    card.className = 'ipl-match-card';
    card.innerHTML = `
      <div class="ipl-match-teams">${m.teams}</div>
      <div class="ipl-match-info">${m.date} • ${m.time}</div>
      <div class="ipl-match-info">${m.venue}</div>
      <button class="btn-book" style="margin-top:10px" onclick="showToast('🏏 IPL tickets available at venue only!')">Book Seats</button>
    `;
    container.appendChild(card);
  });
}

// ─────────────────────── MOVIE DETAIL / TIMINGS ───────────────────────
function openMovieDetail(movieId, isStream) {
  const all = [...MOVIES, ...STREAM_DATA];
  const movie = all.find(m => m.id === movieId);
  if (!movie) return;
  state.selectedMovie = movie;
  state.selectedDate = null;
  state.selectedTheater = null;
  state.selectedTime = null;

  document.getElementById('timingMovieTitle').textContent = movie.title;
  document.getElementById('timingMovieImg').src = movie.img;
  document.getElementById('detailTitle').textContent = movie.title;

  renderDates();
  renderTheaters();
  showScreen('screen-timings');
}

function renderDates() {
  const container = document.getElementById('dateSelector');
  container.innerHTML = '';
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const chip = document.createElement('div');
    chip.className = 'date-chip' + (i === 0 ? ' active' : '');
    chip.innerHTML = `
      <span class="day-name">${days[d.getDay()]}</span>
      <span class="day-num">${d.getDate()}</span>
      <span class="month">${months[d.getMonth()]}</span>
    `;
    chip.onclick = () => {
      document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedDate = d.toDateString();
    };
    if (i === 0) state.selectedDate = d.toDateString();
    container.appendChild(chip);
  }
}

function renderTheaters() {
  const list = document.getElementById('theaterList');
  list.innerHTML = '';
  THEATERS.forEach((theater, ti) => {
    const card = document.createElement('div');
    card.className = 'theater-card';
    card.innerHTML = `
      <div class="theater-name">${theater.name}</div>
      <div class="theater-amenities">
        ${theater.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
      </div>
      <div class="time-slots">
        ${theater.times.map((slot, si) => `
          <div class="time-slot" onclick="selectTimeSlot(this, ${ti}, ${si})">
            ${slot.t}
            <span class="time-slot-price">${slot.avail} • ₹${state.selectedMovie ? state.selectedMovie.price : 300}+</span>
          </div>
        `).join('')}
      </div>
    `;
    list.appendChild(card);
  });
}

function selectTimeSlot(el, theaterIdx, timeIdx) {
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  state.selectedTheater = THEATERS[theaterIdx];
  state.selectedTime = THEATERS[theaterIdx].times[timeIdx].t;
  setTimeout(() => showScreen('screen-seats'), 500);
}

// ─────────────────────── SEAT MAP ───────────────────────
const SEAT_CONFIG = {
  Diamond: { rows: ['A','B'], price: 600, cols: 12, color: 'diamond' },
  Platinum: { rows: ['C','D','E','F'], price: 400, cols: 14, color: 'platinum' },
  Gold: { rows: ['G','H','I','J','K'], price: 280, cols: 16, color: 'gold-s' },
};

// Hardcode some booked seats
const BOOKED_SEATS = new Set(['A3','A8','B2','B11','C5','D7','E3','E10','F6','G2','G9','H4','H13','I7','J5','K11']);

function initSeatMap() {
  state.selectedSeats = [];
  const hall = document.getElementById('seatHall');
  hall.innerHTML = '';

  Object.entries(SEAT_CONFIG).forEach(([sectionName, cfg]) => {
    const section = document.createElement('div');
    section.className = 'seat-section';
    const label = document.createElement('div');
    label.className = 'seat-section-label';
    label.textContent = `${sectionName} — ₹${cfg.price}`;
    section.appendChild(label);

    cfg.rows.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';
      const rowLabel = document.createElement('div');
      rowLabel.className = 'row-label';
      rowLabel.textContent = row;
      rowEl.appendChild(rowLabel);

      // Aisle in middle
      for (let col = 1; col <= cfg.cols; col++) {
        if (col === Math.ceil(cfg.cols / 2) + 1) {
          const aisle = document.createElement('div');
          aisle.className = 'seat aisle';
          rowEl.appendChild(aisle);
        }
        const seatId = row + col;
        const seat = document.createElement('div');
        const isBooked = BOOKED_SEATS.has(seatId);
        seat.className = `seat ${isBooked ? 'booked' : cfg.color}`;
        seat.dataset.id = seatId;
        seat.dataset.price = cfg.price;
        seat.dataset.section = sectionName;
        seat.title = `Seat ${seatId} — ${sectionName} — ₹${cfg.price}`;
        if (!isBooked) {
          seat.onclick = () => openSeatPopup(seat, seatId, cfg);
        }
        rowEl.appendChild(seat);
      }
      section.appendChild(rowEl);
    });

    hall.appendChild(section);
  });

  updateSeatUI();
  document.getElementById('seatScreenTitle').textContent =
    state.selectedMovie ? `${state.selectedMovie.title} — ${state.selectedTime}` : 'Select Seats';
}

function openSeatPopup(el, seatId, cfg) {
  state.popupSeat = { el, seatId, cfg };
  document.getElementById('popupSeatId').textContent = `Seat ${seatId} — ${cfg.color.toUpperCase()}`;

  // Generate realistic physics data based on row
  const rowLetter = seatId[0];
  const colNum = parseInt(seatId.slice(1));
  const totalCols = cfg.cols;
  const leftPct = Math.round((colNum / totalCols) * 100);
  const rightPct = 100 - leftPct;
  const rowDepth = ['A','B','C','D','E','F','G','H','I','J','K'].indexOf(rowLetter);
  const recline = 15 + rowDepth * 5;
  const neckAngle = 25 - rowDepth * 2;
  const backPain = Math.max(5, 30 - rowDepth * 3);

  document.getElementById('pRecline').textContent = recline + '°';
  document.getElementById('pTemp').textContent = (21 + Math.floor(Math.random() * 3)) + '°C';
  document.getElementById('pBackPain').textContent = backPain + '%';
  document.getElementById('pNeckAngle').textContent = Math.max(5, neckAngle) + '°';
  document.getElementById('pLSpeaker').textContent = leftPct + '%';
  document.getElementById('pRSpeaker').textContent = rightPct + '%';

  document.getElementById('seatPopup').style.display = 'block';
}

function closeSeatPopup() {
  document.getElementById('seatPopup').style.display = 'none';
  state.popupSeat = null;
}

function selectFabric(el, fabric) {
  document.querySelectorAll('.fabric-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  if (state.popupSeat) {
    const seat = state.popupSeat.el;
    if (fabric === 'leather') {
      seat.style.background = 'linear-gradient(135deg, #3d1a0a, #6b3015)';
    } else {
      seat.style.background = 'linear-gradient(135deg, #1a0a3d, #3d1560)';
    }
  }
}

function selectSeatFromPopup() {
  if (!state.popupSeat) return;
  const { el, seatId, cfg } = state.popupSeat;
  toggleSeat(el, seatId, cfg);
  closeSeatPopup();
}

function toggleSeat(el, seatId, cfg) {
  const idx = state.selectedSeats.findIndex(s => s.id === seatId);
  if (idx > -1) {
    // Deselect
    state.selectedSeats.splice(idx, 1);
    el.classList.remove('selected');
    el.classList.add(cfg.color);
    el.style.background = '';
  } else {
    if (state.selectedSeats.length >= 8) {
      showToast('Maximum 8 seats per booking.');
      return;
    }
    // Select
    state.selectedSeats.push({ id: seatId, price: cfg.price, section: cfg.color });
    el.classList.add('selected');
  }
  updateSeatUI();
}

function updateSeatUI() {
  const total = state.selectedSeats.reduce((s, seat) => s + seat.price, 0);
  const count = state.selectedSeats.length;
  document.getElementById('seatSelectedCount').textContent = count + ' Selected';
  document.getElementById('seatTotal').textContent = '₹' + total.toLocaleString('en-IN');

  const bar = document.getElementById('seatProceedBar');
  if (count > 0) {
    bar.style.display = 'flex';
    document.getElementById('proceedSeats').textContent = state.selectedSeats.map(s => s.id).join(', ');
    document.getElementById('proceedTotal').textContent = '₹' + total.toLocaleString('en-IN');
  } else {
    bar.style.display = 'none';
  }
}

// ─────────────────────── SNACKS ───────────────────────
function initSnacks() {
  state.snackCounts = {};
  const grid = document.getElementById('snacksGrid');
  grid.innerHTML = '';
  SNACKS.forEach(snack => {
    state.snackCounts[snack.id] = 0;
    const card = document.createElement('div');
    card.className = 'snack-card';
    card.innerHTML = `
      <div class="snack-emoji">${snack.emoji}</div>
      <div class="snack-name">${snack.name}</div>
      <div class="snack-desc">${snack.desc}</div>
      <div class="snack-price">₹${snack.price}</div>
      <div class="snack-counter">
        <button class="counter-btn" onclick="updateSnack(${snack.id}, -1)">−</button>
        <span class="counter-val" id="snack-count-${snack.id}">0</span>
        <button class="counter-btn" onclick="updateSnack(${snack.id}, 1)">+</button>
      </div>
    `;
    grid.appendChild(card);
  });
  updateSnackTotals();
}

function updateSnack(id, delta) {
  const snack = SNACKS.find(s => s.id === id);
  state.snackCounts[id] = Math.max(0, (state.snackCounts[id] || 0) + delta);
  document.getElementById('snack-count-' + id).textContent = state.snackCounts[id];
  updateSnackTotals();
}

function updateSnackTotals() {
  let total = 0, items = 0;
  const summary = [];
  SNACKS.forEach(snack => {
    const c = state.snackCounts[snack.id] || 0;
    if (c > 0) { total += snack.price * c; items += c; summary.push(`${snack.emoji} ${snack.name} x${c}`); }
  });
  document.getElementById('snackCartBadge').textContent = '₹' + total.toLocaleString('en-IN');
  document.getElementById('snackSummary').textContent = items > 0 ? `${items} item(s) — ${summary.slice(0,2).join(', ')}${summary.length > 2 ? ' +more' : ''}` : 'No items added';
}

function goToSnacks() {
  if (state.selectedSeats.length === 0) {
    showToast('Please select at least one seat first.');
    return;
  }
  showScreen('screen-snacks');
}

function goToPayment() {
  showScreen('screen-payment');
}

// ─────────────────────── PAYMENT ───────────────────────
function initPayment() {
  renderOrderSummary();
  generateQR();
  startQRTimer();
  // Pay Later breakdown
  updatePayLaterTax();
}

function renderOrderSummary() {
  const seatTotal = state.selectedSeats.reduce((s, seat) => s + seat.price, 0);
  let snackTotal = 0;
  SNACKS.forEach(snack => { snackTotal += (state.snackCounts[snack.id] || 0) * snack.price; });
  const convenience = 50;
  const grand = seatTotal + snackTotal + convenience;

  const lines = document.getElementById('orderLines');
  lines.innerHTML = `
    <div class="order-line"><span>Seats (${state.selectedSeats.length})</span><span class="val">₹${seatTotal.toLocaleString('en-IN')}</span></div>
    <div class="order-line"><span>Snacks</span><span class="val">₹${snackTotal.toLocaleString('en-IN')}</span></div>
    <div class="order-line"><span>Convenience Fee</span><span class="val">₹${convenience}</span></div>
  `;
  document.getElementById('orderTotal').textContent = `Grand Total: ₹${grand.toLocaleString('en-IN')}`;
  document.getElementById('payNowAmount').textContent = '₹' + grand.toLocaleString('en-IN');
  state.grandTotal = grand;
}

function updatePayLaterTax() {
  const tax = Math.round((state.grandTotal || 0) * 0.1);
  const total = (state.grandTotal || 0) + tax;
  const el = document.getElementById('taxBreakdown');
  if (el) {
    el.innerHTML = `
      <div class="order-line"><span>Base Amount</span><span class="val">₹${(state.grandTotal || 0).toLocaleString('en-IN')}</span></div>
      <div class="order-line"><span>Convenience Tax (10%)</span><span class="val">₹${tax.toLocaleString('en-IN')}</span></div>
      <div class="order-line" style="color:var(--gold);font-weight:600"><span>Pay Later Total</span><span class="val">₹${total.toLocaleString('en-IN')}</span></div>
    `;
  }
}

function selectPayment(el, method) {
  document.querySelectorAll('.method-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  state.paymentMethod = method;
  ['upi','paylater','card','cash'].forEach(m => {
    const p = document.getElementById('panel-' + m);
    if (p) p.style.display = m === method ? 'block' : 'none';
  });
}

function selectUPI(el, upiHandle) {
  document.querySelectorAll('.upi-app').forEach(a => a.classList.remove('selected'));
  el.classList.add('selected');
  state.selectedUPI = upiHandle;
  document.getElementById('upiId').value = (state.user?.contact?.replace('+91 ', '').replace(' ','') || '9876543210') + upiHandle;
}

function verifyUPI() {
  const upiId = document.getElementById('upiId').value;
  if (!upiId.includes('@')) {
    document.getElementById('upiVerifyStatus').textContent = '❌ Invalid UPI ID format';
    document.getElementById('upiVerifyStatus').style.color = '#ff6b6b';
    return;
  }
  document.getElementById('upiVerifyStatus').textContent = '✓ UPI ID verified';
  document.getElementById('upiVerifyStatus').style.color = '#4caf50';
}

function generateQR() {
  const container = document.getElementById('qrCode');
  container.innerHTML = '';
  try {
    new QRCode(container, {
      text: "https://github.com/harshkaushal137",
      width: 140, height: 140,
      colorDark: "#000000", colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch(e) {
    container.innerHTML = '<div style="width:140px;height:140px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#000;text-align:center;padding:10px;">QR: github.com/harshkaushal137</div>';
  }
  // Also generate ticket QR
  const ticketQR = document.getElementById('ticketQR');
  if (ticketQR) {
    ticketQR.innerHTML = '';
    try {
      new QRCode(ticketQR, {
        text: "https://github.com/harshkaushal137",
        width: 80, height: 80,
        colorDark: "#000000", colorLight: "#ffffff",
      });
    } catch(e) {}
  }
}

function startQRTimer() {
  clearInterval(state.qrTimerInterval);
  let secs = 60;
  const el = document.getElementById('qrTimer');
  state.qrTimerInterval = setInterval(() => {
    secs--;
    if (el) el.textContent = `QR valid for: 0:${secs.toString().padStart(2,'0')}`;
    if (secs <= 0) {
      clearInterval(state.qrTimerInterval);
      if (el) el.textContent = 'QR Expired — Refreshing...';
      setTimeout(() => { secs = 60; generateQR(); startQRTimer(); }, 1000);
    }
  }, 1000);
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '');
  v = v.replace(/(.{4})/g, '$1 ').trim();
  input.value = v;
}

function initiatePayment() {
  if (state.paymentMethod === 'upi') {
    const upiId = document.getElementById('upiId').value;
    if (upiId && upiId.includes('@')) {
      showUPIOTPModal();
    } else {
      // Simulate QR scan payment
      simulateQRPayment();
    }
  } else {
    processPaymentDirect();
  }
}

function showUPIOTPModal() {
  document.getElementById('upiOtpModal').style.display = 'flex';
  const otpInputs = document.querySelectorAll('#upiOtpModal .otp-digit');
  otpInputs.forEach((inp, i) => {
    inp.value = '';
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/, '');
      if (inp.value && i < otpInputs.length - 1) otpInputs[i + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) otpInputs[i - 1].focus();
    });
  });
  otpInputs[0].focus();

  // Timer
  clearInterval(state.upiOtpTimerInterval);
  let secs = 60;
  const timerEl = document.getElementById('upiOtpTimer');
  state.upiOtpTimerInterval = setInterval(() => {
    secs--;
    if (timerEl) timerEl.textContent = `Valid for: 0:${secs.toString().padStart(2,'0')}`;
    if (secs <= 0) { clearInterval(state.upiOtpTimerInterval); if (timerEl) timerEl.textContent = 'Expired'; }
  }, 1000);
}

function confirmUPIOTP() {
  document.getElementById('upiOtpModal').style.display = 'none';
  clearInterval(state.upiOtpTimerInterval);
  processPaymentDirect();
}

function simulateQRPayment() {
  const overlay = document.getElementById('paymentOverlay');
  overlay.style.display = 'flex';
  document.getElementById('payStatusText').textContent = 'Waiting for QR Scan...';
  document.getElementById('payStatusSub').textContent = 'Scan QR with your phone to pay';
  setTimeout(() => {
    document.getElementById('payStatusText').textContent = 'Payment Received!';
    document.getElementById('payStatusSub').textContent = '✓ Transaction successful';
    setTimeout(() => {
      overlay.style.display = 'none';
      playSuccessSound();
      showScreen('screen-ticket');
    }, 1200);
  }, 3000);
}

function processPaymentDirect() {
  const overlay = document.getElementById('paymentOverlay');
  overlay.style.display = 'flex';
  document.getElementById('payStatusText').textContent = 'Processing Payment...';
  document.getElementById('payStatusSub').textContent = 'Please do not close this window';
  const steps = [
    { text: 'Authenticating...', sub: 'Verifying your credentials' },
    { text: 'Connecting to bank...', sub: 'Secure SSL connection' },
    { text: 'Authorizing...', sub: 'Confirming transaction' },
    { text: 'Payment Successful! 🎉', sub: 'Generating your ticket...' },
  ];
  let step = 0;
  const interval = setInterval(() => {
    if (step < steps.length) {
      document.getElementById('payStatusText').textContent = steps[step].text;
      document.getElementById('payStatusSub').textContent = steps[step].sub;
      step++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        overlay.style.display = 'none';
        playSuccessSound();
        showScreen('screen-ticket');
      }, 800);
    }
  }, 900);
}

// ─────────────────────── TICKET ───────────────────────
function initTicket() {
  // Populate ticket
  const ref = '#PMS-' + Math.random().toString(36).slice(2,8).toUpperCase();
  document.getElementById('ticketRef').textContent = ref;
  document.getElementById('ticketMovie').textContent = state.selectedMovie ? state.selectedMovie.title : 'Movie';
  document.getElementById('ticketDate').textContent = state.selectedDate || 'Today';
  document.getElementById('ticketTime').textContent = state.selectedTime || '—';
  document.getElementById('ticketSeats').textContent = state.selectedSeats.map(s => s.id).join(', ') || '—';
  document.getElementById('ticketTheater').textContent = state.selectedTheater ? state.selectedTheater.name.split('—')[0].trim() : '—';
  document.getElementById('ticketAmount').textContent = '₹' + (state.grandTotal || 0).toLocaleString('en-IN');

  const snackItems = SNACKS.filter(s => state.snackCounts[s.id] > 0);
  document.getElementById('ticketSnacks').textContent = snackItems.length > 0 ? snackItems.map(s => `${s.emoji}×${state.snackCounts[s.id]}`).join(' ') : 'None';

  generateBarcode();

  // Ticket QR
  setTimeout(() => {
    const tqr = document.getElementById('ticketQR');
    if (tqr && tqr.children.length === 0) {
      try {
        new QRCode(tqr, { text: "https://github.com/harshkaushal137", width: 80, height: 80 });
      } catch(e) {}
    }
  }, 300);

  // Burst animation
  createSuccessBurst();
}

function generateBarcode() {
  const container = document.getElementById('barcodeBars');
  container.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    const h = Math.random() * 30 + 20;
    bar.style.cssText = `width:${Math.random() > 0.7 ? 3 : 2}px; height:${h}px;`;
    container.appendChild(bar);
  }
}

function createSuccessBurst() {
  const burst = document.getElementById('successBurst');
  burst.innerHTML = '';
  const colors = ['#c8a035','#f0c060','#4caf50','#2196f3','#e91e63'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'burst-particle';
    const angle = (i / 20) * 360;
    const dist = Math.random() * 80 + 40;
    const tx = Math.cos(angle * Math.PI / 180) * dist;
    const ty = Math.sin(angle * Math.PI / 180) * dist;
    p.style.cssText = `
      --tx: ${tx}px; --ty: ${ty}px;
      background: ${colors[i % colors.length]};
      width: ${Math.random() * 6 + 4}px; height: ${Math.random() * 6 + 4}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-delay: ${Math.random() * 0.3}s;
    `;
    burst.appendChild(p);
  }
}

function downloadTicket() {
  const ticket = document.getElementById('generatedTicket');
  const opt = {
    margin: 10,
    filename: 'PrepMyShow_Ticket.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: '#0d0d1a' },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(ticket).save().catch(() => showToast('PDF generation requires a modern browser.', true));
}

// ─────────────────────── FEEDBACK ───────────────────────
function rateStar(val) {
  state.starRating = val;
  document.querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('active', i < val);
  });
}

function submitFeedback() {
  const text = document.getElementById('feedbackText').value.trim();
  if (!text) {
    showToast('Please write some feedback first.', true);
    return;
  }
  if (state.starRating === 0) {
    showToast('Please rate your experience.', true);
    return;
  }

  // Filter bad words
  let filtered = text;
  let found = false;
  BAD_WORDS.forEach(word => {
    const re = new RegExp('\\b' + word + '\\b', 'gi');
    if (re.test(filtered)) {
      filtered = filtered.replace(re, '****');
      found = true;
    }
  });

  if (found) {
    document.getElementById('feedbackText').value = filtered;
    document.getElementById('feedbackFilterNote').textContent = '⚠️ Some inappropriate words were filtered from your feedback.';
    return;
  }

  document.getElementById('feedbackFilterNote').textContent = '';
  console.log('Feedback submitted:', { rating: state.starRating, text: filtered });
  document.getElementById('thankYouOverlay').style.display = 'flex';
  playThankYouSound();
}

// ─────────────────────── SOUND ───────────────────────
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch(e) {}
}

function playThankYouSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch(e) {}
}