import { $$, rng } from './utils.js';

/* ---------- split hero headlines once, seeded ---------- */
export function splitHeadlines(){
  $$('.band .split').forEach((el, bi) => {
    const band = el.closest('.band'), fx = band.dataset.fx, spread = parseFloat(band.dataset.spread || .55);
    const text = el.textContent.trim(), r = rng(1234 + bi * 77);
    el.textContent = '';
    const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = text; el.appendChild(sr);
    const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true'); el.appendChild(vis);
    const words = text.split(' ');
    words.forEach((word, wi) => {
      const w = document.createElement('span'); w.className = 'w';
      if (fx === 'scatter') {
        [...word].forEach(ch => {
          const c = document.createElement('span'); c.className = 'c'; c.textContent = ch;
          c.style.setProperty('--th', (r() * spread).toFixed(3));
          c.style.setProperty('--jx', ((r() - .5) * 120).toFixed(1) + 'px');
          c.style.setProperty('--jy', ((r() - .5) * 90).toFixed(1) + 'px');
          c.style.setProperty('--jr', ((r() - .5) * 80).toFixed(1) + 'deg');
          w.appendChild(c);
        });
      } else { w.style.setProperty('--th', (wi / Math.max(1, words.length) * .4).toFixed(3)); w.textContent = word; }
      vis.appendChild(w);
      if (wi < words.length - 1) vis.appendChild(document.createTextNode(' '));
    });
  });
}
