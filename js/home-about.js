(() => {
  const section = document.querySelector('.about-journey');
  if (!section || !('IntersectionObserver' in window)) return;
  const map = section.querySelector('.about-journey__map');
  const observer = new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    section.classList.toggle('is-in-view', visible);
    if (visible) section.classList.add('is-revealed');
  }, { threshold: .15 });
  observer.observe(map);
})();
