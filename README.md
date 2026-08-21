# Portfolio site skeleton

Framework only — every page exists with just a `<h1>` title, ready for you to fill in.

## Structure

```
index.html              Home
work.html                Work (resume + experience)
gallery.html              Gallery (art)
projects/
  index.html               Projects overview
  project-1/index.html      Placeholder project page
  project-2/index.html      Placeholder project page
  project-3/index.html      Placeholder project page

scss/
  main.scss                 Entry point — imports variables, bootstrap, then custom partials
  _variables.scss            Override bootstrap variables here BEFORE bootstrap loads
  _custom.scss                Site-wide custom styles
  _home.scss, _projects.scss, _work.scss, _gallery.scss   Empty per-page partials

css/main.css               Compiled output (generated, don't hand-edit)

src/
  main.ts                    TypeScript source — edit this, not js/main.js

js/
  main.js                    Compiled output of src/main.ts (generated, don't hand-edit)
  vendor/bootstrap.bundle.min.js

components/
  navbar.html, footer.html   Shared nav/footer, injected into every page by main.js

assets/                     Images, fonts, favicon.ico, etc.

robots.txt                  Crawler rules — points to sitemap.xml
sitemap.xml                 Page list for search engines (URLs are placeholders —
                             update once the final domain/GitHub Pages URL is set)
```

## Adding more project pages

Copy `projects/project-1/` to `projects/project-4/` etc, and add a link to it
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

## Editing scripts (TypeScript)

1. Edit `src/main.ts` (not `js/main.js` — that file is generated).
2. Compile it:
   ```
   npm run build:ts
   ```
   or, while actively working:
   ```
   npm run watch:ts
   ```
3. `npm run build` runs both the Sass and TypeScript builds together.

The compiled `js/main.js` is committed to the repo (no bundler, no `dist/` folder) so
GitHub Pages can serve it directly — just remember to rebuild before committing
whenever you change `src/main.ts`.

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
