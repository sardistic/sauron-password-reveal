# One does not simply reveal a password

A password field guarded by the Eye of Sauron. Click the eye and it rises on its spire above the field; move the pointer and a beam sweeps from the eye toward the cursor, revealing only the characters it falls on.

**Demo:** https://sardistic.github.io/sauron-password-reveal/

Inspired by [jhey](https://twitter.com/jh3yy)'s "one does not simply reveal a password" clip.

## Behaviour

- Idle: a closed eye with lashes. It peeks open as the pointer approaches.
- Click: the eye opens fully, the page dims, and a cone of light points at the cursor.
- Only characters inside the cone are shown; the rest stay masked. Aim from above for a narrow window, along the row for a wider one.
- Text the beam crosses is refracted (SVG displacement filter).
- Moving the pointer onto the eye itself dims the beam. `Esc` closes the eye. Typing still works while it is open.
- Honours `prefers-reduced-motion`.

## Files

- `index.html` – markup and the SVG lens filters
- `styles.css` – layout, dimming, eye placement
- `script.js` – beam, cone-based reveal, flaming eye, peeking idle eye

No build step. Open `index.html` in a browser.
