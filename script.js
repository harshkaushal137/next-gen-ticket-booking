/**
 * ================================================================
 *  PREP MYSHOW × JOURNEY TO SMILE CABS — script.js  (v3 — fixed)
 *
 *  BUGS FIXED IN THIS VERSION:
 *  1. Canvas size: now uses window.innerWidth/Height (not offsetWidth
 *     which returns 0 on hidden elements at mount time).
 *  2. goToScreen: APP.currentScreen is captured BEFORE the async
 *     GSAP callback, preventing stale-closure bugs.
 *  3. GSAP animation: replaced invalid `y:[10,0]` syntax with
 *     proper gsap.fromTo().
 *  4. Progress bar: added 'unlocked' class correctly.
 *  5. Screen z-index stacking: outgoing screen gets z-index 10,
 *     incoming gets z-index 11 so it slides over correctly.
 *  6. initIntroCanvas: called AFTER DOMContentLoaded with correct
 *     canvas sizing using window dimensions.
 * ================================================================
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   §1  GLOBAL APP STATE
══════════════════════════════════════════════════════════════ */
const API_BASE = 'http://localhost:3001/api/movies';

const APP = {
  currentScreen   : 'screen-intro',
  transitioning   : false,
  robotChecked    : false,
  robotChecked2   : false,
  robotCheckPending  : false,
  robotCheckPending2 : false,
  _otpTimer       : null,
  _otpExpired     : false,
  selectedMovie   : null,
  selectedTheatre : null,
  selectedSeats   : [],
  snackCart       : {},
  cabBooked       : false,
  payMethod       : 'upi',
  userCoins       : 250,
  currentSlide    : 0,
  sliderTimer     : null,
  feedbackRating  : 0,
  city            : 'Mumbai',
  userName        : '',
  userEmail       : '',
  bookingId       : null,
};

/* ══════════════════════════════════════════════════════════════
   §2  SPA SCREEN ROUTER  ← THE CORE FIX
   Screens are position:fixed layers. Only one is visible at a time.
   goToScreen() captures `fromId` synchronously, so async callbacks
   always reference the correct screen element.
══════════════════════════════════════════════════════════════ */
function goToScreen(toId) {
  if (toId === APP.currentScreen) return;
  if (APP.transitioning) return;

  const fromId = APP.currentScreen;          // ← capture NOW, before any async
  const fromEl = document.getElementById(fromId);
  const toEl   = document.getElementById(toId);

  if (!toEl) { console.warn('[PrepMyShow] Screen not found:', toId); return; }

  APP.transitioning = true;

  // Layer the incoming screen ON TOP while animating
  fromEl.style.zIndex = '10';
  toEl.style.zIndex   = '11';
  toEl.style.opacity  = '0';
  toEl.classList.add('active');
  toEl.scrollTop = 0;

  // Fade out current
  gsap.to(fromEl, {
    opacity : 0,
    duration: 0.25,
    ease    : 'power1.in',
    onComplete() {
      fromEl.classList.remove('active');
      fromEl.style.opacity = '';
      fromEl.style.zIndex  = '';

      // Slide + fade in next
      gsap.fromTo(toEl,
        { opacity: 0, y: 18 },
        {
          opacity  : 1,
          y        : 0,
          duration : 0.35,
          ease     : 'power2.out',
          onComplete() {
            toEl.style.zIndex = '';
            APP.currentScreen  = toId;
            APP.transitioning  = false;
            onScreenEnter(toId);
          }
        }
      );
    }
  });
}

/** Hook: runs once per screen when it becomes fully visible */
function onScreenEnter(id) {
  if (window.lucide) lucide.createIcons();
  switch (id) {
    case 'screen-dashboard': initDashboard();        break;
    case 'screen-seats'    : renderSeatMap();        break;
    case 'screen-snacks'   : renderSnacks();         break;
    case 'screen-driver'   : animateDriverCard();    break;
    case 'screen-payment'  : updatePaymentSummary(); break;
    case 'screen-success'  : triggerSuccess();       break;
    case 'screen-feedback' : initFeedback();         break;
  }
}

/* ══════════════════════════════════════════════════════════════
   §3  SCREEN 1 — INTRO / SPLASH
══════════════════════════════════════════════════════════════ */

/**
 * Particle canvas. CRITICAL: use window.innerWidth/Height, NOT
 * canvas.offsetWidth/Height — those return 0 when the element was
 * recently display:none at parse time.
 */
function initIntroCanvas() {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 120 }, () => ({
    x : Math.random() * canvas.width,
    y : Math.random() * canvas.height,
    r : Math.random() * 2 + 0.5,
    dx: (Math.random() - 0.5) * 0.6,
    dy: (Math.random() - 0.5) * 0.6,
    a : Math.random() * 0.5 + 0.15,
  }));

  let running = true;
  (function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(250,204,21,${p.a})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  })();

  // Stop particle loop once user navigates away (perf)
  canvas._stop = () => { running = false; };
}

/** Entrance animations: handshake first, then typewriter brand name, then rest */
function initIntroAnimations() {
  // Ensure progress and button are always visible (GSAP-independent fallback)
  const progressEl = document.querySelector('.progress-container');
  const btnEl      = document.getElementById('get-started-btn');
  if (progressEl) progressEl.style.opacity = '1';
  if (btnEl)      btnEl.style.opacity      = '1';

  if (!window.gsap) {
    // No GSAP — just show everything immediately
    typewriterBrand();
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Step 1: Handshake animation
  tl.fromTo('.handshake-wrap', { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)' }, 0.2)
    .fromTo('.collab-badge',   { opacity: 0, y: 10 },       { opacity: 1, y: 0,   duration: 0.4 }, 0.85);

  // Step 2: Typewriter brand name after handshake
  tl.add(() => typewriterBrand(), 1.1);

  // Step 3: Rest of elements — always visible, just animate them in nicely
  tl.fromTo('.progress-container', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 2.5)
    .fromTo('#get-started-btn',     { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 2.7);
}

/** Types out "PrepMyShow" letter by letter with gradient coloring */
function typewriterBrand() {
  const container = document.getElementById('brand-letters');
  if (!container) return;

  const fullText = 'PrepMyShow';
  const gradientLetters = 4; // "Prep" gets gradient
  container.innerHTML = '';

  let i = 0;
  const interval = setInterval(() => {
    if (i >= fullText.length) {
      clearInterval(interval);
      // Show collab tag and tagline after brand name finishes
      gsap.to('#collab-tag',   { opacity: 1, y: 0, duration: 0.5, delay: 0.1 });
      gsap.fromTo('#tagline-text', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.35 });
      return;
    }
    const span = document.createElement('span');
    span.textContent = fullText[i];
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    span.style.transform = 'translateY(-20px)';
    if (i < gradientLetters) {
      span.className = 'text-gradient';
    } else {
      span.style.color = 'white';
    }
    container.appendChild(span);
    gsap.to(span, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' });
    i++;
  }, 80);
}

/** 0 → 100 % progress bar with staged speed, then unlocks CTA */
function startProgressBar() {
  const bar = document.getElementById('progress-bar');
  const pct = document.getElementById('progress-pct');
  const btn = document.getElementById('get-started-btn');
  if (!bar || !pct || !btn) return;

  let v = 0;

  // Stages: [targetPercent, msPerTick]
  const stages = [[30, 35], [65, 22], [88, 50], [100, 18]];

  function runStage(i) {
    if (i >= stages.length) return;
    const [target, speed] = stages[i];
    const id = setInterval(() => {
      if (v >= target) {
        clearInterval(id);
        if (v >= 100) unlock();
        else runStage(i + 1);
        return;
      }
      v++;
      bar.style.width   = v + '%';
      pct.textContent   = v + '%';
    }, speed);
  }

  setTimeout(() => runStage(0), 400);

  function unlock() {
    btn.disabled = false;
    btn.classList.remove('locked');
    btn.classList.add('unlocked');
    // Make sure button is fully visible before animating
    gsap.killTweensOf(btn);
    gsap.fromTo(btn,
      { scale: 0.9 },
      { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' }
    );
    showToast('✅ Ready! Tap "Get Started" to begin 🎬');
  }
}

/* ══════════════════════════════════════════════════════════════
   §4  SCREEN 2 — AUTH (Login / Signup / OTP)
══════════════════════════════════════════════════════════════ */

function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('form-login').classList.toggle('hidden', !isLogin);
  document.getElementById('form-signup').classList.toggle('hidden',  isLogin);
  document.getElementById('tab-login').classList.toggle('active',    isLogin);
  document.getElementById('tab-signup').classList.toggle('active',  !isLogin);

  gsap.timeline()
    .to('#robot-svg', { rotation: isLogin ? -8 : 8, duration: 0.2 })
    .to('#robot-svg', { rotation: 0, duration: 0.4, ease: 'elastic.out(1,0.5)' });
}

function toggleRobotCheck() {
  if (APP.robotCheckPending) return; // prevent double click during buffer
  const cb = document.getElementById('robot-checkbox');
  const container = document.getElementById('robot-check-container');

  if (APP.robotChecked) {
    // Uncheck
    APP.robotChecked = false;
    cb.classList.remove('checked');
    gsap.to('#robot-mouth-happy', { opacity: 0, duration: 0.2 });
    gsap.to('#robot-screen', { attr: { width: 0 }, duration: 0.3 });
    return;
  }

  // Start 5-second verification buffer
  APP.robotCheckPending = true;
  cb.classList.remove('checked');
  cb.innerHTML = '<div class="check-spinner"></div>';

  // Show buffer bar
  let bufferEl = document.getElementById('robot-buffer-bar');
  if (!bufferEl) {
    bufferEl = document.createElement('div');
    bufferEl.id = 'robot-buffer-bar';
    bufferEl.innerHTML = `
      <div class="robot-verify-status">
        <span class="verify-spinner">⟳</span>
        <span id="robot-verify-text">Verifying you're human...</span>
      </div>
      <div class="robot-buffer-track">
        <div id="robot-buffer-fill" class="robot-buffer-fill"></div>
      </div>`;
    container.appendChild(bufferEl);
  }
  bufferEl.style.display = 'block';

  let pct = 0;
  const fill = document.getElementById('robot-buffer-fill');
  const txt  = document.getElementById('robot-verify-text');
  const stages = ['Verifying you\'re human...', 'Checking browser signals...', 'Almost done...', '✅ Verified!'];

  const interval = setInterval(() => {
    pct += 2;
    if (fill) fill.style.width = pct + '%';
    if (pct === 30 && txt) txt.textContent = stages[1];
    if (pct === 65 && txt) txt.textContent = stages[2];
    if (pct === 95 && txt) txt.textContent = stages[3];
    if (pct >= 100) {
      clearInterval(interval);
      APP.robotCheckPending = false;
      APP.robotChecked = true;
      cb.innerHTML = '<div class="check-inner"></div>';
      cb.classList.add('checked');
      bufferEl.style.display = 'none';
      document.getElementById('robot-check-msg')?.classList.add('hidden');
      gsap.timeline()
        .to('#robot-svg', { y: -16, duration: 0.22, ease: 'power2.out' })
        .to('#robot-svg', { y: 0,   duration: 0.45, ease: 'bounce.out' });
      gsap.to('#robot-mouth-happy', { opacity: 1, duration: 0.3 });
      gsap.to('#robot-screen', { attr: { width: 58 }, duration: 0.55 });
      showToast('✅ Human verified!');
    }
  }, 50); // 100 steps × 50ms = 5 seconds
}

function toggleRobotCheck2() {
  if (APP.robotCheckPending2) return;
  const cb = document.getElementById('robot-checkbox-2');
  const container = cb.closest('.robot-check');

  if (APP.robotChecked2) {
    APP.robotChecked2 = false;
    cb.classList.remove('checked');
    return;
  }

  APP.robotCheckPending2 = true;
  cb.innerHTML = '<div class="check-spinner"></div>';

  let bufferEl = document.getElementById('robot-buffer-bar-2');
  if (!bufferEl) {
    bufferEl = document.createElement('div');
    bufferEl.id = 'robot-buffer-bar-2';
    bufferEl.innerHTML = `
      <div class="robot-verify-status">
        <span class="verify-spinner">⟳</span>
        <span id="robot-verify-text-2">Verifying you're human...</span>
      </div>
      <div class="robot-buffer-track">
        <div id="robot-buffer-fill-2" class="robot-buffer-fill"></div>
      </div>`;
    container.appendChild(bufferEl);
  }
  bufferEl.style.display = 'block';

  let pct = 0;
  const fill = document.getElementById('robot-buffer-fill-2');
  const txt  = document.getElementById('robot-verify-text-2');

  const interval = setInterval(() => {
    pct += 2;
    if (fill) fill.style.width = pct + '%';
    if (pct === 30 && txt) txt.textContent = 'Checking browser signals...';
    if (pct === 65 && txt) txt.textContent = 'Almost done...';
    if (pct === 95 && txt) txt.textContent = '✅ Verified!';
    if (pct >= 100) {
      clearInterval(interval);
      APP.robotCheckPending2 = false;
      APP.robotChecked2 = true;
      cb.innerHTML = '<div class="check-inner"></div>';
      cb.classList.add('checked');
      bufferEl.style.display = 'none';
      document.getElementById('robot-check-msg-2')?.classList.add('hidden');
      showToast('✅ Human verified!');
    }
  }, 50);
}

function handleLogin() {
  const email = document.getElementById('login-email')?.value.trim() || '';
  APP.userEmail = email;
  APP.userName  = email.split('@')[0];
  const pass  = document.getElementById('login-pass')?.value.trim()  || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) { showToast('⚠️ Please enter a valid email address.'); return; }
  if (pass.length < 4)  { showToast('⚠️ Password must be at least 4 characters.'); return; }
  if (!APP.robotChecked) {
    document.getElementById('robot-check-msg')?.classList.remove('hidden');
    gsap.to('#robot-checkbox', {
      keyframes: [{ x: -6 }, { x: 6 }, { x: -6 }, { x: 6 }, { x: 0 }],
      duration: 0.4
    });
    return;
  }
  showOTPBox();
}

function handleSignup() {
  const fname = document.getElementById('signup-fname')?.value.trim() || '';
  const lname = document.getElementById('signup-lname')?.value.trim() || '';
  const email = document.getElementById('signup-email')?.value.trim() || '';
  const phone = document.getElementById('signup-phone')?.value.trim() || '';
  const pass  = document.getElementById('signup-pass')?.value.trim()  || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!fname) { showToast('⚠️ First name is required.'); return; }
  if (!lname) { showToast('⚠️ Last name is required.'); return; }
  if (!emailRegex.test(email)) { showToast('⚠️ Please enter a valid email address.'); return; }
  if (phone.replace(/\D/g, '').length < 10) { showToast('⚠️ Enter a valid 10-digit phone number.'); return; }
  if (pass.length < 6) { showToast('⚠️ Password must be at least 6 characters.'); return; }
  if (!APP.robotChecked2) {
    document.getElementById('robot-check-msg-2')?.classList.remove('hidden');
    gsap.to('#robot-checkbox-2', {
      keyframes: [{ x: -6 }, { x: 6 }, { x: -6 }, { x: 6 }, { x: 0 }],
      duration: 0.4
    });
    return;
  }
  // ✅ FIX 1: Save user details so booking OTP can use them
  APP.userName  = (fname + ' ' + lname).trim();
  APP.userEmail = email;
  showToast('✉️ Account created! Sending OTP…');
  setTimeout(showOTPBox, 700);
}

function showOTPBox() {
  const box = document.getElementById('otp-alert-box');
  if (!box) return;

  // Hide login/signup forms, show OTP box
  document.getElementById('form-login')?.classList.add('hidden');
  document.getElementById('form-signup')?.classList.add('hidden');
  box.classList.remove('hidden');

  // Arms extend on robot (visible on desktop)
  gsap.to('#arm-left',  { rotation: -38, transformOrigin: '100% 50%', duration: 0.5, ease: 'power2.out' });
  gsap.to('#arm-right', { rotation:  38, transformOrigin: '0% 50%',   duration: 0.5, ease: 'power2.out' });

  // Box pops in
  gsap.fromTo(box,
    { opacity: 0, scale: 0.85, y: 20 },
    { opacity: 1, scale: 1,    y: 0,  duration: 0.4, ease: 'back.out(1.9)' }
  );

  // Start 2-minute OTP countdown
  startOTPCountdown();

  setTimeout(() => {
    const digits = box.querySelectorAll('.otp-digit');
    setupOTPAutoTab(digits);
    digits[0]?.focus();
  }, 450);
}

function startOTPCountdown() {
  clearInterval(APP._otpTimer);
  APP._otpExpired = false;
  let remaining = 120; // 2 minutes
  const timerEl = document.getElementById('otp-countdown');
  const timerWrap = document.getElementById('otp-timer-wrap');
  if (timerWrap) timerWrap.style.display = 'flex';
  if (timerEl) timerEl.textContent = '2:00';

  APP._otpTimer = setInterval(() => {
    remaining--;
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    if (timerEl) {
      timerEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;
      timerEl.style.color = remaining <= 30 ? '#ef4444' : '#facc15';
    }
    if (remaining <= 0) {
      clearInterval(APP._otpTimer);
      APP._otpExpired = true;
      if (timerEl) timerEl.textContent = 'Expired';
      showToast('⏰ OTP expired! Please login again.');
      // Shake the box
      gsap.to('#otp-alert-box', { keyframes: [{ x:-8 },{x:8},{x:-8},{x:0}], duration:0.4 });
      // Disable verify button
      const btn = document.querySelector('#otp-alert-box .btn-primary');
      if (btn) { btn.disabled = true; btn.textContent = '⏰ OTP Expired — Resend'; btn.onclick = resendOTP; }
    }
  }, 1000);
}

function resendOTP() {
  const box = document.getElementById('otp-alert-box');
  box?.querySelectorAll('.otp-digit').forEach(d => { d.value = ''; });
  const btn = document.querySelector('#otp-alert-box .btn-primary');
  if (btn) { btn.disabled = false; btn.textContent = 'Verify & Continue →'; btn.onclick = verifyOTP; }
  startOTPCountdown();
  showToast('📱 New OTP sent! Demo: 123456');
}

function cancelOTP() {
  clearInterval(APP._otpTimer);
  APP._otpExpired = false;
  const box = document.getElementById('otp-alert-box');
  box?.classList.add('hidden');
  // Clear OTP inputs
  box?.querySelectorAll('.otp-digit').forEach(d => { d.value = ''; });
  // Reset verify button
  const btn = box?.querySelector('.btn-primary');
  if (btn) { btn.disabled = false; btn.textContent = 'Verify & Continue →'; btn.onclick = verifyOTP; }
  // Restore the login form
  document.getElementById('form-login')?.classList.remove('hidden');
  // Reset robot arms
  gsap.to('#arm-left',  { rotation: 0, duration: 0.3 });
  gsap.to('#arm-right', { rotation: 0, duration: 0.3 });
}

/** Auto-advance focus between OTP digit inputs */
function setupOTPAutoTab(digits) {
  digits.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/, '').slice(0, 1);
      if (inp.value && i < digits.length - 1) digits[i + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) digits[i - 1].focus();
    });
  });
}

/** Verify login OTP (demo: 123456) */
function verifyOTP() {
  if (APP._otpExpired) { showToast('⏰ OTP expired! Click Resend.'); return; }
  const box  = document.getElementById('otp-alert-box');
  const code = Array.from(box.querySelectorAll('.otp-digit')).map(d => d.value).join('');

  if (code === '123456') {
    clearInterval(APP._otpTimer);
    showToast('✅ Verified! Welcome to PrepMyShow 🎉');
    gsap.to(box, {
      opacity: 0, scale: 0.75, y: -20, duration: 0.4,
      onComplete() {
        box.classList.add('hidden');
        box.querySelectorAll('.otp-digit').forEach(d => { d.value = ''; });
        // Reset robot arms
        gsap.to('#arm-left',  { rotation: 0, duration: 0.3 });
        gsap.to('#arm-right', { rotation: 0, duration: 0.3 });
        // Reset APP state for next login
        APP.robotChecked  = false;
        APP.robotChecked2 = false;
        document.getElementById('robot-checkbox')?.classList.remove('checked');
        document.getElementById('robot-checkbox-2')?.classList.remove('checked');
        goToScreen('screen-dashboard');
      }
    });
  } else {
    showToast('❌ Wrong OTP — hint: 123456');
    gsap.to(box, { keyframes: [{ x: -8 }, { x: 8 }, { x: -8 }, { x: 8 }, { x: 0 }], duration: 0.4 });
    box.querySelectorAll('.otp-digit').forEach(d => { d.value = ''; });
    box.querySelectorAll('.otp-digit')[0]?.focus();
  }
}

/* ══════════════════════════════════════════════════════════════
   §5  SCREEN 3 — DASHBOARD
══════════════════════════════════════════════════════════════ */

function initDashboard() {
  renderMovieGrid('bollywood-grid', MOVIES.bollywood);
  renderMovieGrid('hollywood-grid', MOVIES.hollywood);
  initHeroSlider();
  initVisitorGraph();
  initDraggableLogo();
  initCityList();
}

/** Bottom nav tab switching */
function setNavTab(el, section) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['movies','stream','events','plays','sports','activities'].forEach(s => {
    document.getElementById(`section-${s}`)?.classList.toggle('hidden', s !== section);
  });
}

function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  menu.classList.toggle('hidden');
  if (!menu.classList.contains('hidden')) {
    gsap.fromTo(menu, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.2 });
  }
}

document.addEventListener('click', e => {
  if (!e.target.closest('.profile-wrap'))
    document.getElementById('profile-menu')?.classList.add('hidden');
});

/* ══════════════════════════════════════════════════════════════
   §6  HERO SLIDER
══════════════════════════════════════════════════════════════ */

function initHeroSlider() {
  clearInterval(APP.sliderTimer);
  goToSlide(0);
  APP.sliderTimer = setInterval(() => {
    goToSlide((APP.currentSlide + 1) % 4);
  }, 5000);
}

function goToSlide(idx) {
  APP.currentSlide = idx;
  document.querySelectorAll('.hero-slide').forEach((s, i) => {
    const active = i === idx;
    s.classList.toggle('active', active);
    if (active) gsap.fromTo(s, { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out' });
  });
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));

  // Re-draw graph when slide 1 becomes active
  if (idx === 0) {
    setTimeout(initVisitorGraph, 100);
  }
}

/* ══════════════════════════════════════════════════════════════
   §7  VISITOR GRAPH (Canvas — Slide 1)
══════════════════════════════════════════════════════════════ */

function initVisitorGraph() {
  const canvas = document.getElementById('visitor-graph');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const raw = [12, 18, 14, 22, 30, 28, 45, 52, 63, 71, 85, 100];
  const max = Math.max(...raw);
  const pad = { t: 20, b: 30, l: 8, r: 8 };
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  const pts = raw.map((v, i) => ({
    x: pad.l + (i / (raw.length - 1)) * (W - pad.l - pad.r),
    y: pad.t + (1 - v / max) * (H - pad.t - pad.b),
  }));

  let startTs = null;
  (function draw(ts) {
    if (!startTs) startTs = ts;
    const prog = Math.min((ts - startTs) / 2200, 1);
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + (g / 4) * (H - pad.t - pad.b);
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
    }

    const n    = Math.floor(prog * (pts.length - 1));
    const frac = (prog * (pts.length - 1)) % 1;

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(250,204,21,0.28)');
    grad.addColorStop(1, 'rgba(250,204,21,0)');

    ctx.beginPath();
    ctx.moveTo(pts[0].x, H - pad.b);
    pts.slice(0, n + 1).forEach((pt, i) => {
      if (i === 0) ctx.lineTo(pt.x, pt.y);
      else {
        const cp = { x: (pts[i - 1].x + pt.x) / 2, y: (pts[i - 1].y + pt.y) / 2 };
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, cp.x, cp.y);
      }
    });
    if (n < pts.length - 1) {
      const lx = pts[n].x + frac * (pts[n + 1].x - pts[n].x);
      const ly = pts[n].y + frac * (pts[n + 1].y - pts[n].y);
      ctx.lineTo(lx, ly); ctx.lineTo(lx, H - pad.b);
    } else ctx.lineTo(pts[n].x, H - pad.b);
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    pts.slice(0, n + 1).forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else {
        const cp = { x: (pts[i - 1].x + pt.x) / 2, y: (pts[i - 1].y + pt.y) / 2 };
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, cp.x, cp.y);
      }
    });
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();

    // Dots + month labels
    pts.slice(0, n + 1).forEach((pt, i) => {
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '9px Poppins,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(months[i], pt.x, H - 5);
    });

    if (prog < 1) requestAnimationFrame(draw);
  })(performance.now());
}

/* ══════════════════════════════════════════════════════════════
   §8  DRAGGABLE LOGO
══════════════════════════════════════════════════════════════ */

function initDraggableLogo() {
  const logo = document.getElementById('draggable-logo');
  if (!logo) return;
  let dragging = false, ox = 0, oy = 0;

  logo.addEventListener('mousedown', e => {
    dragging = true;
    const r = logo.getBoundingClientRect();
    ox = e.clientX - r.left; oy = e.clientY - r.top;
    logo.style.cssText += ';cursor:grabbing;position:fixed;z-index:9999;margin:0;';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    logo.style.left = (e.clientX - ox) + 'px';
    logo.style.top  = (e.clientY - oy) + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    logo.style.cursor = 'grab';
    gsap.to(logo, { left: '', top: '', position: 'relative', duration: 0.65, ease: 'elastic.out(1,0.5)', clearProps: 'all' });
  });
}

/* ══════════════════════════════════════════════════════════════
   §9  CITY MODAL
══════════════════════════════════════════════════════════════ */

const CITIES = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata',
  'Pune','Ahmedabad','Jaipur','Surat','Lucknow','Kanpur',
  'Nagpur','Indore','Bhopal','Visakhapatnam','Patna','Vadodara',
  'Ghaziabad','Ludhiana','Coimbatore','Agra','Nashik','Mangrol',
];

function initCityList() { renderCities(CITIES); }

function renderCities(list) {
  const grid = document.getElementById('city-list');
  if (!grid) return;
  grid.innerHTML = list.map(c =>
    `<div class="city-item" onclick="selectCity('${c}')">${c}</div>`
  ).join('');
}

function filterCities(q) {
  renderCities(CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase())));
}

function selectCity(city) {
  APP.city = city;
  document.getElementById('selected-city').textContent = city;
  toggleCityModal();
  showToast(`📍 City set to ${city}`);
}

function toggleCityModal() {
  const m = document.getElementById('city-modal');
  m.classList.toggle('hidden');
  if (!m.classList.contains('hidden')) {
    gsap.fromTo('.modal-box', { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 0.28, ease: 'back.out(1.5)' });
  }
}

function closeCityModal(e) {
  if (e.target === document.getElementById('city-modal')) toggleCityModal();
}

/* ══════════════════════════════════════════════════════════════
   §10  SEARCH
══════════════════════════════════════════════════════════════ */

function handleSearch(q) {
  const dd = document.getElementById('search-results');
  if (!q.trim()) { dd.classList.add('hidden'); return; }

  const pool = [
    ...MOVIES.bollywood, ...MOVIES.hollywood
  ].map(m => ({ ...m, type: '🎬 Movie' })).concat([
    { title: 'IPL 2025 Finals',    type: '🏆 Sports' },
    { title: 'Coldplay Mumbai',    type: '🎵 Event'  },
    { title: 'Diljit Tour 2025',   type: '🎵 Event'  },
    { title: 'Comedy Night Live',  type: '🎭 Comedy' },
  ]).filter(x => x.title.toLowerCase().includes(q.toLowerCase())).slice(0, 6);

  if (!pool.length) { dd.classList.add('hidden'); return; }

  dd.innerHTML = pool.map(x =>
    `<div class="search-result-item" onclick='_searchSelect(${JSON.stringify(x)})'>
       <span>${x.type}</span>
       <span style="font-weight:600;color:#fff">${x.title}</span>
     </div>`
  ).join('');
  dd.classList.remove('hidden');
}

function _searchSelect(item) {
  document.getElementById('search-results').classList.add('hidden');
  document.querySelector('.search-input').value = '';
  if (item && item.price) openMovieBooking(item);
  else showToast(`🔍 Showing: ${item.title}`);
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-container'))
    document.getElementById('search-results')?.classList.add('hidden');
});

/* ══════════════════════════════════════════════════════════════
   §11  MOVIE DATA + GRID
══════════════════════════════════════════════════════════════ */

const MOVIES = {
  bollywood: [
    { id:'king',    title:'King',         genre:'Action/Drama',    rating:'9.1', lang:'Hindi',        price:350, format:'IMAX',    poster:'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=420&fit=crop&crop=face' },
    { id:'ram',     title:'Ramayana',     genre:'Mythology/Epic',  rating:'9.4', lang:'Hindi',        price:400, format:'IMAX 3D', poster:'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=420&fit=crop' },
    { id:'sing3',   title:'Singham 3',    genre:'Action',          rating:'8.2', lang:'Hindi',        price:280, format:'4DX',     poster:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=420&fit=crop' },
    { id:'dunki2',  title:'Dunki 2',      genre:'Drama/Comedy',    rating:'8.7', lang:'Hindi',        price:300, format:'Standard',poster:'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=420&fit=crop' },
    { id:'push3',   title:'Pushpa 3',     genre:'Action/Thriller', rating:'9.0', lang:'Telugu/Hindi', price:380, format:'IMAX',    poster:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=420&fit=crop' },
    { id:'fight2',  title:'Fighter 2',    genre:'Action',          rating:'8.5', lang:'Hindi',        price:350, format:'IMAX',    poster:'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&h=420&fit=crop' },
  ],
  hollywood: [
    { id:'av5',     title:'Avengers: Doomsday',      genre:'Action/Sci-Fi',     rating:'9.3', lang:'English', price:450, format:'IMAX 3D', poster:'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=420&fit=crop' },
    { id:'dune3',   title:'Dune: Part Three',         genre:'Sci-Fi/Epic',       rating:'9.1', lang:'English', price:420, format:'IMAX',    poster:'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=420&fit=crop' },
    { id:'mi9',     title:'Mission: Impossible 9',   genre:'Action/Thriller',   rating:'8.9', lang:'English', price:380, format:'4DX',     poster:'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=300&h=420&fit=crop' },
    { id:'av3',     title:'Avatar: Pandora Rising',  genre:'Sci-Fi/Adventure',  rating:'8.7', lang:'English', price:500, format:'IMAX 3D', poster:'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=420&fit=crop' },
    { id:'bat3',    title:'The Batman: Dark Knight', genre:'Action/Crime',       rating:'9.0', lang:'English', price:400, format:'IMAX',    poster:'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=300&h=420&fit=crop' },
    { id:'sp4',     title:'Spider-Man: Beyond',      genre:'Action/Superhero',  rating:'9.2', lang:'English', price:430, format:'IMAX 3D', poster:'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=420&fit=crop' },
  ],
};

function renderMovieGrid(containerId, movies) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  grid.innerHTML = movies.map((m, i) => `
    <div class="movie-card" style="animation-delay:${i * 0.07}s"
         onclick='openMovieBooking(${JSON.stringify(m)})'>
      <div class="movie-poster-wrap">
        <img src="${m.poster}" alt="${m.title}" class="movie-poster" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=420&fit=crop'"/>
        <div class="movie-format-tag">${m.format}</div>
        <div class="movie-overlay">
          <button class="book-now-btn"
                  onclick="event.stopPropagation();openMovieBooking(${JSON.stringify(m)})">
            Book Now →
          </button>
        </div>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${m.title}</h3>
        <div class="movie-meta">
          <span class="movie-rating">⭐ ${m.rating}</span>
          <span class="movie-lang">${m.lang}</span>
        </div>
        <p class="movie-genre">${m.genre}</p>
        <p class="movie-price">from ₹${m.price}</p>
      </div>
    </div>`).join('');

  gsap.fromTo(grid.querySelectorAll('.movie-card'),
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0,  duration: 0.45, stagger: 0.07, ease: 'power2.out' }
  );
}

const CITY_THEATRES = {
  'Mumbai':       ['PVR IMAX Andheri', 'Cinepolis Infinity Mall', 'INOX Megaplex Malad', 'BookMyShow Cinemas Thane'],
  'Delhi':        ['PVR DLF Promenade', 'INOX Nehru Place', 'Cinepolis Viviana Dwarka', 'Wave Cinemas Noida'],
  'Bangalore':    ['PVR Forum Mall', 'INOX Garuda Mall', 'Cinepolis Nexus Koramangala', 'Gopalan Cinemas Mysuru Rd'],
  'Hyderabad':    ['AMB Cinemas Gachibowli', 'PVR Inorbit Mall', 'Cinepolis Sarath City', 'INOX GVK One'],
  'Chennai':      ['SPI Cinemas Palazzo', 'PVR ECR', 'AGS Cinemas Anna Nagar', 'Sathyam Cinemas'],
  'Kolkata':      ['INOX South City', 'Cinepolis Acropolis', 'PVR Mani Square', 'Bigcinemas Kankurgachi'],
  'Pune':         ['PVR Phoenix Marketcity', 'INOX Bund Garden', 'Cinepolis Pavilion Mall', 'E-Square Cinemas'],
  'Ahmedabad':    ['PVR Himalaya Mall', 'INOX Iscon Megaplex', 'Cinepolis AlphaOne', 'Wide Angle Cinema'],
  'Jaipur':       ['PVR Crystal Palm', 'INOX GT Central', 'Cinepolis World Trade Park', 'Raj Mandir Cinema'],
  'Surat':        ['PVR Rahul Raj Mall', 'Cinepolis VR Mall', 'INOX Udhna', 'Fun Republic Surat'],
  'Lucknow':      ['PVR Saharaganj', 'INOX Fun Republic', 'Cinepolis Rave Moti', 'Wave Cinemas Lucknow'],
  'Nagpur':       ['Cinepolis Eternity Mall', 'PVR Empress City', 'INOX Poonam Chambers', 'Cinemax Nagpur'],
  'Mangrol':      ['Mangrol Talkies', 'City Cinema Mangrol', 'Star Theatre Mangrol'],
  'default':      ['PVR Cinemas', 'INOX Megaplex', 'Cinepolis', 'BookMyShow Partner Theatre'],
};

function getTheatresForCity(city) {
  return CITY_THEATRES[city] || CITY_THEATRES['default'];
}

function openMovieBooking(movie) {
  APP.selectedMovie = movie;
  APP.selectedSeats = [];

  // Get theatres for selected city
  const theatres = getTheatresForCity(APP.city);
  APP.selectedTheatre = theatres[0];

  document.getElementById('seat-movie-title').textContent = movie.title;
  document.getElementById('seat-show-info').textContent   = `Today, 7:00 PM | ${movie.format}`;
  document.getElementById('success-movie').textContent    = movie.title;

  // Show theatre selector popup
  showTheatreSelector(movie, theatres);
}

function showTheatreSelector(movie, theatres) {
  const existing = document.getElementById('theatre-select-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'theatre-select-modal';
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:480px;width:90%">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-black text-white text-lg">🎬 Select Theatre in ${APP.city}</h3>
        <button onclick="document.getElementById('theatre-select-modal').remove()" class="text-gray-400 hover:text-white text-xl">✕</button>
      </div>
      <p class="text-gray-400 text-sm mb-4">${movie.title} — ${movie.format} | Today 7:00 PM</p>
      <div class="theatre-list">
        ${theatres.map((t, i) => `
          <div class="theatre-option" onclick="selectTheatre('${t}')">
            <div class="theatre-opt-left">
              <span class="theatre-num">${i + 1}</span>
              <div>
                <p class="theatre-name">${t}</p>
                <p class="theatre-meta">${APP.city} • ${['IMAX','4DX','Standard','Dolby'][i % 4]} • ${['7:00 PM','8:30 PM','4:15 PM','10:00 PM'][i % 4]}</p>
              </div>
            </div>
            <span class="theatre-arrow">→</span>
          </div>`).join('')}
      </div>
    </div>`;

  document.body.appendChild(modal);
  gsap.fromTo('.modal-box', { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' });
}

function selectTheatre(theatre) {
  APP.selectedTheatre = theatre;
  document.getElementById('theatre-select-modal')?.remove();
  document.getElementById('seat-show-info').textContent = `Today, 7:00 PM | ${APP.selectedMovie?.format} | ${theatre}`;
  // Update cab drop field
  const cabDrop = document.querySelector('#cab-form input[readonly]');
  if (cabDrop) cabDrop.value = theatre;
  goToScreen('screen-seats');
}

/* ══════════════════════════════════════════════════════════════
   §12  SEAT SELECTION
══════════════════════════════════════════════════════════════ */

const SEAT_CONFIG = {
  platinum: { rows: 2,  cols: 10, price: 500, label: 'Platinum' },
  gold:     { rows: 3,  cols: 12, price: 350, label: 'Gold'     },
  normal:   { rows: 5,  cols: 14, price: 200, label: 'Normal'   },
};

const BOOKED_PRESET = new Set([
  'A3','A7','B2','B9','C4','C8','C11','D3','D6',
  'E1','E10','F5','F9','G2','H7','H11','I4','J3',
]);

function renderSeatMap() {
  const container = document.getElementById('seat-map');
  if (!container) return;
  container.innerHTML = '';
  APP.selectedSeats = [];
  updateSeatUI();

  let rowCode = 65; // 'A'

  Object.entries(SEAT_CONFIG).forEach(([type, cfg]) => {
    // Section label
    const lbl = document.createElement('div');
    lbl.className = 'seat-category-label';
    lbl.innerHTML = `<span class="seat-cat-badge ${type}">${cfg.label}</span>
                     <span class="seat-cat-price">₹${cfg.price}</span>`;
    container.appendChild(lbl);

    for (let r = 0; r < cfg.rows; r++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';
      const rowId = String.fromCharCode(rowCode++);

      const rowLbl = document.createElement('span');
      rowLbl.className = 'row-label';
      rowLbl.textContent = rowId;
      rowEl.appendChild(rowLbl);

      const mid = Math.ceil(cfg.cols / 2);

      for (let c = 1; c <= cfg.cols; c++) {
        if (c === mid + 1) {
          const aisle = document.createElement('div');
          aisle.className = 'aisle-gap';
          rowEl.appendChild(aisle);
        }
        const sid  = `${rowId}${c}`;
        const seat = document.createElement('button');
        seat.className       = `seat ${type}`;
        seat.id              = `seat-${sid}`;
        seat.dataset.id      = sid;
        seat.dataset.type    = type;
        seat.dataset.price   = cfg.price;
        seat.title           = sid;

        if (BOOKED_PRESET.has(sid)) { seat.classList.add('booked'); seat.disabled = true; }

        seat.addEventListener('click', () => toggleSeat(seat, sid, type, cfg.price));
        seat.addEventListener('mouseenter', () => { if (!seat.classList.contains('booked')) showSeatTooltip(seat, sid, type); });
        seat.addEventListener('mouseleave', hideSeatTooltip);
        rowEl.appendChild(seat);
      }
      container.appendChild(rowEl);
    }
  });
}

function toggleSeat(el, id, type, price) {
  if (el.classList.contains('booked')) return;
  const idx = APP.selectedSeats.indexOf(id);
  if (idx === -1) {
    APP.selectedSeats.push(id);
    el.classList.add('selected');
    gsap.fromTo(el, { scale: 0.55 }, { scale: 1, duration: 0.38, ease: 'elastic.out(1,0.5)' });
    // Show seat info popup
    showSeatInfoPopup(id, type, price);
  } else {
    APP.selectedSeats.splice(idx, 1);
    el.classList.remove('selected');
    gsap.to(el, { scale: 0.88, duration: 0.12, yoyo: true, repeat: 1 });
  }
  updateSeatUI();
}

function showSeatInfoPopup(id, type, price) {
  // Remove existing popup
  document.getElementById('seat-info-popup')?.remove();

  const features = {
    platinum: {
      color: '#818cf8',
      icon: '👑',
      title: 'Platinum Seat',
      features: [
        '🎯 Front-row premium experience',
        '🦺 Recliner-style cushioning',
        '📐 Wide legroom (extra 6")',
        '❄️ Personal AC vent nearby',
        '⚠️ Note: High neck tilt angle (~70°)',
      ],
      price: 500
    },
    gold: {
      color: '#fbbf24',
      icon: '⭐',
      title: 'Gold Seat',
      features: [
        '✅ Best viewing angle (center)',
        '🪑 Plush cushioned seat',
        '👀 Perfect screen distance',
        '🔊 Optimal surround sound zone',
        '🎬 Most recommended section',
      ],
      price: 350
    },
    normal: {
      color: '#94a3b8',
      icon: '🎟️',
      title: 'Normal Seat',
      features: [
        '📺 Good rear-view experience',
        '💰 Most affordable option',
        '🚶 Easy aisle access',
        '🎬 Standard comfort seating',
        '✔️ Value for money',
      ],
      price: 200
    }
  };

  const f = features[type];
  const popup = document.createElement('div');
  popup.id = 'seat-info-popup';
  popup.className = 'seat-info-popup';
  popup.innerHTML = `
    <div class="seat-popup-content">
      <button class="seat-popup-close" onclick="document.getElementById('seat-info-popup')?.remove()">✕</button>
      <div class="seat-popup-header" style="border-color:${f.color}">
        <span class="seat-popup-icon">${f.icon}</span>
        <div>
          <h3 style="color:${f.color}">${f.title} — ${id}</h3>
          <p class="seat-popup-price">₹${f.price} per seat</p>
        </div>
        <div class="seat-popup-badge" style="background:${f.color}20;border-color:${f.color}40;color:${f.color}">
          Selected ✓
        </div>
      </div>
      <ul class="seat-popup-features">
        ${f.features.map(ft => `<li>${ft}</li>`).join('')}
      </ul>
      <div class="seat-popup-footer">
        <span>Seat <strong>${id}</strong> added to your selection</span>
        <span style="color:${f.color};font-weight:700">₹${f.price}</span>
      </div>
    </div>`;

  document.getElementById('screen-seats').appendChild(popup);
  gsap.fromTo(popup, { opacity: 0, scale: 0.8, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' });

  // Auto-hide after 3.5 seconds
  setTimeout(() => {
    if (document.getElementById('seat-info-popup') === popup) {
      gsap.to(popup, { opacity: 0, y: 20, duration: 0.3, onComplete: () => popup.remove() });
    }
  }, 3500);
}

function updateSeatUI() {
  const count = APP.selectedSeats.length;
  document.getElementById('seat-count-display').textContent = `${count} Seat${count !== 1 ? 's' : ''}`;
  document.getElementById('seat-total').textContent = `₹${calcSeatTotal()}`;
  const btn = document.getElementById('proceed-snacks-btn');
  if (btn) btn.disabled = count === 0;
}

function calcSeatTotal() {
  return APP.selectedSeats.reduce((s, id) => {
    const el = document.getElementById(`seat-${id}`);
    return s + (el ? +el.dataset.price : 0);
  }, 0);
}

function showSeatTooltip(el, id, type) {
  const tip = document.getElementById('seat-tooltip');
  if (!tip) return;
  const rect = el.getBoundingClientRect();

  let html = '';
  if (type === 'platinum') {
    const row = id.charCodeAt(0) - 65;
    html = `<strong style="color:#facc15">${id} – Platinum</strong><br>
            📐 Neck Angle: <b>${row === 0 ? '~72°' : '~65°'}</b><br>
            😬 Pain Risk: <b style="color:#f97316">${row === 0 ? '~68%' : '~55%'}</b>`;
  } else if (type === 'gold') {
    html = `<strong style="color:#fbbf24">${id} – Gold</strong><br>✅ Comfortable angle<br>₹350/seat`;
  } else {
    html = `<strong style="color:#94a3b8">${id} – Normal</strong><br>🎬 Standard view<br>₹200/seat`;
  }

  tip.innerHTML = html;
  tip.style.top  = (rect.top  - 120) + 'px';
  tip.style.left = (rect.left - 60)  + 'px';
  tip.classList.remove('hidden');
  gsap.fromTo(tip, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.18 });
}

function hideSeatTooltip() {
  document.getElementById('seat-tooltip')?.classList.add('hidden');
}

/* ══════════════════════════════════════════════════════════════
   §13  SNACKS
══════════════════════════════════════════════════════════════ */

const SNACKS = [
  {id:'s01',name:'Butter Popcorn (Lg)',    price:220,emoji:'🍿',cat:'Popcorn',   img:'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=120&h=120&fit=crop'},
  {id:'s02',name:'Caramel Popcorn',        price:250,emoji:'🍿',cat:'Popcorn',   img:'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=120&h=120&fit=crop'},
  {id:'s03',name:'Choco Popcorn',          price:230,emoji:'🍿',cat:'Popcorn',   img:'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=120&h=120&fit=crop'},
  {id:'s04',name:'Spicy Tangy Popcorn',    price:200,emoji:'🍿',cat:'Popcorn',   img:'https://images.unsplash.com/photo-1594480634534-7f4d37f6e3e0?w=120&h=120&fit=crop'},
  {id:'s05',name:'Masala Popcorn',         price:190,emoji:'🍿',cat:'Popcorn',   img:'https://images.unsplash.com/photo-1639581271600-7eda09f56aa8?w=120&h=120&fit=crop'},
  {id:'s06',name:'Cheesy Nachos',          price:199,emoji:'🧀',cat:'Snacks',    img:'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=120&h=120&fit=crop'},
  {id:'s07',name:'Cheese Fries',           price:179,emoji:'🍟',cat:'Snacks',    img:'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=120&h=120&fit=crop'},
  {id:'s08',name:'Peri Peri Fries',        price:159,emoji:'🍟',cat:'Snacks',    img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop'},
  {id:'s09',name:'Onion Rings',            price:149,emoji:'🧅',cat:'Snacks',    img:'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=120&h=120&fit=crop'},
  {id:'s10',name:'Mozzarella Sticks',      price:229,emoji:'🧀',cat:'Snacks',    img:'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=120&h=120&fit=crop'},
  {id:'s11',name:'Salted Peanuts',         price:80, emoji:'🥜',cat:'Snacks',    img:'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=120&h=120&fit=crop'},
  {id:'s12',name:'Butter Corn Cup',        price:89, emoji:'🌽',cat:'Snacks',    img:'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=120&h=120&fit=crop'},
  {id:'s13',name:'Veg Burger',             price:179,emoji:'🍔',cat:'Food',      img:'https://images.unsplash.com/photo-1550317138-10000687a72b?w=120&h=120&fit=crop'},
  {id:'s14',name:'Chicken Burger',         price:229,emoji:'🍔',cat:'Food',      img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop'},
  {id:'s15',name:'Hot Dog',                price:159,emoji:'🌭',cat:'Food',      img:'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=120&h=120&fit=crop'},
  {id:'s16',name:'Pizza Slice',            price:199,emoji:'🍕',cat:'Food',      img:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&h=120&fit=crop'},
  {id:'s17',name:'Cheese Pizza (6")',      price:279,emoji:'🍕',cat:'Food',      img:'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=120&h=120&fit=crop'},
  {id:'s18',name:'Grilled Sandwich',       price:149,emoji:'🥪',cat:'Food',      img:'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=120&h=120&fit=crop'},
  {id:'s19',name:'Chicken Wings (6pc)',    price:299,emoji:'🍗',cat:'Food',      img:'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=120&h=120&fit=crop'},
  {id:'s20',name:'Samosa (2 pcs)',         price:60, emoji:'🥟',cat:'Desi',      img:'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=120&h=120&fit=crop'},
  {id:'s21',name:'Aloo Tikki Chaat',       price:89, emoji:'🥙',cat:'Desi',      img:'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=120&h=120&fit=crop'},
  {id:'s22',name:'Paneer Tikka (6pc)',     price:249,emoji:'🧆',cat:'Desi',      img:'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=120&h=120&fit=crop'},
  {id:'s23',name:'Dahi Puri (6pc)',        price:99, emoji:'🫙',cat:'Desi',      img:'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=120&h=120&fit=crop'},
  {id:'s24',name:'Pav Bhaji',              price:129,emoji:'🍞',cat:'Desi',      img:'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=120&h=120&fit=crop'},
  {id:'s25',name:'Chole Bhature',          price:149,emoji:'🥙',cat:'Desi',      img:'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=120&h=120&fit=crop'},
  {id:'s26',name:'Coke (500ml)',           price:99, emoji:'🥤',cat:'Drinks',    img:'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=120&h=120&fit=crop'},
  {id:'s27',name:'Sprite (500ml)',         price:99, emoji:'🥤',cat:'Drinks',    img:'https://images.unsplash.com/photo-1625772452859-1c03d884dcd7?w=120&h=120&fit=crop'},
  {id:'s28',name:'Mango Frooti',           price:60, emoji:'🥭',cat:'Drinks',    img:'https://images.unsplash.com/photo-1546173159-315724a31696?w=120&h=120&fit=crop'},
  {id:'s29',name:'Mineral Water',          price:40, emoji:'💧',cat:'Drinks',    img:'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=120&h=120&fit=crop'},
  {id:'s30',name:'Masala Tea',             price:50, emoji:'☕',cat:'Drinks',    img:'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=120&h=120&fit=crop'},
  {id:'s31',name:'Cold Coffee',            price:149,emoji:'☕',cat:'Drinks',    img:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=120&h=120&fit=crop'},
  {id:'s32',name:'Mojito (Virgin)',        price:149,emoji:'🍹',cat:'Drinks',    img:'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=120&h=120&fit=crop'},
  {id:'s33',name:'Fresh Lime Soda',        price:79, emoji:'🍋',cat:'Drinks',    img:'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=120&h=120&fit=crop'},
  {id:'s34',name:'Red Bull',               price:149,emoji:'🥫',cat:'Drinks',    img:'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=120&h=120&fit=crop'},
  {id:'s35',name:'Coconut Water',          price:99, emoji:'🥥',cat:'Drinks',    img:'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=120&h=120&fit=crop'},
  {id:'s36',name:'Choco Brownie',          price:129,emoji:'🍫',cat:'Desserts',  img:'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=120&h=120&fit=crop'},
  {id:'s37',name:'Ice Cream Cup',          price:99, emoji:'🍦',cat:'Desserts',  img:'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=120&h=120&fit=crop'},
  {id:'s38',name:'Waffle Cone',            price:149,emoji:'🧇',cat:'Desserts',  img:'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=120&h=120&fit=crop'},
  {id:'s39',name:'Oreo Shake',             price:179,emoji:'🥛',cat:'Desserts',  img:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop'},
  {id:'s40',name:'Kulfi on Stick',         price:80, emoji:'🍡',cat:'Desserts',  img:'https://images.unsplash.com/photo-1629903152308-9d4dce2c19db?w=120&h=120&fit=crop'},
  {id:'s41',name:'Gulab Jamun (2pc)',      price:70, emoji:'🍮',cat:'Desserts',  img:'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=120&h=120&fit=crop'},
  {id:'s42',name:'Tiramisu Cup',           price:199,emoji:'🍰',cat:'Desserts',  img:'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=120&h=120&fit=crop'},
  {id:'s43',name:'Nutella Waffle',         price:179,emoji:'🧇',cat:'Desserts',  img:'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=120&h=120&fit=crop'},
  {id:'s44',name:'Masala Soda',            price:60, emoji:'🥤',cat:'Drinks',    img:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&h=120&fit=crop'},
  {id:'s45',name:'Iced Americano',         price:159,emoji:'☕',cat:'Drinks',    img:'https://images.unsplash.com/photo-1568649929103-28ffbefaca1e?w=120&h=120&fit=crop'},
  {id:'s46',name:'Combo: Popcorn+Coke',   price:289,emoji:'🎁',cat:'Combos',    img:'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=120&h=120&fit=crop'},
  {id:'s47',name:'Combo: Burger+Fries+Coke',price:349,emoji:'🎁',cat:'Combos',  img:'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=120&h=120&fit=crop'},
  {id:'s48',name:'Combo: 2 Popcorn+2 Coke',price:449,emoji:'🎁',cat:'Combos',  img:'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=120&h=120&fit=crop'},
  {id:'s49',name:'Mixed Nuts Pack',        price:120,emoji:'🥜',cat:'Snacks',    img:'https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=120&h=120&fit=crop'},
  {id:'s50',name:'Chilli Cheese Toast',    price:129,emoji:'🍞',cat:'Snacks',    img:'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=120&h=120&fit=crop'},
];

function renderSnacks() {
  const grid = document.getElementById('snack-grid');
  if (!grid) return;

  const cats = {};
  SNACKS.forEach(s => { if (!cats[s.cat]) cats[s.cat] = []; cats[s.cat].push(s); });

  grid.innerHTML = Object.entries(cats).map(([cat, items]) => `
    <div class="snack-category">
      <h3 class="snack-cat-title">${cat}</h3>
      <div class="snack-items-row">
        ${items.map(s => `
          <div class="snack-item" id="snack-item-${s.id}">
            <div class="snack-img-wrap">
              <img src="${s.img}" alt="${s.name}" class="snack-img"
                   onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
              <div class="snack-emoji-fallback" style="display:none">${s.emoji}</div>
            </div>
            <div class="snack-name">${s.name}</div>
            <div class="snack-price">₹${s.price}</div>
            <div class="snack-qty-ctrl">
              <button onclick="changeSnackQty('${s.id}',-1)">−</button>
              <span id="qty-${s.id}">${APP.snackCart[s.id] || 0}</span>
              <button onclick="changeSnackQty('${s.id}',1)">+</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');

  updateSnackTotal();
}

function changeSnackQty(id, delta) {
  const snack = SNACKS.find(s => s.id === id);
  if (!snack) return;
  APP.snackCart[id] = Math.max(0, (APP.snackCart[id] || 0) + delta);
  const qEl = document.getElementById(`qty-${id}`);
  if (qEl) qEl.textContent = APP.snackCart[id];
  document.getElementById(`snack-item-${id}`)?.classList.toggle('in-cart', APP.snackCart[id] > 0);
  if (delta > 0 && qEl) gsap.fromTo(qEl, { scale: 1.6, color: '#facc15' }, { scale: 1, color: '', duration: 0.3 });
  updateSnackTotal();
}

function calcSnackTotal() {
  return Object.entries(APP.snackCart).reduce((sum, [id, qty]) => {
    const s = SNACKS.find(x => x.id === id);
    return sum + (s ? s.price * qty : 0);
  }, 0);
}

function updateSnackTotal() {
  const sn = calcSnackTotal(), se = calcSeatTotal();
  document.getElementById('snack-total-display').textContent = `₹${sn}`;
  document.getElementById('grand-total-display').textContent = `₹${se + sn}`;
}

/* ══════════════════════════════════════════════════════════════
   §14  CAB BOOKING
══════════════════════════════════════════════════════════════ */

const DRIVERS = [
  { name:'Suresh Kumar',  exp:'8 Years',  phone:'+91 98100 55123', rating:'4.8', female:'5.0', seed:'driver1', car:'Maruti Suzuki Ertiga', plate:'MH 02 AB 4521', color:'White'  },
  { name:'Ramesh Yadav',  exp:'5 Years',  phone:'+91 97200 44211', rating:'4.6', female:'4.9', seed:'driver2', car:'Toyota Innova Crysta', plate:'MH 04 CD 9832', color:'Silver' },
  { name:'Anil Patil',    exp:'12 Years', phone:'+91 99300 12345', rating:'4.9', female:'5.0', seed:'driver3', car:'Honda City',           plate:'MH 01 EF 7723', color:'Black'  },
  { name:'Vikram Singh',  exp:'6 Years',  phone:'+91 96100 88877', rating:'4.7', female:'4.8', seed:'driver4', car:'Hyundai Creta',        plate:'MH 03 GH 3341', color:'Red'    },
];

function skipCab() {
  APP.cabBooked = false;
  goToScreen('screen-payment');
}

function bookCab() {
  const pickup = document.getElementById('pickup-addr')?.value.trim();
  const name   = document.getElementById('cab-pax-name')?.value.trim();
  const phone  = document.getElementById('cab-phone')?.value.trim();
  if (!pickup) { showToast('⚠️ Enter your pickup address.'); return; }
  if (!name)   { showToast('⚠️ Enter your name.');          return; }
  if (!phone)  { showToast('⚠️ Enter your phone number.');  return; }

  APP.cabBooked = true;
  const d = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
  populateDriverCard(d);
  goToScreen('screen-driver');
}

function populateDriverCard(d) {
  document.getElementById('driver-name').textContent  = d.name;
  document.getElementById('driver-exp').textContent   = `🕐 ${d.exp} Experience`;
  document.getElementById('driver-phone').textContent = `📞 ${d.phone}`;
  document.getElementById('driver-photo').src =
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.seed}&backgroundColor=b6e3f4`;
  const rg = document.querySelectorAll('.driver-rating-item span');
  if (rg[0]) rg[0].textContent = `${d.rating}⭐`;
  if (rg[1]) rg[1].textContent = `${d.female}♀`;
  const vt = document.querySelectorAll('.vehicle-tag');
  if (vt[0]) vt[0].textContent = `🚗 ${d.car}`;
  if (vt[1]) vt[1].textContent = d.plate;
  if (vt[2]) vt[2].textContent = d.color;
}

function animateDriverCard() {
  gsap.fromTo('.driver-id-card',
    { opacity: 0, y: 40, rotationY: -15 },
    { opacity: 1, y: 0,  rotationY: 0,  duration: 0.7, ease: 'power3.out' }
  );
}

/* ══════════════════════════════════════════════════════════════
   §15  PAYMENT
══════════════════════════════════════════════════════════════ */

function selectPayment(method) {
  APP.payMethod = method;
  document.getElementById('upi-input-section').classList.toggle('hidden', method !== 'upi');
  document.getElementById('card-input-section').classList.toggle('hidden', method !== 'card');
}

function updatePaymentSummary() {
  const tickets = calcSeatTotal();
  const snacks  = calcSnackTotal();
  const cab     = APP.cabBooked ? 299 : 0;
  const total   = tickets + snacks + cab + 49;
  document.getElementById('pay-tickets').textContent = `₹${tickets}`;
  document.getElementById('pay-snacks').textContent  = `₹${snacks}`;
  document.getElementById('pay-cab').textContent     = `₹${cab}`;
  document.getElementById('pay-total').textContent   = `₹${total}`;
  const row = document.getElementById('cab-summary-row');
  if (row) row.style.display = APP.cabBooked ? '' : 'none';
}

function initiatePayment() {
  if (APP.payMethod === 'upi') {
    const upi = document.getElementById('upi-id-input')?.value.trim();
    if (!upi || !upi.includes('@')) { showToast('⚠️ Enter a valid UPI ID (e.g. name@upi)'); return; }
  }
  showPaymentOTP();
}

async function showPaymentOTP() {
  // ✅ FIX 2: Guard — seats must be selected, user must be logged in
  if (!APP.selectedSeats || APP.selectedSeats.length === 0) {
    showToast('⚠️ Pehle seats select karein!');
    return;
  }
  if (!APP.userEmail) {
    showToast('⚠️ Please login first to receive OTP.');
    return;
  }

  // Send real OTP email to user before showing modal
  const modal = document.getElementById('payment-otp-modal');

  showToast('\ud83d\udce7 Sending OTP to ' + APP.userEmail + '...');

  try {
    const res = await fetch(API_BASE + '/confirm-booking', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        userName  : APP.userName  || 'Guest',
        userEmail : APP.userEmail || '',
        movieName : APP.selectedMovie?.title || 'Movie',
        showDate  : 'Today',
        showTime  : '7:00 PM',
        seats     : APP.selectedSeats,
        tmdbId    : APP.selectedMovie?.tmdbId || null,
      }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      APP.bookingId = data.bookingId;
      showToast('\u2705 OTP sent to ' + APP.userEmail + '!');
    } else {
      showToast('\u26a0\ufe0f Could not send OTP: ' + data.message);
    }
  } catch (err) {
    console.error('OTP send error:', err);
    showToast('\u26a0\ufe0f Server se connect nahi ho paya.');
  }

  modal.classList.remove('hidden');
  gsap.fromTo('.otp-modal-content',
    { opacity: 0, scale: 0.78, y: 30 },
    { opacity: 1, scale: 1,    y: 0,  duration: 0.4, ease: 'back.out(1.5)' }
  );
  gsap.to('.robot-mini', { y: -10, duration: 0.4, yoyo: true, repeat: 3, ease: 'power1.inOut' });

  const digits = modal.querySelectorAll('.otp-digit');
  setupOTPAutoTab(digits);
  digits[0]?.focus();
}

function closeOTPModal() {
  document.getElementById('payment-otp-modal').classList.add('hidden');
}

async function confirmPayment() {
  const modal = document.getElementById('payment-otp-modal');
  // ✅ FIX 3: Backend sends 4-digit OTP — collect only first 4 filled boxes
  const allDigits = Array.from(modal.querySelectorAll('.otp-digit')).map(d => d.value);
  const code = allDigits.join('').slice(0, 4);

  if (code.length < 4) { showToast('⚠️ Please enter the 4-digit OTP.'); return; }

  try {
    const res = await fetch(API_BASE + '/verify-otp', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ bookingId: APP.bookingId, otp: code }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      closeOTPModal();
      APP.userCoins += 25;
      document.getElementById('user-coins').textContent = APP.userCoins;
      if (APP.selectedSeats.length)
        document.getElementById('success-seats').textContent = APP.selectedSeats.join(', ');
      showToast('✅ Booking confirmed! 🎉');
      goToScreen('screen-success');
    } else {
      showToast('❌ ' + (data.message || 'Wrong OTP. Try again.'));
      gsap.to('.otp-modal-content', { keyframes: [{ x: -8 }, { x: 8 }, { x: -8 }, { x: 8 }, { x: 0 }], duration: 0.38 });
      modal.querySelectorAll('.otp-digit').forEach(d => { d.value = ''; });
      modal.querySelectorAll('.otp-digit')[0]?.focus();
    }
  } catch (err) {
    console.error('verify-otp error:', err);
    showToast('⚠️ Server error. Please try again.');
  }
}

/* ══════════════════════════════════════════════════════════════
   §16  SUCCESS + CONFETTI
══════════════════════════════════════════════════════════════ */

function triggerSuccess() {
  launchConfetti();
  playSuccessSound();

  gsap.fromTo('.success-ring',
    { scale: 0, opacity: 1 },
    { scale: 2.5, opacity: 0, duration: 1.6, stagger: 0.3, ease: 'power1.out', repeat: -1 }
  );
  gsap.fromTo('.ticket-preview',     { opacity: 0, y: 28 }, { opacity: 1, y: 0, delay: 0.5,  duration: 0.6 });
  gsap.fromTo('.coins-earned-anim',  { opacity: 0, y: 18 }, { opacity: 1, y: 0, delay: 0.9,  duration: 0.5 });
  gsap.to('.coins-earned-anim',      { y: -8, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.4 });
}

function launchConfetti() {
  const c = document.getElementById('confetti-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  c.width = window.innerWidth; c.height = window.innerHeight;
  const COLS = ['#facc15','#22c55e','#3b82f6','#ec4899','#f97316','#ffffff'];
  const pts  = Array.from({ length: 160 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height,
    w: 6 + Math.random() * 8, h: 10 + Math.random() * 10,
    rot: Math.random() * Math.PI * 2, drot: (Math.random() - .5) * .15,
    vy: 2 + Math.random() * 4, vx: (Math.random() - .5) * 2,
    col: COLS[Math.floor(Math.random() * COLS.length)], a: 1,
  }));
  let frame = 0;
  (function draw() {
    frame++;
    ctx.clearRect(0, 0, c.width, c.height);
    let alive = false;
    pts.forEach(p => {
      p.y += p.vy; p.x += p.vx; p.rot += p.drot;
      if (frame > 120) p.a -= 0.007;
      if (p.y < c.height + 20 && p.a > 0) {
        alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.a); ctx.fillStyle = p.col;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
    });
    if (alive) requestAnimationFrame(draw);
  })();
}

function playSuccessSound() {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.frequency.value = freq; o.type = 'sine';
      const t = ac.currentTime + i * 0.13;
      o.start(t);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.stop(t + 0.6);
    });
  } catch (e) { /* AudioContext blocked by browser — silent fail */ }
}

function downloadTicket() {
  const movie = APP.selectedMovie?.title || 'Movie';
  const seats = APP.selectedSeats.join(', ') || 'N/A';
  const date  = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const total = calcSeatTotal() + calcSnackTotal() + (APP.cabBooked ? 299 : 0) + 49;
  const bookingId = 'PMS-' + Date.now().toString(36).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="290" viewBox="0 0 600 290">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="600" height="290" rx="20" fill="url(#g)"/>
  <rect x="0" y="0" width="8" height="290" rx="4" fill="#facc15"/>
  <text x="30" y="48"  font-family="monospace" font-size="20" font-weight="bold" fill="#facc15">🎬 PrepMyShow Ticket</text>
  <text x="30" y="84"  font-family="monospace" font-size="15" fill="#ffffff">Movie: ${movie}</text>
  <text x="30" y="116" font-family="monospace" font-size="13" fill="#94a3b8">Date: ${date}  |  Show: 7:00 PM</text>
  <text x="30" y="148" font-family="monospace" font-size="13" fill="#94a3b8">Seats: ${seats}</text>
  <text x="30" y="180" font-family="monospace" font-size="14" fill="#facc15">Total Paid: ₹${total}</text>
  <text x="30" y="212" font-family="monospace" font-size="12" fill="#94a3b8">🪙 +25 Gold Coins added to account</text>
  <text x="30" y="244" font-family="monospace" font-size="11" fill="#475569">Booking ID: ${bookingId}</text>
  <text x="30" y="272" font-family="monospace" font-size="10" fill="#334155">× Journey to Smile Cabs | PrepMyShow</text>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `PrepMyShow_${Date.now()}.svg` });
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Ticket downloaded successfully!');
}

function goToFeedback() { goToScreen('screen-feedback'); }

/* ══════════════════════════════════════════════════════════════
   §17  FEEDBACK
══════════════════════════════════════════════════════════════ */

const PROFANITY = ['idiot','stupid','moron','hate','scam','fraud','crap','useless','damn','loser'];

function initFeedback() {
  APP.feedbackRating = 0;
  document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
  if (document.getElementById('feedback-text'))
    document.getElementById('feedback-text').value = '';
}

function setRating(val) {
  APP.feedbackRating = val;
  document.querySelectorAll('.star').forEach((s, i) => s.classList.toggle('active', i < val));
  gsap.fromTo('.stars', { scale: 1.07 }, { scale: 1, duration: 0.22 });
}

function toggleFeedbackTag(el) {
  el.classList.toggle('active');
  gsap.fromTo(el, { scale: 0.86 }, { scale: 1, duration: 0.22, ease: 'back.out(2)' });
}

function submitFeedback() {
  const text = document.getElementById('feedback-text')?.value.toLowerCase() || '';
  const warn = document.getElementById('profanity-warning');
  if (PROFANITY.some(w => text.includes(w))) { warn?.classList.remove('hidden'); return; }
  warn?.classList.add('hidden');
  if (!APP.feedbackRating) { showToast('⭐ Please rate your experience!'); return; }

  showToast('🙏 Thank you! +5 Bonus Coins earned 🪙');
  APP.userCoins += 5;
  document.getElementById('user-coins').textContent = APP.userCoins;
  gsap.to('.feedback-card', {
    scale: 0.95, duration: 0.15, yoyo: true, repeat: 1,
    onComplete: () => setTimeout(() => goToScreen('screen-dashboard'), 500)
  });
}

/* ══════════════════════════════════════════════════════════════
   §18  CHATBOT (Prep-Bot)
══════════════════════════════════════════════════════════════ */

const BOT_KB = {
  'how to book'   : 'Book in 5 steps: 1) Pick a movie 2) Select seats 3) Add snacks 4) Book optional cab 5) Pay with OTP. Done! 🎬',
  'cab'           : 'Journey to Smile Cabs — 150+ cars, 4.3⭐ avg, 1500+ safe female rides. Book after snack selection! 🚕',
  'gold coin'     : 'Earn 25 Gold Coins per booking. 1000 Coins = 1 Free Ticket! 🪙 Balance shows in the top navbar.',
  'offer'         : 'SBI Credit Card → 5% OFF every booking. Check Events tab for seasonal deals! 🏦',
  'cancel'        : 'Cancel up to 2 hours before showtime via My Orders in your profile menu. 📦',
  'refund'        : 'Refunds process in 5–7 business days to your original payment method. 💳',
  'otp'           : 'OTP is sent to your registered mobile. Demo OTP for testing: 123456. 🔐',
  'payment'       : 'We accept: UPI (GPay, PhonePe, BHIM), Cards (Visa, MC, RuPay, SBI), Cash at Counter. 💰',
  'seat'          : '3 seat types: Platinum (front, ₹500), Gold (mid, ₹350), Normal (rear, ₹200). Hover any seat for details! 🪑',
  'snack'         : '50+ snack options — Popcorn, Food, Desi, Drinks, Desserts & Combos. Add before checkout 🍿',
  'female safety' : 'All drivers are police-verified with a dedicated Female Safety Rating. Zero-tolerance policy. ♀️🛡️',
  'contact'       : 'Email: support@prepmyshow.com | Toll-free: 1800-PREP-SHOW (24/7 support) 📞',
  'hello'         : 'Hey! 👋 Welcome to PrepMyShow. How can I make your movie experience better?',
  'hi'            : "Hi there! 👋 I'm Prep-Bot. Ask me about bookings, cabs, coins, seats, or snacks!",
  'thank'         : "You're welcome! 🙏 Have a great time at the movies!",
  'help'          : 'I can help with: bookings, cab, gold coins, offers, cancellations, seats, snacks, payment, safety. Just ask! 🤖',
};

function toggleChatbot() {
  const win = document.getElementById('bot-window');
  win.classList.toggle('hidden');
  if (!win.classList.contains('hidden')) {
    gsap.fromTo(win, { opacity: 0, scale: 0.83, y: 22 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' });
    document.getElementById('bot-input')?.focus();
  }
}

function sendBotMessage() {
  const inp = document.getElementById('bot-input');
  const msg = inp.value.trim();
  if (!msg) return;
  appendBotMsg(msg, 'user');
  inp.value = '';
  const tid = appendTyping();
  setTimeout(() => { removeTyping(tid); appendBotMsg(getBotReply(msg), 'bot'); }, 650 + Math.random() * 500);
}

function botReply(text) {
  appendBotMsg(text, 'user');
  const tid = appendTyping();
  setTimeout(() => { removeTyping(tid); appendBotMsg(getBotReply(text), 'bot'); }, 720);
}

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const [k, v] of Object.entries(BOT_KB)) if (lower.includes(k)) return v;
  return "Hmm, I didn't catch that 🤔 Try: 'how to book', 'cab services', 'gold coins', 'offers', 'payment', or 'seat info'.";
}

function appendBotMsg(text, role) {
  const msgs = document.getElementById('bot-messages');
  const div  = document.createElement('div');
  div.className = role === 'user' ? 'user-msg' : 'bot-msg';
  div.innerHTML = role === 'user'
    ? `<div class="user-bubble">${text}</div>`
    : `<span class="bot-avatar">🤖</span><div class="bot-bubble">${text}</div>`;
  msgs.appendChild(div);
  gsap.fromTo(div, { opacity: 0, y: 9 }, { opacity: 1, y: 0, duration: 0.22 });
  msgs.scrollTop = msgs.scrollHeight;
}

function appendTyping() {
  const msgs = document.getElementById('bot-messages');
  const div  = document.createElement('div');
  div.className = 'bot-msg'; div.id = 'typing-' + Date.now();
  div.innerHTML = `<span class="bot-avatar">🤖</span>
    <div class="bot-bubble">
      <span class="typing-dots"><span></span><span></span><span></span></span>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div.id;
}

function removeTyping(id) { document.getElementById(id)?.remove(); }

/* ══════════════════════════════════════════════════════════════
   §19  TOAST
══════════════════════════════════════════════════════════════ */

let _toastTimer = null;

function showToast(msg, dur = 3200) {
  const t = document.getElementById('toast');
  if (!t) return;
  clearTimeout(_toastTimer);
  t.textContent = msg;
  t.classList.remove('hidden');
  // Kill any running GSAP tweens on toast, then animate fresh
  gsap.killTweensOf(t);
  gsap.fromTo(t,
    { opacity: 0, y: 20, scale: 0.90 },
    { opacity: 1, y: 0,  scale: 1,    duration: 0.32, ease: 'back.out(1.5)' }
  );
  _toastTimer = setTimeout(() => {
    gsap.to(t, { opacity: 0, y: 12, duration: 0.28,
      onComplete: () => t.classList.add('hidden') });
  }, dur);
}

/* ══════════════════════════════════════════════════════════════
   §20  ROBOT IDLE ANIMATIONS
══════════════════════════════════════════════════════════════ */

function initRobotIdle() {
  // Only animate if the SVG element exists in the DOM
  if (!document.getElementById('robot-svg')) return;
  gsap.to('#robot-svg',           { y: 12,    duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.pupil-left, .pupil-right', { x: 2, duration: 2,   repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.antenna-blink',       { opacity: 0, duration: 0.4, repeat: -1, yoyo: true, repeatDelay: 1.2 });
  gsap.to('.chest-blink',         { opacity: 0.2, duration: 0.6, repeat: -1, yoyo: true, ease: 'power1.inOut', repeatDelay: 0.8 });
}

/* ══════════════════════════════════════════════════════════════
   §21  KEYBOARD SHORTCUTS
══════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['profile-menu','city-modal','search-results','payment-otp-modal','bot-window']
      .forEach(id => document.getElementById(id)?.classList.add('hidden'));
  }
  if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleChatbot(); }
});

window.addEventListener('resize', () => {
  const c = document.getElementById('confetti-canvas');
  if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
});

/* ══════════════════════════════════════════════════════════════
   §22  BOOT — DOMContentLoaded
   Order matters: DOM ready → init icons → run canvas → run
   progress bar → start robot → city list.
══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Lucide icons
  if (window.lucide) lucide.createIcons();

  // 2. Particle canvas (uses window.innerWidth — works even if screen was hidden)
  initIntroCanvas();

  // 3. Entrance animations for the intro screen elements
  initIntroAnimations();

  // 4. Progress bar — kicks off after a tiny delay so CSS paint completes
  setTimeout(startProgressBar, 100);

  // 5. Robot idle on auth screen
  initRobotIdle();

  // 6. Pre-warm city list so modal opens instantly
  initCityList();

  // 7. Bot pulse ring
  gsap.to('.bot-pulse', { scale: 2, opacity: 0, duration: 1.2, repeat: -1, ease: 'power1.out' });

  // 8. Loyalty coin spin on slider
  gsap.to('.coin-3d', { rotationY: 360, duration: 3, repeat: -1, ease: 'none' });

  // 9. Wire up feedback textarea profanity check
  document.getElementById('feedback-text')?.addEventListener('input', function () {
    const found = PROFANITY.some(w => this.value.toLowerCase().includes(w));
    document.getElementById('profanity-warning')?.classList.toggle('hidden', !found);
  });

  // 10. OTP auto-tab for auth robot box (pre-wire in case it's already rendered)
  const authDigits = document.querySelectorAll('#otp-alert-box .otp-digit');
  if (authDigits.length) setupOTPAutoTab(authDigits);

  console.log('%c🎬 PrepMyShow × Journey to Smile Cabs', 'color:#facc15;font-size:16px;font-weight:900');
  console.log('%c   v3 — SPA fixed-layer screen system ✅', 'color:#22c55e;font-size:12px');
});