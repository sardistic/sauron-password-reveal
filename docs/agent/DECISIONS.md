# Decisions

## 2026-09-25 — Reset-password mockup becomes a passphrase generator

- The form is now a working generator (passphrase first, random password second) styled as the Doors of Durin. The Eye-of-Sauron cone reveal is kept as the only way to read the secret on screen; `script.js` still owns the Eye and reads `#password`, while the new `generator.js` owns what goes into it. They communicate only through the input's `input` event; generator writes dispatch an untrusted event so hand edits (`isTrusted`) can be told apart.
- Word lists live in `lexicon.js` as plain data. Diacritics are folded at build time unless "keep accents" is on, and the pool is deduplicated after folding so the displayed entropy matches the real unique count.
- Randomness is `crypto.getRandomValues` with rejection sampling. Entropy is computed from the generation recipe, not estimated from the output string.
- Only option choices are persisted (`localStorage`, key `durin-forge-options`); generated secrets are never stored.
