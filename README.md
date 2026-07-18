# UCN ID Card Generator

A client-side tool for generating United Confederation Navy ID cards (fan-made,
not affiliated with Bridge Command / The London Space Elevator Limited).

Runs entirely in the browser — nothing typed or uploaded here is sent anywhere.

## Deploying

This is a static site — no build step, no server-side code. To deploy on
Netlify:

1. Push this whole folder to a GitHub repo.
2. In Netlify: "Add new site" → "Import an existing project" → pick the repo.
3. Leave the build command blank and set the publish directory to the repo
   root (or wherever `index.html` lives).
4. Deploy. That's it.

You can also just drag-and-drop this folder onto Netlify's dashboard for a
one-off deploy without GitHub at all.

## Structure

```
index.html          the page itself
css/style.css        all styling
js/app.js            the app: form handling, live preview, PDF generation
js/vendor/           third-party libraries (jsPDF)
fonts/               Exo 2 + Orbitron .ttf files, embedded into generated PDFs
assets/              logo, watermark, and clearance-level background images
```

## Important: this needs real hosting, not a downloaded file

`js/app.js` loads the fonts and images via `fetch()` at the moment someone
clicks "Download PDF", so the generated PDF can embed real custom fonts
instead of falling back to a generic one. Browsers block `fetch()` of local
files when a page is opened directly from disk (`file://...`), so this will
only work when served over `http://` or `https://` — i.e. via Netlify, or any
other static host, or a local dev server (`python3 -m http.server`, `npx
serve`, etc.) if you want to test it before deploying.

Two other libraries — JsBarcode and QRCode.js — are still loaded from cdnjs
in `index.html` rather than vendored locally, so an internet connection is
needed for the barcode/QR feature and for the Exo 2 / Orbitron webfonts used
on-screen (Google Fonts). None of this affects the "nothing you type leaves
your device" privacy note — those are just asset downloads, not data uploads.

## Editing

- Colours, layout, fonts: `css/style.css`
- Form fields, live preview syncing, PDF drawing logic: `js/app.js`
- To change which fonts get embedded in the PDF, see `registerFonts()` in
  `js/app.js` — add/replace files in `fonts/` and update the list there.
