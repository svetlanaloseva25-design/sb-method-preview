(function () {
  'use strict';
  const inner = document.querySelector('.flip-inner');
  const faces = [document.getElementById('tarot-art'), document.getElementById('tarot-next')];
  const hero = document.querySelector('.tarot-feature');
  if (!inner || faces.some(face => !face) || !hero) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sources = ['priestess', 'magician', 'hermit', 'lovers', 'ten-cups', 'nine-pentacles', 'king-swords', 'four-wands', 'hanged-man', 'strength'].map(name => 'assets/tarot/' + name + '.webp');
  const HOLD_MS = 2000, TURN_MS = 800;
  let index = 0, active = 0, angle = 180, timer, animation, generation = 0, visible = true;
  const ready = sources.map(src => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  }));
  function canPlay() { return visible && !document.hidden && !reduced.matches; }
  function schedule() { clearTimeout(timer); if (canPlay()) timer = setTimeout(step, HOLD_MS); }
  async function step() {
    const token = generation;
    let next = (index + 1) % sources.length;
    while (!(await ready[next])) {
      next = (next + 1) % sources.length;
      if (next === index) return;
    }
    if (token !== generation || !canPlay()) return;
    const incoming = faces[1 - active];
    incoming.src = sources[next];
    try { await incoming.decode(); } catch (_) { schedule(); return; }
    if (token !== generation || !canPlay()) return;
    // Both real images are mounted and decoded before one uninterrupted turn.
    const target = angle + 180;
    animation = inner.animate([
      { transform: 'rotateY(' + angle + 'deg)' },
      { transform: 'rotateY(' + target + 'deg)' }
    ], { duration: TURN_MS, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' });
    await animation.finished;
    // Commit the exact final pose before removing the animation effect.
    inner.style.transform = 'rotateY(' + target + 'deg)';
    animation.cancel();
    animation = null;
    angle = target;
    index = next;
    active = 1 - active;
    schedule();
  }
  function resume() {
    clearTimeout(timer);
    generation++;
    // Finish an in-flight turn instead of snapping back to the previous pose.
    if (animation) { animation.finish(); return; }
    schedule();
  }
  document.addEventListener('visibilitychange', resume);
  reduced.addEventListener('change', resume);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      const next = entries[0].isIntersecting;
      if (visible !== next) { visible = next; resume(); }
    }, { threshold: 0.15 }).observe(hero);
  }
  if (faces[0].complete) resume();
  else faces[0].addEventListener('load', resume, { once: true });
})();
