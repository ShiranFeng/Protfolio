(() => {
  'use strict';
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.mind-hero');
  const about = document.querySelector('.draft-about');
  const follower = document.querySelector('.draft-follower');
  const curiosity = document.querySelector('.draft-curiosity');
  const dialog = document.querySelector('.draft-dialog');
  let introAnimations = [];
  let introVersion = 0;
  let introTimer;
  let observer;
  let followerFrame = 0;
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0, rotation = 0;
  let followerActive = false;
  let lastOpener = null;

  function setPaper(open) {
    hero.classList.toggle('is-open', open);
  }
  async function intro() {
    const version = ++introVersion;
    clearTimeout(introTimer);
    introAnimations.forEach(animation => animation.cancel());
    introAnimations = [];
    hero.classList.remove('is-entering');
    setPaper(true);
    if (reduced.matches) return;
    hero.classList.add('is-entering');
    setPaper(false);
    const portrait = hero.querySelector('.mind-lower img');
    try { await Promise.race([portrait.decode(), new Promise(resolve => setTimeout(resolve, 1800))]); } catch {}
    if (version !== introVersion || reduced.matches) return;
    const name = hero.querySelector('.mind-name');
    introAnimations.push(name.animate([{ transform:'translateY(110%)', opacity:0 }, { transform:'translateY(0)', opacity:1 }], { duration:850, easing:'cubic-bezier(.215,.61,.355,1)', fill:'both' }));
    const scene = hero.querySelector('.mind-scene');
    introAnimations.push(scene.animate([{ transform:'translateY(110%) scale(.9)' }, { transform:'translateY(0) scale(1)' }], { delay:650, duration:1000, easing:'cubic-bezier(.215,.61,.355,1)', fill:'both' }));
    introTimer = setTimeout(() => {
      setPaper(true);
      hero.classList.remove('is-entering');
    }, 1900);
  }
  function configureMotion() {
    body.classList.toggle('motion-enabled', !reduced.matches);
    observer?.disconnect();
    const reveals = document.querySelectorAll('[data-reveal]');
    if (reduced.matches || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('is-visible'));
    } else {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < innerHeight * .92 && rect.bottom > 0) el.classList.add('is-visible');
        else observer.observe(el);
      });
    }
    hideFollower();
    intro();
    updateScroll();
  }

  function updateScroll() {
    const limit = document.documentElement.scrollHeight - innerHeight;
    body.style.setProperty('--page-progress', String(limit > 0 ? scrollY / limit : 0));
    if (reduced.matches) return;
    hero.style.setProperty('--scene-scroll', `${Math.min(scrollY * .07, 45)}px`);
    const rect = about.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
    about.style.setProperty('--tear-scale', String(.55 + progress * .65));
    about.style.setProperty('--about-rotation', `${progress * 100}deg`);
  }
  let scrollPending = false;
  function scheduleScroll() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => { updateScroll(); scrollPending = false; });
  }
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll);
  addEventListener('load', scheduleScroll);
  const eyes = hero.querySelector('.mind-eyes');
  const eyeWindows = [...eyes.querySelectorAll('.mind-eye')];
  // Eye centers are registered independently: the source grid has uneven gutters.
  const gazeFrames = {
    nw: [142, 222, 177], n: [525, 606, 177], ne: [916, 997, 177],
    w: [142, 222, 621], center: [525, 606, 621], e: [916, 997, 621],
    sw: [142, 222, 1081], s: [525, 606, 1081], se: [916, 997, 1081]
  };
  const sectors = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  let gazeFrame = 0;
  let pointer = null;
  function setGaze(direction) {
    if (eyes.dataset.gaze === direction) return;
    eyes.dataset.gaze = direction;
    const [left, right, y] = gazeFrames[direction];
    [left, right].forEach((x, i) => eyeWindows[i].setAttribute('viewBox', `${x - 32} ${y - 19} 64 38`));
  }
  function resetGaze() {
    pointer = null;
    cancelAnimationFrame(gazeFrame);
    gazeFrame = 0;
    setGaze('center');
  }
  function isInsidePortrait(point) {
    const portrait = hero.querySelector('.mind-portrait');
    const rect = portrait.getBoundingClientRect();
    return point.x >= rect.left && point.x <= rect.right &&
      point.y >= rect.top && point.y <= rect.bottom;
  }
  function updateGaze() {
    gazeFrame = 0;
    if (!pointer) return;
    const rect = eyes.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= innerHeight) return resetGaze();
    const dx = pointer.x - (rect.left + rect.width * 602 / 1164);
    const dy = pointer.y - (rect.top + rect.height * 583 / 1351);
    const distance = Math.hypot(dx, dy);
    const deadZone = Math.max(22, rect.width * .085);
    if (distance < deadZone) return setGaze('center');
    const angle = Math.atan2(dy, dx);
    const sector = (Math.round(angle / (Math.PI / 4)) + 8) % 8;
    // Keep the current frame near a sector boundary to avoid flicker.
    const previous = sectors.indexOf(eyes.dataset.gaze);
    if (previous >= 0) {
      const delta = Math.atan2(Math.sin(angle - previous * Math.PI / 4), Math.cos(angle - previous * Math.PI / 4));
      if (Math.abs(delta) < Math.PI / 8 + .06) return;
    }
    setGaze(sectors[sector]);
  }
  document.addEventListener('pointermove', event => {
    if (!finePointer.matches || event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    if (isInsidePortrait(pointer)) {
      cancelAnimationFrame(gazeFrame);
      gazeFrame = 0;
      setGaze('center');
      return;
    }
    if (!gazeFrame) gazeFrame = requestAnimationFrame(updateGaze);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetGaze);
  addEventListener('blur', resetGaze);
  addEventListener('scroll', resetGaze, { passive: true });
  finePointer.addEventListener('change', resetGaze);
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      const header = document.querySelector('.site-header');
      const headerPosition = header ? getComputedStyle(header).position : 'static';
      const headerHeight = header && ['fixed', 'sticky'].includes(headerPosition) ? header.offsetHeight : 0;
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - headerHeight - 24, behavior: reduced.matches ? 'instant' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });

  function moveFollower() {
    if (!followerActive) return;
    const dx = targetX - currentX;
    currentX += dx * .22;
    currentY += (targetY - currentY) * .22;
    rotation += (Math.max(-25, Math.min(25, dx * .5)) - rotation) * .18;
    follower.style.transform = `translate3d(${currentX + 22}px, ${currentY - 85}px, 0) rotate(${rotation}deg)`;
    followerFrame = requestAnimationFrame(moveFollower);
  }
  function showFollower(x, y) {
    if (reduced.matches) return;
    targetX = x; targetY = y;
    if (!followerActive) {
      currentX = x; currentY = y;
      followerActive = true;
      follower.classList.add('is-visible');
      moveFollower();
    }
  }
  function hideFollower() {
    followerActive = false;
    cancelAnimationFrame(followerFrame);
    follower.classList.remove('is-visible');
  }
  if (curiosity) {
    curiosity.addEventListener('pointermove', event => {
      if (finePointer.matches) showFollower(event.clientX, event.clientY);
    });
    curiosity.addEventListener('pointerleave', hideFollower);
    curiosity.addEventListener('focus', () => {
      const rect = curiosity.getBoundingClientRect();
      showFollower(Math.min(rect.right, innerWidth - 160), rect.top);
    });
    curiosity.addEventListener('blur', hideFollower);
    curiosity.addEventListener('click', () => {
      if (followerActive) hideFollower();
      else {
        const rect = curiosity.getBoundingClientRect();
        showFollower(Math.min(rect.right, innerWidth - 160), rect.top);
      }
    });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) hideFollower(); });
  finePointer.addEventListener('change', hideFollower);

  document.querySelectorAll('[data-artwork]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      lastOpener = link;
      const image = dialog.querySelector('img');
      image.src = link.href;
      image.alt = link.dataset.caption;
      dialog.querySelector('h2').textContent = link.dataset.caption;
      dialog.showModal();
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => lastOpener?.focus({ preventScroll: true }));
  reduced.addEventListener('change', configureMotion);
  configureMotion();
})();
