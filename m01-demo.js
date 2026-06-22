/* m01-demo.js — Automotive HUD / Cluster circular demo
   Mounts a 13-slide auto-play sequence into a 460×460 circular container.
   All CSS is scoped with the .m01- prefix.                                   */

(function () {

  // ─── CSS ───────────────────────────────────────────────────────────────────
  const CSS = `
/* ---- reset / shared ---- */
.m01-root {
  position: absolute;
  inset: 0;
  background: #000;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

/* ---- slides ---- */
.m01-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.m01-slide.m01-active {
  opacity: 1;
}

/* =============================================
   SLIDE 1 — Boot
   ============================================= */
.m01-boot-greeting {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.m01-boot-time {
  font-size: 18px;
  color: #888;
  font-weight: 300;
}

/* =============================================
   CLUSTER — shared layout used by slides 2–8, 12
   ============================================= */
.m01-cluster {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Orange arc gauge along the left inner edge */
.m01-cluster-arc {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.m01-arc-bg {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 5;
  stroke-linecap: round;
}
.m01-arc-fill {
  fill: none;
  stroke: #f59e0b;
  stroke-width: 5;
  stroke-linecap: round;
  /* 68% of the ~456px total arc ≈ 310px */
  stroke-dasharray: 310 999;
}

/* Horizontal center row: battery | speed | gear */
.m01-cluster-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.m01-speed-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ADAS arc: hidden until 1.5s, then blinks (scene 3 only) */
.m01-arc-blink {
  opacity: 0;                              /* invisible during delay */
  animation: m01-blink 0.6s step-start infinite;
  animation-delay: 1.5s;                   /* arrow blinks first, arc follows */
}
.m01-slide:not(.m01-active) .m01-arc-blink {
  animation-play-state: paused;
}

/* Turn-signal arrow (SVG) + invisible right spacer for balance */
.m01-turn-arrow { display: block; flex-shrink: 0; }
.m01-turn-slot  { width: 40px; height: 26px; flex-shrink: 0; }
.m01-turn-blink {
  animation: m01-blink 0.6s step-start infinite;
}
.m01-slide:not(.m01-active) .m01-turn-blink {
  animation-play-state: paused;
}

/* "On tap" micro-interaction — fires at 4.2s (scenes 4 & 8, both 5s slides) */
@keyframes m01-btn-tap {
  0%   { transform: scale(1);    filter: brightness(1);   }
  40%  { transform: scale(0.91); filter: brightness(1.5); }
  100% { transform: scale(1);    filter: brightness(1);   }
}
.m01-tap-anim {
  animation: m01-btn-tap 0.45s ease-in-out 4.2s 1 both;
}
.m01-slide:not(.m01-active) .m01-tap-anim {
  animation-play-state: paused;
}

/* Mode-switch transitions: cluster ↔ HUD strip */
@keyframes m01-mode-to-hud {
  from { transform: translateY(-150px) scale(1.5); opacity: 0; }
  to   { transform: translateY(0)       scale(1);   opacity: 1; }
}
@keyframes m01-mode-to-cluster {
  from { transform: translateY(150px) scale(0.65); opacity: 0; }
  to   { transform: translateY(0)     scale(1);    opacity: 1; }
}
.m01-strip-enter {
  animation: m01-mode-to-hud 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}
.m01-cluster-enter {
  animation: m01-mode-to-cluster 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}
.m01-slide:not(.m01-active) .m01-strip-enter,
.m01-slide:not(.m01-active) .m01-cluster-enter {
  animation-play-state: paused;
}

/* Word-by-word VTT fade-in (scene 6) */
@keyframes m01-word-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.m01-word {
  opacity: 0;
  display: inline;
  animation: m01-word-in 0.25s ease forwards;
}
.m01-slide:not(.m01-active) .m01-word {
  animation-play-state: paused;
}

/* Song-switch transition (scene 11): current slides out, next slides in */
@keyframes m01-song-out {
  from { opacity: 1; transform: translateX(0);    }
  to   { opacity: 0; transform: translateX(-28px); }
}
@keyframes m01-song-in {
  from { opacity: 0; transform: translateX(28px); }
  to   { opacity: 1; transform: translateX(0);    }
}
.m01-song-container {
  position: relative;
  height: 46px;
  width: 220px;
  overflow: hidden;
}
.m01-song-info {
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.m01-song-current {
  animation: m01-song-out 0.45s ease-in 2.6s 1 both;
}
.m01-song-next {
  opacity: 0;
  animation: m01-song-in 0.45s ease-out 3.05s 1 forwards;
}
.m01-next-tap {
  animation: m01-btn-tap 0.35s ease-in-out 2.3s 1 both;
}
.m01-slide:not(.m01-active) .m01-song-current,
.m01-slide:not(.m01-active) .m01-song-next,
.m01-slide:not(.m01-active) .m01-next-tap {
  animation-play-state: paused;
}

.m01-batt {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #aaa;
}
.m01-batt-bar {
  width: 22px; height: 11px;
  border: 1.5px solid #666;
  border-radius: 2px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 1.5px;
}
.m01-batt-bar::after {
  content: '';
  position: absolute;
  right: -5px; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 5px;
  background: #666;
  border-radius: 0 1px 1px 0;
}
.m01-batt-fill {
  height: 100%;
  width: 68%;
  background: #4ade80;
  border-radius: 1px;
}
.m01-gear-box {
  width: 30px; height: 26px;
  border: 1.5px solid #fff;
  border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700; color: #fff;
  letter-spacing: 0;
}
.m01-cluster-speed {
  font-size: 80px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -3px;
  color: #fff;
  font-family: 'SF Mono', 'Fira Mono', 'Courier New', monospace;
}
.m01-cluster-unit {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
  letter-spacing: 2px;
  text-transform: lowercase;
}
.m01-cluster-odo {
  position: absolute;
  bottom: 110px;
  left: 0; right: 0;
  text-align: center;
  font-size: 12px;
  color: #666;
  letter-spacing: 1.5px;
}

/* turn-signal blink keyframe */
@keyframes m01-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* =============================================
   NOTIFICATION CARD — shared by slides 4–8
   ============================================= */
.m01-card {
  position: absolute;
  top: 68px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  background: #1c1c1e;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.m01-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}
.m01-card-sub {
  font-size: 12px;
  color: #8e8e93;
  line-height: 1.3;
}
.m01-card-msg {
  font-size: 13px;
  color: #fff;
  line-height: 1.4;
}
.m01-card-label {
  font-size: 11px;
  color: #8e8e93;
  margin-bottom: 2px;
}
/* Center-aligned card variant (scenes 5 & 6) */
.m01-card-center {
  align-items: center;
  text-align: center;
}
.m01-card-center .m01-card-label { text-align: center; }
.m01-card-center .m01-wave-bars  { justify-content: center; }
.m01-card-center .m01-voice-text { text-align: center; }
.m01-pill-row {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}
.m01-pill {
  flex: 1;
  background: #3a3a3c;
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 12px;
  padding: 6px 0;
  text-align: center;
  cursor: pointer;
}
.m01-pill-yes {
  background: #7c3aed;
}
.m01-btn-row {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.m01-btn {
  flex: 1;
  background: #3a3a3c;
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  padding: 7px 0;
  text-align: center;
  cursor: pointer;
  font-weight: 500;
}
.m01-btn-yes {
  background: #7c3aed;
}

/* =============================================
   SLIDE 6 — Voice waveform
   ============================================= */
.m01-wave-bars {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  margin-bottom: 8px;
}
.m01-bar {
  width: 5px;
  border-radius: 3px;
  background: #fff;
  animation: m01-wave 1.2s ease-in-out infinite;
}
.m01-bar:nth-child(1) { animation-delay: 0.0s; }
.m01-bar:nth-child(2) { animation-delay: 0.2s; }
.m01-bar:nth-child(3) { animation-delay: 0.4s; }
.m01-bar:nth-child(4) { animation-delay: 0.6s; }
.m01-bar:nth-child(5) { animation-delay: 0.8s; }
.m01-bar:nth-child(6) { animation-delay: 1.0s; }
@keyframes m01-wave {
  0%, 100% { height: 8px;  opacity: 0.5; }
  50%       { height: 28px; opacity: 1;   }
}
.m01-slide:not(.m01-active) .m01-bar {
  animation-play-state: paused;
}
.m01-voice-text {
  font-size: 14px;
  font-style: italic;
  color: #fff;
  text-align: center;
}

/* =============================================
   SLIDE 7 — Message sent
   ============================================= */
.m01-check {
  font-size: 32px;
  text-align: center;
  margin-bottom: 4px;
}
.m01-sent-text {
  font-size: 14px;
  color: #fff;
  text-align: center;
}

/* =============================================
   HUD — slides 9, 10, 11
   ============================================= */
.m01-hud {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
    #020408;
  background-size: 30px 30px;
}

/* Nav instruction (turn arrow + distance) */
.m01-hud-nav {
  position: absolute;
  top: 36px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}
.m01-hud-dist {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  font-family: 'SF Mono', 'Fira Mono', monospace;
}

/* Road map SVG container */
.m01-hud-road {
  position: absolute;
  top: 94px;
  left: 50%;
  transform: translateX(-50%);
}

/* Speed limit sign (right side of circle) */
.m01-hud-speed-limit {
  position: absolute;
  top: 126px;
  left: 376px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: 3.5px solid #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #111;
  font-family: 'SF Mono', 'Fira Mono', monospace;
}

/* ETA label */
.m01-hud-eta {
  position: absolute;
  top: 232px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: #ccc;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

/* Separator line between content area and bottom strip */
.m01-hud-separator {
  position: absolute;
  top: 298px;
  left: 0; right: 0;
  height: 1px;
  background: rgba(255,255,255,0.18);
}

/* Bottom strip: compact cluster info */
.m01-hud-strip {
  position: absolute;
  top: 299px;
  left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.m01-hud-strip-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
/* Vertical battery: percentage above, bar below */
.m01-hud-batt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.m01-hud-batt-pct {
  font-size: 12px;
  color: #aaa;
  line-height: 1;
}
/* Speed + unit in strip */
.m01-hud-spd {
  font-size: 38px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #fff;
  font-family: 'SF Mono', 'Fira Mono', monospace;
  line-height: 1;
  letter-spacing: -2px;
}
.m01-hud-unit {
  font-size: 11px;
  color: #888;
  letter-spacing: 2px;
  margin-top: 1px;
}
/* Strip arrow spacers — hidden but keep layout balanced */
.m01-hud-dir {
  font-size: 18px;
  line-height: 1;
  visibility: hidden;
}

/* =============================================
   SLIDE 10 — AR lanes (SVG perspective road)
   ============================================= */
.m01-ar-lanes {
  position: absolute;
  top: 78px;
  left: 0;
  width: 460px;
  height: 155px;
}
.m01-ar-road-svg {
  width: 100%;
  height: 100%;
}

/* =============================================
   SLIDE 11 — Now playing (HUD music layout)
   ============================================= */
.m01-hud-music {
  position: absolute;
  top: 38px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 220px;
  overflow: hidden;
}
.m01-music-art {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #666;
  flex-shrink: 0;
}
.m01-music-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  text-align: center;
}
.m01-music-artist {
  font-size: 13px;
  color: #8e8e93;
  text-align: center;
  margin-top: -4px;
}
.m01-music-controls {
  display: flex;
  gap: 22px;
  margin-top: 6px;
  font-size: 22px;
  color: #fff;
}

/* =============================================
   SLIDE 13 — Charging ring
   ============================================= */
.m01-charge-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 170px;
  height: 170px;
}
.m01-charge-svg {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
}
.m01-charge-track {
  fill: none;
  stroke: #222;
  stroke-width: 10;
}
.m01-charge-fill {
  fill: none;
  stroke: #f59e0b;
  stroke-width: 10;
  stroke-linecap: round;
  /* circumference of r=72 ≈ 452.4; 68% = 307.6 */
  stroke-dasharray: 307.6 452.4;
  transition: stroke-dasharray 1s ease;
}
.m01-charge-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  line-height: 1.15;
  z-index: 1;
}
.m01-charge-icon { font-size: 18px; }
.m01-charge-label { font-size: 12px; color: #888; }
.m01-charge-pct   { font-size: 36px; font-weight: 700; color: #fff; font-family: 'SF Mono','Fira Mono',monospace; line-height: 1; }
.m01-charge-eta   { font-size: 11px; color: #888; }
`;

  // ─── HTML helpers ──────────────────────────────────────────────────────────

  // Cluster base: optional ADAS arc + center row (battery | speed | gear) + odo
  // opts.showArc    — render the orange arc, blinking
  // opts.leftSignal — render the left turn-signal arrow, blinking
  function clusterBase(opts) {
    var showArc    = opts && opts.showArc;
    var leftSignal = opts && opts.leftSignal;

    var arcSvg = showArc ? `
        <svg class="m01-cluster-arc m01-arc-blink" viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg">
          <path class="m01-arc-bg"   d="M 121,419 A 218,218 0 0,1 121,41"/>
          <path class="m01-arc-fill" d="M 121,419 A 218,218 0 0,1 121,41"/>
        </svg>` : '';

    // Left arrow SVG — solid filled left-pointing arrow, matches automotive turn-signal shape
    var leftSlot = leftSignal ? `
        <svg class="m01-turn-arrow m01-turn-blink" width="40" height="26" viewBox="0 0 40 26" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,13 L16,0 L16,7 L40,7 L40,19 L16,19 L16,26 Z" fill="#4ade80"/>
        </svg>` : '';

    // Invisible right spacer keeps the row centered when the left arrow is shown
    var rightSlot = leftSignal ? `<span class="m01-turn-slot"></span>` : '';

    var clusterClass = 'm01-cluster' + ((opts && opts.enter) ? ' m01-cluster-enter' : '');
    return `
      <div class="${clusterClass}">
        ${arcSvg}
        <div class="m01-cluster-row">
          ${leftSlot}
          <div class="m01-batt">
            <div class="m01-batt-bar"><div class="m01-batt-fill"></div></div>
            <span>68%</span>
          </div>
          <div class="m01-speed-block">
            <div class="m01-cluster-speed">42</div>
            <div class="m01-cluster-unit">km/h</div>
          </div>
          <div class="m01-gear-box">D</div>
          ${rightSlot}
        </div>
        <div class="m01-cluster-odo">ODO &nbsp; 3,005 km</div>
      </div>
    `;
  }

  // HUD base: grid background + separator line + bottom strip with cluster info
  function hudBase(opts) {
    var stripClass = 'm01-hud-strip' + ((opts && opts.enter) ? ' m01-strip-enter' : '');
    return `
      <div class="m01-hud"></div>
      <div class="m01-hud-separator"></div>
      <div class="${stripClass}">
        <div class="m01-hud-strip-row">
          <span class="m01-hud-dir">&#9668;</span>
          <div class="m01-hud-batt">
            <span class="m01-hud-batt-pct">68%</span>
            <div class="m01-batt-bar"><div class="m01-batt-fill"></div></div>
          </div>
          <div class="m01-speed-block">
            <div class="m01-hud-spd">42</div>
            <div class="m01-hud-unit">km/h</div>
          </div>
          <div class="m01-gear-box">D</div>
          <span class="m01-hud-dir">&#9658;</span>
        </div>
      </div>
    `;
  }

  // Right-turn nav instruction (used by map + AR lane slides)
  function hudNav() {
    return `
      <div class="m01-hud-nav">
        <svg width="26" height="36" viewBox="0 0 26 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M8,36 L8,14 Q8,4 18,4 L22,4 M16,0 L22,4 L16,8"
                fill="none" stroke="#fff" stroke-width="4.5"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="m01-hud-dist">300m</div>
      </div>
    `;
  }

  // Cross-intersection road map SVG
  function roadMap() {
    return `
      <div class="m01-hud-road">
        <svg width="300" height="120" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
          <rect x="130" y="0"   width="40"  height="120" fill="#282828"/>
          <rect x="0"   y="45"  width="300" height="30"  fill="#282828"/>
          <rect x="131" y="1"   width="2"   height="120" fill="#323232"/>
          <rect x="167" y="1"   width="2"   height="44"  fill="#323232"/>
          <rect x="167" y="76"  width="2"   height="44"  fill="#323232"/>
          <rect x="1"   y="46"  width="128" height="2"   fill="#323232"/>
          <rect x="171" y="46"  width="128" height="2"   fill="#323232"/>
          <rect x="149" y="7"   width="2"   height="13"  fill="#3e3e3e" rx="1"/>
          <rect x="149" y="27"  width="2"   height="13"  fill="#3e3e3e" rx="1"/>
          <rect x="14"  y="59"  width="13"  height="2"   fill="#3e3e3e" rx="1"/>
          <rect x="42"  y="59"  width="13"  height="2"   fill="#3e3e3e" rx="1"/>
          <rect x="70"  y="59"  width="13"  height="2"   fill="#3e3e3e" rx="1"/>
          <rect x="98"  y="59"  width="13"  height="2"   fill="#3e3e3e" rx="1"/>
          <rect x="175" y="59"  width="13"  height="2"   fill="#3e3e3e" rx="1"/>
          <rect x="203" y="59"  width="13"  height="2"   fill="#3e3e3e" rx="1"/>
          <rect x="231" y="59"  width="13"  height="2"   fill="#3e3e3e" rx="1"/>
          <rect x="259" y="59"  width="13"  height="2"   fill="#3e3e3e" rx="1"/>
          <path d="M150,70 L162,102 L150,95 L138,102 Z" fill="#d0d0d0"/>
        </svg>
      </div>
    `;
  }

  // ETA label + speed limit sign (shared by map + AR lane slides)
  function hudInfo() {
    return `
      <div class="m01-hud-eta">Lee's Bakery &middot; ETA 17:25</div>
      <div class="m01-hud-speed-limit">50</div>
    `;
  }

  // ─── Slides definition ─────────────────────────────────────────────────────
  const SLIDES_HTML = [
    /* 0 — Boot (3s) */
    `<div class="m01-boot-greeting">Good Afternoon!</div>
     <div class="m01-boot-time">14:35</div>`,

    /* 1 — Cluster idle (4s) */
    clusterBase(),

    /* 2 — Turn signal (4s): ADAS arc blinks + left arrow blinks */
    clusterBase({ showArc: true, leftSignal: true }),

    /* 3 — Notification (5s) */
    clusterBase() + `
      <div class="m01-card">
        <div class="m01-card-name">Katie Collins</div>
        <div class="m01-card-sub">1 new message</div>
        <div class="m01-pill-row">
          <div class="m01-pill">&#128263; Mute</div>
          <div class="m01-pill m01-pill-yes m01-tap-anim">&#9654; Play</div>
        </div>
      </div>`,

    /* 4 — System reading message aloud (5s) */
    clusterBase() + `
      <div class="m01-card m01-card-center">
        <div class="m01-card-label">Katie Collins</div>
        <div class="m01-wave-bars">
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
        </div>
        <div class="m01-voice-text">Can you pick up the cake at Lee's Bakery?</div>
      </div>`,

    /* 5 — Voice response / VTT (4s): words appear one-by-one */
    clusterBase() + `
      <div class="m01-card m01-card-center">
        <div class="m01-wave-bars">
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
          <div class="m01-bar"></div>
        </div>
        <div class="m01-voice-text">
          <span class="m01-word" style="animation-delay:0.4s">No</span>
          <span class="m01-word" style="animation-delay:1.1s"> problem</span>
        </div>
      </div>`,

    /* 6 — Message sent (3s) */
    clusterBase() + `
      <div class="m01-card">
        <div class="m01-check">&#10003;</div>
        <div class="m01-sent-text">Message Sent</div>
      </div>`,

    /* 7 — Navigate prompt (5s) */
    clusterBase() + `
      <div class="m01-card">
        <div class="m01-card-msg">Navigate to Lee's Bakery?</div>
        <div class="m01-btn-row">
          <div class="m01-btn">No</div>
          <div class="m01-btn m01-btn-yes m01-tap-anim">Yes</div>
        </div>
      </div>`,

    /* 8 — HUD map (6s) — cluster→HUD mode switch: strip animates from cluster position */
    hudBase({ enter: true }) + hudNav() + roadMap() + hudInfo(),

    /* 9 — HUD AR lanes + road distance detect (5s) */
    hudBase() + hudNav() + `
      <div class="m01-ar-lanes">
        <svg class="m01-ar-road-svg" viewBox="0 0 460 155" xmlns="http://www.w3.org/2000/svg">
          <!-- Road surface -->
          <polygon points="230,5 52,155 408,155" fill="#0e0e0e" opacity="0.55"/>
          <!-- Outer road edges -->
          <line x1="230" y1="5" x2="52"  y2="155" stroke="rgba(255,255,255,0.32)" stroke-width="1.5"/>
          <line x1="230" y1="5" x2="408" y2="155" stroke="rgba(255,255,255,0.32)" stroke-width="1.5"/>
          <!-- Inner lane dividers (dashed) -->
          <line x1="230" y1="5" x2="171" y2="155" stroke="rgba(255,255,255,0.13)" stroke-width="1" stroke-dasharray="6 9"/>
          <line x1="230" y1="5" x2="289" y2="155" stroke="rgba(255,255,255,0.13)" stroke-width="1" stroke-dasharray="6 9"/>
          <!-- AR direction arrows: far → mid → near, fading with distance -->
          <path d="M230,32 L255,45 L237,45 L237,52 L223,52 L223,45 L205,45 Z"
                fill="rgba(255,255,255,0.42)"/>
          <path d="M230,50 L266,68 L241,68 L241,78 L219,78 L219,68 L194,68 Z"
                fill="rgba(255,255,255,0.62)"/>
          <path d="M230,68 L281,97 L245,97 L245,113 L215,113 L215,97 L179,97 Z"
                fill="rgba(255,255,255,0.82)"/>
          <!-- Distance detect stripes (4 bands, opacity fades toward camera) -->
          <line x1="104" y1="108" x2="356" y2="108" stroke="rgba(255,255,255,0.22)" stroke-width="9"  stroke-linecap="round"/>
          <line x1="87"  y1="121" x2="373" y2="121" stroke="rgba(255,255,255,0.15)" stroke-width="7"  stroke-linecap="round"/>
          <line x1="72"  y1="133" x2="388" y2="133" stroke="rgba(255,255,255,0.10)" stroke-width="5"  stroke-linecap="round"/>
          <line x1="58"  y1="144" x2="402" y2="144" stroke="rgba(255,255,255,0.06)" stroke-width="4"/>
        </svg>
      </div>` + hudInfo(),

    /* 10 — Now playing (5s): at 2.3s ▶| taps, at 2.6s current slides out, at 3.05s next slides in */
    hudBase() + `
      <div class="m01-hud-music">
        <div class="m01-music-art"></div>
        <div class="m01-song-container">
          <div class="m01-song-info m01-song-current">
            <div class="m01-music-title">Midnight Drive</div>
            <div class="m01-music-artist">Neon Circuit</div>
          </div>
          <div class="m01-song-info m01-song-next">
            <div class="m01-music-title">Neon City Drive</div>
            <div class="m01-music-artist">Kiro</div>
          </div>
        </div>
        <div class="m01-music-controls">
          <span>&#9198;</span><span>&#9654;</span><span class="m01-next-tap">&#9197;</span>
        </div>
      </div>`,

    /* 11 — Cluster return (3s) — HUD→cluster mode switch: cluster expands from strip position */
    clusterBase({ enter: true }),

    /* 12 — Charging (7s) */
    `<div class="m01-charge-wrap">
       <svg class="m01-charge-svg" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">
         <circle class="m01-charge-track" cx="85" cy="85" r="72"/>
         <circle class="m01-charge-fill"  cx="85" cy="85" r="72"/>
       </svg>
       <div class="m01-charge-inner">
         <div class="m01-charge-icon">&#9889;</div>
         <div class="m01-charge-label">Charging</div>
         <div class="m01-charge-pct">68%</div>
         <div class="m01-charge-eta">25 min left</div>
       </div>
     </div>`,
  ];

  // Durations in milliseconds for each slide
  const DURATIONS = [3000, 4000, 4000, 5000, 5000, 4000, 3000, 5000, 6000, 5000, 5000, 3000, 7000];

  // Short scene labels shown in the step pagination
  const SLIDE_NAMES = [
    'Boot', 'Idle', 'Signal', 'Notif', 'Msg',
    'Voice', 'Sent', 'Nav?', 'Map', 'Lanes',
    'Music', 'Return', 'Charge'
  ];

  // ─── mount function ────────────────────────────────────────────────────────

  const _timers = new WeakMap();

  function mountM01(container) {
    if (_timers.has(container)) {
      const old = _timers.get(container);
      old.forEach(id => clearTimeout(id));
      _timers.set(container, []);
    }

    const STYLE_ID = 'm01-injected-style';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    const root = document.createElement('div');
    root.className = 'm01-root';

    const slides = SLIDES_HTML.map((html) => {
      const div = document.createElement('div');
      div.className = 'm01-slide';
      div.innerHTML = html;
      root.appendChild(div);
      return div;
    });

    container.innerHTML = '';
    container.appendChild(root);

    let current = 0;
    let onChangeCb = null;
    const timers = [];

    function clearTimers() {
      timers.forEach(id => clearTimeout(id));
      timers.splice(0, timers.length);
    }

    function activateSlide(index) {
      slides.forEach(s => s.classList.remove('m01-active'));
      slides[index].classList.add('m01-active');
      current = index;
      if (onChangeCb) onChangeCb(index);
    }

    function scheduleNext(index) {
      const duration = DURATIONS[index];
      const t = setTimeout(() => {
        const next = (index + 1) % slides.length;
        activateSlide(next);
        scheduleNext(next);
      }, duration);
      timers.push(t);
    }

    activateSlide(0);
    scheduleNext(0);

    _timers.set(container, timers);

    return {
      goTo: function(index) {
        if (index < 0 || index >= slides.length) return;
        clearTimers();
        activateSlide(index);
        scheduleNext(index);
      },
      onChange: function(cb) { onChangeCb = cb; },
      count: SLIDES_HTML.length,
      names: SLIDE_NAMES,
      durations: DURATIONS,
    };
  }

  // ─── Export ────────────────────────────────────────────────────────────────
  if (typeof window !== 'undefined') {
    window.mountM01 = mountM01;
  }

  if (typeof module !== 'undefined') module.exports = { mountM01 };

})();
