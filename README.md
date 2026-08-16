# Portfolio site skeleton

Framework only — every page exists with just a `<h1>` title, ready for you to fill in.

## Structure

```
index.html              Home
work.html                Work (resume + experience)
gallery.html              Gallery (art)
projects/
  index.html               Projects overview
  project-1.html            Placeholder project page
  project-2.html            Placeholder project page
  project-3.html            Placeholder project page

scss/
  main.scss                 Entry point — imports variables, bootstrap, then custom partials
  _variables.scss            Override bootstrap variables here BEFORE bootstrap loads
  _custom.scss                Site-wide custom styles
  _home.scss, _projects.scss, _work.scss, _gallery.scss   Empty per-page partials

css/main.css               Compiled output (generated, don't hand-edit)

js/
  main.js                    Loads navbar/footer components, fixes relative paths
  vendor/bootstrap.bundle.min.js

components/
  navbar.html, footer.html   Shared nav/footer, injected into every page by main.js

assets/                     Images, fonts, etc. (empty for now)
```

## Adding more project pages

Copy `projects/project-1.html` to `projects/project-4.html` etc, and add a link to it
from `projects/index.html`. Each project page is independent — content, layout and
structure can differ page to page.

## Editing styles

1. Edit files in `scss/`. Put your own variables (colors, fonts) in `_variables.scss`
   — that file is imported *before* Bootstrap, so your values override Bootstrap's
   defaults.
2. Rebuild the compiled CSS:
   ```
   npm install
   npm run build:css
   ```
   or, while actively working:
   ```
   npm run watch:css
   ```

## Running locally

Because `js/main.js` uses `fetch()` to load the navbar/footer, opening the HTML files
directly (`file://`) will fail due to browser CORS restrictions. Serve the folder with
a local server instead, e.g.:

```
npx serve .
```

or the VS Code "Live Server" extension.

## Deploying

`node_modules/` is not needed at runtime (it's excluded via `.gitignore`) — the site
only depends on `css/main.css` (compiled) and `js/vendor/bootstrap.bundle.min.js`
(vendored), both already committed.
