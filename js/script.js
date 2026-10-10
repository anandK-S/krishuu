// ==========================================================================
// KRISHUU'S BIRTHDAY SURPRISE — MASTER JAVASCRIPT
// Minimal & Clean, Aesthetic Instagram Theme, Mobile-First
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initGiftUnboxing();
  initQuestionGate();
  initWishButton();
  initPolaroidGallery();
  initScratchCards();
});

// ==========================================================================
// 1. SOUND SYNTHESIZER (WEB AUDIO API - ZERO ASSET DEPENDENCY)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTap() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCelebration() {
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
    });
  }

  playPop() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }
}

const sounds = new SoundFX();

// ==========================================================================
// 2. MAGICAL 3D UNBOXING INTRO EXPERIENCE (POP-OUT CARD & CELEBRATION)
// ==========================================================================
function initGiftUnboxing() {
  const intro = document.getElementById('intro-animation');
  const giftContainer = document.getElementById('intro-gift-box');
  const giftBox = document.getElementById('gift-box-wrap');
  const textWrap = document.getElementById('intro-text-wrap');
  if (!intro || !giftContainer) return;

  let isUnboxing = false;

  function triggerUnbox(e) {
    if (isUnboxing) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    isUnboxing = true;

        launchConfetti();

    giftContainer.classList.add('unboxing');

    // Keep the reveal stage clearly visible for 2.6 seconds so Krishuu can read and enjoy it!
    setTimeout(() => {
      intro.classList.add('hidden');
      setTimeout(() => {
        intro.style.display = 'none';
      }, 500);
    }, 2600);
  }

  // Only trigger on explicit tap/click of the gift box or prompt text, not accidental background touches!
  if (giftBox) {
    giftBox.addEventListener('click', triggerUnbox);
    giftBox.addEventListener('touchend', (e) => {
      triggerUnbox(e);
    });
  }
  if (textWrap) {
    textWrap.addEventListener('click', triggerUnbox);
    textWrap.addEventListener('touchend', (e) => {
      triggerUnbox(e);
    });
  }
}

// ==========================================================================
// 3. QUESTION GATE (UNTOUCHABLE NO BUTTON WITH SAFE SCREEN DODGING)
// ==========================================================================
function initQuestionGate() {
  const btnYes = document.getElementById('btn-gate-yes-1');
  const btnNo = document.getElementById('btn-gate-no-1');
  const questionSection = document.getElementById('question-section');
  const surpriseContent = document.getElementById('surprise-content');

  const teasePhrases = [
    "NO 🙅‍♀️",
    "Arre ek baar Yes toh click karo! 🥺",
    "Mujhse dosti karni padegi! 😤",
    "Please na Krishuu! 🌸",
    "No click karna allowed nahi hai! 🚫",
    "Kitna nakhra karogi! 😂",
    "Yes button better hai wese bhi! ✨",
    "Chal maan ja ab! 🎂",
    "You have no choice! 👑",
    "Maan jao na bestie! 💖",
    "Pakad ke dikha button! 🏃‍♀️💨"
  ];
  let phraseIdx = 0;

  function dodge(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sounds.playTap();

    phraseIdx = (phraseIdx + 1) % teasePhrases.length;
    btnNo.textContent = teasePhrases[phraseIdx];

    const padding = 16;
    const vWidth = window.visualViewport ? window.visualViewport.width : (window.innerWidth || 360);
    const vHeight = window.visualViewport ? window.visualViewport.height : (window.innerHeight || 640);
    const btnWidth = Math.min(btnNo.offsetWidth || 140, vWidth - 32);
    const btnHeight = btnNo.offsetHeight || 44;

    const maxX = Math.max(padding, vWidth - btnWidth - padding);
    const maxY = Math.max(padding, vHeight - btnHeight - padding);

    const randomX = Math.min(Math.max(padding, Math.floor(Math.random() * maxX)), vWidth - btnWidth - 12);
    const randomY = Math.min(Math.max(padding, Math.floor(Math.random() * maxY)), vHeight - btnHeight - 12);

    btnNo.style.position = 'fixed';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
    btnNo.style.zIndex = '99999';
  }

  if (btnNo) {
    ['mouseenter', 'mouseover', 'touchstart', 'pointerdown'].forEach(evt => {
      btnNo.addEventListener(evt, dodge, { passive: false });
    });
  }

  if (btnYes) {
    btnYes.addEventListener('click', () => {
            launchConfetti();

      if (btnNo) btnNo.style.display = 'none';
      btnYes.innerHTML = 'YAYYY! Besties Forever! 🎉';

      if (questionSection) questionSection.classList.add('fade-out');
      if (surpriseContent) {
        surpriseContent.classList.add('revealed');
        setTimeout(initScratchCards, 150);
      }

      setTimeout(() => {
        if (questionSection) questionSection.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 400);
    });
  }
}

// ==========================================================================
// 4. HERO INSTAGRAM WISH BUTTON (NO HEART ICON IN FRONT)
// ==========================================================================
function initWishButton() {
  const wishBtn = document.getElementById('btn-insta-wish');
  if (wishBtn) {
    wishBtn.addEventListener('click', () => {
            launchConfetti();
      wishBtn.innerHTML = 'Woohoo! Happy Birthday Krishuu! 🥳💖';
      setTimeout(() => {
        wishBtn.innerHTML = 'Happy Birthday Krishuu! 🎂🎉';
      }, 2500);
    });
  }
}

// ==========================================================================
// 5. POLAROID PHOTO GALLERY (ZERO OVERFLOW & LIGHTBOX)
// ==========================================================================
function initPolaroidGallery() {
  const cards = document.querySelectorAll('.gallery-story-card, .polaroid-card');
  const lightboxModal = document.getElementById('lightbox-modal-overlay');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');

  cards.forEach(card => {
    const img = card.querySelector('.gallery-img');
    const captionSpan = card.querySelector('.story-caption-text, .polaroid-caption');

    card.addEventListener('click', () => {
      if (img && lightboxImg && lightboxModal) {
        lightboxImg.src = img.src;
        if (lightboxCaption && captionSpan) {
          lightboxCaption.textContent = captionSpan.textContent;
        }
        lightboxModal.classList.add('active');
        sounds.playTap();
      }
    });
  });

  if (btnCloseLightbox && lightboxModal) {
    btnCloseLightbox.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
      sounds.playTap();
    });

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        lightboxModal.classList.remove('active');
      }
    });
  }
}

// ==========================================================================
// 6. REAL TACTILE FINGER-SCRATCH CARD SYSTEM (HTML5 CANVAS + GESTURE)
// ==========================================================================
function initScratchCards() {
  const cards = document.querySelectorAll('.scratch-ticket-card');
  if (!cards || cards.length === 0) return;

  let totalRevealed = 0;

  function spawnScratchSparkle(card, x, y) {
    const dot = document.createElement('div');
    dot.className = 'scratch-sparkle-dot';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.setProperty('--tx', `${(Math.random() - 0.5) * 40}px`);
    dot.style.setProperty('--ty', `${(Math.random() - 0.5) * 40}px`);
    card.appendChild(dot);
    setTimeout(() => dot.remove(), 500);
  }

  function setupSingleCard(card) {
    if (card.dataset.initialized === 'true') return;

    const foil = card.querySelector('.ticket-foil-cover');
    const canvas = card.querySelector('.scratch-canvas');
    if (!foil || !canvas) return;

    const rect = card.getBoundingClientRect();
    if (rect.width === 0 || card.offsetWidth === 0) {
      // Card currently hidden (e.g. before question gate answered)
      return;
    }

    card.dataset.initialized = 'true';

    const width = Math.max(card.offsetWidth, 280);
    const height = Math.max(card.offsetHeight, 100);

    // High-DPI retina canvas support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // 1. Paint rich metallic rose-gold foil
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f59cb2');
    grad.addColorStop(0.25, '#ffd2dc');
    grad.addColorStop(0.5, '#fcaec0');
    grad.addColorStop(0.75, '#ffe0e8');
    grad.addColorStop(1, '#f797af');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Paint shimmering diagonal texture lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3.5;
    for (let x = -width; x < width * 2; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height * 1.3, height);
      ctx.stroke();
    }

    // 3. Paint subtle sparkle glitter specks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    for (let i = 0; i < 24; i++) {
      const rx = (i * 41) % width;
      const ry = (i * 37) % height;
      ctx.beginPath();
      ctx.arc(rx, ry, (i % 2 === 0) ? 1.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Now set foil wrapper to transparent so destination-out clears directly to text!
    foil.style.background = 'transparent';

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let strokeCount = 0;
    let isRevealed = false;

    function revealTicket() {
      if (isRevealed) return;
      isRevealed = true;
      totalRevealed++;

      foil.classList.add('scratched');
      setTimeout(() => {
        foil.style.display = 'none';
      }, 400);

      // Celebration when all 17 reasons are revealed!
      if (totalRevealed === cards.length) {
        setTimeout(() => {
          launchConfetti();
        }, 300);
      }
    }

    function scratchLine(x1, y1, x2, y2) {
      if (isRevealed) return;

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 44 * dpr;

      ctx.beginPath();
      ctx.moveTo(x1 * dpr, y1 * dpr);
      ctx.lineTo(x2 * dpr, y2 * dpr);
      ctx.stroke();
      ctx.restore();

      const badge = card.querySelector('.foil-badge-ui');
      if (badge && !badge.classList.contains('hidden-badge')) {
        badge.classList.add('hidden-badge');
      }

      if (strokeCount % 2 === 0) {
        spawnScratchSparkle(card, x2, y2);
      }

      strokeCount++;

      // After 10 rubs, celebrate & peel off completely!
      if (strokeCount >= 10) {
        revealTicket();
      }
    }

    function getCoords(e) {
      const cRect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - cRect.left,
        y: clientY - cRect.top
      };
    }

    // Touch events for mobile finger scratching
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDrawing = true;
      const pos = getCoords(e);
      lastX = pos.x;
      lastY = pos.y;
      scratchLine(pos.x, pos.y, pos.x, pos.y);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getCoords(e);
      scratchLine(lastX, lastY, pos.x, pos.y);
      lastX = pos.x;
      lastY = pos.y;
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      isDrawing = false;
      if (strokeCount >= 5) {
        revealTicket();
      }
    });

    // Mouse drag events for laptop/desktop
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const pos = getCoords(e);
      lastX = pos.x;
      lastY = pos.y;
      scratchLine(pos.x, pos.y, pos.x, pos.y);
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const pos = getCoords(e);
      scratchLine(lastX, lastY, pos.x, pos.y);
      lastX = pos.x;
      lastY = pos.y;
    });

    window.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    // Tap/Click fallback: Single tap also scratches open cleanly!
    canvas.addEventListener('click', () => {
      revealTicket();
    });
  }

  // Initialize all cards that are currently visible
  cards.forEach(card => setupSingleCard(card));

  // IntersectionObserver to auto-initialize when scrolled into view
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setupSingleCard(entry.target);
        }
      });
    }, { rootMargin: '100px' });

    cards.forEach(card => observer.observe(card));
  }

  window.addEventListener('resize', () => {
    cards.forEach(card => {
      card.dataset.initialized = 'false';
      setupSingleCard(card);
    });
  });
}

// ==========================================================================
// 8. HIGH-DEFINITION CELEBRATORY CONFETTI & SPARKLE ENGINE
// ==========================================================================
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = [
    '#ff3366', '#ff6b8b', '#ffd166', '#06d6a0', '#118ab2',
    '#7209b7', '#f72585', '#ffe066', '#ffffff', '#ff9ebb'
  ];

  const particles = [];
  const particleCount = 135;

  for (let i = 0; i < particleCount; i++) {
    const isStar = Math.random() < 0.25;
    const isRibbon = Math.random() < 0.35;
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 60,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 60,
      w: isRibbon ? Math.random() * 8 + 6 : Math.random() * 6 + 4,
      h: isRibbon ? Math.random() * 16 + 10 : Math.random() * 6 + 4,
      r: Math.random() * 4 + 3,
      dx: (Math.random() - 0.5) * 26,
      dy: (Math.random() - 0.8) * 26,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      wobble: 0,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      isStar: isStar,
      isRibbon: isRibbon,
      alpha: 1
    });
  }

  let animationFrame;
  let frameCount = 0;

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.55; // faster gravity
      p.dx *= 0.978; // snappier drag
      p.rotation += p.rotSpeed * 1.3; // faster spin
      p.wobble += p.wobbleSpeed * 1.2;

      if (frameCount > 20) {
        p.alpha -= 0.024; // snappier fade
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.isStar) {
        ctx.fillStyle = '#ffd166';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨', 0, 0);
      } else if (p.isRibbon) {
        ctx.fillStyle = p.color;
        const scaleX = Math.sin(p.wobble);
        ctx.scale(scaleX, 1);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    if (frameCount < 70 && particles.some(p => p.alpha > 0)) {
      animationFrame = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  }

  update();
}
