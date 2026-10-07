/**
 * KRISHUU'S BIRTHDAY SURPRISE - MASTER JAVASCRIPT
 * RESPECTFUL HINGLISH + 212 MEDIA FILES + CINEMATIC BIRTHDAY MOVIE THEATER
 */

// Global State
const STATE = {
  unlocked: false,
  passcode: '12:14',
  inputCode: '',
  audioPlaying: false,
  candlesBlown: false,
  giftOpened: false,
  isCelebrationMode: false,
  // Video Reels State
  currentVideoIdx: 0,
  // Photo Vault & Lightbox State
  currentPhotoIdx: 0,
  vaultPhotos: (typeof KRISHUU_GALLERY !== 'undefined' && KRISHUU_GALLERY.images) ? [...KRISHUU_GALLERY.images] : [],
  loadedPhotoCount: 0,
  photosPerPage: 24,
  slideshowTimer: null,
  isSlideshowPlaying: false,
  // Cinema Movie State
  isCinemaPlaying: false,
  currentSceneIdx: 0,
  cinemaTimer: null,
  cinemaSoundMuted: false
};

// ==========================================================================
// 1. WEB AUDIO API SYNTHESIZER & SOUND EFFECTS
// ==========================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingMelody = false;
    this.timer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playUnlockChime() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
      }, idx * 120);
    });
  }

  playErrorBuzz() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playBlowSound() {
    this.init();
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.8);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playUnboxSound() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  startBirthdayMelody() {
    // Continuous song removed as requested by user
    return;
  }

  stopBirthdayMelody() {
    this.isPlayingMelody = false;
    if (this.timer) clearTimeout(this.timer);
  }
}

const sounds = new SoundEngine();

// ==========================================================================
// 2. PASSCODE VAULT CONTROLLER (Password: 11:11 / 11:1)
// ==========================================================================
function initPasscodeVault() {
  if (!STATE.unlocked) {
    document.body.classList.add('is-locked');
    document.documentElement.classList.add('is-locked');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);
  }

  const slots = [
    document.getElementById('slot-1'),
    document.getElementById('slot-2'),
    document.getElementById('slot-3'),
    document.getElementById('slot-4')
  ];
  const keypad = document.getElementById('lock-container');
  const lockScreen = document.getElementById('lock-screen');
  const errorAlert = document.getElementById('lock-error-alert');

  function updateSlots() {
    const raw = STATE.inputCode;
    slots.forEach((slot, idx) => {
      if (idx < raw.length) {
        slot.textContent = raw[idx];
        slot.classList.add('filled');
      } else {
        slot.textContent = '';
        slot.classList.remove('filled');
      }
    });
  }

  let codeDebounceTimer = null;

  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playClick();
      const num = btn.getAttribute('data-num');
      const action = btn.getAttribute('data-action');

      if (errorAlert) errorAlert.classList.remove('show');

      if (num !== null) {
        if (STATE.inputCode.length < 4) {
          STATE.inputCode += num;
          updateSlots();

          if (codeDebounceTimer) clearTimeout(codeDebounceTimer);

          if (STATE.inputCode.length === 4) {
            checkCode();
          } else if (STATE.inputCode.length === 3 && STATE.inputCode === '111') {
            // Also accept 3-digit '111' if user pauses
            codeDebounceTimer = setTimeout(() => {
              if (STATE.inputCode === '111') {
                checkCode();
              }
            }, 800);
          }
        }
      } else if (action === 'delete') {
        if (codeDebounceTimer) clearTimeout(codeDebounceTimer);
        STATE.inputCode = STATE.inputCode.slice(0, -1);
        updateSlots();
      } else if (action === 'clear') {
        if (codeDebounceTimer) clearTimeout(codeDebounceTimer);
        STATE.inputCode = '';
        updateSlots();
      }
    });
  });

  function checkCode() {
    if (STATE.inputCode === '1111' || STATE.inputCode === '111') {
      sounds.playUnlockChime();
      triggerConfetti();

      // Ensure viewport stays strictly at top
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

      setTimeout(() => {
        lockScreen.classList.add('unlocked');
        STATE.unlocked = true;

        // Restore body scroll and keep at exact top
        document.body.classList.remove('is-locked');
        document.documentElement.classList.remove('is-locked');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        setTimeout(() => {
          lockScreen.style.display = 'none';
          window.scrollTo(0, 0);

          // Focus on the Friendship Question Section
          const questionSection = document.getElementById('friendship-question-section');
          if (questionSection) {
            questionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 600);
      }, 350);
    } else {
      sounds.playErrorBuzz();
      if (keypad) keypad.classList.add('shake');
      if (errorAlert) errorAlert.classList.add('show');

      setTimeout(() => {
        if (keypad) keypad.classList.remove('shake');
        STATE.inputCode = '';
        updateSlots();
      }, 600);

      setTimeout(() => {
        if (errorAlert) errorAlert.classList.remove('show');
      }, 2500);
    }
  }

  window.addEventListener('keydown', (e) => {
    if (STATE.unlocked) return;
    if (errorAlert) errorAlert.classList.remove('show');

    if (e.key >= '0' && e.key <= '9') {
      if (STATE.inputCode.length < 4) {
        sounds.playClick();
        STATE.inputCode += e.key;
        updateSlots();
        if (codeDebounceTimer) clearTimeout(codeDebounceTimer);

        if (STATE.inputCode.length === 4) {
          checkCode();
        } else if (STATE.inputCode.length === 3 && STATE.inputCode === '111') {
          codeDebounceTimer = setTimeout(() => {
            if (STATE.inputCode === '111') {
              checkCode();
            }
          }, 800);
        }
      }
    } else if (e.key === 'Backspace') {
      sounds.playClick();
      if (codeDebounceTimer) clearTimeout(codeDebounceTimer);
      STATE.inputCode = STATE.inputCode.slice(0, -1);
      updateSlots();
    }
  });

  function updateLockTime() {
    const lockTimeElem = document.getElementById('lock-clock-time');
    if (!lockTimeElem) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    hours = hours % 12 || 12;
    lockTimeElem.textContent = `${hours}:${minutes}`;
  }
  updateLockTime();
  setInterval(updateLockTime, 1000);
}

// ==========================================================================
// 3. BACKGROUND AUDIO TOGGLE (DISABLED AS REQUESTED)
// ==========================================================================
function toggleAudio() {
  // Continuous song removed as requested by user
  STATE.audioPlaying = false;
}

// ==========================================================================
// 4. LIVE COUNTDOWN & 12 OCTOBER GRAND ARRIVAL MODE
// ==========================================================================
function initCountdown() {
  const daysElem = document.getElementById('days-val');
  const hoursElem = document.getElementById('hours-val');
  const minutesElem = document.getElementById('mins-val');
  const secondsElem = document.getElementById('secs-val');
  const todayBanner = document.getElementById('birthday-today-banner');
  const previewBtn = document.getElementById('preview-celebration-btn');

  function trigger12OctArrivalMode() {
    if (todayBanner) todayBanner.classList.add('active');
    if (daysElem) daysElem.textContent = '12';
    if (hoursElem) hoursElem.textContent = 'OCT';
    if (minutesElem) minutesElem.textContent = '17';
    if (secondsElem) secondsElem.textContent = 'BDAY';
  }

  function update() {
    if (STATE.isCelebrationMode) return;

    const now = new Date();
    const year = now.getFullYear();
    let bday = new Date(year, 9, 12, 0, 0, 0);

    if (now.getMonth() === 9 && now.getDate() === 12) {
      trigger12OctArrivalMode();
      return;
    }

    if (now > bday) {
      bday = new Date(year + 1, 9, 12, 0, 0, 0);
    }

    const diff = bday.getTime() - now.getTime();
    if (diff <= 0) {
      trigger12OctArrivalMode();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    if (daysElem) daysElem.textContent = String(days).padStart(2, '0');
    if (hoursElem) hoursElem.textContent = String(hours).padStart(2, '0');
    if (minutesElem) minutesElem.textContent = String(mins).padStart(2, '0');
    if (secondsElem) secondsElem.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);

  if (previewBtn && todayBanner) {
    previewBtn.addEventListener('click', () => {
      STATE.isCelebrationMode = !STATE.isCelebrationMode;
      if (STATE.isCelebrationMode) {
        trigger12OctArrivalMode();
        previewBtn.innerHTML = '<i class="fas fa-undo"></i> Wapas Countdown Par Jaiye';
        previewBtn.style.borderColor = '#ffd166';
        sounds.playUnlockChime();
        triggerConfetti();
        todayBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        todayBanner.classList.remove('active');
        previewBtn.innerHTML = '<i class="fas fa-sparkles" style="color: var(--gold);"></i> 12 Oct Mode Dekhiye 🎉';
        previewBtn.style.borderColor = '';
        update();
      }
    });
  }
}

// ==========================================================================
// 5. INTERACTIVE BIRTHDAY CAKE & CANDLE BLOWING
// ==========================================================================
function initCake() {
  const blowBtn = document.getElementById('blow-candles-btn');
  const cakeWishBanner = document.getElementById('cake-wish-banner');
  const candles = document.querySelectorAll('.candle');

  function blowCandles() {
    if (STATE.candlesBlown) return;
    STATE.candlesBlown = true;
    sounds.playBlowSound();

    candles.forEach((candle, idx) => {
      setTimeout(() => {
        candle.classList.add('blown');
      }, idx * 80);
    });

    setTimeout(() => {
      if (cakeWishBanner) cakeWishBanner.classList.add('active');
      if (blowBtn) {
        blowBtn.innerHTML = '✨ Wish Maang Li & Mombatti Bujh Gayi! 🎂';
        blowBtn.style.background = '#2ecc71';
      }
      triggerConfetti();
    }, 600);
  }

  if (blowBtn) blowBtn.addEventListener('click', blowCandles);

  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      sounds.playBlowSound();
      candle.classList.add('blown');
      const allBlown = Array.from(candles).every(c => c.classList.contains('blown'));
      if (allBlown && !STATE.candlesBlown) {
        STATE.candlesBlown = true;
        if (cakeWishBanner) cakeWishBanner.classList.add('active');
        if (blowBtn) {
          blowBtn.innerHTML = '✨ Wish Maang Li & Mombatti Bujh Gayi! 🎂';
          blowBtn.style.background = '#2ecc71';
        }
        triggerConfetti();
      }
    });
  });
}

// ==========================================================================
// 6. CINEMATIC BIRTHDAY MOVIE THEATER ("A 17-YEAR JOURNEY")
// ==========================================================================
const MOVIE_SCENES = [
  { type: 'image', src: 'assets/media/images/img_1.jpg', tag: 'Scene 1 • Ek Pari Ka Aagman', text: '12 October 2009 — Is din is duniya ko Krishuu jaisi angel mili thi ✨', dur: 5000 },
  { type: 'video', src: 'assets/media/videos/vid_1.mp4', tag: 'Scene 2 • Teri Wo Muskaan', text: 'Teri wo pyaari muskaan, jo har kisi ka din roshan kar deti hai 💕', dur: 6000 },
  { type: 'image', src: 'assets/media/images/img_5.jpg', tag: 'Scene 3 • Nautanki & Drama Queen', text: 'Tera wo cute andaaz aur dramatic expressions, full entertainment! 👑', dur: 5000 },
  { type: 'video', src: 'assets/media/videos/vid_2.mp4', tag: 'Scene 4 • Real Moments on Camera', text: 'Har ek video me teri sachhi khushi aur mast energy dikhti hai 🎥', dur: 6000 },
  { type: 'image', src: 'assets/media/images/img_15.jpg', tag: 'Scene 5 • Purity of Heart', text: 'Tera saaf aur pyaara dil, jo sabki bina kisi matlab ke itni care karta hai 💛', dur: 5000 },
  { type: 'video', src: 'assets/media/videos/vid_3.mp4', tag: 'Scene 6 • Endless Laughter', text: 'Wo jab hum bina wajah haste-haste pagal ho jaate hain 😂', dur: 6000 },
  { type: 'image', src: 'assets/media/images/img_25.jpg', tag: 'Scene 7 • Comfort & Peace', text: 'Bas tere saath reh kar ya baat karke ek alag hi sukoon milta hai 🌸', dur: 5000 },
  { type: 'video', src: 'assets/media/videos/vid_4.mp4', tag: 'Scene 8 • Bestie Vibes', text: 'Tere jaisi dost milna sach me kismat ki baat hai 👯‍♀️', dur: 6000 },
  { type: 'image', src: 'assets/media/images/img_40.jpg', tag: 'Scene 9 • Strong & Beautiful Soul', text: 'Tu jitna sochti hai na, usse 100 guna zyada strong aur samajhdaar hai 🌟', dur: 5000 },
  { type: 'video', src: 'assets/media/videos/vid_5.mp4', tag: 'Scene 10 • Golden Hours', text: 'Zindagi ke sabse khoobsurat lamhe jo hamesha dil me rahenge 🌅', dur: 6000 },
  { type: 'image', src: 'assets/media/images/img_60.jpg', tag: 'Scene 11 • Food & Sweet Cravings', text: 'Saath me khana, nayi jagah explore karna aur unlimited baatein 🍰', dur: 5000 },
  { type: 'video', src: 'assets/media/videos/vid_6.mp4', tag: 'Scene 12 • Forever Best Friends', text: 'Chahe life me koi bhi mod aaye, main hamesha tere saath khada hu 🤞', dur: 6000 },
  { type: 'image', src: 'assets/media/images/img_80.jpg', tag: 'Scene 13 • 17 Magical Years', text: 'Sweet 16 se Fabulous 17 tak ka safar, tu hamesha aisi hi chamakti rehna 👑', dur: 5000 },
  { type: 'video', src: 'assets/media/videos/vid_7.mp4', tag: 'Scene 14 • Celebration Time', text: 'Aaj ka poora din sirf aur sirf tere naam, Krishuu! 🥳🎉', dur: 6000 },
  { type: 'image', src: 'assets/media/images/img_1.jpg', tag: 'Scene 15 • Grand Birthday Finale', text: 'Happy 17th Birthday Dearest Krishuu! May all your secret wishes come true! 💖🎂✨', dur: 6000 }
];

function initCinemaMovie() {
  const openBtn = document.getElementById('start-cinema-btn');
  const modal = document.getElementById('cinema-modal');
  const closeBtn = document.getElementById('close-cinema-btn');
  const titleCard = document.getElementById('cinema-title-card');
  const countdownNum = document.getElementById('cinema-countdown-num');
  const imgLayer = document.getElementById('cinema-img-layer');
  const videoLayer = document.getElementById('cinema-video-layer');
  const sceneTag = document.getElementById('cinema-scene-tag');
  const captionText = document.getElementById('cinema-caption-text');
  const playBtn = document.getElementById('cinema-play-btn');
  const playIcon = document.getElementById('cinema-play-icon');
  const prevBtn = document.getElementById('cinema-prev-btn');
  const nextBtn = document.getElementById('cinema-next-btn');
  const timeLabel = document.getElementById('cinema-time-label');
  const progressFill = document.getElementById('cinema-progress-fill');
  const soundBtn = document.getElementById('cinema-sound-btn');
  const soundIcon = document.getElementById('cinema-sound-icon');

  if (!modal) return;

  function startMovie() {
    modal.classList.add('active');
    titleCard.classList.remove('hidden');
    STATE.currentSceneIdx = 0;
    STATE.isCinemaPlaying = false;
    toggleAudio(false, true); // Pause normal bg audio

    // Countdown 3... 2... 1...
    let count = 3;
    countdownNum.textContent = count;
    sounds.playClick();

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNum.textContent = count;
        sounds.playClick();
      } else {
        clearInterval(countInterval);
        titleCard.classList.add('hidden');
        STATE.isCinemaPlaying = true;
        if (playIcon) playIcon.className = 'fas fa-pause';
        playScene(0);
      }
    }, 1000);
  }

  function playScene(idx) {
    if (idx >= MOVIE_SCENES.length) {
      // Movie complete!
      triggerConfetti();
      sounds.playUnlockChime();
      sceneTag.textContent = "FINALE • THE END";
      captionText.textContent = "Happy 17th Birthday Krishuu! Tu hamesha khush rehna! 💖✨";
      STATE.isCinemaPlaying = false;
      if (playIcon) playIcon.className = 'fas fa-redo';
      return;
    }

    STATE.currentSceneIdx = idx;
    const scene = MOVIE_SCENES[idx];

    // Update labels and progress
    const currentNum = String(idx + 1).padStart(2, '0');
    const totalNum = String(MOVIE_SCENES.length).padStart(2, '0');
    if (timeLabel) timeLabel.textContent = `${currentNum} / ${totalNum}`;
    if (progressFill) progressFill.style.width = `${((idx + 1) / MOVIE_SCENES.length) * 100}%`;

    sceneTag.textContent = scene.tag;
    captionText.textContent = scene.text;

    if (scene.type === 'image') {
      videoLayer.classList.remove('active');
      videoLayer.pause();
      imgLayer.src = scene.src;
      imgLayer.className = 'cinema-media active ken-burns';
    } else {
      imgLayer.classList.remove('active');
      imgLayer.className = 'cinema-media';
      videoLayer.src = scene.src;
      videoLayer.muted = STATE.cinemaSoundMuted;
      videoLayer.className = 'cinema-media active';
      videoLayer.play().catch(() => {});
    }

    if (STATE.cinemaTimer) clearTimeout(STATE.cinemaTimer);
    STATE.cinemaTimer = setTimeout(() => {
      if (STATE.isCinemaPlaying) {
        playScene(idx + 1);
      }
    }, scene.dur);
  }

  function pauseMovie() {
    STATE.isCinemaPlaying = false;
    if (playIcon) playIcon.className = 'fas fa-play';
    if (STATE.cinemaTimer) clearTimeout(STATE.cinemaTimer);
    videoLayer.pause();
  }

  function resumeMovie() {
    STATE.isCinemaPlaying = true;
    if (playIcon) playIcon.className = 'fas fa-pause';
    playScene(STATE.currentSceneIdx);
  }

  function closeCinema() {
    pauseMovie();
    modal.classList.remove('active');
    videoLayer.src = '';
    imgLayer.src = '';
    titleCard.classList.remove('hidden');
    toggleAudio(true); // Resume background music
  }

  if (openBtn) openBtn.addEventListener('click', startMovie);
  if (closeBtn) closeBtn.addEventListener('click', closeCinema);

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (STATE.currentSceneIdx >= MOVIE_SCENES.length) {
        // Replay
        startMovie();
      } else if (STATE.isCinemaPlaying) {
        pauseMovie();
      } else {
        resumeMovie();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      let prevIdx = Math.max(0, STATE.currentSceneIdx - 1);
      playScene(prevIdx);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      let nextIdx = Math.min(MOVIE_SCENES.length - 1, STATE.currentSceneIdx + 1);
      playScene(nextIdx);
    });
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      STATE.cinemaSoundMuted = !STATE.cinemaSoundMuted;
      videoLayer.muted = STATE.cinemaSoundMuted;
      if (soundIcon) {
        soundIcon.className = STATE.cinemaSoundMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
      }
    });
  }
}

// ==========================================================================
// 7. 41 VIDEO REELS THEATER
// ==========================================================================
function initVideoReels() {
  const container = document.getElementById('reels-carousel');
  const modal = document.getElementById('video-modal');
  const player = document.getElementById('modal-video-player');
  const closeBtn = document.getElementById('close-video-modal');
  const prevBtn = document.getElementById('video-prev-btn');
  const nextBtn = document.getElementById('video-next-btn');

  if (!container || typeof KRISHUU_GALLERY === 'undefined' || !KRISHUU_GALLERY.videos) return;

  const videos = KRISHUU_GALLERY.videos;
  const reelCaptions = [
    "Pure Vibe ✨", "Nautanki Queen 👑", "Cute Moments 💕", "Real Smile 🌸",
    "Pagalpanti Mode 😂", "Golden Memories 💛", "Unfiltered Drama 🎥", "Bestie Energy 🌟"
  ];

  videos.forEach((vidSrc, idx) => {
    const card = document.createElement('div');
    card.className = 'reel-card';
    const tag = reelCaptions[idx % reelCaptions.length];

    card.innerHTML = `
      <video src="${vidSrc}" preload="metadata" muted playsinline></video>
      <div class="reel-overlay">
        <div class="reel-badge"><i class="fas fa-video"></i> Reel #${idx + 1}</div>
        <div class="reel-play-icon"><i class="fas fa-play"></i></div>
        <div class="reel-info">
          <h4>${tag}</h4>
          <p>Tap karke full video dekhiye</p>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openVideo(idx));
    container.appendChild(card);
  });

  function openVideo(idx) {
    STATE.currentVideoIdx = idx;
    player.src = videos[idx];
    modal.classList.add('active');
    toggleAudio(false, true);
    player.play().catch(() => {});
  }

  function closeVideo() {
    modal.classList.remove('active');
    player.pause();
    player.src = '';
    toggleAudio(true);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeVideo);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeVideo();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      let newIdx = STATE.currentVideoIdx - 1;
      if (newIdx < 0) newIdx = videos.length - 1;
      openVideo(newIdx);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      let newIdx = (STATE.currentVideoIdx + 1) % videos.length;
      openVideo(newIdx);
    });
  }
}

// ==========================================================================
// 8. 700+ PHOTOS INFINITE VAULT WITH CATEGORY TABS
// ==========================================================================
function initPhotoVault() {
  const grid = document.getElementById('vault-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const tabBtns = document.querySelectorAll('.gallery-filter-tabs .tab-btn');

  if (!grid || !STATE.vaultPhotos || STATE.vaultPhotos.length === 0) return;

  function renderBatch() {
    const start = STATE.loadedPhotoCount;
    const end = Math.min(start + STATE.photosPerPage, STATE.vaultPhotos.length);

    for (let i = start; i < end; i++) {
      const src = STATE.vaultPhotos[i];
      const item = document.createElement('div');
      item.className = 'vault-item';
      item.innerHTML = `
        <img src="${src}" alt="Krishuu Memory" loading="lazy">
        <div class="vault-badge">#${i + 1}</div>
      `;
      item.addEventListener('click', () => openLightbox(i));
      grid.appendChild(item);
    }

    STATE.loadedPhotoCount = end;

    if (STATE.loadedPhotoCount >= STATE.vaultPhotos.length) {
      if (loadMoreBtn) loadMoreBtn.parentElement.style.display = 'none';
    } else {
      if (loadMoreBtn) loadMoreBtn.parentElement.style.display = 'block';
    }
  }

  renderBatch();

  if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => renderBatch());

  // Category Tabs Handling
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-cat') || 'all';

      if (cat === 'shuffle') {
        for (let i = STATE.vaultPhotos.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [STATE.vaultPhotos[i], STATE.vaultPhotos[j]] = [STATE.vaultPhotos[j], STATE.vaultPhotos[i]];
        }
        sounds.playUnlockChime();
      } else if (cat === 'all') {
        STATE.vaultPhotos = [...KRISHUU_GALLERY.images];
      } else if (KRISHUU_GALLERY.categories && KRISHUU_GALLERY.categories[cat]) {
        STATE.vaultPhotos = [...KRISHUU_GALLERY.categories[cat]];
      }

      grid.innerHTML = '';
      STATE.loadedPhotoCount = 0;
      renderBatch();
    });
  });
}

// ==========================================================================
// 9. UPGRADED LIGHTBOX MODAL WITH SLIDESHOW
// ==========================================================================
function openLightbox(idx) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const counter = document.getElementById('lightbox-counter');
  const caption = document.getElementById('lightbox-caption');

  if (!modal || !img) return;

  STATE.currentPhotoIdx = idx;
  const total = STATE.vaultPhotos.length;
  img.src = STATE.vaultPhotos[idx];

  if (counter) counter.textContent = `Photo ${idx + 1} of ${total}`;
  if (caption) caption.textContent = `Pyaari Krishuu 💕 (#${idx + 1})`;

  modal.classList.add('active');
}

function initLightboxControls() {
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('close-lightbox');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');
  const likeBtn = document.getElementById('lightbox-like-btn');
  const autoplayBtn = document.getElementById('lightbox-autoplay-btn');

  function showNext() {
    const total = STATE.vaultPhotos.length;
    let nextIdx = (STATE.currentPhotoIdx + 1) % total;
    openLightbox(nextIdx);
  }

  function showPrev() {
    const total = STATE.vaultPhotos.length;
    let prevIdx = STATE.currentPhotoIdx - 1;
    if (prevIdx < 0) prevIdx = total - 1;
    openLightbox(prevIdx);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      stopSlideshow();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        stopSlideshow();
      }
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'Escape') {
      modal.classList.remove('active');
      stopSlideshow();
    }
  });

  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      sounds.playUnlockChime();
      triggerConfetti();
      likeBtn.innerHTML = '<i class="fas fa-heart" style="color: #ff5e8e;"></i> Bohot Pyaari Photo! 💕';
      setTimeout(() => {
        likeBtn.innerHTML = '<i class="fas fa-heart" style="color: #ff5e8e;"></i> Like kiya! 💕';
      }, 2000);
    });
  }

  function stopSlideshow() {
    if (STATE.slideshowTimer) {
      clearInterval(STATE.slideshowTimer);
      STATE.slideshowTimer = null;
    }
    STATE.isSlideshowPlaying = false;
    if (autoplayBtn) autoplayBtn.innerHTML = '<i class="fas fa-play"></i> Auto-Play 📽️';
  }

  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', () => {
      if (STATE.isSlideshowPlaying) {
        stopSlideshow();
      } else {
        STATE.isSlideshowPlaying = true;
        autoplayBtn.innerHTML = '<i class="fas fa-pause"></i> Pause ⏸️';
        sounds.playClick();
        STATE.slideshowTimer = setInterval(() => {
          showNext();
        }, 2500);
      }
    });
  }

  document.querySelectorAll('.polaroid-card').forEach((card, idx) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img) {
        const foundIdx = STATE.vaultPhotos.indexOf(img.getAttribute('src'));
        openLightbox(foundIdx !== -1 ? foundIdx : idx);
      }
    });
  });

  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      sounds.playClick();
    });
  });
}

// ==========================================================================
// 10. RUNAWAY FRIENDSHIP QUESTION CONTROLLER ("WILL YOU BE MY FRIEND?")
// ==========================================================================
function initFriendshipQuestion() {
  const btnYes = document.getElementById('btn-question-yes');
  const btnNo = document.getElementById('btn-question-no');
  const acceptedBanner = document.getElementById('question-accepted-banner');
  const surpriseContent = document.getElementById('main-surprise-content');

  if (!btnYes || !btnNo) return;

  const teasePhrases = [
    "NO 🙅‍♀️",
    "Arre pakad ke dikha! 😜",
    "Nahi maan rahi? 🏃‍♀️💨",
    "Oops! Miss ho gaya! 🤭",
    "Sirf YES daba sakti hai! 💖",
    "Bhag gaya button! 🚀",
    "Tu meri bestie hai na! 🥺",
    "Click karke toh dikha! 😝"
  ];
  let phraseIdx = 0;

  function dodgeNoButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sounds.playClick();

    const btnWidth = btnNo.offsetWidth || 110;
    const btnHeight = btnNo.offsetHeight || 44;
    const padding = 20;

    const maxX = Math.max(padding, window.innerWidth - btnWidth - padding);
    const maxY = Math.max(padding, window.innerHeight - btnHeight - padding);

    const randomX = Math.floor(Math.random() * maxX) + padding;
    const randomY = Math.floor(Math.random() * maxY) + padding;

    btnNo.classList.add('dodging');
    btnNo.style.position = 'fixed';
    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
    btnNo.style.zIndex = '99999';

    phraseIdx = (phraseIdx + 1) % teasePhrases.length;
    btnNo.textContent = teasePhrases[phraseIdx];
  }

  // Prevent Krishuu from ever clicking NO on mouse or touch
  ['mouseenter', 'mouseover', 'touchstart', 'pointerdown', 'click'].forEach(evt => {
    btnNo.addEventListener(evt, dodgeNoButton, { passive: false });
  });

  // On YES click:
  btnYes.addEventListener('click', () => {
    sounds.playUnlockChime();
    triggerConfetti();

    // Hide runaway NO button
    btnNo.style.display = 'none';

    // Update YES button
    btnYes.innerHTML = '<i class="fas fa-heart"></i> YAYYY! Besties Forever! 🥰💖✨';
    btnYes.style.animation = 'none';
    btnYes.style.transform = 'scale(1.06)';

    // Show accepted banner
    if (acceptedBanner) {
      acceptedBanner.classList.add('show');
    }

    // Unhide the main surprise content!
    if (surpriseContent) {
      surpriseContent.classList.add('revealed');
    }

    // Smooth scroll down to surprise
    setTimeout(() => {
      const hero = document.getElementById('hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1200);
  });
}

// ==========================================================================
// 11. VINTAGE HEARTFELT LETTER CUSTOMIZER ("JO MEH LIKHUNGA")
// ==========================================================================
function initLetterCustomizer() {
  const letterTextElem = document.getElementById('parchment-letter-text');
  const editBtn = document.getElementById('btn-letter-edit');
  const modal = document.getElementById('letter-edit-modal');
  const closeBtn = document.getElementById('close-letter-edit');
  const input = document.getElementById('letter-custom-input');
  const saveBtn = document.getElementById('letter-save-btn');
  const restoreDefaultBtn = document.getElementById('letter-restore-default-btn');

  if (!letterTextElem) return;

  const defaultLetter = letterTextElem.textContent.trim();

  // Load saved customized letter from localStorage
  const savedLetter = localStorage.getItem('krishuu_custom_letter');
  if (savedLetter && savedLetter.trim()) {
    letterTextElem.textContent = savedLetter;
  }

  if (editBtn && modal && input) {
    editBtn.addEventListener('click', () => {
      input.value = letterTextElem.textContent.trim();
      modal.classList.add('active');
      sounds.playClick();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (saveBtn && input && modal) {
    saveBtn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) return;
      localStorage.setItem('krishuu_custom_letter', val);
      letterTextElem.textContent = val;
      modal.classList.remove('active');
      sounds.playUnlockChime();
      triggerConfetti();
    });
  }

  if (restoreDefaultBtn && input) {
    restoreDefaultBtn.addEventListener('click', () => {
      localStorage.removeItem('krishuu_custom_letter');
      letterTextElem.textContent = defaultLetter;
      input.value = defaultLetter;
      sounds.playClick();
    });
  }
}

// ==========================================================================
// 12. VIRTUAL GIFT BOX UNBOXING & CUTE GIFS
// ==========================================================================
function initGiftBox() {
  const giftBoxWrap = document.getElementById('gift-box-wrap');
  const revealedSurprises = document.getElementById('revealed-surprises');

  if (giftBoxWrap) {
    giftBoxWrap.addEventListener('click', () => {
      if (STATE.giftOpened) return;
      STATE.giftOpened = true;
      sounds.playUnboxSound();
      giftBoxWrap.classList.add('opened');

      triggerConfetti();

      setTimeout(() => {
        if (revealedSurprises) {
          revealedSurprises.classList.add('active');
          revealedSurprises.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 700);
    });
  }

  // Cute reaction GIFs tap listener
  document.querySelectorAll('.cute-gif-card').forEach(card => {
    card.addEventListener('click', () => {
      sounds.playUnlockChime();
      triggerConfetti();
      card.style.transform = 'scale(1.08) translateY(-8px)';
      setTimeout(() => card.style.transform = '', 350);
    });
  });

  document.querySelectorAll('.btn-redeem').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const ticket = e.target.closest('.coupon-ticket');
      if (ticket && !ticket.classList.contains('redeemed')) {
        ticket.classList.add('redeemed');
        btn.textContent = 'CLAIM HO GAYA WITH RESPECT & LOVE ❤️';
        sounds.playUnlockChime();
        triggerConfetti();
      }
    });
  });
}

// ==========================================================================
// 11. MAGIC SCRATCH CARD
// ==========================================================================
function initScratchCard() {
  const canvas = document.getElementById('scratch-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;

  let width = container.clientWidth || 340;
  let height = container.clientHeight || 180;
  canvas.width = width;
  canvas.height = height;

  function drawCover() {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#e0e0e0');
    grad.addColorStop(0.3, '#f5d77f');
    grad.addColorStop(0.7, '#d4af37');
    grad.addColorStop(1, '#cccccc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#6e5414';
    ctx.font = 'bold 15px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Ungli ya mouse se scratch karo! ✨', width / 2, height / 2 - 5);
    ctx.font = '12px Poppins, sans-serif';
    ctx.fillText('Krishuu Ka Secret Birthday Message 💖', width / 2, height / 2 + 20);
  }
  drawCover();

  let isScratching = false;

  function scratch(e) {
    if (!isScratching) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.addEventListener('mousedown', () => isScratching = true);
  window.addEventListener('mouseup', () => isScratching = false);
  canvas.addEventListener('mousemove', scratch);

  canvas.addEventListener('touchstart', (e) => {
    isScratching = true;
    scratch(e);
  }, { passive: true });
  canvas.addEventListener('touchmove', scratch, { passive: true });
  window.addEventListener('touchend', () => isScratching = false);
}

// ==========================================================================
// 12. INTERACTIVE WISH JAR
// ==========================================================================
function initWishJar() {
  const jar = document.getElementById('jar-illustration');
  const wishText = document.getElementById('wish-display-text');

  const wishes = [
    "Bhagwan kare Krishuu ke 17th saal me sirf khushiyaan aur success aaye! ✨",
    "Teri har ek wish jo tu dil me maange wo poori ho jaye! 🎂",
    "Tu hamesha aise hi hasti rahe aur chamakti rahe! 💖",
    "Duniya ki saari khushiyan aur best treats Krishuu ke naam! 🍰",
    "Hamari dosti hamesha aisi hi strong rahe, chahe kuch bhi ho jaye! 🫂",
    "Tere chehre ki ye smile duniya ki sabse keemti cheez hai! 🌸",
    "Kabhi koi dukh ya pareshani tere paas bhi na bhatke! 🌟",
    "Tu jitna sochti hai usse 100 guna zyada special hai sabke liye! 💫",
    "Happy 17th Birthday to the most special person in the universe! 👑",
    "Har ek din tere liye nayi khushiyan aur blessings lekar aaye! 🚀"
  ];

  if (jar && wishText) {
    jar.addEventListener('click', () => {
      sounds.playUnlockChime();
      jar.style.transform = 'scale(0.9) rotate(8deg)';
      setTimeout(() => jar.style.transform = '', 300);

      const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
      wishText.style.opacity = '0';
      setTimeout(() => {
        wishText.textContent = `"${randomWish}"`;
        wishText.style.opacity = '1';
        triggerConfetti();
      }, 200);
    });
  }
}

// ==========================================================================
// 13. PHOTO MANAGER & GUESTBOOK
// ==========================================================================
function initPhotoManager() {
  const managerBtn = document.getElementById('photo-manager-btn');
  const managerModal = document.getElementById('photo-manager-modal');
  const closeManagerBtn = document.getElementById('close-manager-modal');

  if (managerBtn && managerModal) {
    managerBtn.addEventListener('click', () => managerModal.classList.add('active'));
  }
  if (closeManagerBtn && managerModal) {
    closeManagerBtn.addEventListener('click', () => managerModal.classList.remove('active'));
    managerModal.addEventListener('click', (e) => {
      if (e.target === managerModal) managerModal.classList.remove('active');
    });
  }

  document.querySelectorAll('.photo-file-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const targetId = input.getAttribute('data-target-img');
      const file = e.target.files[0];
      if (file && targetId) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const targetImg = document.getElementById(targetId);
          if (targetImg) {
            targetImg.src = event.target.result;
            const thumb = input.closest('.photo-slot-item')?.querySelector('.photo-slot-thumb');
            if (thumb) thumb.src = event.target.result;
            try {
              localStorage.setItem(`krishuu_img_${targetId}`, event.target.result);
            } catch (err) {
              console.warn('Storage limit reached for local images');
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });
  });

  document.querySelectorAll('img[id]').forEach(img => {
    const saved = localStorage.getItem(`krishuu_img_${img.id}`);
    if (saved) img.src = saved;
  });
}

function initGuestbook() {
  const form = document.getElementById('guestbook-form');
  const nameInput = document.getElementById('guest-name');
  const msgInput = document.getElementById('guest-msg');
  const stream = document.getElementById('wishes-stream');

  if (form && stream) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim() || 'Tera Khaas Dost';
      const msg = msgInput.value.trim();
      if (!msg) return;

      const item = document.createElement('div');
      item.className = 'wish-item';
      item.innerHTML = `<strong>✨ ${escapeHtml(name)}:</strong><p>${escapeHtml(msg)}</p>`;
      stream.prepend(item);

      form.reset();
      triggerConfetti();
    });
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================================================
// 14. CANVAS PARTICLES & CONFETTI CANNON
// ==========================================================================
function initCanvasParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const totalParticles = 40;

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 20;
      this.size = Math.random() * 8 + 4;
      this.speedY = Math.random() * 1.2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.type = Math.random() > 0.4 ? 'heart' : 'sparkle';
      this.color = Math.random() > 0.5 ? '#ff8fab' : '#ffd166';
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      if (this.type === 'heart') {
        const s = this.size;
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
        ctx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, 0);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < totalParticles; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

function triggerConfetti() {
  const count = 130;
  const colors = ['#ff5e8e', '#ff8fab', '#ffd166', '#b588f7', '#ffffff', '#2ecc71'];
  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.style.position = 'fixed';
  confettiCanvas.style.top = '0';
  confettiCanvas.style.left = '0';
  confettiCanvas.style.width = '100vw';
  confettiCanvas.style.height = '100vh';
  confettiCanvas.style.pointerEvents = 'none';
  confettiCanvas.style.zIndex = '99999';
  document.body.appendChild(confettiCanvas);

  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const pieces = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      velX: (Math.random() - 0.5) * 22,
      velY: (Math.random() - 0.8) * 20,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.45,
      alpha: 1
    });
  }

  let frame = 0;
  function updateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    pieces.forEach(p => {
      p.x += p.velX;
      p.y += p.velY;
      p.velY += p.gravity;
      p.rot += p.rotSpeed;
      if (frame > 35) p.alpha -= 0.02;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });

    frame++;
    if (alive && frame < 140) {
      requestAnimationFrame(updateConfetti);
    } else {
      confettiCanvas.remove();
    }
  }
  updateConfetti();
}

// ==========================================================================
// HERO PHOTO SLIDESHOW RING & PETAL RAIN ANIMATIONS
// ==========================================================================
function initHeroSlideshowRing() {
  const ring = document.getElementById('hero-slideshow-ring');
  if (!ring) return;

  let pool = [];
  if (typeof KRISHUU_GALLERY !== 'undefined') {
    if (KRISHUU_GALLERY.categories && KRISHUU_GALLERY.categories.solo && KRISHUU_GALLERY.categories.solo.length > 0) {
      pool = KRISHUU_GALLERY.categories.solo;
    } else if (KRISHUU_GALLERY.images && KRISHUU_GALLERY.images.length > 0) {
      pool = KRISHUU_GALLERY.images;
    }
  }

  if (pool.length === 0) return;

  const count = Math.min(5, pool.length);
  const step = Math.max(1, Math.floor(pool.length / count));
  const chosen = [];
  for (let i = 0; i < count; i++) {
    chosen.push(pool[(i * step) % pool.length]);
  }

  ring.innerHTML = '';
  chosen.forEach((src, idx) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Krishuu Photo #${idx + 1}`;
    img.className = 'hsr-photo';
    img.loading = 'lazy';
    img.title = 'Tap karke zoom me dekho! 💖';
    img.addEventListener('click', () => {
      const vIdx = STATE.vaultPhotos.indexOf(src);
      if (vIdx !== -1) {
        openLightbox(vIdx);
      } else {
        openLightbox(0);
      }
    });
    ring.appendChild(img);
  });
}

function initPetalRain() {
  const container = document.getElementById('petal-rain');
  if (!container) return;

  const symbols = ['🌸', '✨', '💖', '🌺', '⭐', '🩷', '💫', '🌹', '🎀'];
  const count = 22;

  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const drop = document.createElement('span');
    drop.className = 'petal-drop';
    drop.textContent = symbols[i % symbols.length];
    drop.style.left = `${(i * (100 / count) + (Math.random() * 4 - 2)).toFixed(1)}%`;
    const dur = (5 + Math.random() * 5).toFixed(1);
    const delay = (Math.random() * 6).toFixed(1);
    const size = (0.8 + Math.random() * 0.7).toFixed(2);
    drop.style.animationDuration = `${dur}s`;
    drop.style.animationDelay = `${delay}s`;
    drop.style.fontSize = `${size}rem`;
    drop.style.opacity = (0.5 + Math.random() * 0.4).toFixed(2);
    container.appendChild(drop);
  }
}

// ==========================================================================
// INITIALIZATION ON DOM READY
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  if (!STATE.unlocked) {
    window.scrollTo(0, 0);
  }
  initPasscodeVault();
  initFriendshipQuestion();
  initCountdown();
  initHeroSlideshowRing();
  initPetalRain();
  initLetterCustomizer();
  initLightboxControls();
  initGiftBox();
  initScratchCard();
  initWishJar();
  initPhotoManager();
  initGuestbook();
  initCanvasParticles();

  const musicBtn = document.getElementById('music-toggle-btn');
  if (musicBtn) musicBtn.addEventListener('click', () => toggleAudio());

  const blastBtn = document.getElementById('blast-confetti-btn');
  if (blastBtn) {
    blastBtn.addEventListener('click', () => {
      sounds.playUnlockChime();
      triggerConfetti();
    });
  }
});
