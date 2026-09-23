function initGallery(): void {
  const grid = document.querySelector<HTMLElement>(".artwork-gallery");
  const dialog = document.querySelector<HTMLDialogElement>(".artwork-dialog");
  const dialogImage = dialog?.querySelector<HTMLImageElement>(".artwork-dialog__image");
  const dialogTitle = dialog?.querySelector<HTMLElement>("#artwork-dialog-title");
  const closeButton = dialog?.querySelector<HTMLButtonElement>(".artwork-dialog__close");
  if (!grid || !dialog || !dialogImage || !dialogTitle || !closeButton) return;

  const cards = Array.from(grid.querySelectorAll<HTMLButtonElement>(".artwork-card"));

  function sizeCard(card: HTMLButtonElement): void {
    const image = card.querySelector<HTMLImageElement>("img");
    if (!image || !image.naturalWidth) return;
    const styles = getComputedStyle(grid!);
    const row = parseFloat(styles.gridAutoRows);
    const gap = parseFloat(styles.rowGap);
    const imageHeight = card.clientWidth * (image.naturalHeight / image.naturalWidth);
    card.style.gridRowEnd = `span ${Math.ceil((imageHeight + gap) / (row + gap))}`;
  }

  function sizeAll(): void {
    cards.forEach(sizeCard);
  }

  cards.forEach((card, index) => {
    const image = card.querySelector<HTMLImageElement>("img");
    if (!image) return;
    image.addEventListener("load", () => sizeCard(card));
    if (image.complete) sizeCard(card);
    card.addEventListener("click", () => {
      showArtwork(index);
      dialog.showModal();
    });
  });


  let currentIndex = 0;
  const counter = document.createElement('span');
  counter.className = 'artwork-dialog__counter';
  counter.setAttribute('aria-live', 'polite');
  const navigation = document.createElement('nav');
  navigation.className = 'artwork-dialog__navigation';
  navigation.setAttribute('aria-label', 'Browse artworks');
  function showArtwork(index: number) {
    currentIndex = (index + cards.length) % cards.length;
    const card = cards[currentIndex];
    const image = card.querySelector<HTMLImageElement>('img');
    if (!image) return;
    dialogImage!.src = image.currentSrc || image.src;
    dialogImage!.alt = image.alt;
    dialogTitle!.textContent = card.dataset.title || 'Artwork';
    const description = dialog!.querySelector('#artwork-dialog-description');
    if (description) description.textContent = card.dataset.description || '';
    counter.textContent = (currentIndex + 1) + ' / ' + cards.length;
  }
  for (const [label, symbol, direction] of [['Previous artwork', '←', -1], ['Next artwork', '→', 1]] as const) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.textContent = symbol;
    button.addEventListener('click', () => showArtwork(currentIndex + direction));
    navigation.append(button);
    if (direction === -1) navigation.append(counter);
  }
  dialog.append(navigation);
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showArtwork(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  new ResizeObserver(sizeAll).observe(grid);
}

document.addEventListener("DOMContentLoaded", initGallery);
