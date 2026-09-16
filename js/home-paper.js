(() => {
  'use strict';
  const section = document.querySelector('.home-paper');
  if (!section) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const svg = section.querySelector('svg');
  const panel = section.querySelector('.home-paper__sticky');
  const paths = Object.fromEntries(['sheet', 'edge', 'curl', 'curl-edge', 'shadow', 'fibers'].map(name => [name, svg.querySelector(`.home-paper__${name}`)]));
  const clamp = value => Math.max(0, Math.min(1, value));
  // Fixed multiscale noise: the paper fibers stay attached while the fold moves.
  const rough = n => Math.sin(n * .071) * 5 + Math.sin(n * .173 + 1.2) * 2.5 + Math.sin(n * .67) * 1.4;
  const point = (x, y) => `${x.toFixed(2)},${y.toFixed(2)}`;
  let pending = false;
  let last = -1;
  function render() {
    pending = false;
    if (motion.matches) { section.classList.remove('is-ready'); panel.style.transform = ''; return; }
    const rect = section.getBoundingClientRect();
    // Keep this panel in view without relying on ancestor overflow/sticky behavior.
    const offset = Math.max(0, Math.min(-rect.top, rect.height - innerHeight));
    panel.style.transform = `translate3d(0,${offset}px,0)`;
    // Start peeling as the transition enters the viewport, not after a full
    // dark sheet has scrolled up over it. Downward scroll always opens it.
    const entry = innerHeight * .65;
    const progress = clamp((entry - rect.top) / Math.max(1, rect.height - innerHeight + entry));
    if (Math.abs(progress - last) < .0001) return;
    last = progress;
    // Corner travels from outside the lower-right to beyond the upper-left.
    const travel = progress * progress * (3 - 2 * progress);
    const tipX = 2440 - travel * 2940;
    const tipY = -80 + progress * 280;
    const bottomX = tipX - 720;
    const foldWidth = Math.sin(progress * Math.PI) * 235;
    const top = [], inner = [], fibers = [];
    for (let x = -20; x < tipX; x += 6) {
      const t = clamp((x + 20) / Math.max(1, tipX + 20));
      const y = tipY - (1 - t) * 125 + rough(x) + Math.sin(x * .009) * 12;
      const width = (16 + 22 * (1 + Math.sin(x * .012))) * Math.pow(1 - t, .35);
      top.push(point(x,y)); inner.push(point(x,y + width + rough(x + 83) * .5));
      if (x % 18 === 4) fibers.push(`M${point(x,y+1)}l2,-4`);
    }
    top.push(point(tipX,tipY)); inner.push(point(tipX,tipY));
    const edge = `M${top.join(' L')} L${inner.reverse().join(' L')}Z`;
    // The rough top boundary cuts away the original upper surface.
    const surface = `M${top.join(' L')} L${point(bottomX,930)} H-30Z`;
    const outer = [];
    for (let i=0;i<=80;i++) {
      const t=i/80, y=tipY+(930-tipY)*t;
      const x=tipX+(bottomX-tipX)*t + Math.sin(Math.PI*t)*foldWidth + rough(i*9)*Math.sin(Math.PI*t);
      outer.push(point(x,y));
    }
    const curl = `M${point(tipX,tipY)} L${point(bottomX,930)} L${outer.reverse().join(' L')}Z`;
    const ragged = [];
    for (let i=80;i>=0;i--) {
      const t=i/80, y=tipY+(930-tipY)*t;
      const x=tipX+(bottomX-tipX)*t + Math.sin(Math.PI*t)*foldWidth;
      ragged.push(point(x-12*Math.sin(Math.PI*t)+rough(i*9+60)*.4,y));
    }
    paths.sheet.setAttribute('d', surface);
    paths.edge.setAttribute('d', edge);
    paths.curl.setAttribute('d', curl);
    paths['curl-edge'].setAttribute('d', `M${[...outer].reverse().join(' L')} L${ragged.join(' L')}Z`);
    paths.shadow.setAttribute('d', curl);
    paths.shadow.setAttribute('transform', `translate(${foldWidth*.22} 10)`);
    paths.fibers.setAttribute('d', fibers.join(' '));
    svg.style.opacity = String(1 - clamp((progress - .92) / .08));
    section.classList.add('is-ready');
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(render); } }
  addEventListener('scroll', schedule, { passive:true });
  addEventListener('resize', () => { last = -1; schedule(); });
  addEventListener('load', () => { last = -1; schedule(); });
  motion.addEventListener('change', () => { last = -1; schedule(); });
  render();
})();
