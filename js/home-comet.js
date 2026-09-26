(() => {
  const comet = document.querySelector('#home-shooting-star');
  const stage = document.querySelector('.star-stage');
  const about = document.querySelector('#about');
  if (!comet || !stage || !about) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0;

  function render() {
    frame = 0;
    const bounds = stage.getBoundingClientRect();
    const start = bounds.top + scrollY + stage.clientHeight * .78 - innerHeight * .82;
    const end = about.getBoundingClientRect().top + scrollY - innerHeight * .3;
    const progress = clamp((scrollY - Math.max(0, start)) / Math.max(1, end - Math.max(0, start)));
    const fade = clamp((progress - .35) / .65);
    comet.style.opacity = String(1 - fade * fade * (3 - 2 * fade));
    comet.style.transform = reduced.matches ? 'none' : `translate3d(${-bounds.width * .62 * progress}px, ${bounds.width * .24 * progress}px, 0)`;
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  comet.addEventListener('load', schedule);
  reduced.addEventListener('change', schedule);
  render();
})();
