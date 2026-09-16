"use strict";
function initGallery() {
    const grid = document.querySelector(".artwork-gallery");
    const dialog = document.querySelector(".artwork-dialog");
    const dialogImage = dialog === null || dialog === void 0 ? void 0 : dialog.querySelector(".artwork-dialog__image");
    const dialogTitle = dialog === null || dialog === void 0 ? void 0 : dialog.querySelector("#artwork-dialog-title");
    const closeButton = dialog === null || dialog === void 0 ? void 0 : dialog.querySelector(".artwork-dialog__close");
    if (!grid || !dialog || !dialogImage || !dialogTitle || !closeButton)
        return;
    const cards = Array.from(grid.querySelectorAll(".artwork-card"));
    function sizeCard(card) {
        const image = card.querySelector("img");
        if (!image || !image.naturalWidth)
            return;
        const styles = getComputedStyle(grid);
        const row = parseFloat(styles.gridAutoRows);
        const gap = parseFloat(styles.rowGap);
        const imageHeight = card.clientWidth * (image.naturalHeight / image.naturalWidth);
        card.style.gridRowEnd = `span ${Math.ceil((imageHeight + gap) / (row + gap))}`;
    }
    function sizeAll() {
        cards.forEach(sizeCard);
    }
    cards.forEach((card) => {
        const image = card.querySelector("img");
        if (!image)
            return;
        image.addEventListener("load", () => sizeCard(card));
        if (image.complete)
            sizeCard(card);
        card.addEventListener("click", () => {
            dialogImage.src = image.currentSrc || image.src;
            dialogImage.alt = image.alt;
            dialogTitle.textContent = card.dataset.title || "Artwork";
            dialog.showModal();
        });
    });
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog)
            dialog.close();
    });
    new ResizeObserver(sizeAll).observe(grid);
}
document.addEventListener("DOMContentLoaded", initGallery);
