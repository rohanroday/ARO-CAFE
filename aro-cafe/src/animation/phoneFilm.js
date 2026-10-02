import { $, $$, clamp, ASSETS } from './utils.js';
import { N, DIMS } from './constants.js';

/* ---------- phone hero film: always moving ----------
   A muted looping video is the first choice. Phones in low power or battery saver mode can refuse
   to autoplay video, so when that happens the same film is drawn frame by frame onto a canvas
   (images are never blocked), and the first tap hands back over to the real video in place. */
const CLIP = 691, HEAD = 24, VFRAMES = CLIP - HEAD, VFPS = 24;   // master frames, frames folded into the loop seam
function framePlayer(cv, mode, from){
  const [w, h] = DIMS[mode]; cv.width = w; cv.height = h;   // portrait: the tall 9:16 frames, landscape: the wide ones
  const g = cv.getContext('2d', { alpha: false });
  const imgs = new Array(N), FPS = 12, FADE = 1, RUN = (N - 1) / FPS, LEN = RUN + FADE;
  let got = 0, qi = 0, t = HEAD / 2 / FPS, last = 0, raf = 0, dead = false, running = false, drawn = -1, started = false, seen = false;
  if (from > 0) t = Math.min(RUN, (from * VFPS + HEAD) % CLIP / 2 / FPS);   // carry on from where the video stopped
  const first = Math.floor(t * FPS);                                         // frames arrive in playing order from here
  const pump = async () => {
    while (!dead && qi < N) {
      const i = (first + qi++) % N, img = new Image(); img.decoding = 'async';
      img.src = `${ASSETS}/seq/${mode}/${String(i + 1).padStart(3, '0')}.webp`;
      try { await img.decode(); imgs[i] = img; } catch (_) { imgs[i] = false; }
      got++;
    }
  };
  for (let n = 0; n < 4; n++) pump();
  const pick = i => { for (let n = 0; n < N; n++) { const im = imgs[(i - n + N) % N]; if (im) return im; } return null; };
  const step = now => {
    raf = 0; if (dead || !running) return;
    const dt = Math.min(100, now - (last || now)) / 1000; last = now;
    if (!started) started = got >= Math.min(N, 30);            // a short buffer before the first frame moves
    else {
      const nt = t + dt;                                        // never run past what has arrived
      if (nt >= LEN) t = nt - LEN;
      else if (imgs[nt < RUN ? Math.min(N - 1, Math.floor(nt * FPS) + 1) : 0] !== undefined) t = nt;
    }
    let a, b, mix;
    if (t < RUN) { const f = t * FPS; a = Math.floor(f); b = Math.min(N - 1, a + 1); mix = f - a; }
    else { a = N - 1; b = 0; const k = (t - RUN) / FADE; mix = k * k * (3 - 2 * k); }
    const key = a + mix;
    if (key !== drawn) {
      const ia = pick(a), ib = pick(b);
      if (ia) {
        g.globalAlpha = 1; g.drawImage(ia, 0, 0, w, h);
        if (ib && ib !== ia && mix > .01) { g.globalAlpha = mix; g.drawImage(ib, 0, 0, w, h); }
        drawn = key; if (!seen) { seen = true; cv.classList.add('on'); }
      }
    }
    raf = requestAnimationFrame(step);
  };
  return {
    play(){ if (dead || running) return; running = true; last = 0; raf = requestAnimationFrame(step); },
    pause(){ running = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
    stop(){ this.pause(); dead = true; imgs.length = 0; },
    // where the real video should pick up, in its own seconds
    videoTime(){ const mf = Math.min(RUN, t) * FPS * 2; return (((mf - HEAD) % VFRAMES) + VFRAMES) % VFRAMES / VFPS; },
    progress(){ return Math.min(1, t / RUN); }
  };
}
export function phoneFilm(){
  const hero = $('.m-hero'), vid = $('.m-film video'), cv = $('.m-film canvas'), dots = $$('.m-hero .dots i');
  const landscape = () => innerWidth > innerHeight;
  let mode = null, fb = null, onVideo = false, inView = true, gen = 0, retryBound = false, dotRaf = 0, dotP = -1;
  vid.muted = true; vid.defaultMuted = true; vid.loop = true; vid.playsInline = true;
  const active = () => inView && !document.hidden;
  const framesOnly = /[?&]film=frames/.test(location.search);   // preview the low power path on any device

  function videoStarted(g){
    if (g !== gen) return;
    onVideo = true;
    const swap = () => { if (g !== gen || !onVideo) return; vid.classList.add('on'); if (fb) { const old = fb; fb = null; cv.classList.remove('on'); setTimeout(() => old.stop(), 700); } };
    if (vid.requestVideoFrameCallback) vid.requestVideoFrameCallback(swap);
    setTimeout(swap, 400);
    if (!active()) vid.pause();
  }
  function tryVideo(){
    const g = gen; let pr;
    if (framesOnly) return fallback();
    try { pr = vid.play(); } catch (_) { return fallback(); }
    if (pr && pr.then) pr.then(() => videoStarted(g)).catch(e => { if (g === gen && !(e && e.name === 'AbortError')) fallback(); });
    // some browsers neither play nor refuse: paused with no promise settled means autoplay is off
    setTimeout(() => { if (g === gen && !onVideo && vid.paused && active()) fallback(); }, 2500);
  }
  function fallback(from){
    if (onVideo || fb) return;
    fb = framePlayer(cv, mode, from);
    if (active()) fb.play();
    if (!retryBound && !framesOnly) {
      retryBound = true;
      // a tap is permission to play: hand the film back to the real video where the frames left off
      const retry = () => {
        if (onVideo || !fb) return;
        const g = gen, at = fb.videoTime();
        const seek = () => { try { vid.currentTime = at; } catch (_) {} };
        if (vid.readyState >= 1) seek(); else vid.addEventListener('loadedmetadata', seek, { once: true });
        const pr = vid.play();
        if (pr && pr.then) pr.then(() => videoStarted(g)).catch(() => {});
      };
      ['touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, retry, { passive: true }));
    }
  }
  function load(){
    const m = landscape() ? 'd' : 'm';
    if (m === mode) return;
    const at = onVideo ? vid.currentTime : 0;
    mode = m; gen++; onVideo = false;
    if (fb) { fb.stop(); fb = null; }
    vid.classList.remove('on'); cv.classList.remove('on');
    vid.src = `${ASSETS}/hero-loop-${m}.mp4`;
    if (at) vid.addEventListener('loadedmetadata', () => { try { vid.currentTime = at; } catch (_) {} }, { once: true });
    vid.load();
    tryVideo();
  }
  function setActive(){
    if (active()) {
      if (onVideo) { const g = gen, pr = vid.play(); if (pr && pr.catch) pr.catch(e => { if (g === gen && !(e && e.name === 'AbortError')) { onVideo = false; vid.classList.remove('on'); fallback(vid.currentTime); } }); }
      else if (fb) fb.play();
      else tryVideo();
      if (!dotRaf) dotRaf = requestAnimationFrame(dotStep);
    } else { if (onVideo) vid.pause(); if (fb) fb.pause(); }
  }
  // the three bars under the buttons follow the film: peaks, Gangtok, your cup
  function dotStep(){
    dotRaf = 0; if (!active()) return;
    let p = -1;
    if (onVideo && vid.duration) p = ((vid.currentTime * VFPS + HEAD) % CLIP) / CLIP;
    else if (fb) p = fb.progress();
    if (p >= 0 && Math.abs(p - dotP) > .002) { dotP = p; dots.forEach((d, i) => d.style.setProperty('--f', clamp(p * 3 - i, 0, 1).toFixed(3))); }
    dotRaf = requestAnimationFrame(dotStep);
  }
  // if the system pauses the video behind our back (power mode switched on mid-visit), keep the film moving
  vid.addEventListener('pause', () => { if (onVideo && active() && !vid.ended) setTimeout(() => { if (onVideo && active() && vid.paused) setActive(); }, 250); });
  vid.addEventListener('ended', () => { vid.currentTime = 0; setActive(); });
  vid.addEventListener('error', () => { if (!onVideo) fallback(); });
  new IntersectionObserver(es => { inView = es[0].isIntersecting; setActive(); }, { threshold: .02 }).observe(hero);
  document.addEventListener('visibilitychange', setActive);
  addEventListener('pageshow', setActive);
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(load, 200); });
  load();
  dotRaf = requestAnimationFrame(dotStep);
}
