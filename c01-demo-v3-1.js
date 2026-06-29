/* c01-demo-v3.js — Museum AR Guide circular demo (transparent-display variant)
   Same flow as v2 (two exhibits), but scenes 4/5/6/9 are "see-through":
   a live camera passthrough sits behind the AR overlays to simulate a
   transparent display. Scene 5 → 6/9 plays a dolly-zoom "approach" transition.
   All CSS is scoped with the .c01- prefix.                              */

(function () {

  // ─── CSS ─────────────────────────────────────────────────────────────────────
  const CSS = `
/* ---- root ---- */
.c01-root {
  position: absolute;
  inset: 0;
  background: #000;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

/* ---- screens ---- */
.c01-screen {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  overflow: hidden;
}
.c01-screen.c01-active {
  opacity: 1;
  pointer-events: all;
}

/* =============================================
   SCREEN C0 — Welcome
   ============================================= */
.c01-c0 {
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.c01-c0-title {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}
.c01-c0-sub {
  font-size: 14px;
  color: #666;
  letter-spacing: 0.3px;
}

/* =============================================
   SCREEN C1 — Home
   ============================================= */
.c01-c1 {
  background: #000;
}
.c01-c1-route-label {
  position: absolute;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #555;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.c01-c1-carousel {
  position: absolute;
  top: 114px;
  left: 0;
  right: 0;
  height: 218px;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  cursor: grab;
  user-select: none;
}
.c01-c1-carousel.c01-c1-dragging { cursor: grabbing; }
.c01-c1-carousel::-webkit-scrollbar { display: none; }
.c01-c1-carousel::before,
.c01-c1-carousel::after {
  content: '';
  display: block;
  flex-shrink: 0;
  width: 118px;
}
.c01-c1-ccard {
  flex-shrink: 0;
  width: 200px;
  height: 214px;
  border-radius: 10px;
  border: 1px solid #2a2a2a;
  overflow: hidden;
  scroll-snap-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  opacity: 0.4;
  transition: border-color 0.25s, opacity 0.2s;
}
.c01-c1-ccard.c01-ccard-active { border-color: #fff; }
.c01-c1-ccard-img {
  flex: 1;
  background:
    linear-gradient(to bottom right, transparent 49.7%, #2a2a2a 49.7%, #2a2a2a 50.3%, transparent 50.3%),
    linear-gradient(to bottom left,  transparent 49.7%, #2a2a2a 49.7%, #2a2a2a 50.3%, transparent 50.3%),
    #1a1a1a;
}
.c01-c1-ccard-label {
  flex-shrink: 0;
  padding: 9px 10px;
  font-size: 14px;
  font-weight: 500;
  color: #bbb;
  text-align: center;
  background: #111;
  letter-spacing: 0.2px;
}
.c01-c1-buttons {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}
.c01-btn-base {
  width: 130px;
  height: 36px;
  border-radius: 8px;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: opacity 0.15s;
}
.c01-btn-base:hover { opacity: 0.85; }
.c01-btn-dark { background: #2a2a2a; }
.c01-btn-purple { background: #7c3aed; }

/* =============================================
   SCREEN C1_1 — My Collection
   ============================================= */
.c01-c1_1 {
  background: #000;
}
.c01-c1_1-title {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}
.c01-c1_1-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  color: #444;
}
.c01-c1_1-close {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 42px;
  height: 42px;
  background: #2a2a2a;
  border: 1.5px solid #666;
  border-radius: 50%;
  color: #ccc;
  font-size: 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
}
.c01-c1_1-close:hover { background: #3a3a3a; border-color: #888; }
.c01-c1_1-items {
  position: absolute;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: center;
}
.c01-c1_1-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100px;
}
.c01-c1_1-thumb {
  width: 90px;
  height: 80px;
  border-radius: 8px;
  border: 1.5px solid #555;
  background:
    linear-gradient(to bottom right, transparent 49.7%, #666 49.7%, #666 50.3%, transparent 50.3%),
    linear-gradient(to bottom left,  transparent 49.7%, #666 49.7%, #666 50.3%, transparent 50.3%),
    #333;
}
.c01-c1_1-iname {
  font-size: 13px;
  color: #aaa;
  text-align: center;
  line-height: 1.3;
}

/* =============================================
   SCREEN C2_1 — AR Approaching Gallery
   ============================================= */
.c01-c2_1 {
  background: transparent;
}
.c01-c2_1-badge {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 18px;
  color: #fff;
  white-space: nowrap;
  letter-spacing: 0.3px;
}
.c01-c2_1-corridor {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.c01-c2_1-corridor svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.c01-c2_1-arrow {
  position: absolute;
  top: 53%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 12px rgba(255,255,255,0.7)) drop-shadow(0 0 28px rgba(255,255,255,0.25));
  animation: c01-arrow-float 2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes c01-arrow-float {
  0%, 100% { transform: translate(-50%, -50%); }
  50%       { transform: translate(-50%, -64%); }
}
.c01-screen:not(.c01-active) .c01-c2_1-arrow { animation-play-state: paused; }
.c01-c2_1-home {
  position: absolute;
  bottom: 68px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  border: 1px solid #444;
}
.c01-c2_1-tap-hint {
  position: absolute;
  bottom: 88px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #444;
  white-space: nowrap;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* =============================================
   SCREEN C2_2 — AR NFC Trigger
   ============================================= */
.c01-c2_2 {
  background: transparent;
}
.c01-c2_2-top {
  position: absolute;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.c01-c2_2-gallery {
  font-size: 11px;
  color: #777;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}
.c01-c2_2-instruction {
  font-size: 18px;
  color: #fff;
  white-space: nowrap;
}
.c01-c2_2-exhibit {
  position: absolute;
  background: #1f1a2e;
  border: 1px solid #5b21b6;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 18px;
  color: #fff;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 0 10px #7c3aed44;
}
.c01-c2_2-home {
  position: absolute;
  bottom: 68px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  border: 1px solid #444;
}
@keyframes c01-pulse-glow {
  0%, 100% { box-shadow: 0 0 20px #7c3aed88; }
  50%       { box-shadow: 0 0 36px #7c3aedcc; }
}
.c01-nfc-rings {
  position: absolute;
  top: 50%;
  left: 40%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  pointer-events: none;
}
.c01-nfc-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid #7c3aed;
  transform: translate(-50%, -50%);
  animation: c01-sonar 2.4s ease-out infinite;
  opacity: 0;
}
.c01-nfc-ring:nth-child(1) { width: 60px;  height: 60px;  animation-delay: 0s; }
.c01-nfc-ring:nth-child(2) { width: 100px; height: 100px; animation-delay: 0.6s; }
.c01-nfc-ring:nth-child(3) { width: 140px; height: 140px; animation-delay: 1.2s; }
@keyframes c01-sonar {
  0%   { opacity: 0.9; transform: translate(-50%, -50%) scale(0.5); }
  100% { opacity: 0;   transform: translate(-50%, -50%) scale(1); }
}
.c01-screen:not(.c01-active) .c01-nfc-ring {
  animation-play-state: paused;
}
.c01-screen:not(.c01-active) .c01-c2_2-exhibit {
  animation-play-state: paused;
}

/* =============================================
   SCREEN C3 — AR Hotspot (C3a / C3b states)
   ============================================= */
.c01-c3ar {
  background: transparent;
}
.c01-v3-ar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  pointer-events: none;
}
.c01-c3ar-dot {
  position: absolute;
  width: 44px;
  height: 44px;
  cursor: pointer;
  z-index: 3;
  transform: translate(-50%, -50%);
}
.c01-c3ar-dot-inner {
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 6px rgba(255,255,255,0.18);
  animation: c01-dot-pulse 1.8s ease-in-out infinite;
}
.c01-c3ar-dot:nth-child(2) .c01-c3ar-dot-inner { animation-delay: 0.6s; }
@keyframes c01-dot-pulse {
  0%, 100% { box-shadow: 0 0 0 6px rgba(255,255,255,0.18); }
  50%       { box-shadow: 0 0 0 14px rgba(255,255,255,0.05); }
}
.c01-screen:not(.c01-active) .c01-c3ar-dot-inner { animation-play-state: paused; }
.c01-c3ar-card {
  position: absolute;
  bottom: 44px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  background: rgba(8,8,8,0.97);
  border-radius: 18px 18px 0 0;
  padding: 14px 20px 20px;
  z-index: 2;
}
.c01-c3ar-card-id {
  font-size: 10px;
  color: #555;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.c01-c3ar-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.c01-c3ar-title {
  font-size: 19px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.c01-c3ar-desc {
  font-size: 18px;
  color: #777;
  margin-top: 5px;
  line-height: 1.55;
  max-width: 240px;
}
.c01-c3ar-star {
  flex-shrink: 0;
  font-size: 24px;
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  font-family: inherit;
  margin-top: 1px;
  transition: color 0.15s;
}
.c01-c3ar-star.c01-star-saved {
  color: #f5c518;
}
.c01-c3ar-more {
  margin-top: 10px;
  font-size: 11px;
  color: #444;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s;
}
.c01-c3ar-more:hover { color: #777; }
.c01-back-btn {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(30,30,30,0.85);
  border: 1px solid #444;
  color: #aaa;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  z-index: 10;
  transition: background 0.15s;
}
.c01-back-btn:hover { background: #2a2a2a; }

/* =============================================
   SCREEN C3a — Exhibit Detail
   ============================================= */
.c01-c3 {
  background: #000;
}
.c01-c3-photo {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 48%;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 13px;
  letter-spacing: 1px;
}
.c01-c3-photo-icon {
  font-size: 40px;
  opacity: 0.3;
}
.c01-c3-card {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 45%;
  background: rgba(10,10,10,0.97);
  border-radius: 16px 16px 0 0;
  padding: 12px 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.c01-c3-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.c01-c3-id {
  font-size: 10px;
  color: #666;
  letter-spacing: 0.5px;
}
.c01-c3-star {
  font-size: 18px;
  cursor: pointer;
  color: #666;
  transition: color 0.15s;
  line-height: 1;
  user-select: none;
}
.c01-c3-star:hover { color: #a78bfa; }
.c01-c3-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.c01-c3-subtitle {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.c01-c3-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #222;
  margin-top: 2px;
}
.c01-c3-tab {
  padding: 6px 14px 6px 0;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
  user-select: none;
}
.c01-c3-tab.c01-tab-active {
  color: #fff;
  border-bottom-color: #7c3aed;
}
.c01-c3-tab-content {
  font-size: 18px;
  color: #aaa;
  line-height: 1.6;
  flex: 1;
  overflow: hidden;
}
.c01-c3-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 4px;
}
.c01-c3-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2a2a2a;
  border: none;
  color: #aaa;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: background 0.15s;
}
.c01-c3-close:hover { background: #3a3a3a; }
.c01-c3-save-btn {
  background: #7c3aed;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 7px 14px;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.c01-c3-save-btn:hover { opacity: 0.85; }

/* =============================================
   SCREEN C3d — Saved Confirmation
   ============================================= */
.c01-c3d {
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.c01-c3d-thumb {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
  animation: c01-pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes c01-pop-in {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
.c01-c3d-name {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}
.c01-c3d-sub {
  font-size: 18px;
  color: #888;
  text-align: center;
}

/* =============================================
   SCREEN C4 — Recommendation
   ============================================= */
.c01-c4 {
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 30px;
}
.c01-c4-thumb {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 46px;
  margin-bottom: 4px;
}
.c01-c4-also {
  font-size: 18px;
  color: #555;
  letter-spacing: 0.3px;
}
.c01-c4-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}
.c01-c4-location {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 18px;
  color: #888;
  margin-bottom: 4px;
}
.c01-c4-actions {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.c01-c4-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1e1e1e;
  border: 1px solid #333;
  color: #aaa;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: background 0.15s;
}
.c01-c4-close:hover { background: #2a2a2a; }

/* =============================================
   SCREEN C5 — Visit Complete (intro)
   ============================================= */
.c01-c5i {
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.c01-c5i-text {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
}

/* =============================================
   SCREEN C5_1 — Recap
   ============================================= */
.c01-c5 {
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 64px;
}
.c01-c5-you-are {
  font-size: 18px;
  color: #888;
  letter-spacing: 0.3px;
}
.c01-c5-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
  margin-top: 4px;
}
.c01-c5-badge {
  margin-top: 6px;
  background: #1a0a33;
  border: 1px solid #7c3aed;
  border-radius: 12px;
  padding: 3px 12px;
  font-size: 18px;
  color: #a78bfa;
  letter-spacing: 0.5px;
}
.c01-c5-section {
  margin-top: 14px;
  font-size: 18px;
  color: #555;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.c01-c5-carousel {
  width: 100%;
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  cursor: grab;
  user-select: none;
}
.c01-c5-carousel.c01-c5-dragging { cursor: grabbing; }
.c01-c5-carousel::-webkit-scrollbar { display: none; }
.c01-c5-carousel::before,
.c01-c5-carousel::after {
  content: '';
  display: block;
  flex-shrink: 0;
  width: 145px;
}
.c01-c5-citem {
  flex-shrink: 0;
  width: 150px;
  scroll-snap-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.4;
  transition: opacity 0.2s;
}
.c01-c5-cthumb {
  width: 130px;
  height: 120px;
  border-radius: 8px;
  border: 1.5px solid #555;
  background:
    linear-gradient(to bottom right, transparent 49.7%, #666 49.7%, #666 50.3%, transparent 50.3%),
    linear-gradient(to bottom left,  transparent 49.7%, #666 49.7%, #666 50.3%, transparent 50.3%),
    #333;
}
.c01-c5-engaged {
  font-size: 12px;
  background: #888;
  color: #fff;
  border-radius: 3px;
  padding: 2px 6px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.c01-c5-cname {
  font-size: 14px;
  color: #777;
  text-align: center;
  line-height: 1.3;
  padding: 0 4px;
}
.c01-c5-end-btn {
  margin-top: 28px;
  width: 160px;
  height: 40px;
  background: #fff;
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}
.c01-c5-end-btn:hover { opacity: 0.85; }

/* =============================================
   SCREEN C6 — Thank You
   ============================================= */
.c01-c6 {
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  padding: 0 40px;
}
.c01-c6-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}
.c01-c6-sub {
  font-size: 18px;
  color: #666;
  line-height: 1.5;
  margin-top: 4px;
}

/* =============================================
   SCREEN C7 — Replay
   ============================================= */
.c01-c7 {
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
}
.c01-c7-icon {
  width: 80px;
  height: 80px;
}
.c01-c7-label {
  font-size: 18px;
  color: #666;
  letter-spacing: 1px;
}
.c01-scene-close,
.c01-c1_1-close,
.c01-c2_1-home,
.c01-c2_2-home,
.c01-c3-close,
.c01-c4-close,
.c01-nav-btn {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2a2a2a;
  border: 1.5px solid #555;
  color: #ccc;
  font-size: 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: background 0.15s;
  z-index: 5;
  flex-shrink: 0;
}
.c01-scene-close:hover,
.c01-c1_1-close:hover,
.c01-c2_1-home:hover,
.c01-c2_2-home:hover,
.c01-c3-close:hover,
.c01-c4-close:hover,
.c01-nav-btn:hover { background: #3a3a3a; }

/* =============================================
   V3: CAMERA PASSTHROUGH + AR DISPLAY EFFECTS
   ============================================= */
.c01-v3-camera {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  z-index: 0;
  display: block;
  pointer-events: none;
}
/* HUD edge ring: thin inner border + corner ticks to suggest display boundary */
.c01-v3-hud-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.13);
  pointer-events: none;
  z-index: 4;
}
.c01-v3-hud-ring::before,
.c01-v3-hud-ring::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: rgba(255,255,255,0.28);
  border-style: solid;
}
.c01-v3-hud-ring::before { top: 40px; left: 60px; border-width: 1.5px 0 0 1.5px; }
.c01-v3-hud-ring::after  { top: 40px; right: 60px; border-width: 1.5px 1.5px 0 0; }
.c01-v3-corner-b {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: rgba(255,255,255,0.28);
  border-style: solid;
  pointer-events: none;
  z-index: 4;
}
.c01-v3-corner-bl { bottom: 40px; left: 60px; border-width: 0 0 1.5px 1.5px; }
.c01-v3-corner-br { bottom: 40px; right: 60px; border-width: 0 1.5px 1.5px 0; }
/* Approach overlay: fades in during dolly transition */
.c01-v3-approach {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 6;
  opacity: 0;
  transition: opacity 0.18s;
}
.c01-v3-approach.c01-v3-visible { opacity: 1; }
.c01-v3-approach-pill {
  font-size: 18px;
  color: rgba(255,255,255,0.92);
  background: rgba(0,0,0,0.52);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 22px;
  padding: 9px 22px;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
@keyframes c01-v3-dolly {
  from { transform: scale(1); }
  to   { transform: scale(1.14); }
}
.c01-v3-camera.c01-v3-dolly { animation: c01-v3-dolly 0.75s cubic-bezier(0.25,0,0.25,1) forwards; }
`;

  // ─── Screen HTML builders ──────────────────────────────────────────────────

  function buildScreens() {
    return `
      <!-- C0: Welcome -->
      <div id="c01-screen-C0" class="c01-screen c01-c0 c01-active">
        <div class="c01-c0-title">Welcome!</div>
      </div>

      <!-- C1: Home -->
      <div id="c01-screen-C1" class="c01-screen c01-c1">
        <div class="c01-c1-route-label">Recommended Routes</div>
        <div class="c01-c1-carousel">
          <!-- group 0 -->
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Jade Stone</div></div>
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Treasure Hunt</div></div>
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Masterpieces</div></div>
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Ancient Arts</div></div>
          <!-- group 1 (main) -->
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Jade Stone</div></div>
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Treasure Hunt</div></div>
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Masterpieces</div></div>
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Ancient Arts</div></div>
          <!-- group 2 -->
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Jade Stone</div></div>
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Treasure Hunt</div></div>
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Masterpieces</div></div>
          <div class="c01-c1-ccard" data-action="to-C2_1"><div class="c01-c1-ccard-img"></div><div class="c01-c1-ccard-label">Ancient Arts</div></div>
        </div>
        <div class="c01-c1-buttons">
          <button class="c01-btn-base c01-btn-dark" data-action="to-C1_1">My Collection</button>
          <button class="c01-btn-base c01-btn-dark" data-action="to-C5">End Visit</button>
        </div>
        <button class="c01-scene-close" data-action="home-back">✕</button>
      </div>

      <!-- C1_1: My Collection -->
      <div id="c01-screen-C1_1" class="c01-screen c01-c1_1">
        <div class="c01-c1_1-title">My Collection</div>
        <div id="c01-c1_1-content"><div class="c01-c1_1-empty">Empty</div></div>
        <button class="c01-c1_1-close" data-action="to-C1">&#10005;</button>
      </div>

      <!-- C2_1: AR Approaching Gallery (see-through) -->
      <div id="c01-screen-C2_1" class="c01-screen c01-c2_1">
        <div class="c01-v3-ar-overlay"></div>
        <div class="c01-v3-hud-ring">
          <div class="c01-v3-corner-b c01-v3-corner-bl"></div>
          <div class="c01-v3-corner-b c01-v3-corner-br"></div>
        </div>
        <div class="c01-c2_1-badge">🏛 Jade Gallery &nbsp;→&nbsp; 3 min ahead</div>
        <div class="c01-c2_1-arrow">
          <svg width="52" height="68" viewBox="0 0 52 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26 2 L50 42 L36 42 L36 66 L16 66 L16 42 L2 42 Z" fill="white" fill-opacity="0.88"/>
          </svg>
        </div>
        <div class="c01-c2_1-home" data-action="to-C1">⌂</div>
      </div>

      <!-- C2_2: AR NFC Trigger (see-through) -->
      <div id="c01-screen-C2_2" class="c01-screen c01-c2_2">
        <div class="c01-v3-ar-overlay"></div>
        <div class="c01-v3-hud-ring">
          <div class="c01-v3-corner-b c01-v3-corner-bl"></div>
          <div class="c01-v3-corner-b c01-v3-corner-br"></div>
        </div>
        <div class="c01-c2_2-top">
          <div class="c01-c2_2-gallery">Jade Gallery</div>
          <div class="c01-c2_2-instruction">Move closer to learn more</div>
        </div>
        <div class="c01-c2_2-exhibit" data-action="to-C3a" style="top:148px; right:54px;">Jadeite Cabbage</div>
        <div class="c01-c2_2-exhibit" data-action="to-C3b" style="top:292px; left:66px;">Meat-shaped Stone</div>
        <div class="c01-c2_2-home" data-action="to-C1">⌂</div>
      </div>

      <!-- C3a: AR Hotspot (Jadeite Cabbage) — scene 6a (see-through) -->
      <div id="c01-screen-C3a" class="c01-screen c01-c3ar">
        <div class="c01-v3-ar-overlay"></div>
        <div class="c01-v3-hud-ring">
          <div class="c01-v3-corner-b c01-v3-corner-bl"></div>
          <div class="c01-v3-corner-b c01-v3-corner-br"></div>
        </div>
        <div class="c01-c3ar-dot" style="top:210px; left:130px;" data-hotspot="1">
          <div class="c01-c3ar-dot-inner"></div>
        </div>
        <div class="c01-c3ar-dot" style="top:148px; left:255px;" data-hotspot="2">
          <div class="c01-c3ar-dot-inner"></div>
        </div>
        <div class="c01-c3ar-card">
          <div class="c01-c3ar-card-id">AD1644-1911</div>
          <div class="c01-c3ar-row">
            <div>
              <div class="c01-c3ar-title">Jadeite Cabbage</div>
              <div class="c01-c3ar-desc">One of the museum's most beloved jade treasures.</div>
            </div>
            <button class="c01-c3ar-star" data-action="to-C3d">☆</button>
          </div>
        </div>
        <button class="c01-scene-close" data-action="to-C2_2">✕</button>
      </div>

      <!-- C3a_1: Exhibit Detail — Jade Tone -->
      <div id="c01-screen-C3a_1" class="c01-screen c01-c3">
        <div class="c01-c3-photo">
          <div class="c01-c3-photo-icon">🪨</div>
        </div>
        <div class="c01-c3-card">
          <div class="c01-c3-subtitle">Jade Tone</div>
          <div class="c01-c3-tab-content">
            Natural jadeite gradation from white base to deep green — no dye used.
          </div>
          <div class="c01-c3-actions">
            <button class="c01-c3-close" data-action="to-C3a">✕</button>
          </div>
        </div>
      </div>

      <!-- C3a_2: Exhibit Detail — Katydid -->
      <div id="c01-screen-C3a_2" class="c01-screen c01-c3">
        <div class="c01-c3-photo">
          <div class="c01-c3-photo-icon">🪨</div>
        </div>
        <div class="c01-c3-card">
          <div class="c01-c3-subtitle">Katydid</div>
          <div class="c01-c3-tab-content">
            Locust and katydid are traditional metaphors for having numerous children.
          </div>
          <div class="c01-c3-actions">
            <button class="c01-c3-close" data-action="to-C3a">✕</button>
          </div>
        </div>
      </div>

      <!-- C3b: AR Hotspot (Meat-shaped Stone) (see-through) -->
      <div id="c01-screen-C3b" class="c01-screen c01-c3ar">
        <div class="c01-v3-ar-overlay"></div>
        <div class="c01-v3-hud-ring">
          <div class="c01-v3-corner-b c01-v3-corner-bl"></div>
          <div class="c01-v3-corner-b c01-v3-corner-br"></div>
        </div>
        <div class="c01-c3ar-dot" style="top:205px; left:145px;" data-hotspot="1">
          <div class="c01-c3ar-dot-inner"></div>
        </div>
        <div class="c01-c3ar-dot" style="top:155px; left:250px;" data-hotspot="2">
          <div class="c01-c3ar-dot-inner"></div>
        </div>
        <div class="c01-c3ar-card">
          <div class="c01-c3ar-card-id">AD1680-1895</div>
          <div class="c01-c3ar-row">
            <div>
              <div class="c01-c3ar-title">Meat-shaped Stone</div>
              <div class="c01-c3ar-desc">A jasper stone carved to mimic braised pork belly with astonishing realism.</div>
            </div>
            <button class="c01-c3ar-star" data-action="to-C3d">☆</button>
          </div>
        </div>
        <button class="c01-scene-close" data-action="to-C2_2">✕</button>
      </div>

      <!-- C3b_1: Exhibit Detail — Layered Texture -->
      <div id="c01-screen-C3b_1" class="c01-screen c01-c3">
        <div class="c01-c3-photo">
          <div class="c01-c3-photo-icon">🥩</div>
        </div>
        <div class="c01-c3-card">
          <div class="c01-c3-subtitle">Layered Texture</div>
          <div class="c01-c3-tab-content">
            Layers of jasper stone carved and stained to mimic braised pork belly in perfect detail.
          </div>
          <div class="c01-c3-actions">
            <button class="c01-c3-close" data-action="to-C3b">✕</button>
          </div>
        </div>
      </div>

      <!-- C3b_2: Exhibit Detail — Royal Origin -->
      <div id="c01-screen-C3b_2" class="c01-screen c01-c3">
        <div class="c01-c3-photo">
          <div class="c01-c3-photo-icon">🥩</div>
        </div>
        <div class="c01-c3-card">
          <div class="c01-c3-subtitle">Royal Origin</div>
          <div class="c01-c3-tab-content">
            Unearthed during the Qing Dynasty; believed to have been a royal amusement piece.
          </div>
          <div class="c01-c3-actions">
            <button class="c01-c3-close" data-action="to-C3b">✕</button>
          </div>
        </div>
      </div>

      <!-- C3d: Saved Confirmation -->
      <div id="c01-screen-C3d" class="c01-screen c01-c3d">
        <div class="c01-c3d-thumb">🪨</div>
        <div class="c01-c3d-name">Jadeite Cabbage</div>
        <div class="c01-c3d-sub">is saved to your collection!</div>
        <button class="c01-c3-close" data-action="to-C2_2">✕</button>
      </div>

      <!-- C4: Recommendation -->
      <div id="c01-screen-C4" class="c01-screen c01-c4">
        <div class="c01-c4-thumb">🥩</div>
        <div class="c01-c4-also">You might also like</div>
        <div class="c01-c4-name">Meat-Shaped Stone</div>
        <div class="c01-c4-location" data-action="to-C2_2" style="cursor:pointer;">📍 Jade Gallery</div>
        <div class="c01-c4-actions">
          <button class="c01-c4-close" data-action="to-C2_2">✕</button>
        </div>
      </div>

      <!-- C5: Visit Complete (intro, auto-advance) -->
      <div id="c01-screen-C5" class="c01-screen c01-c5i">
        <div class="c01-c5i-text">Visit Complete!</div>
      </div>

      <!-- C5_1: Recap -->
      <div id="c01-screen-C5_1" class="c01-screen c01-c5">
        <div class="c01-c5-you-are">You are a</div>
        <div class="c01-c5-title">Jade Enthusiast</div>
        <div class="c01-c5-section">My Collection</div>
        <div class="c01-c5-carousel">
          <!-- group 0 (left clone for loop) -->
          <div class="c01-c5-citem"><div class="c01-c5-cthumb"></div><div class="c01-c5-cname">Meat-Shaped Stone</div></div>
          <div class="c01-c5-citem c01-c5-featured"><div class="c01-c5-cthumb"></div><div class="c01-c5-engaged">Most Engaged</div><div class="c01-c5-cname">Jadeite Cabbage</div></div>
          <div class="c01-c5-citem"><div class="c01-c5-cthumb"></div><div class="c01-c5-cname">Ceramic Vase</div></div>
          <!-- group 1 (main) -->
          <div class="c01-c5-citem"><div class="c01-c5-cthumb"></div><div class="c01-c5-cname">Meat-Shaped Stone</div></div>
          <div class="c01-c5-citem c01-c5-featured"><div class="c01-c5-cthumb"></div><div class="c01-c5-engaged">Most Engaged</div><div class="c01-c5-cname">Jadeite Cabbage</div></div>
          <div class="c01-c5-citem"><div class="c01-c5-cthumb"></div><div class="c01-c5-cname">Ceramic Vase</div></div>
          <!-- group 2 (right clone for loop) -->
          <div class="c01-c5-citem"><div class="c01-c5-cthumb"></div><div class="c01-c5-cname">Meat-Shaped Stone</div></div>
          <div class="c01-c5-citem c01-c5-featured"><div class="c01-c5-cthumb"></div><div class="c01-c5-engaged">Most Engaged</div><div class="c01-c5-cname">Jadeite Cabbage</div></div>
          <div class="c01-c5-citem"><div class="c01-c5-cthumb"></div><div class="c01-c5-cname">Ceramic Vase</div></div>
        </div>
        <button class="c01-c5-end-btn" data-action="to-C6">End Visit</button>
      </div>

      <!-- C6: Thank You -->
      <div id="c01-screen-C6" class="c01-screen c01-c6">
        <div class="c01-c6-title">Thank you for<br>exploring with us!</div>
        <div class="c01-c6-sub">Please return the device to the information desk.</div>
      </div>

      <!-- C7: Replay -->
      <div id="c01-screen-C7" class="c01-screen c01-c7">
        <svg class="c01-c7-icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Circle arc leaving a gap at top-right for the arrowhead -->
          <path d="M 40 8 A 32 32 0 1 0 66 24" fill="none" stroke="#fff" stroke-width="3"
            stroke-linecap="round"/>
          <!-- Arrowhead pointing along the arc direction at top-right -->
          <polyline points="58,14 66,24 56,26" fill="none" stroke="#fff" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="c01-c7-label">Tap to replay</div>
      </div>
    `;
  }

  // ─── Mount function ────────────────────────────────────────────────────────

  // Store cleanup refs per container
  const _state = new WeakMap();

  function mountC01v31(container) {
    // 1. Clean up any previous instance (timers + camera stream)
    if (_state.has(container)) {
      const old = _state.get(container);
      if (old.timers) old.timers.forEach(id => clearTimeout(id));
      if (old.cleanup) old.cleanup();
    }

    // 2. Inject CSS — always overwrite so switching variants gets fresh styles
    const STYLE_ID = 'c01-injected-style';
    let _styleEl = document.getElementById(STYLE_ID);
    if (!_styleEl) {
      _styleEl = document.createElement('style');
      _styleEl.id = STYLE_ID;
      document.head.appendChild(_styleEl);
    }
    _styleEl.textContent = CSS;

    // 3. Build DOM
    const root = document.createElement('div');
    root.className = 'c01-root';
    root.innerHTML = buildScreens();
    container.innerHTML = '';
    container.appendChild(root);

    // 3b. Camera passthrough — prepended behind all screens (z-index: 0)
    // Hidden by default; only made visible during the 4 see-through AR scenes
    // so non-AR screen transitions never expose the live feed.
    const AR_SCENES = { C2_1: true, C2_2: true, C3a: true, C3b: true };
    let cameraStream = null;
    const camVideo = document.createElement('video');
    camVideo.className = 'c01-v3-camera';
    camVideo.autoplay = true;
    camVideo.playsInline = true;
    camVideo.muted = true;
    camVideo.style.visibility = 'hidden';
    root.prepend(camVideo);

    // QR scanning — active only while on C2_2 (exhibit selection scene)
    const QR_MAP = {
      'jade': 'C3a',
      'meat': 'C3b',
    };
    const qrCanvas = document.createElement('canvas');
    qrCanvas.width  = 320;
    qrCanvas.height = 320;
    const qrCtx = qrCanvas.getContext('2d');
    let qrScanning = false;

    function startQrScan() {
      if (qrScanning || !window.jsQR) return;
      qrScanning = true;
      (function scan() {
        if (!qrScanning) return;
        if (camVideo.readyState >= 2) {
          qrCtx.drawImage(camVideo, 0, 0, 320, 320);
          var img  = qrCtx.getImageData(0, 0, 320, 320);
          var code = window.jsQR(img.data, 320, 320, { inversionAttempts: 'dontInvert' });
          if (code) {
            var dest = QR_MAP[code.data.trim().toLowerCase()];
            if (dest) {
              stopQrScan();
              showScreen(dest);
              return;
            }
          }
        }
        if (qrScanning) requestAnimationFrame(scan);
      })();
    }

    function stopQrScan() { qrScanning = false; }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function(stream) {
          cameraStream = stream;
          camVideo.srcObject = stream;
        })
        .catch(function() {
          // Fallback: hide video, let transparent scenes show dark bg from .c01-root
          camVideo.style.display = 'none';
        });
    } else {
      camVideo.style.display = 'none';
    }

    // 4. State machine
    const SCREENS = [
      { id: 'C0',   name: 'Welcome', dur: 2000 },
      { id: 'C1',   name: 'Home',    dur: 0    },
      { id: 'C1_1', name: 'Collect', dur: 0    },
      { id: 'C2_1', name: 'AR Nav',  dur: 3000 },
      { id: 'C2_2', name: 'AR Scan', dur: 0    },
      { id: 'C3a',   name: '6a Jade',  dur: 0    },
      { id: 'C3a_1', name: '7a Tone',  dur: 0    },
      { id: 'C3a_2', name: '8a Katy',  dur: 0    },
      { id: 'C3b',   name: '6b Meat',  dur: 0    },
      { id: 'C3b_1', name: '7b Text',  dur: 0    },
      { id: 'C3b_2', name: '8b Orig',  dur: 0    },
      { id: 'C3d',   name: 'Saved',    dur: 1500 },
      { id: 'C4',   name: 'Nearby',   dur: 4000 },
      { id: 'C5',   name: 'Complete', dur: 1800 },
      { id: 'C5_1', name: 'Recap',    dur: 0    },
      { id: 'C6',   name: 'Ending',   dur: 3000 },
      { id: 'C7',   name: 'Replay',   dur: 0    },
    ];

    const idToIndex = {};
    SCREENS.forEach(function(s, i) { idToIndex[s.id] = i; });

    let onChangeCb = null;
    let currentScreen = 'C0';
    let prevScreen = null;
    let homeSource = null; // what screen the user came from when opening C1
    let savedCount = 0;
    let lastSavedExhibit = null;
    let savedExhibits = [];
    const timers = [];

    function updateRecommendation() {
      var recommendMeat = (lastSavedExhibit === 'C3a');
      var c4 = root.querySelector('#c01-screen-C4');
      if (!c4) return;
      c4.querySelector('.c01-c4-thumb').textContent = recommendMeat ? '🥩' : '🪨';
      c4.querySelector('.c01-c4-name').textContent  = recommendMeat ? 'Meat-Shaped Stone' : 'Jadeite Cabbage';
    }

    function updateSavedScreen() {
      var isMeat = (lastSavedExhibit === 'C3b');
      var c3d = root.querySelector('#c01-screen-C3d');
      if (!c3d) return;
      c3d.querySelector('.c01-c3d-thumb').textContent = isMeat ? '🥩' : '🪨';
      c3d.querySelector('.c01-c3d-name').textContent  = isMeat ? 'Meat-shaped Stone' : 'Jadeite Cabbage';
    }

    function updateStarButtons() {
      ['C3a', 'C3b'].forEach(function(id) {
        var screen = root.querySelector('#c01-screen-' + id);
        if (!screen) return;
        var btn = screen.querySelector('.c01-c3ar-star');
        if (!btn) return;
        var saved = savedExhibits.indexOf(id) !== -1;
        btn.textContent = saved ? '★' : '☆';
        btn.classList.toggle('c01-star-saved', saved);
      });
    }

    var EXHIBIT_LABELS = { 'C3a': 'Jadeite Cabbage', 'C3b': 'Meat-shaped Stone' };
    function updateCollection() {
      var el = root.querySelector('#c01-c1_1-content');
      if (!el) return;
      if (savedExhibits.length === 0) {
        el.innerHTML = '<div class="c01-c1_1-empty">Empty</div>';
        return;
      }
      var items = savedExhibits.map(function(id) {
        return '<div class="c01-c1_1-item"><div class="c01-c1_1-thumb"></div><div class="c01-c1_1-iname">' + EXHIBIT_LABELS[id] + '</div></div>';
      }).join('');
      el.innerHTML = '<div class="c01-c1_1-items">' + items + '</div>';
    }

    const tabContent = {
      jade:    'Natural jadeite gradation from white base to deep green — no dye used.',
      katydid: 'Locust and katydid are traditional metaphors for having numerous children.',
      texture: 'Layers of jasper stone carved and stained to mimic braised pork belly in perfect detail.',
      origin:  'Unearthed during the Qing Dynasty; believed to have been a royal amusement piece.',
    };

    function showStep(index) {
      timers.forEach(function(t) { clearTimeout(t); });
      timers.length = 0;

      var screen = SCREENS[index];
      // Show camera only for see-through AR scenes; hide immediately otherwise
      // so opacity transitions on non-AR screens never expose the live feed.
      camVideo.style.visibility = AR_SCENES[screen.id] ? 'visible' : 'hidden';

      // Track where C1 (Home) was opened from, but ignore C1_1 (sub-page)
      if (screen.id === 'C1' && currentScreen !== 'C1_1') {
        homeSource = currentScreen;
      }
      prevScreen = currentScreen;
      currentScreen = screen.id;

      root.querySelectorAll('.c01-screen').forEach(function(s) {
        s.classList.remove('c01-active');
      });
      var target = root.querySelector('#c01-screen-' + screen.id);
      if (target) target.classList.add('c01-active');

      if (onChangeCb) onChangeCb(index);

      // Auto-advance for specific screens
      if (screen.id === 'C0') {
        timers.push(setTimeout(function() { showStep(idToIndex['C1']); }, 2000));
      }
      if (screen.id === 'C2_1') {
        timers.push(setTimeout(function() { showStep(idToIndex['C2_2']); }, 3000));
      }
      if (screen.id === 'C3d') {
        timers.push(setTimeout(function() {
          showStep(idToIndex[savedCount >= 2 ? 'C2_2' : 'C4']);
        }, 1500));
      }
      if (screen.id === 'C5') {
        timers.push(setTimeout(function() { showStep(idToIndex['C5_1']); }, 1800));
      }
      if (screen.id === 'C6') {
        timers.push(setTimeout(function() { showStep(idToIndex['C7']); }, 3000));
      }
      if (screen.id === 'C3a' || screen.id === 'C3b') {
        updateStarButtons();
      }
      if (screen.id === 'C2_2') { startQrScan(); } else { stopQrScan(); }
    }

    function showScreen(id) {
      var index = idToIndex[id];
      if (index !== undefined) showStep(index);
    }

    // 5. Tab switching inside C3_1 / C3_2
    function setupTabs() {
      root.querySelectorAll('.c01-c3-tab').forEach(tab => {
        tab.addEventListener('click', function (e) {
          e.stopPropagation();
          const key = this.dataset.tab;
          const card = this.closest('.c01-c3-card');
          if (!card) return;
          card.querySelectorAll('.c01-c3-tab').forEach(t => t.classList.remove('c01-tab-active'));
          this.classList.add('c01-tab-active');
          const contentEl = card.querySelector('.c01-c3-tab-content');
          if (contentEl && tabContent[key]) contentEl.textContent = tabContent[key];
        });
      });
    }

    // 6. Event delegation from root
    function handleClick(e) {
      // Check for data-action on the clicked element or its ancestors (up to root)
      let el = e.target;
      let action = null;
      while (el && el !== root) {
        if (el.dataset && el.dataset.action) {
          action = el.dataset.action;
          break;
        }
        el = el.parentElement;
      }

      if (action === 'home-back') {
        e.stopPropagation();
        showScreen(homeSource === 'C0' || homeSource === null ? 'C2_2' : homeSource);
        return;
      }

      // Approach transition: dolly-zoom camera then navigate to exhibit hotspot

      if (action) {
        e.stopPropagation();
        if (action === 'to-C3d') {
          var idx = savedExhibits.indexOf(currentScreen);
          if (idx !== -1) {
            // Already saved — unsave
            savedExhibits.splice(idx, 1);
            savedCount = Math.max(0, savedCount - 1);
            if (lastSavedExhibit === currentScreen) {
              lastSavedExhibit = savedExhibits[savedExhibits.length - 1] || null;
            }
            updateStarButtons();
            updateRecommendation();
            updateCollection();
            return; // don't navigate to C3d
          }
          // Not yet saved — save and navigate to confirmation
          savedCount++;
          lastSavedExhibit = currentScreen;
          savedExhibits.push(currentScreen);
          updateSavedScreen();
          updateRecommendation();
          updateCollection();
          updateStarButtons();
        }
        const dest = action.replace('to-', '');
        showScreen(dest);
        return;
      }

      // Hotspot dot tap → route to the correct exhibit's detail pages
      var dot = e.target.closest('.c01-c3ar-dot');
      if (dot) {
        var hotspot = dot.dataset.hotspot;
        if (currentScreen === 'C3b') {
          showScreen(hotspot === '2' ? 'C3b_2' : 'C3b_1');
        } else {
          showScreen(hotspot === '2' ? 'C3a_2' : 'C3a_1');
        }
        e.stopPropagation();
        return;
      }

      // Screen-wide tap handlers (no data-action found)
      if (currentScreen === 'C7') {
        savedCount = 0;
        lastSavedExhibit = null;
        savedExhibits = [];
        homeSource = null;
        updateCollection();
        updateStarButtons();
        showScreen('C0');
      }
    }

    root.addEventListener('click', handleClick);
    setupTabs();

    // C1 carousel: loop + opacity focus + drag
    var carousel = root.querySelector('.c01-c1-carousel');
    if (carousel) {
      // 12 items = 3 groups × 4. card=200, gap=12 → spacing=212. GROUP_W=848.
      // Group snap offsets: group0=[0,212,424,636], group1=[848,1060,1272,1484], group2=[1696+]
      var C1_GROUP_W = 848;

      function updateC1Opacity() {
        var center = carousel.scrollLeft + 230;
        carousel.querySelectorAll('.c01-c1-ccard').forEach(function(card) {
          var dist = Math.abs(card.offsetLeft + 100 - center);
          card.style.opacity = dist < 106 ? '1' : '0.4';
        });
      }

      setTimeout(function() {
        carousel.scrollLeft = 848; // start on group1 item0
        updateC1Opacity();
      }, 50);

      var c1LoopTimer;
      carousel.addEventListener('scroll', function() {
        updateC1Opacity();
        clearTimeout(c1LoopTimer);
        c1LoopTimer = setTimeout(function() {
          if (carousel.scrollLeft < 848) {
            carousel.scrollLeft += C1_GROUP_W;
          } else if (carousel.scrollLeft > 1484) {
            carousel.scrollLeft -= C1_GROUP_W;
          }
          updateC1Opacity();
        }, 80);
      }, { passive: true });

      var c1Dragging = false, c1DragX = 0, c1DragScroll = 0, c1WasDragged = false;
      carousel.addEventListener('mousedown', function(e) {
        c1Dragging = true;
        c1WasDragged = false;
        c1DragX = e.pageX - carousel.offsetLeft;
        c1DragScroll = carousel.scrollLeft;
        carousel.classList.add('c01-c1-dragging');
      });
      carousel.addEventListener('mouseleave', function() {
        c1Dragging = false;
        carousel.classList.remove('c01-c1-dragging');
      });
      carousel.addEventListener('mouseup', function() {
        c1Dragging = false;
        carousel.classList.remove('c01-c1-dragging');
      });
      carousel.addEventListener('mousemove', function(e) {
        if (!c1Dragging) return;
        e.preventDefault();
        var dx = e.pageX - carousel.offsetLeft - c1DragX;
        if (Math.abs(dx) > 4) c1WasDragged = true;
        carousel.scrollLeft = c1DragScroll - dx;
      });
      carousel.addEventListener('click', function(e) {
        if (c1WasDragged) {
          e.stopPropagation();
          c1WasDragged = false;
        }
      });
    }

    // C5_1 carousel: initial scroll to center featured item + mouse drag
    var c5carousel = root.querySelector('.c01-c5-carousel');
    if (c5carousel) {
      // 9 items = 3 groups × 3 items. card=150, gap=10, spacer=145.
      // Group snap offsets: group0=[0,160,320], group1=[480,640,800], group2=[960,1120,1280]
      // Start on group1 Jadeite (item4): scrollLeft=640
      var C5_GROUP_W = 480; // 3 × (150+10)

      function updateC5Opacity() {
        var center = c5carousel.scrollLeft + 230;
        c5carousel.querySelectorAll('.c01-c5-citem').forEach(function(item) {
          var dist = Math.abs(item.offsetLeft + 75 - center);
          item.style.opacity = dist < 80 ? '1' : '0.4';
        });
      }

      setTimeout(function() {
        c5carousel.scrollLeft = 640;
        updateC5Opacity();
      }, 50);

      var loopTimer;
      c5carousel.addEventListener('scroll', function() {
        updateC5Opacity();
        clearTimeout(loopTimer);
        loopTimer = setTimeout(function() {
          if (c5carousel.scrollLeft < 480) {
            c5carousel.scrollLeft += C5_GROUP_W;
          } else if (c5carousel.scrollLeft > 800) {
            c5carousel.scrollLeft -= C5_GROUP_W;
          }
          updateC5Opacity();
        }, 80);
      }, { passive: true });

      // Mouse drag
      var isDragging = false, dragStartX = 0, dragScrollLeft = 0;
      c5carousel.addEventListener('mousedown', function(e) {
        isDragging = true;
        dragStartX = e.pageX - c5carousel.offsetLeft;
        dragScrollLeft = c5carousel.scrollLeft;
        c5carousel.classList.add('c01-c5-dragging');
      });
      c5carousel.addEventListener('mouseleave', function() {
        isDragging = false;
        c5carousel.classList.remove('c01-c5-dragging');
      });
      c5carousel.addEventListener('mouseup', function() {
        isDragging = false;
        c5carousel.classList.remove('c01-c5-dragging');
      });
      c5carousel.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        var x = e.pageX - c5carousel.offsetLeft;
        c5carousel.scrollLeft = dragScrollLeft - (x - dragStartX);
      });
    }

    // Store state + camera stream for cleanup when variant is switched away
    _state.set(container, {
      timers,
      cleanup: function() {
        stopQrScan();
        if (cameraStream) {
          cameraStream.getTracks().forEach(function(t) { t.stop(); });
          cameraStream = null;
        }
      }
    });

    // Start on C0
    showStep(0);

    return {
      goTo: function(index) {
        if (index >= 0 && index < SCREENS.length) showStep(index);
      },
      onChange: function(cb) { onChangeCb = cb; },
      count: SCREENS.length,
      names: SCREENS.map(function(s) { return s.name; }),
      durations: SCREENS.map(function(s) { return s.dur; }),
    };
  }

  // ─── Export ────────────────────────────────────────────────────────────────
  if (typeof window !== 'undefined') {
    window.mountC01v31 = mountC01v31;
  }

})();

if (typeof module !== 'undefined') module.exports = { mountC01v31 };
