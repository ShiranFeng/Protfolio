/* Progressive enhancement: existing artwork buttons remain the source of truth. */
(() => {
  const grid = document.querySelector('.artwork-gallery');
  const banner = document.querySelector('.gallery-banner');
  if (!grid || !banner) return;
  const cards = [...grid.querySelectorAll('.artwork-card')];
  if (!cards.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scatter = document.createElement('div');
  scatter.className = 'gallery-scatter';
  scatter.setAttribute('aria-hidden', 'true');
  cards.slice(0, 10).forEach((card, i) => {
    const image = card.querySelector('img').cloneNode();
    image.alt = '';
    image.loading = 'eager';
    const side = i % 2;
    image.style.setProperty('--x', `${side ? 91 : 9}%`);
    image.style.setProperty('--y', `${10 + Math.floor(i / 2) * 19}%`);
    image.style.setProperty('--tilt', `${(i % 3 - 1) * 14}deg`);
    scatter.append(image);
  });
  banner.prepend(scatter);
  const controls = document.createElement('div');
  controls.className = 'gallery-view-controls';
  controls.innerHTML = '<span>Selected works / Scroll to explore</span><button type="button" aria-controls="gallery-film">View as grid</button>';
  const film = document.createElement('section');
  film.id = 'gallery-film';
  film.className = 'gallery-film';
  film.setAttribute('aria-label', 'Selected artworks');
  film.innerHTML = '<div class="gallery-film-stage"><div><span class="gallery-film-count"></span><h2 class="gallery-film-title"></h2></div><button class="gallery-film-picture" type="button"><img alt=""></button><p class="gallery-film-description"></p><div class="gallery-film-controls"><button type="button" aria-label="Previous artwork">← Previous</button><button type="button" aria-label="Next artwork">Next →</button></div></div>';
  grid.before(controls, film);
  const picture = film.querySelector('.gallery-film-picture');
  const image = picture.querySelector('img');
  const title = film.querySelector('.gallery-film-title');
  const description = film.querySelector('.gallery-film-description');
  const count = film.querySelector('.gallery-film-count');
  const toggle = controls.querySelector('button');
  let index = -1;
  let frame = 0;
  let animation;
  function show(next) {
    if (next === index) return;
    const direction = next > index ? 1 : -1;
    const first = index < 0;
    index = next;
    const card = cards[index];
    const source = card.querySelector('img');
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    title.textContent = card.dataset.title;
    description.textContent = card.dataset.description;
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    picture.setAttribute('aria-label', `${card.dataset.title}: view details`);
    if (!first && !reduced.matches) {
      animation?.cancel();
      animation = image.animate([{ opacity: 0, transform: `translateY(${direction * 70}px) rotate(${direction * 3}deg) scale(.92)` }, { opacity: 1, transform: 'translateY(0) rotate(0) scale(1)' }], { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
  }
  function update() {
    frame = 0;
    if (film.hidden) return;
    const step = innerHeight * .8;
    show(Math.max(0, Math.min(cards.length - 1, Math.round(-film.getBoundingClientRect().top / step))));
  }
  function resize() {
    film.style.height = `${innerHeight * (1 + (cards.length - 1) * .8)}px`;
    update();
  }
  function jump(delta) {
    const next = Math.max(0, Math.min(cards.length - 1, index + delta));
    window.scrollTo({ top: scrollY + film.getBoundingClientRect().top + next * innerHeight * .8, behavior: 'instant' });
    show(next);
  }
  film.querySelectorAll('.gallery-film-controls button').forEach((button, i) => button.addEventListener('click', () => jump(i ? 1 : -1)));
  picture.addEventListener('click', () => cards[index].click());
  const dialog = document.querySelector('.artwork-dialog');
  dialog?.addEventListener('close', () => { if (!film.hidden) picture.focus({ preventScroll: true }); });
  film.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault(); jump(event.key === 'ArrowRight' ? 1 : -1);
  });
  function setGrid(useGrid) {
    grid.hidden = !useGrid;
    film.hidden = useGrid;
    toggle.textContent = useGrid ? 'View scroll gallery' : 'View as grid';
    if (!useGrid) resize();
  }
  toggle.addEventListener('click', () => setGrid(!film.hidden));
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', resize);
  reduced.addEventListener('change', () => { animation?.cancel(); setGrid(reduced.matches); });
  show(0);
  setGrid(reduced.matches);
})();
