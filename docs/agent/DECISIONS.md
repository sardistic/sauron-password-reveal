# Decisions

## 2026-09-25 — Reset-password mockup becomes a passphrase generator

- The form is now a working generator (passphrase first, random password second) styled as the Doors of Durin. The Eye-of-Sauron cone reveal is kept as the only way to read the secret on screen; `script.js` still owns the Eye and reads `#password`, while the new `generator.js` owns what goes into it. They communicate only through the input's `input` event; generator writes dispatch an untrusted event so hand edits (`isTrusted`) can be told apart.
- Word lists live in `lexicon.js` as plain data. Diacritics are folded at build time unless "keep accents" is on, and the pool is deduplicated after folding so the displayed entropy matches the real unique count.
- Randomness is `crypto.getRandomValues` with rejection sampling. Entropy is computed from the generation recipe, not estimated from the output string.
- Only option choices are persisted (`localStorage`, key `durin-forge-options`); generated secrets are never stored.

## 2026-09-25 — Bigger lexicon, inflected forms, two-scenario crack time

- The lexicon grew from about 1,030 to 4,215 base words. The new lists hold everyday vocabulary associated with the books (landscape, hobbit home life, war, lore and archaic diction, verbs, adjectives, common speech) and more Silmarillion and Appendix names. Tolkien-only lists were too small for strong passphrases at a sensible word count.
- Lists tagged `inflect: 'noun'` or `inflect: 'verb'` get plurals or -s/-ing forms from small rules in `lexicon.js`. Irregular and uncountable nouns are listed explicitly, and ready-made past forms sit in `also` so they are never re-inflected. With the default toggle on, the pool is 5,852 words.
- Strength now shows two offline guess rates (10⁴/s for a well-kept hash, 10¹⁰/s for a fast hash) instead of only the worst case, which made healthy passphrases look fragile.

## 2026-09-26 — 11k-word pool, no rarity credit, Barad-dûr redrawn

- The lexicon now holds 5,939 base words and 11,078 in the default pool (≈13.4 bits per word), which is above the EFF diceware list. This adds about 1,200 verbs, a Things noun list, more adjectives, and hobbit, Rohirrim and Gondor names. Verbs also get -ed forms, except for listed irregular verbs, whose real past forms are in `also`. Doubling follows Tolkien's British spelling.
- Crack time deliberately gives **no** extra credit for the words being unusual. The list is published with the page, and estimates follow Kerckhoffs's principle (the attacker knows the method), as diceware, EFF and the major password managers do. A note under the meter says so.
- Barad-dûr is back, redrawn on the full-screen atmosphere canvas instead of inside the Eye canvas: barbed prongs, a thorned tiered spire (`towerHalf()` gives its profile), rim light, lit window slits, a backlit haze column, and a base that dissolves into smoke. The geometry is built once per session. The Eye's dark halo was shrunk so it doesn't mask the prongs.
