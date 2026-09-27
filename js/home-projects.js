(() => {
  const cards = document.querySelectorAll('.project-glass-card');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  if (reducedMotion || !finePointer) return;

  cards.forEach((card) => {
    const reset = () => {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
      card.style.removeProperty('--shine-position');
      card.style.removeProperty('--shine-opacity');
    };

    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty('--mouse-x', `${x * 100}%`);
      card.style.setProperty('--mouse-y', `${y * 100}%`);
      card.style.setProperty('--tilt-x', `${(x - .5) * 5}deg`);
      card.style.setProperty('--tilt-y', `${(.5 - y) * 5}deg`);
      card.style.setProperty('--shine-position', `${130 - x * 160}%`);
      card.style.setProperty('--shine-opacity', '1');
    });
    card.addEventListener('pointerleave', reset);
    card.addEventListener('blur', reset);
    card.addEventListener('focus', () => card.style.setProperty('--shine-opacity', '1'));
  });
})();
