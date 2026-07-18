# UCN ID Card Generator

A client-side tool for generating United Confederation Navy ID cards (fan-made,
not affiliated with Bridge Command / The London Space Elevator Limited).

Runs entirely in the browser — nothing typed or uploaded here is sent anywhere.


## Structure

```
index.html          the page itself
css/style.css        all styling
js/app.js            the app: form handling, live preview, PDF generation
js/vendor/           third-party libraries (jsPDF)
fonts/               Exo 2 + Orbitron .ttf files, embedded into generated PDFs
assets/              logo, watermark, and clearance-level background images
```

## Editing

- Colours, layout, fonts: `css/style.css`
- Form fields, live preview syncing, PDF drawing logic: `js/app.js`
- To change which fonts get embedded in the PDF, see `registerFonts()` in
  `js/app.js` — add/replace files in `fonts/` and update the list there.
