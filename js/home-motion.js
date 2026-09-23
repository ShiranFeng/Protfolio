(() => {
  'use strict';

  const hero = document.querySelector('.orbit-hero');
  if (!hero) return;

  const icons = [...hero.querySelectorAll('.orbit-icon')];
  const tracks = [
    { rx: 245, ry: 92, tilt: -.48, speed: .14 },
    { rx: 305, ry: 142, tilt: -.48, speed: .14 },
    { rx: 365, ry: 192, tilt: -.48, speed: .14 }
  ];
  const point = (track, angle) => {
    const x = track.rx * Math.cos(angle), y = track.ry * Math.sin(angle);
    return [500 + x * Math.cos(track.tilt) - y * Math.sin(track.tilt),
      365 + x * Math.sin(track.tilt) + y * Math.cos(track.tilt)];
  };
  for (const track of tracks) {
    for (const front of [false, true]) {
      const start = front ? 0 : Math.PI;
      const points = Array.from({ length: 81 }, (_, i) => point(track, start + i / 80 * Math.PI));
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', points.map(([x,y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' '));
      hero.querySelector(front ? '.orbit-lines--front' : '.orbit-lines--back').append(path);
    }
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const button = hero.querySelector('.orbit-pause');
  let paused = reduced.matches, hovering = false, visible = true, elapsed = 0, last = 0, frame = 0;
  const draw = () => icons.forEach((icon, index) => {
    const track = tracks[Number(icon.dataset.orbit)];
    // Equal angular spacing keeps the six icons from bunching up.
    const movingAngle = index * Math.PI / 3 - .35 - elapsed * track.speed;
    const angle = icon.matches(':hover') ? (icon._hoverAngle ?? movingAngle) : movingAngle;
    const [x,y] = point(track, angle);
    icon.style.left = `${x / 10}%`;
    icon.style.top = `${y / 6.5}%`;
    icon.style.zIndex = Math.sin(angle) >= 0 ? '5' : '2';
  });
  icons.forEach(icon => {
    icon.setAttribute('role', 'link');
    icon.setAttribute('tabindex', '0');
    icon.setAttribute('aria-label', 'Open Gallery');
    icon.addEventListener('click', () => { window.location.href = 'gallery.html'; });
    icon.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.location.href = 'gallery.html'; }
    });
    icon.addEventListener('pointerenter', () => {
      const index = icons.indexOf(icon);
      const track = tracks[Number(icon.dataset.orbit)];
      icon._hoverAngle = index * Math.PI / 3 - .35 - elapsed * track.speed;
      draw();
    });
    icon.addEventListener('pointerleave', () => { icon._hoverAngle = null; });
  });
  const tick = time => {
    frame = 0;
    if (paused || !visible || document.hidden) { last = 0; return; }
    if (last) elapsed += Math.min(50, time - last) / 1000;
    last = time; draw(); frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    button.textContent = paused ? 'Play orbits' : 'Pause orbits';
    button.setAttribute('aria-pressed', String(paused));
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  };
  button.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(hero);
  draw(); sync();
})();
