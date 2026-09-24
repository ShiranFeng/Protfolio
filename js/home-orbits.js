(() => {
  const astronaut = document.querySelector('.orbit-astronaut');
  if (!astronaut || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const gazeSources = {
    'up-left': 'assets/home-astronaut/gaze-up-left.png',
    up: 'assets/home-astronaut/gaze-up.png',
    'up-right': 'assets/home-astronaut/gaze-up-right.png',
    left: 'assets/home-astronaut/gaze-left.png',
    center: 'assets/home-astronaut/gaze-center.png',
    right: 'assets/home-astronaut/gaze-right.png',
    'down-left': 'assets/home-astronaut/gaze-down-left.png',
    down: 'assets/home-astronaut/gaze-down.png',
    'down-right': 'assets/home-astronaut/gaze-down-right.png'
  };

  Object.values(gazeSources).forEach((source) => {
    const image = new Image();
    image.src = source;
  });

  const setGaze = (gaze) => {
    if (astronaut.dataset.gaze === gaze) return;
    astronaut.dataset.gaze = gaze;
    astronaut.src = gazeSources[gaze];
  };

  document.addEventListener('pointermove', (event) => {
    const bounds = astronaut.getBoundingClientRect();
    const cursorIsOnAstronaut = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;

    if (cursorIsOnAstronaut) {
      setGaze('center');
      return;
    }

    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    const horizontal = x < -bounds.width * .18 ? 'left' : x > bounds.width * .18 ? 'right' : '';
    const vertical = y < -bounds.height * .18 ? 'up' : y > bounds.height * .18 ? 'down' : '';
    const gaze = vertical && horizontal ? `${vertical}-${horizontal}` : vertical || horizontal || 'center';
    setGaze(gaze);
  });
})();
