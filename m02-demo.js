// m02-demo.js — Kiro Face Avatar Demo Module
// Mounts into a 460×460px circular container

function mountM02(container) {
  // Clear any previous timers stored on container
  if (container._m02Timers) {
    container._m02Timers.forEach(clearTimeout);
  }
  container._m02Timers = [];

  // ── 1. Inject styles ──────────────────────────────────────────────────────
  const STYLE_ID = 'm02-styles';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* ── Reset / container ── */
      .m02-root {
        position: relative;
        width: 460px;
        height: 460px;
        background: #000;
        overflow: hidden;
        font-family: system-ui, -apple-system, sans-serif;
        color: #fff;
      }

      /* ── Slide layers ── */
      .m02-slide {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }
      .m02-slide.m02-active {
        opacity: 1;
        pointer-events: auto;
      }

      /* ── Face wrapper ── */
      .m02-face-wrap {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -55%);
        width: 160px;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .m02-face-svg {
        width: 160px;
        height: 160px;
        transition: opacity 0.4s ease, filter 0.4s ease;
      }

      /* ── Face hidden state ── */
      .m02-face-hidden .m02-face-svg {
        opacity: 0;
      }

      /* ── Glow pulse for celebratory ── */
      .m02-face-glow .m02-face-svg {
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 20px rgba(167,139,250,0.6));
        animation: m02GlowPulse 0.8s ease-in-out infinite;
      }
      @keyframes m02GlowPulse {
        0%, 100% { filter: drop-shadow(0 0 6px rgba(255,255,255,0.7)) drop-shadow(0 0 16px rgba(167,139,250,0.4)); }
        50%       { filter: drop-shadow(0 0 14px rgba(255,255,255,1))   drop-shadow(0 0 30px rgba(167,139,250,0.9)); }
      }

      /* ── Face fade-out for sleeping ── */
      .m02-face-fadeout .m02-face-svg {
        opacity: 0;
        transition: opacity 3s ease;
      }

      /* ── Eye circles: solid fill ── */
      .m02-face-svg .m02-eye-circle,
      .m02-face-svg .m02-eye-sm-circle {
        fill: #fff;
        stroke: none;
      }

      /* ── SVG face elements — show/hide via class ── */
      .m02-face-svg .m02-eye-circle,
      .m02-face-svg .m02-eye-arc,
      .m02-face-svg .m02-eye-line,
      .m02-face-svg .m02-mouth-arc,
      .m02-face-svg .m02-mouth-line,
      .m02-face-svg .m02-mouth-oval,
      .m02-face-svg .m02-mouth-big-smile,
      .m02-face-svg .m02-dots-row,
      .m02-face-svg .m02-rays,
      .m02-face-svg .m02-eye-sm-circle {
        display: none;
      }

      /* ── Processing dots animation ── */
      .m02-face-svg .m02-dot {
        animation: m02DotPulse 1.2s ease-in-out infinite;
      }
      .m02-face-svg .m02-dot:nth-child(2) { animation-delay: 0.2s; }
      .m02-face-svg .m02-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes m02DotPulse {
        0%, 80%, 100% { opacity: 0.2; }
        40%            { opacity: 1; }
      }

      /* ── Speech / info card ── */
      .m02-card {
        position: absolute;
        bottom: 52px;
        left: 50%;
        transform: translateX(-50%);
        width: 300px;
        padding: 14px 18px;
        background: rgba(20,20,20,0.92);
        border: 1px solid #333;
        border-radius: 12px;
        text-align: center;
        box-sizing: border-box;
      }
      .m02-card-user {
        background: rgba(30,28,40,0.95);
        border-color: #555;
      }
      .m02-card-label {
        font-size: 11px;
        color: #a78bfa;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 4px;
      }
      .m02-card-main {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        line-height: 1.3;
      }
      .m02-card-sub {
        font-size: 12px;
        color: #aaa;
        margin-top: 4px;
      }
      .m02-card-large {
        font-size: 22px;
        font-weight: 700;
        color: #fff;
        margin-top: 2px;
      }
      .m02-card-eta {
        font-size: 13px;
        color: #a78bfa;
        margin-top: 3px;
      }
      .m02-card-mic {
        font-size: 12px;
        color: #aaa;
        margin-top: 5px;
      }
      .m02-card-big-title {
        font-size: 26px;
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.02em;
      }
      .m02-card-note {
        font-size: 12px;
        color: #888;
        margin-top: 3px;
      }

      /* ── Processing dots (card-level) ── */
      .m02-proc-dots {
        display: inline-flex;
        gap: 5px;
        margin-top: 8px;
        align-items: center;
        justify-content: center;
      }
      .m02-proc-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #a78bfa;
        display: inline-block;
        animation: m02DotPulse 1.2s ease-in-out infinite;
      }
      .m02-proc-dots span:nth-child(2) { animation-delay: 0.2s; }
      .m02-proc-dots span:nth-child(3) { animation-delay: 0.4s; }

      /* ── Floating music notes ── */
      .m02-music-notes {
        position: absolute;
        bottom: 160px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 80px;
        pointer-events: none;
      }
      .m02-note {
        position: absolute;
        font-size: 18px;
        color: #a78bfa;
        animation: m02NoteFloat 2s ease-out forwards;
        opacity: 0;
      }
      .m02-note:nth-child(1) { left: 30px;  bottom: 0; animation-delay: 0s;   }
      .m02-note:nth-child(2) { left: 80px;  bottom: 0; animation-delay: 0.8s; }
      .m02-note:nth-child(3) { left: 130px; bottom: 0; animation-delay: 1.6s; }
      .m02-note:nth-child(4) { left: 55px;  bottom: 0; animation-delay: 2.4s; }
      @keyframes m02NoteFloat {
        0%   { opacity: 0;   transform: translateY(0)   scale(0.8); }
        20%  { opacity: 1;   transform: translateY(-10px) scale(1); }
        80%  { opacity: 0.7; transform: translateY(-55px) scale(1.1); }
        100% { opacity: 0;   transform: translateY(-75px) scale(0.9); }
      }

      /* ── Waking blink ── */
      @keyframes m02Blink {
        0%, 45%, 55%, 100% { opacity: 1; }
        48%, 52%            { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── 2. Build HTML ─────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="m02-root">

      <!-- Always-present face SVG -->
      <div class="m02-face-wrap m02-face-hidden" id="m02FaceWrap">
        <svg class="m02-face-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
             fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">

          <!-- Head -->
          <circle cx="50" cy="50" r="42" stroke-width="2"/>

          <!-- === Eyes === -->

          <!-- waking: small circles -->
          <circle class="m02-eye-sm-circle" id="m02EyeLSm" cx="34" cy="40" r="2" stroke-width="2"/>
          <circle class="m02-eye-sm-circle" id="m02EyeRSm" cx="66" cy="40" r="2" stroke-width="2"/>

          <!-- speaking / listening open circles -->
          <circle class="m02-eye-circle" id="m02EyeL" cx="34" cy="40" r="4" stroke-width="2"/>
          <circle class="m02-eye-circle" id="m02EyeR" cx="66" cy="40" r="4" stroke-width="2"/>

          <!-- listening: bigger circles -->
          <circle class="m02-eye-circle" id="m02EyeLLg" cx="34" cy="40" r="5" stroke-width="2"/>
          <circle class="m02-eye-circle" id="m02EyeRLg" cx="66" cy="40" r="5" stroke-width="2"/>

          <!-- idle / processing: small symmetric circles -->
          <circle class="m02-eye-circle" id="m02EyeLProc" cx="34" cy="40" r="3" stroke-width="2"/>
          <circle class="m02-eye-circle" id="m02EyeRProc" cx="66" cy="40" r="3" stroke-width="2"/>

          <!-- idle: half-closed arcs -->
          <path class="m02-eye-arc" id="m02EyeLIdle" d="M30,38 Q34,44 38,38" stroke-width="2"/>
          <path class="m02-eye-arc" id="m02EyeRIdle" d="M62,38 Q66,44 70,38" stroke-width="2"/>

          <!-- happy / celebratory: upward arcs -->
          <path class="m02-eye-arc" id="m02EyeLHappy" d="M30,36 Q34,30 38,36" stroke-width="2"/>
          <path class="m02-eye-arc" id="m02EyeRHappy" d="M62,36 Q66,30 70,36" stroke-width="2"/>

          <!-- sleeping: flat lines -->
          <line class="m02-eye-line" id="m02EyeLSleep" x1="30" y1="40" x2="38" y2="40" stroke-width="2"/>
          <line class="m02-eye-line" id="m02EyeRSleep" x1="62" y1="40" x2="70" y2="40" stroke-width="2"/>

          <!-- === Mouth === -->

          <!-- waking: flat -->
          <line class="m02-mouth-line" id="m02MouthFlat" x1="38" y1="63" x2="62" y2="63" stroke-width="2"/>

          <!-- speaking: open arc smile -->
          <path class="m02-mouth-arc" id="m02MouthSpeak" d="M36,62 Q50,72 64,62" stroke-width="2"/>

          <!-- idle: gentle curve -->
          <path class="m02-mouth-arc" id="m02MouthIdle" d="M38,64 Q50,68 62,64" stroke-width="2"/>

          <!-- listening: slightly open oval -->
          <ellipse class="m02-mouth-oval" id="m02MouthListen" cx="50" cy="64" rx="10" ry="5" stroke-width="2"/>

          <!-- happy / celebratory: big smile -->
          <path class="m02-mouth-big-smile" id="m02MouthHappy" d="M32,64 Q50,78 68,64 Z" stroke-width="2"/>

          <!-- processing: open O circle -->
          <circle class="m02-mouth-oval" id="m02MouthO" cx="50" cy="65" r="6" stroke-width="2.5"/>

          <!-- processing dots (below mouth) -->
          <g class="m02-dots-row" id="m02FaceDots">
            <circle class="m02-dot" cx="44" cy="72" r="1.8" fill="#fff" stroke="none"/>
            <circle class="m02-dot" cx="50" cy="72" r="1.8" fill="#fff" stroke="none"/>
            <circle class="m02-dot" cx="56" cy="72" r="1.8" fill="#fff" stroke="none"/>
          </g>

          <!-- celebratory rays -->
          <g class="m02-rays" id="m02Rays" stroke-width="1.5" opacity="0.7">
            <line x1="50" y1="4"  x2="50" y2="0"/>
            <line x1="78" y1="14" x2="81" y2="11"/>
            <line x1="92" y1="40" x2="96" y2="39"/>
            <line x1="22" y1="14" x2="19" y2="11"/>
            <line x1="8"  y1="40" x2="4"  y2="39"/>
            <line x1="85" y1="72" x2="88" y2="75"/>
            <line x1="15" y1="72" x2="12" y2="75"/>
          </g>

          <!-- sleeping: neutral mouth -->
          <line class="m02-mouth-line" id="m02MouthSleep" x1="42" y1="64" x2="58" y2="64" stroke-width="1.5" opacity="0.5"/>

        </svg>
      </div>

      <!-- S0: blank -->
      <div class="m02-slide" id="m02S0"></div>

      <!-- S1a: waking -->
      <div class="m02-slide" id="m02S1a"></div>

      <!-- S1b: speaking — intro -->
      <div class="m02-slide" id="m02S1b">
        <div class="m02-card" style="bottom:52px; position:absolute; left:50%; transform:translateX(-50%);">
          <div class="m02-card-label">Kiro</div>
          <div class="m02-card-main">Hi, I'm Kiro.<br>I'm your drive companion.</div>
        </div>
      </div>

      <!-- S2: destination info -->
      <div class="m02-slide" id="m02S2">
        <div class="m02-card" style="bottom:52px; position:absolute; left:50%; transform:translateX(-50%);">
          <div class="m02-card-sub" style="margin-bottom:2px;">We are heading to</div>
          <div class="m02-card-large">Lumina Mall</div>
          <div class="m02-card-eta">ETA &nbsp; 18:32</div>
        </div>
      </div>

      <!-- S3: idle — no card -->
      <div class="m02-slide" id="m02S3"></div>

      <!-- S4a: user request -->
      <div class="m02-slide" id="m02S4a">
        <div class="m02-card m02-card-user" style="bottom:52px; position:absolute; left:50%; transform:translateX(-50%);">
          <div class="m02-card-main" style="font-weight:400; font-size:14px;">"Can we stop for coffee?<br>And play something chill"</div>
          <div class="m02-card-mic">🎤 listening…</div>
        </div>
      </div>

      <!-- S4b: processing coffee -->
      <div class="m02-slide" id="m02S4b">
        <div class="m02-card" style="bottom:52px; position:absolute; left:50%; transform:translateX(-50%);">
          <div class="m02-card-main" style="font-size:14px;">Finding a good coffee stop on the way…</div>
          <div class="m02-proc-dots"><span></span><span></span><span></span></div>
        </div>
      </div>

      <!-- S4c: coffee added -->
      <div class="m02-slide" id="m02S4c">
        <div class="m02-card" style="bottom:52px; position:absolute; left:50%; transform:translateX(-50%);">
          <div class="m02-card-label">☕ Coffee stop added</div>
          <div class="m02-card-large" style="font-size:18px;">Brewer's Lane</div>
          <div class="m02-card-eta">+6 min</div>
        </div>
      </div>

      <!-- S4d: processing music -->
      <div class="m02-slide" id="m02S4d">
        <div class="m02-card" style="bottom:52px; position:absolute; left:50%; transform:translateX(-50%);">
          <div class="m02-card-main" style="font-size:14px;">Setting the mood…</div>
          <div class="m02-proc-dots"><span></span><span></span><span></span></div>
        </div>
      </div>

      <!-- S5: happy + music -->
      <div class="m02-slide" id="m02S5">
        <div class="m02-music-notes">
          <span class="m02-note">♪</span>
          <span class="m02-note">♫</span>
          <span class="m02-note">♪</span>
          <span class="m02-note">♫</span>
        </div>
        <div class="m02-card" style="bottom:52px; position:absolute; left:50%; transform:translateX(-50%);">
          <div class="m02-card-label">♪ Kiro's chill pick</div>
          <div class="m02-card-large">Neon City Drive</div>
        </div>
      </div>

      <!-- S7: celebratory — arrived -->
      <div class="m02-slide" id="m02S7">
        <div class="m02-card" style="bottom:52px; position:absolute; left:50%; transform:translateX(-50%);">
          <div class="m02-card-big-title">We're here!</div>
          <div class="m02-card-note">Don't forget your belongings</div>
        </div>
      </div>

      <!-- S8a: see you soon -->
      <div class="m02-slide" id="m02S8a">
        <div class="m02-card" style="bottom:52px; position:absolute; left:50%; transform:translateX(-50%);">
          <div class="m02-card-large" style="font-size:24px;">See You Soon!</div>
        </div>
      </div>

      <!-- S8b: sleeping — no card -->
      <div class="m02-slide" id="m02S8b"></div>

    </div>
  `;

  // ── 3. State machine helpers ───────────────────────────────────────────────
  const root      = container.querySelector('.m02-root');
  const faceWrap  = container.querySelector('#m02FaceWrap');

  // All face element IDs
  const EL = {
    // eyes
    eyeLSm:    root.querySelector('#m02EyeLSm'),
    eyeRSm:    root.querySelector('#m02EyeRSm'),
    eyeL:      root.querySelector('#m02EyeL'),
    eyeR:      root.querySelector('#m02EyeR'),
    eyeLLg:    root.querySelector('#m02EyeLLg'),
    eyeRLg:    root.querySelector('#m02EyeRLg'),
    eyeLProc:  root.querySelector('#m02EyeLProc'),
    eyeRProc:  root.querySelector('#m02EyeRProc'),
    eyeLIdle:  root.querySelector('#m02EyeLIdle'),
    eyeRIdle:  root.querySelector('#m02EyeRIdle'),
    eyeLHappy: root.querySelector('#m02EyeLHappy'),
    eyeRHappy: root.querySelector('#m02EyeRHappy'),
    eyeLSleep: root.querySelector('#m02EyeLSleep'),
    eyeRSleep: root.querySelector('#m02EyeRSleep'),
    // mouth
    mouthFlat:     root.querySelector('#m02MouthFlat'),
    mouthSpeak:    root.querySelector('#m02MouthSpeak'),
    mouthIdle:     root.querySelector('#m02MouthIdle'),
    mouthListen:   root.querySelector('#m02MouthListen'),
    mouthHappy:    root.querySelector('#m02MouthHappy'),
    mouthProc:     root.querySelector('#m02MouthProc'),
    mouthSleep:    root.querySelector('#m02MouthSleep'),
    // extras
    mouthO:    root.querySelector('#m02MouthO'),
    faceDots:  root.querySelector('#m02FaceDots'),
    rays:      root.querySelector('#m02Rays'),
  };

  function hideAll(elList) {
    elList.forEach(el => { if (el) el.style.display = 'none'; });
  }
  function showAll(elList) {
    elList.forEach(el => { if (el) el.style.display = 'block'; });
  }

  const ALL_FACE_ELS = Object.values(EL);

  function setFaceState(state) {
    // Reset all
    hideAll(ALL_FACE_ELS);
    faceWrap.className = 'm02-face-wrap';

    switch (state) {
      case 'none':
        faceWrap.classList.add('m02-face-hidden');
        break;

      case 'waking':
        // tiny dots, flat line — face barely visible, fading in
        showAll([EL.eyeLSm, EL.eyeRSm, EL.mouthFlat]);
        break;

      case 'speaking':
        // medium dots + wide grin
        showAll([EL.eyeL, EL.eyeR, EL.mouthHappy]);
        break;

      case 'idle':
        // small dots + gentle smile (relaxed companion)
        showAll([EL.eyeLProc, EL.eyeRProc, EL.mouthIdle]);
        break;

      case 'listening':
        // medium dots + moderate smile (attentive, user is speaking)
        showAll([EL.eyeL, EL.eyeR, EL.mouthSpeak]);
        break;

      case 'processing':
        // small dots + open O mouth (thinking)
        showAll([EL.eyeLProc, EL.eyeRProc, EL.mouthO]);
        break;

      case 'happy':
        // upward ^_^ arcs + wide grin (music / delight — distinct from speaking)
        showAll([EL.eyeLHappy, EL.eyeRHappy, EL.mouthHappy]);
        break;

      case 'celebratory':
        showAll([EL.eyeLHappy, EL.eyeRHappy, EL.mouthHappy, EL.rays]);
        break;

      case 'sleeping':
        showAll([EL.eyeLSleep, EL.eyeRSleep, EL.mouthSleep]);
        faceWrap.classList.add('m02-face-fadeout');
        break;
    }
  }

  // ── 4. Sequence definition ────────────────────────────────────────────────
  const STEP_NAMES = [
    'Blank', 'Wake', 'Intro', 'Dest', 'Idle',
    'Ask', 'Search', 'Coffee', 'Mood', 'Chill',
    'Arrive', 'Bye', 'Sleep',
  ];

  let onChangeCb = null;

  // [slideId, durationMs, faceState, resetMusicNotes]
  const SEQUENCE = [
    { id: 'm02S0',  dur: 2000,  face: 'none'        },
    { id: 'm02S1a', dur: 3000,  face: 'waking'      },
    { id: 'm02S1b', dur: 5000,  face: 'speaking'    },
    { id: 'm02S2',  dur: 6000,  face: 'speaking'    },
    { id: 'm02S3',  dur: 4000,  face: 'idle'        },
    { id: 'm02S4a', dur: 5000,  face: 'listening'   },
    { id: 'm02S4b', dur: 4000,  face: 'processing'  },
    { id: 'm02S4c', dur: 5000,  face: 'speaking'    },
    { id: 'm02S4d', dur: 3000,  face: 'processing'  },
    { id: 'm02S5',  dur: 7000,  face: 'happy',       resetNotes: true },
    { id: 'm02S7',  dur: 7000,  face: 'celebratory' },
    { id: 'm02S8a', dur: 5000,  face: 'speaking'    },
    { id: 'm02S8b', dur: 3000,  face: 'sleeping'    },
  ];

  let currentSlide = null;

  function showStep(index) {
    const step = SEQUENCE[index];
    const slideEl = root.querySelector('#' + step.id);

    // Hide previous slide
    if (currentSlide && currentSlide !== slideEl) {
      currentSlide.classList.remove('m02-active');
    }

    // Set face state
    setFaceState(step.face);

    // Reset music notes animation by cloning the container
    if (step.resetNotes) {
      const notesEl = slideEl.querySelector('.m02-music-notes');
      if (notesEl) {
        const clone = notesEl.cloneNode(true);
        notesEl.parentNode.replaceChild(clone, notesEl);
      }
    }

    // Show slide
    slideEl.classList.add('m02-active');
    currentSlide = slideEl;

    // Notify external listener
    if (onChangeCb) onChangeCb(index);

    // Schedule next step
    const nextIndex = (index + 1) % SEQUENCE.length;
    const timer = setTimeout(() => showStep(nextIndex), step.dur);
    container._m02Timers.push(timer);
  }

  // ── 5. Kick off ───────────────────────────────────────────────────────────
  showStep(0);

  return {
    goTo: function(index) {
      if (index < 0 || index >= SEQUENCE.length) return;
      container._m02Timers.forEach(clearTimeout);
      container._m02Timers = [];
      showStep(index);
    },
    onChange: function(cb) { onChangeCb = cb; },
    count: SEQUENCE.length,
    names: STEP_NAMES,
    durations: SEQUENCE.map(function(s) { return s.dur; }),
  };
}

if (typeof module !== 'undefined') module.exports = { mountM02 };
