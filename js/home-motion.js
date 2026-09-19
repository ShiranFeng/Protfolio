(() => {
  'use strict';

  const hero = document.querySelector('.mind-hero');
  if (!hero) return;

  // The portrait's torn-paper cap is the only motion retained on the homepage.
  const revealPortrait = () => requestAnimationFrame(() => hero.classList.add('is-open'));
  if (document.readyState === 'loading') {
    addEventListener('load', revealPortrait, { once: true });
  } else {
    revealPortrait();
  }
})();
