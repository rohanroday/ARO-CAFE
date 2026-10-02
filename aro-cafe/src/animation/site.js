// The site's animation engine. This is the original page script, moved as-is into a function
// that runs once after React has put the markup on the page. It drives the DOM directly
// (GSAP, ScrollTrigger, Lenis, three.js), so the components stay static and never re-render.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { $, $$, clamp, smoothstep, mixv, smoothDamp, rng, ASSETS } from './utils.js';
import { N, DIMS } from './constants.js';
import { STAGE_VERT, STAGE_FRAG, PARTICLE_VERT, PARTICLE_FRAG } from './heroShaders.js';
import { splitHeadlines } from './splitHeadlines.js';
import { initHoldToSayAro } from './holdToSayAro.js';
import { phoneFilm } from './phoneFilm.js';

let started = false;
export function initSite(){
  if (started) return;
  started = true;

  const R = document.documentElement;
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const libsOk = true;   // gsap, ScrollTrigger and Lenis are bundled, so they are always here
  gsap.registerPlugin(ScrollTrigger);

  splitHeadlines();

  /* ---------- caption bands, paced in scroll distance ---------- */
  const bands = $$('.band').map(el => ({ el, a: +el.dataset.a, b: +el.dataset.b, ramp: +el.dataset.ramp || 0, op: -1, k: -1, off: null }));
  const LAST = bands.length - 1;
  let loadK = 0;
  const cue = $('.cue'), rail = $('.rail'), railFill = $('.rail .track i'), railItems = $$('.rail li');
  let cueHidden = null, railIdx = -1, railP = -1, railDark = null;
  function updateCaptions(p){
    bands.forEach((bd, i) => {
      const { a, b } = bd, f = Math.min(0.02, (b - a) / 3);
      const op = (i === 0 ? 1 : smoothstep(p, a, a + f)) * (i === LAST ? 1 : 1 - smoothstep(p, b - f, b));
      let k = clamp((p - a) / (bd.ramp || Math.min(0.025, (b - a) * .35)), 0, 1);
      if (i === 0) k = Math.max(k, loadK);
      if (Math.abs(op - bd.op) > .004 || (op === 0) !== (bd.op === 0) || (op === 1 && bd.op !== 1)) { bd.el.style.opacity = op.toFixed(3); bd.op = op; }
      if (Math.abs(k - bd.k) > .003 || (k === 1 && bd.k !== 1) || (k === 0 && bd.k !== 0)) { bd.el.style.setProperty('--k', k.toFixed(3)); bd.k = k; }
      const off = op < .02; if (off !== bd.off) { bd.el.classList.toggle('off', off); bd.off = off; }
    });
    const ch = p > .03; if (ch !== cueHidden) { cue.classList.toggle('hide', ch); cueHidden = ch; }
    const idx = p < .33 ? 0 : p < .66 ? 1 : 2;
    if (idx !== railIdx) { railItems.forEach((li, n) => li.classList.toggle('on', n === idx)); railIdx = idx; }
    if (Math.abs(p - railP) > .003) { railFill.style.setProperty('--rp', p.toFixed(3)); railP = p; }
    const dk = p > .86; if (dk !== railDark) { rail.classList.toggle('dark', dk); railDark = dk; }
  }

  /* ---------- frame sequence: loaded coarse-to-fine ---------- */
  let seqMode = null, frames = [], loaded = 0, loadGen = 0, coarseN = 0;
  // phones ("lean"): a decoded frame is about 2MB of memory, so only the frames around the current position
  // stay decoded; the rest wait as small compressed files. Every 24th frame is always kept as a safety net.
  let lean = false, blobs = [];
  const pending = new Set(), live = new Set(), NEAR = 16;
  const isCoarse = i => i % 24 === 0 || i === N - 1;
  const pickMode = () => (innerWidth / innerHeight < 0.9 ? 'm' : 'd');
  function loadOrder(n){
    const seen = new Set(), out = [];
    const push = i => { if (!seen.has(i)) { seen.add(i); out.push(i); } };
    for (let i = 0; i < n; i += 24) push(i);
    push(n - 1);
    coarseN = out.length;
    for (const step of [12, 6, 3, 2, 1]) for (let i = 0; i < n; i += step) push(i);
    return out;
  }
  async function decode(blob){
    if ('createImageBitmap' in window) {
      // decoded the way WebGL wants it, so handing a frame to the GPU is a straight copy with no conversion pass
      try { return await createImageBitmap(blob, { premultiplyAlpha: 'none' }); } catch (_) {}
      try { return await createImageBitmap(blob); } catch (_) {}
    }
    const img = new Image(); img.src = URL.createObjectURL(blob); await img.decode(); return img;
  }
  function startLoading(mode){
    seqMode = mode; loadGen++; const gen = loadGen;
    frames = new Array(N); loaded = 0;
    blobs = new Array(N); pending.clear(); live.clear();
    const q = loadOrder(N); let qi = 0, failures = 0;
    let resolveCoarse; const coarse = new Promise(r => resolveCoarse = r);
    const worker = async () => {
      while (qi < q.length && gen === loadGen) {
        const i = q[qi++];
        try {
          const res = await fetch(`${ASSETS}/seq/${mode}/${String(i + 1).padStart(3, '0')}.webp`);
          if (!res.ok) throw new Error(res.status);
          const blob = await res.blob();
          if (lean && !isCoarse(i)) { if (gen !== loadGen) return; blobs[i] = blob; loaded++; }
          else {
            const img = await decode(blob);
            if (gen !== loadGen) { img.close && img.close(); return; }
            frames[i] = img; loaded++;
          }
        } catch (e) { failures++; if (i === 0) resolveCoarse(false); }
        if (loaded + failures >= coarseN) resolveCoarse(loaded > 0);
        introProgress(Math.min(1, loaded / coarseN));
      }
    };
    for (let w = 0; w < (mode === 'm' ? 4 : 6); w++) worker();
    return coarse;
  }
  // Decode what the film is about to show (f = frame on screen, tf = frame the scroll is heading for).
  // The window leans toward where the thumb is going, and during a fast flick only every 2nd or 3rd
  // frame is decoded: the cross-fade bridges the gaps, so the decoder keeps up instead of falling behind.
  function keepNear(f, tf){
    const c = Math.round(f), gap = tf - f, dist = Math.abs(gap);
    const dir = dist > 1.5 ? Math.sign(gap) : 0;
    const stride = dist > 40 ? 3 : dist > 16 ? 2 : 1;
    const ahead = dir ? Math.min(60, Math.ceil(dist) + 10) : NEAR, behind = dir ? 8 : NEAR;
    for (const i of live) {
      const rel = dir ? (i - c) * dir : Math.abs(i - c);
      if ((rel > ahead + 14 || rel < -(behind + 14)) && i !== curA && i !== curB) { const im = frames[i]; frames[i] = undefined; live.delete(i); im && im.close && im.close(); }
    }
    // returns false once the decoder is busy, which ends this round
    const want = i => {
      if (i < 0 || i >= N || frames[i] || pending.has(i) || !blobs[i]) return true;
      if (pending.size >= 3) return false;
      pending.add(i); const gen = loadGen;
      decode(blobs[i]).then(img => {
        pending.delete(i);
        if (gen !== loadGen || frames[i]) { img.close && img.close(); return; }
        frames[i] = img; live.add(i);
      }, () => pending.delete(i));
      return true;
    };
    if (dir) {
      const base = Math.round(c / stride) * stride;
      for (let k = 0; k * stride <= ahead; k++) if (!want(base + dir * k * stride)) return;
      if (stride > 1) return;                                   // flicking: no decodes spent on in-between frames
      for (let d = 1; d <= behind; d++) if (!want(c - dir * d)) return;
    } else for (let d = 0; d <= NEAR; d++) { if (!want(c + d) || !want(c - d)) return; }
  }
  // the loaded frames on either side of a position, so sparse (still loading) stretches cross-fade evenly
  function below(i){ for (; i >= 0; i--) if (frames[i]) return i; return -1; }
  function above(i){ for (; i < N; i++) if (frames[i]) return i; return -1; }

  /* ---------- WebGL stage (three.js) ---------- */
  let THREE = null, renderer, scene, cam, uni, puni, texA, texB, curA = -1, curB = -1, glOn = false, glBuilt = false;
  async function buildGL(){
    if (glBuilt) return true;
    try { THREE = await import('three'); }
    catch (e) { return false; }
    try { renderer = new THREE.WebGLRenderer({ canvas: $('#gl'), antialias: false, alpha: false, powerPreference: 'high-performance' }); }
    catch (e) { return false; }
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(1);
    scene = new THREE.Scene(); cam = new THREE.Camera();
    const mkTex = () => { const t = new THREE.Texture(); t.flipY = false; t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; return t; };
    texA = mkTex(); texB = mkTex();
    uni = {
      tA: { value: texA }, tB: { value: texB }, uMix: { value: 0 }, uTime: { value: 0 }, uVel: { value: 0 },
      uMist: { value: 0 }, uFlow: { value: 0 }, uZoom: { value: 1.03 }, uMouse: { value: new THREE.Vector2() },
      uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(...DIMS[seqMode]) }
    };
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: uni, depthTest: false, depthWrite: false,
      vertexShader: STAGE_VERT,
      fragmentShader: STAGE_FRAG
    }));
    plane.frustumCulled = false; scene.add(plane);

    // drifting particles: snow at the peaks, warm city lights over Gangtok
    const count = seqMode === 'm' ? 220 : 600;
    const seeds = new Float32Array(count * 3), r = rng(99);
    for (let i = 0; i < count * 3; i++) seeds[i] = r();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('seed', new THREE.BufferAttribute(seeds, 3));
    puni = { uTime: { value: 0 }, uFlow: { value: 0 }, uSize: { value: 6 }, uPR: { value: renderer.getPixelRatio() }, uAlpha: { value: .8 }, uColor: { value: new THREE.Color(1, 1, 1) } };
    const points = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: puni, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG
    }));
    points.frustumCulled = false; points.renderOrder = 1; scene.add(points);
    glBuilt = true; sizeGL(true);
    return true;
  }
  let lastW = 0, lastH = 0, quality = 1;
  // the footage is 720p: drawing more than ~2.3 million pixels only costs frames
  function pixelRatio(w, h){ return Math.max(.6, Math.min(devicePixelRatio, lean ? 1.5 : 1.75, Math.sqrt(2.3e6 / Math.max(1, w * h))) * quality); }
  function sizeGL(force){
    if (!glBuilt) return;
    const wrap = $('.glwrap'), w = wrap.clientWidth, h = wrap.clientHeight;
    if (!force && w === lastW && Math.abs(h - lastH) < 120) return;   // ignore phone toolbar wobble
    lastW = w; lastH = h;
    const pr = pixelRatio(w, h);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    uni.uRes.value.set(w * pr, h * pr);
    puni.uPR.value = pr;
  }
  // if this machine cannot hold the frame rate, trade a little sharpness for it. Judged on the median of
  // 90 settled frames; a step down that buys nothing (a 30Hz or power-throttled screen) is undone.
  let paceBuf = [], paceBase = 0, paceUndo = 0, paceOff = false, paceSkip = 120;
  function watchPace(dt){
    if (paceOff || document.hidden || loaded < N * .98) return;
    if (paceSkip > 0) { paceSkip--; return; }
    if (dt > 100) { paceBuf.length = 0; return; }       // a long gap is a hidden tab or a stall, not the GPU
    paceBuf.push(dt); if (paceBuf.length < 90) return;
    const med = paceBuf.sort((x, y) => x - y)[45]; paceBuf = [];
    if (paceUndo) {
      if (med > paceBase * .88) { quality = paceUndo; paceOff = true; sizeGL(true); return; }
      paceUndo = 0;
    }
    if (med > 21 && quality > .62) { paceBase = med; paceUndo = quality; quality = Math.max(.6, quality * .8); paceSkip = 20; sizeGL(true); }
  }
  function setFrames(f){
    const i0 = Math.floor(f);
    let a = below(i0), b = above(Math.min(N - 1, i0 + 1));
    if (a < 0) a = b; if (b < 0) b = a;
    if (a < 0) return false;
    if (a !== curA) {
      if (a === curB) { [texA, texB] = [texB, texA]; [curA, curB] = [curB, curA]; uni.tA.value = texA; uni.tB.value = texB; }
      else { texA.image = frames[a]; texA.needsUpdate = true; curA = a; }
    }
    if (b !== curB) { texB.image = frames[b]; texB.needsUpdate = true; curB = b; }
    uni.uMix.value = a === b ? 0 : clamp((f - a) / (b - a), 0, 1);
    return true;
  }

  /* ---------- the drive loop ---------- */
  let target = 0, shown = 0, vel = 0, tmx = 0, tmy = 0, mx = 0, my = 0, heroVisible = true, settleShift = -1, heroPx = 1;
  const follow = { v: 0 };
  const glwrap = $('.glwrap'), shade = $('.shade');
  function look(p){
    // mist swells at the two cloud crossings; particles change character by chapter
    const mist = .12 * (1 - smoothstep(p, .05, .2)) + .75 * smoothstep(p, .29, .34) * (1 - smoothstep(p, .37, .45)) + .6 * smoothstep(p, .58, .64) * (1 - smoothstep(p, .67, .72));
    uni.uMist.value = mist; uni.uFlow.value = p * 5; puni.uFlow.value = p * 3.2;
    const city = smoothstep(p, .4, .48), cup = smoothstep(p, .64, .72);
    puni.uColor.value.setRGB(1, mixv(1, .78, city), mixv(1, .45, city));
    puni.uSize.value = (seqMode === 'm' ? .7 : 1) * mixv(7, 22, city);
    puni.uAlpha.value = mixv(mixv(.75, .35, city), 0, cup);
  }
  function tick(time, deltaMs){
    if (!glOn || !heroVisible) return;
    const dt = Math.min(64, deltaMs || 16.7), fr = dt / 16.667;
    watchPace(deltaMs || 16.7);
    // phones: read the scroll position fresh every frame; touch scroll events arrive in uneven bursts
    if (lean && heroST) target = clamp((scrollY - heroST.start) / heroPx, 0, 1);
    shown = clamp(smoothDamp(shown, target, follow, .17, dt / 1000), 0, 1);
    if (Math.abs(target - shown) < 1e-5 && Math.abs(follow.v) < 1e-4) { shown = target; follow.v = 0; }
    // speed of the film itself, in screen heights a second, eased so the lens effect swells and settles
    vel += (clamp(follow.v * heroPx / 1500, -1, 1) - vel) * (1 - Math.pow(.88, fr));
    if (Math.abs(vel) < 1e-4) vel = 0;
    const mk = 1 - Math.pow(.95, fr);
    mx += (tmx - mx) * mk; my += (tmy - my) * mk;
    if (lean) keepNear(shown * (N - 1), target * (N - 1));
    if (!setFrames(shown * (N - 1))) return;
    uni.uTime.value = time; puni.uTime.value = time;
    uni.uVel.value = vel; uni.uMouse.value.set(mx, my);
    look(shown);
    updateCaptions(shown);
    if (seqMode === 'm') {   // phones: the finished cup lifts to make room for the words
      const s = smoothstep(shown, .84, .95);
      if (Math.abs(s - settleShift) > .003) { glwrap.style.transform = `translate3d(0,${(-19 * s).toFixed(2)}%,0)`; shade.style.opacity = s.toFixed(3); settleShift = s; }
    }
    renderer.render(scene, cam);
  }

  /* ---------- intro curtain ---------- */
  const introBar = $('.intro .bar i');
  let introShown = 0;
  function introProgress(f){ if (f > introShown && libsOk && introBar.isConnected) { introShown = f; gsap.to(introBar, { scaleX: f, duration: .4, overwrite: true }); } }
  function playIntro(){
    const tl = gsap.timeline({ onComplete: () => { const i = $('.intro'); if (i) i.remove(); } });
    tl.to(introBar, { scaleX: 1, duration: .35, overwrite: true })
      .to('.intro', { yPercent: -100, duration: 1.15, ease: 'expo.inOut' })
      .fromTo('.glwrap', { scale: 1.16 }, { scale: 1, duration: 2, ease: 'expo.out', clearProps: 'scale' }, '-=.75')
      .add(() => { lenis && lenis.start(); rampBandOne(); }, '-=1.6');
  }
  function rampBandOne(){ const o = { v: 0 }; gsap.to(o, { v: 1, duration: 1.4, ease: 'power2.out', onUpdate(){ loadK = o.v; updateCaptions(shown); } }); }

  /* ---------- smooth scroll + scroll triggers ---------- */
  let lenis = null, ctx = null, heroST = null, echoCleanup = null;
  const lenisRaf = t => lenis && lenis.raf(t * 1000);
  function startLenis(){
    if (lenis) return;
    lenis = new Lenis({ lerp: .075, smoothWheel: true, wheelMultiplier: .9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);
  }
  function stopLenis(){ if (!lenis) return; gsap.ticker.remove(lenisRaf); lenis.destroy(); lenis = null; }

  function initHeroTriggers(){
    heroST = ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom bottom',
      onUpdate(s){ target = s.progress; },
      onRefresh(s){ heroPx = Math.max(1, s.end - s.start); target = s.progress; }
    });
    new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; }).observe($('#hero'));
  }

  function initSections(){
    ctx = gsap.context(() => {
      gsap.utils.toArray('.rv').forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: 1.25, ease: 'power3.out', force3D: true, scrollTrigger: { trigger: el, start: 'top 88%' } }));

      // the echo marquee: speed follows scroll velocity, direction follows scroll direction
      const r1 = gsap.to('.echo .r1', { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
      const r2 = gsap.fromTo('.echo .r2', { xPercent: -50 }, { xPercent: 0, duration: 30, ease: 'none', repeat: -1 });
      r1.totalTime(26 * 400); r2.totalTime(30 * 400);
      // one eased value carries both speed and direction, so a change of direction glides through zero
      let want = 1, cur = 1, dir = 1, echoOn = false;
      const echoTick = (t, dms) => {
        if (!echoOn) return;
        const fr = Math.min(64, dms || 16.7) / 16.667;
        want += (dir - want) * (1 - Math.pow(.955, fr));        // the boost drains back to cruising speed
        cur += (want - cur) * (1 - Math.pow(.9, fr));
        r1.timeScale(cur); r2.timeScale(cur);
      };
      gsap.ticker.add(echoTick);
      ScrollTrigger.create({ trigger: '.echo', start: 'top bottom', end: 'bottom top',
        onToggle(s){ echoOn = s.isActive; },
        onUpdate(s){ dir = s.direction || 1; const b = dir * (1 + Math.min(4, Math.abs(s.getVelocity()) / 400)); if (Math.abs(b) > Math.abs(want) || b * want < 0) want = b; }
      });
      echoCleanup = () => gsap.ticker.remove(echoTick);

      // the name: gull flies its path, words fill in as you read
      const trail = $('#name .trail'), len = trail.getTotalLength();
      const nameST = { trigger: '#name', start: 'top 85%', end: 'top 30%', scrub: 1 };
      gsap.fromTo(trail, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: nameST });
      gsap.fromTo('#name .gull', { x: -500, y: 70, rotate: -8, opacity: 0 }, { x: 0, y: 0, rotate: 0, opacity: 1, ease: 'none', scrollTrigger: { ...nameST } });
      const bq = $('#name blockquote.fill');
      if (!bq.dataset.split) {
        bq.dataset.split = 1;
        const walk = node => [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
              else { const s = document.createElement('span'); s.className = 'fw'; s.textContent = part; frag.appendChild(s); }
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
        walk(bq);
      }
      gsap.fromTo('#name .fw', { opacity: .14 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: bq, start: 'top 80%', end: 'bottom 45%', scrub: .4 } });

      // menu tiles rise in, photos drift inside their frames
      gsap.from('.tile', { y: 48, opacity: 0, duration: 1.3, ease: 'power3.out', stagger: .09, force3D: true, scrollTrigger: { trigger: '.bento', start: 'top 85%' } });
      gsap.utils.toArray('.tile .ph img').forEach(img => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', force3D: true, scrollTrigger: { trigger: img.closest('.tile'), start: 'top bottom', end: 'bottom top', scrub: .5 } }));

      // the day: the path draws as the hours pass
      $$('.timeline svg path').forEach(p => {
        const l = p.getTotalLength() || 1;
        gsap.fromTo(p, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 60%', scrub: 1 } });
      });
      gsap.from('.step', { y: 36, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: .12, scrollTrigger: { trigger: '.steps', start: 'top 82%' } });
      gsap.from('.step .ico', { scale: .4, duration: 1.2, ease: 'elastic.out(1,.55)', stagger: .12, scrollTrigger: { trigger: '.steps', start: 'top 82%' } });

      // the team: two photos, two speeds
      gsap.fromTo('.team-photos .main', { y: 40 }, { y: -30, ease: 'none', force3D: true, scrollTrigger: { trigger: '#team', start: 'top bottom', end: 'bottom top', scrub: .5 } });
      gsap.fromTo('.team-photos .side', { y: 120, rotate: 9 }, { y: -40, rotate: 0, ease: 'none', force3D: true, scrollTrigger: { trigger: '#team', start: 'top bottom', end: 'bottom top', scrub: .5 } });
      $$('[data-count]').forEach(el => {
        const to = +el.dataset.count, o = { v: 0 };
        gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate(){ el.textContent = Math.round(o.v).toLocaleString('en-IN') + (el.dataset.suffix || ''); } });
      });

      // moments: polaroids get tossed onto the table
      const tr = rng(7);
      gsap.utils.toArray('.pola').forEach((p, i) => gsap.from(p, {
        x: (tr() - .5) * 260, y: 160 + tr() * 120, rotate: (tr() - .5) * 50, opacity: 0, scale: .85,
        ease: 'none', scrollTrigger: { trigger: '.wall', start: `top ${95 - i * 3}%`, end: 'top 45%', scrub: 1 }
      }));

      // visit: the night view settles in
      gsap.fromTo('.visit-card .bg', { scale: 1.22 }, { scale: 1, ease: 'none', force3D: true, scrollTrigger: { trigger: '.visit-card', start: 'top bottom', end: 'bottom bottom', scrub: .5 } });

      // nav tucks away on the way down, returns on the way up
      const nav = $('.nav'); let tucked = false;
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate(s){ const t = s.direction === 1 && s.scroll() > 240; if (t !== tucked) { nav.classList.toggle('tucked', t); tucked = t; } } });

      // phone dock: after the hero, until the visit card
      const dock = $('.dock'); let dockOn = false;
      ScrollTrigger.create({ trigger: '#main', start: 'top 60%', endTrigger: '#visit', end: 'top 70%', onToggle: s => { if (s.isActive !== dockOn) { dock.classList.toggle('show', s.isActive); dockOn = s.isActive; } } });
    });
  }

  initHoldToSayAro();

  /* ---------- anchors glide with Lenis ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = document.querySelector(id); if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView();
    if (id === '#main') el.focus({ preventScroll: true });
  });

  /* ---------- boot, and reduced motion live in both directions ---------- */
  function introDone(){ const i = $('.intro'); if (i) i.remove(); lenis && lenis.start(); loadK = 1; ScrollTrigger.refresh(); }
  async function motionOn(){
    R.classList.remove('rm');
    if (!libsOk) return;
    startLenis();
    if ($('.intro')) lenis.stop();
    if (!heroST) initHeroTriggers();
    initSections();
    const mode = pickMode();
    if (seqMode !== mode) {
      const coarse = startLoading(mode);
      const ok = await buildGL();
      if (!ok) { R.classList.add('nogl'); introDone(); return; }
      const first = await Promise.race([coarse, new Promise(r => setTimeout(() => r(!!frames[0]), 7000))]);
      if (!first || !frames[0]) { R.classList.add('nogl'); introDone(); return; }
    }
    glOn = true; curA = curB = -1; settleShift = -1;
    if (!tick.added) { gsap.ticker.add(tick); tick.added = true; }
    ScrollTrigger.refresh();
    target = shown = heroST.progress; follow.v = 0;
    if ($('.intro')) playIntro(); else { loadK = 1; updateCaptions(shown); }
  }
  function motionOff(){
    R.classList.add('rm');
    glOn = false; stopLenis();
    if (ctx) { ctx.revert(); ctx = null; }
    if (echoCleanup) { echoCleanup(); echoCleanup = null; }
    $('.nav').classList.remove('tucked');
    const i = $('.intro'); if (i) i.remove();
    if (libsOk) ScrollTrigger.refresh();
  }
  const phoneMQ = matchMedia('(max-width: 600px), (pointer: coarse) and (max-height: 500px)');
  phoneMQ.addEventListener('change', () => location.reload());   // crossing phone and larger screens rebuilds cleanly
  // portrait phones scroll through the film just like larger screens (native touch scrolling, no Lenis)
  async function phoneJourney(){
    lean = true;
    ScrollTrigger.config({ ignoreMobileResize: true });   // the address bar sliding away is not a resize
    initHeroTriggers();
    const coarse = startLoading(pickMode());
    const ok = await buildGL();
    const first = ok && await Promise.race([coarse, new Promise(r => setTimeout(() => r(!!frames[0]), 7000))]);
    if (!first || !frames[0]) { loadGen++; heroST.kill(); heroST = null; R.classList.remove('journey'); return false; }
    glOn = true; curA = curB = -1; settleShift = -1;
    if (!tick.added) { gsap.ticker.add(tick); tick.added = true; }
    ScrollTrigger.refresh();
    target = shown = heroST.progress; follow.v = 0;
    return true;
  }
  function phoneInit(){
    R.classList.add('phone');
    // upright phones get the scroll journey; sideways phones, and phones without WebGL, get the looping film
    const upright = innerHeight > innerWidth;
    let journey = null, journeyOn = false;
    if (upright) {
      R.classList.add('journey');
      R.classList.remove('rm');   // battery savers report "reduce motion"; the film should still follow the thumb
      matchMedia('(orientation: portrait)').addEventListener('change', () => location.reload());
      journey = phoneJourney().then(on => { journeyOn = on; if (!on) { phoneFilm(); watchHero($('.m-hero')); } });
    } else phoneFilm();
    // splash: show the wordmark while the first picture arrives, then lift the curtain
    const intro = $('.intro');
    const ready = () => { R.classList.add('m-ready'); if (journeyOn) rampBandOne(); };
    if ((reduceMQ.matches && !upright) || !intro) { if (intro) intro.remove(); ready(); }
    else {
      const t0 = performance.now();
      const firstPhoto = new Promise(res => {
        const url = getComputedStyle($('.m-film')).backgroundImage.replace(/^url\(["']?|["']?\)$/g, '');
        const img = new Image(); img.onload = img.onerror = res; img.src = url;
      });
      const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      const soon = p => Promise.race([p, new Promise(r => setTimeout(r, 3000))]);
      (journey ? Promise.all([journey, soon(fonts)]) : soon(Promise.all([firstPhoto, fonts]))).then(() => {
        setTimeout(() => {
          intro.classList.add('lift');
          setTimeout(ready, 450);
          intro.addEventListener('transitionend', () => intro.remove(), { once: true });
          setTimeout(() => intro.isConnected && intro.remove(), 1600);
        }, Math.max(0, 1200 - (performance.now() - t0)));
      });
    }
    const els = $$('#main .rv, #main blockquote, #main .tile, #main .step, #main .team-photos, #main .pola, #main .hello-card, #main .faq-list details, #main .visit-card, footer .rv');
    if (!reduceMQ.matches) {
      els.forEach(el => el.classList.add('m-rv'));
      const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
      els.forEach(el => io.observe(el));
    }
    // directions dock: after the welcome screen, until the visit card
    const dock = $('.dock'); let heroIn = true, visitIn = false, heroObs = null;
    function watchHero(el){
      if (heroObs) heroObs.disconnect();
      heroObs = new IntersectionObserver(es => { heroIn = es[0].isIntersecting; dock.classList.toggle('show', !heroIn && !visitIn); });
      heroObs.observe(el);
    }
    watchHero(upright ? $('#hero') : $('.m-hero'));
    new IntersectionObserver(es => {
      es.forEach(e => { visitIn = e.isIntersecting; });
      dock.classList.toggle('show', !heroIn && !visitIn);
    }).observe($('#visit'));
  }
  if (phoneMQ.matches) phoneInit();
  else {
    reduceMQ.addEventListener('change', e => e.matches ? motionOff() : motionOn());
    if (reduceMQ.matches || !libsOk) { const i = $('.intro'); if (i) i.remove(); }
    else motionOn();
  }

  /* ---------- resize, pointer, hidden tab ---------- */
  let rzT;
  addEventListener('resize', () => {
    clearTimeout(rzT);
    rzT = setTimeout(() => {
      if (!glBuilt || R.classList.contains('rm')) return;
      const mode = pickMode();
      if (mode !== seqMode) { startLoading(mode); uni.uImg.value.set(...DIMS[mode]); curA = curB = -1; settleShift = -1; glwrap.style.transform = ''; shade.style.opacity = 0; }
      sizeGL(false);
    }, 150);
  });
  if (matchMedia('(pointer: fine)').matches) addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));
}
