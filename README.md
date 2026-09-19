# Dipal Kumar Shrestha — Portfolio

Static site. No build step, no dependencies.

## Files

    index.html    Markup and content
    styles.css    All styles (design tokens are the CSS variables in :root)
    main.js       Clock, scroll tracking, copy button, hero mesh animation

## Run locally

Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000

Then visit http://localhost:8000

## Deploy

Upload all three files to any static host (GitHub Pages, Netlify, Vercel,
Cloudflare Pages). Keep them in the same folder — `index.html` links to
`styles.css` and `main.js` by relative path.

For GitHub Pages: push to a repo, then Settings → Pages → deploy from the
branch root.

## Editing

**Colours and type.** Every colour, font, radius and spacing value is a CSS
variable at the top of `styles.css`, under `:root`. Change `--cyan` there and
the whole accent changes.

**Content.** All text is in `index.html`. Sections are marked with comments:
`00 // HERO`, `01 // WORK`, `02 // PROFILE`, `03 // LOG`, `04 // STACK`,
`05 // CONTACT`.

**Project links.** The project cards have no outgoing links yet. To add one,
wrap a card's `<h3>` text in an anchor:

    <h3><a href="https://github.com/deepalsr/your-repo">Timur RMS</a></h3>

**Fonts.** Space Grotesk, Inter and JetBrains Mono load from Google Fonts, so
the page needs a connection to render as designed. It falls back to system
fonts offline.

## Notes

- Responsive from 320px up; checked at 320, 390, 820 and 1440px.
- Respects `prefers-reduced-motion` — the hero mesh renders as a static frame.
- The hero mesh pauses when scrolled out of view or the tab is hidden.
- The hero clock shows real Asia/Kathmandu time.
