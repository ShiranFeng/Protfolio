"use strict";
/**
 * Loads shared components (navbar, footer) into any page that has
 * <div id="navbar-placeholder" data-depth="0"></div> and
 * <div id="footer-placeholder" data-depth="0"></div>.
 *
 * data-depth = how many folders deep the current page is from the site root.
 * index.html, work.html, gallery.html  -> depth 0
 * projects/index.html -> depth 1
 * projects/project-1/index.html -> depth 2
 */
function loadComponent(placeholderId, componentPath) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder)
        return Promise.resolve();
    const depth = parseInt(placeholder.dataset.depth || "0", 10);
    const root = "../".repeat(depth);
    return fetch(root + componentPath)
        .then((res) => res.text())
        .then((html) => {
        placeholder.innerHTML = html.replaceAll("__ROOT__", root);
    })
        .catch((err) => console.error("Failed to load component:", componentPath, err));
}
function playPageEntrance() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
    document.body.classList.add("page-fade-in-up");
    document.body.addEventListener("animationend", () => {
        document.body.classList.remove("page-fade-in-up");
    }, { once: true });
}
document.addEventListener("DOMContentLoaded", () => {
    playPageEntrance();
    loadComponent("navbar-placeholder", "components/navbar.html");
    loadComponent("footer-placeholder", "components/footer.html").then(() => {
        const yearEl = document.getElementById("year");
        if (yearEl)
            yearEl.textContent = new Date().getFullYear().toString();
    });
});
