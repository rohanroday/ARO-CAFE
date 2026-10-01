import gsap from 'gsap';
import { $, rng } from './utils.js';

/* ---------- the interactive moment: hold to say Aro ---------- */
export function initHoldToSayAro(){
  const R = document.documentElement;
  const hello = $('#hello'), hold = $('#holdBtn'), answer = $('.answer');
  let hp = 0, holding = false, hraf = null, hlast = 0, done = false;
  function complete(){
    if (done) return; done = true; hp = 1; hold.style.setProperty('--hp', 1);
    hello.classList.add('done');
    answer.textContent = 'Aro! Welcome in, friend.';
    hold.querySelector('small').textContent = 'We heard you';
    if (!R.classList.contains('rm')) {
      const r = rng(42), card = $('.hello-card'), br = hold.getBoundingClientRect(), cr = card.getBoundingClientRect();
      for (let i = 0; i < 14; i++) {
        const s = document.createElement('span'); s.className = 'burst'; s.textContent = i % 3 ? 'Aro!' : 'Hello!';
        s.setAttribute('aria-hidden', 'true');
        s.style.top = (br.top - cr.top + br.height / 2) + 'px';
        card.appendChild(s);
        const ang = r() * Math.PI * 2, dist = 140 + r() * 220;
        gsap.fromTo(s, { xPercent: -50, yPercent: -50, scale: .4, opacity: 1 }, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist * .7, rotate: (r() - .5) * 60, scale: 1 + r() * .6, opacity: 0, duration: 1.6 + r() * .6, ease: 'expo.out', onComplete: () => s.remove() });
      }
    }
  }
  function hstep(now){
    const dt = Math.min(64, now - (hlast || now)); hlast = now;
    hp = holding ? Math.min(1, hp + dt / 1500) : Math.max(0, hp - dt / 900);
    hold.style.setProperty('--hp', hp.toFixed(3));
    if (hp >= 1) { hraf = null; hlast = 0; complete(); return; }
    if (holding || hp > 0) hraf = requestAnimationFrame(hstep); else { hraf = null; hlast = 0; }
  }
  function press(){ if (done) return; if (R.classList.contains('rm')) return complete(); holding = true; if (hraf === null) hraf = requestAnimationFrame(hstep); }
  function release(){ holding = false; }
  hold.addEventListener('pointerdown', e => { e.preventDefault(); try { hold.setPointerCapture(e.pointerId); } catch (_) {} press(); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => hold.addEventListener(ev, release));
  hold.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(); } });
  hold.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') release(); });
  hold.addEventListener('contextmenu', e => e.preventDefault());
}
