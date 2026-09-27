(() => {
  const descriptions = {
    customer: ['Start a booking and choose how you ride.', 'Select snowboard or ski, then plan your day.', 'Choose resort and date to narrow your search.', 'Apply service, skill and trust filters; compare a match.', 'Choose add-ons and message the provider, then confirm.', 'Pay the deposit to confirm your booking and arrange the meetup.', 'Meet and complete the service, then settle the balance.', 'Pay the balance and optional tip, then review booked services.'],
    provider: ['Choose “Become a provider” to begin setup.', 'Select riding styles, then declare your services.', 'Your service choices determine the available profile modules.', 'Complete basic info and chosen modules in any order; save each, then submit.', 'Check which modules are live or awaiting certification review.', 'Open the dashboard to manage each service independently.']
  };
  const provider = document.querySelector('#provider');
  const branches = document.createElement('section');
  branches.className = 'module-branches';
  branches.innerHTML = '<h2>B4 · Profile modules — parallel paths</h2><p>From the checklist, open any available module. Saving returns you to B4. Basic info is required; coaching and photo/video appear only when selected in B3.</p><div class="module-lane" tabindex="0" role="region" aria-label="Profile module branches"></div>';
  const moduleSteps = [...provider.querySelectorAll('.step')].filter(step => /^B4[a-c]/.test(step.textContent));
  const paths = ['B4 → Basic info (required) → Save → B4', 'B4 → Coaching (if selected) → Save → B4', 'B4 → Photo/video (if selected) → Save → B4'];
  moduleSteps.forEach((step, index) => {
    const path = document.createElement('span');
    path.className = 'module-path';
    path.textContent = paths[index];
    step.prepend(path);
    branches.querySelector('.module-lane').append(step);
  });
  provider.querySelector('.endnote').before(branches);
  for (const [id, labels] of Object.entries(descriptions)) {
    const pane = document.getElementById(id);
    const flow = pane.querySelector('.flow');
    flow.tabIndex = 0;
    flow.setAttribute('role', 'region');
    flow.setAttribute('aria-label', `${id} journey, scroll horizontally to explore`);
    const steps = [...flow.querySelectorAll('.step')];
    steps.slice(0, -1).forEach((step, index) => {
      const connector = document.createElement('div');
      connector.className = 'flow-connector';
      const label = document.createElement('span');
      label.textContent = labels[index];
      const arrow = document.createElement('i');
      arrow.setAttribute('aria-hidden', 'true');
      connector.append(label, arrow);
      step.after(connector);
    });
    const controls = document.createElement('div');
    controls.className = 'flow-tools';
    controls.innerHTML = '<p>Read left to right · Scroll or use arrows to explore each step</p><button type="button" aria-label="Previous steps">←</button><button type="button" aria-label="Next steps">→</button>';
    controls.querySelectorAll('button').forEach((button, index) => button.addEventListener('click', () => flow.scrollBy({ left: (index ? 1 : -1) * 434 })));
    flow.before(controls);
  }
  const tabs = [...document.querySelectorAll('.tab')];
  tabs.forEach(tab => {
    tab.setAttribute('aria-controls', tab.dataset.target);
    tab.setAttribute('aria-pressed', String(tab.classList.contains('active')));
    tab.addEventListener('click', () => tabs.forEach(item => item.setAttribute('aria-pressed', String(item === tab))));
  });
})();
