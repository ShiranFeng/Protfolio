/**
 * Loads shared components (navbar, footer) into any page that has
 * <div id="navbar-placeholder" data-depth="0"></div> and
 * <div id="footer-placeholder" data-depth="0"></div>.
 *
 * data-depth = how many folders deep the current page is from the site root.
 * index.html, work.html, gallery.html  -> depth 0
 * projects/index.html, projects/project-1.html -> depth 1
 */

function loadComponent(placeholderId, componentPath) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;

  const depth = parseInt(placeholder.dataset.depth || "0", 10);
  const root = "../".repeat(depth);

  fetch(root + componentPath)
    .then((res) => res.text())
    .then((html) => {
      placeholder.innerHTML = html.replaceAll("__ROOT__", root);
    })
    .catch((err) => console.error("Failed to load component:", componentPath, err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar-placeholder", "components/navbar.html");
  loadComponent("footer-placeholder", "components/footer.html");

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
