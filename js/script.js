// ==========================================================================
// KRISHUU'S BIRTHDAY SURPRISE — MASTER JAVASCRIPT
// Minimal & Clean, Aesthetic Instagram Theme, Mobile-First
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initPasscodeVault();
  initQuestionGate();
  initInstaFeed();
  initLetterEditor();
  initWishButton();
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
    osc.frequency.setValueAtTime(480, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playUnlock() {
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.3);
    });
  }

  playBuzzer() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
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
// 2. PASSCODE VAULT CONTROLLER (Passcode: 1111 / 111)
// ==========================================================================
function initPasscodeVault() {
  const lockScreen = document.getElementById('lock-screen');
  const lockCard = document.getElementById('lock-card');
  const errorAlert = document.getElementById('lock-error-alert');
  const dots = [
    document.getElementById('dot-1'),
    document.getElementById('dot-2'),
    document.getElementById('dot-3'),
    document.getElementById('dot-4')
  ];

  let enteredCode = '';
  let autoTimer = null;
  let isUnlocked = false;
  const VALID_CODES = ['1111', '111', '1214', '1210'];

  function updateDots() {
    dots.forEach((dot, idx) => {
      if (!dot) return;
      if (idx < enteredCode.length) {
        dot.textContent = '💖';
        dot.classList.add('filled');
      } else {
        dot.textContent = '';
        dot.classList.remove('filled');
      }
    });
  }

  function handleDigit(num) {
    if (isUnlocked) return;
    sounds.playTap();
    if (errorAlert) errorAlert.classList.remove('show');
    if (autoTimer) clearTimeout(autoTimer);

    if (enteredCode.length < 4) {
      enteredCode += num;
      updateDots();

      if (enteredCode.length === 4) {
        verifyCode();
      } else if (enteredCode.length === 3 && enteredCode === '111') {
        // Auto-check if Krishuu stops at 3 ones (111)
        autoTimer = setTimeout(() => {
          if (enteredCode === '111') verifyCode();
        }, 500);
      }
    }
  }

  function handleDelete() {
    if (isUnlocked) return;
    sounds.playTap();
    if (errorAlert) errorAlert.classList.remove('show');
    if (autoTimer) clearTimeout(autoTimer);

    enteredCode = enteredCode.slice(0, -1);
    updateDots();
  }

  function verifyCode() {
    if (isUnlocked) return;
    if (!enteredCode) return;

    if (VALID_CODES.includes(enteredCode)) {
      // SUCCESS!
      isUnlocked = true;
      sounds.playUnlock();
      launchConfetti();

      dots.forEach(d => {
        if (d) {
          d.style.borderColor = '#10b981';
          d.style.backgroundColor = '#ecfdf5';
          d.textContent = '✨';
        }
      });

      window.scrollTo(0, 0);

      setTimeout(() => {
        lockScreen.classList.add('unlocked');
        document.body.classList.remove('is-locked');
        document.documentElement.classList.remove('is-locked');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.scrollTo(0, 0);

        setTimeout(() => {
          lockScreen.style.display = 'none';
          window.scrollTo(0, 0);
          const questionSection = document.getElementById('question-section');
          if (questionSection) {
            questionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 550);
      }, 350);

    } else {
      // WRONG CODE: ANGER TANTRUM
      sounds.playBuzzer();
      if (lockCard) {
        lockCard.classList.remove('shake-card');
        void lockCard.offsetWidth; // trigger reflow
        lockCard.classList.add('shake-card');
      }
      if (errorAlert) {
        errorAlert.classList.add('show');
      }

      dots.forEach(d => {
        if (d) {
          d.style.borderColor = '#ff3b5b';
          d.textContent = '✖';
        }
      });

      setTimeout(() => {
        if (lockCard) lockCard.classList.remove('shake-card');
        enteredCode = '';
        updateDots();
        dots.forEach(d => {
          if (d) {
            d.style.borderColor = '';
            d.textContent = '';
          }
        });
      }, 700);

      setTimeout(() => {
        if (errorAlert) errorAlert.classList.remove('show');
      }, 3500);
    }
  }

  // Keypad click handlers
  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-num');
      const action = btn.getAttribute('data-action');

      if (num !== null) {
        handleDigit(num);
      } else if (action === 'delete') {
        handleDelete();
      } else if (action === 'unlock') {
        if (autoTimer) clearTimeout(autoTimer);
        verifyCode();
      }
    });
  });

  // Physical Keyboard Support
  window.addEventListener('keydown', (e) => {
    if (isUnlocked) return;
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      handleDelete();
    } else if (e.key === 'Enter') {
      if (autoTimer) clearTimeout(autoTimer);
      verifyCode();
    }
  });
}

// ==========================================================================
// 3. "WILL YOU BE MY FRIEND?" QUESTION GATE (UNTOUCHABLE NO)
// ==========================================================================
function initQuestionGate() {
  const btnYes = document.getElementById('btn-gate-yes');
  const btnNo = document.getElementById('btn-gate-no');
  const successCard = document.getElementById('gate-success-card');
  const surpriseContent = document.getElementById('surprise-content');

  if (!btnYes || !btnNo) return;

  const teasePhrases = [
    "NO 🙅‍♀️",
    "Arre pakad ke dikha! 😜",
    "Nahi maan sakti? 🏃‍♀️💨",
    "Button bhag gaya! 🚀",
    "Sirf YES daba sakti hai! 💖",
    "Tu meri bestie hai na! 🥺",
    "Click karke toh dikha! 😝",
    "Never ever NO! 🥰"
  ];
  let phraseIdx = 0;

  function dodgeButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sounds.playTap();

    phraseIdx = (phraseIdx + 1) % teasePhrases.length;
    btnNo.textContent = teasePhrases[phraseIdx];

    const padding = 16;
    const btnWidth = btnNo.offsetWidth || 110;
    const btnHeight = btnNo.offsetHeight || 44;
    const screenW = window.innerWidth || document.documentElement.clientWidth || 360;
    const screenH = window.innerHeight || document.documentElement.clientHeight || 640;

    const maxX = Math.max(padding, screenW - btnWidth - padding);
    const maxY = Math.max(padding, screenH - btnHeight - padding);

    const randomX = Math.min(Math.max(padding, Math.floor(Math.random() * maxX)), screenW - btnWidth - 8);
    const randomY = Math.min(Math.max(padding, Math.floor(Math.random() * maxY)), screenH - btnHeight - 8);

    btnNo.style.position = 'fixed';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
    btnNo.style.zIndex = '99999';
  }

  ['mouseenter', 'mouseover', 'touchstart', 'pointerdown'].forEach(evt => {
    btnNo.addEventListener(evt, dodgeButton, { passive: false });
  });

  btnYes.addEventListener('click', () => {
    sounds.playUnlock();
    launchConfetti();

    btnNo.style.display = 'none';
    btnYes.innerHTML = '<i class="fas fa-heart"></i> YAYYY! Besties Forever! 🥰💖';
    btnYes.style.animation = 'none';
    btnYes.style.transform = 'scale(1.05)';

    if (successCard) {
      successCard.classList.add('show');
    }

    if (surpriseContent) {
      surpriseContent.classList.add('revealed');
    }

    setTimeout(() => {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400);
  });
}

// ==========================================================================
// 4. INSTAGRAM FEED: DOUBLE-TAP & LIKE INTERACTIONS
// ==========================================================================
function initInstaFeed() {
  const postCards = document.querySelectorAll('.insta-post-card');

  postCards.forEach(card => {
    const mediaWrap = card.querySelector('.post-media-wrap');
    const heartOverlay = card.querySelector('.heart-overlay');
    const btnLike = card.querySelector('.btn-like');
    const likeCountSpan = card.querySelector('.like-count');

    let likes = parseInt(likeCountSpan ? likeCountSpan.textContent.replace(/,/g, '') : '1712', 10);
    let isLiked = false;

    function toggleLike() {
      isLiked = !isLiked;
      sounds.playPop();

      if (isLiked) {
        likes += 1;
        btnLike.classList.add('liked');
        btnLike.innerHTML = '<i class="fas fa-heart"></i>';
      } else {
        likes = Math.max(0, likes - 1);
        btnLike.classList.remove('liked');
        btnLike.innerHTML = '<i class="far fa-heart"></i>';
      }

      if (likeCountSpan) {
        likeCountSpan.textContent = likes.toLocaleString();
      }
    }

    // Button click
    if (btnLike) {
      btnLike.addEventListener('click', toggleLike);
    }

    // Double tap on media wrap
    let lastTap = 0;
    if (mediaWrap) {
      mediaWrap.addEventListener('click', () => {
        const now = Date.now();
        if (now - lastTap < 300) {
          // Double Tap Triggered
          if (heartOverlay) {
            heartOverlay.classList.remove('pop');
            void heartOverlay.offsetWidth;
            heartOverlay.classList.add('pop');
            setTimeout(() => heartOverlay.classList.remove('pop'), 600);
          }
          if (!isLiked) toggleLike();
        }
        lastTap = now;
      });
    }
  });
}

// ==========================================================================
// 5. PERSONAL LETTER LIVE EDITOR (LOCAL STORAGE PERSISTENCE)
// ==========================================================================
function initLetterEditor() {
  const modal = document.getElementById('letter-modal-overlay');
  const btnOpen = document.getElementById('btn-open-letter-modal');
  const btnClose = document.getElementById('btn-close-letter-modal');
  const btnCancel = document.getElementById('btn-cancel-letter');
  const btnSave = document.getElementById('btn-save-letter');

  const displaySalutation = document.getElementById('display-letter-salutation');
  const displayP1 = document.getElementById('display-letter-p1');
  const displayP2 = document.getElementById('display-letter-p2');
  const displayP3 = document.getElementById('display-letter-p3');
  const displayAuthor = document.getElementById('display-letter-author');

  const inputSalutation = document.getElementById('input-salutation');
  const inputP1 = document.getElementById('input-p1');
  const inputP2 = document.getElementById('input-p2');
  const inputP3 = document.getElementById('input-p3');
  const inputAuthor = document.getElementById('input-author');

  // Load saved letter if exists
  const savedData = localStorage.getItem('krishuu_letter_v2');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (parsed.salutation && displaySalutation) displaySalutation.textContent = parsed.salutation;
      if (parsed.p1 && displayP1) displayP1.textContent = parsed.p1;
      if (parsed.p2 && displayP2) displayP2.textContent = parsed.p2;
      if (parsed.p3 && displayP3) displayP3.textContent = parsed.p3;
      if (parsed.author && displayAuthor) displayAuthor.textContent = parsed.author;
    } catch (e) {
      console.error(e);
    }
  }

  function openModal() {
    sounds.playTap();
    if (inputSalutation && displaySalutation) inputSalutation.value = displaySalutation.textContent.trim();
    if (inputP1 && displayP1) inputP1.value = displayP1.textContent.trim();
    if (inputP2 && displayP2) inputP2.value = displayP2.textContent.trim();
    if (inputP3 && displayP3) inputP3.value = displayP3.textContent.trim();
    if (inputAuthor && displayAuthor) inputAuthor.value = displayAuthor.textContent.trim();

    if (modal) modal.classList.add('active');
  }

  function closeModal() {
    sounds.playTap();
    if (modal) modal.classList.remove('active');
  }

  function saveLetter() {
    sounds.playPop();
    const data = {
      salutation: inputSalutation ? inputSalutation.value : '',
      p1: inputP1 ? inputP1.value : '',
      p2: inputP2 ? inputP2.value : '',
      p3: inputP3 ? inputP3.value : '',
      author: inputAuthor ? inputAuthor.value : ''
    };

    if (displaySalutation && data.salutation) displaySalutation.textContent = data.salutation;
    if (displayP1 && data.p1) displayP1.textContent = data.p1;
    if (displayP2 && data.p2) displayP2.textContent = data.p2;
    if (displayP3 && data.p3) displayP3.textContent = data.p3;
    if (displayAuthor && data.author) displayAuthor.textContent = data.author;

    localStorage.setItem('krishuu_letter_v2', JSON.stringify(data));
    closeModal();
    launchConfetti();
  }

  if (btnOpen) btnOpen.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);
  if (btnSave) btnSave.addEventListener('click', saveLetter);
}

// ==========================================================================
// 6. HERO CELEBRATION BUTTON
// ==========================================================================
function initWishButton() {
  const wishBtn = document.getElementById('btn-insta-wish');
  if (wishBtn) {
    wishBtn.addEventListener('click', () => {
      sounds.playUnlock();
      launchConfetti();
      wishBtn.innerHTML = '<i class="fas fa-heart"></i> Woohoo! Happy Birthday Krishuu! 🥳💖';
      setTimeout(() => {
        wishBtn.innerHTML = '<i class="fas fa-heart"></i> Happy Birthday Krishuu! 🎂🎉';
      }, 2500);
    });
  }
}

// ==========================================================================
// 7. LIGHTWEIGHT CANVAS CONFETTI CANNON
// ==========================================================================
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ff5e83', '#ff7b9a', '#ffd166', '#a288e3', '#06d6a0', '#ff9ebb'];
  const particles = [];
  const particleCount = 75;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      r: Math.random() * 5 + 3,
      dx: (Math.random() - 0.5) * 12,
      dy: (Math.random() - 0.7) * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10,
      tiltAngle: 0,
      tiltAngleInc: (Math.random() * 0.07) + 0.05,
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
      p.dy += 0.35; // gravity
      p.tiltAngle += p.tiltAngleInc;
      p.tilt = Math.sin(p.tiltAngle) * 8;

      if (frameCount > 30) {
        p.alpha -= 0.02;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x + p.tilt, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (frameCount < 80 && particles.some(p => p.alpha > 0)) {
      animationFrame = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  }

  update();
}
