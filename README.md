# Speak, friend, and enter

A passphrase generator carved into the Doors of Durin, guarded by the Eye of Sauron. Passphrases are drawn from a Tolkien lexicon. The result stays masked until you wake the Eye: its beam sweeps toward the cursor and reveals only the characters it falls on.

**Demo:** https://sardistic.github.io/sauron-password-reveal/

Inspired by [jhey](https://twitter.com/jh3yy)'s "one does not simply reveal a password" clip.

## Generator

**Passphrase** (the default)
- 3–12 words, chosen uniformly from the selected lexicons using `crypto.getRandomValues` with rejection sampling, so there is no modulo bias.
- Separator: `-` `.` `_` space, or a random digit between each pair of words.
- Case: lower, Title, UPPER, or miXed (each word randomly Title or lower).
- Extras: append a digit to one random word; keep diacritics (`Barad-dûr` → `baraddûr` instead of `baraddur`).
- Lexicons: Folk, Realms, Elvish, Dwarvish, Relics, Peoples, Westron (on by default, about 1,030 unique words, ≈10 bits per word), and Black Speech (off by default).

**Password**
- 8–64 characters from A–Z, a–z, 0–9 and symbols, with at least one character from each chosen set. It can also leave out look-alike characters (`Il1O0o`).

**Strength**: entropy in bits, worked out from how the secret was generated rather than guessed from the text afterwards. The crack time assumes 10¹⁰ guesses per second. The tiers run from *Fool of a Took!* to *You shall not pass*. If you edit the field by hand, it shows the strength as unknown.

Option choices (never the secret) are remembered in `localStorage`.

## The Eye

- Idle: a closed eye in the field. It peeks open as the pointer approaches.
- Click: the Eye rises into a background of smoke, embers and Barad-dûr while a searchlight follows the cursor. Only characters inside the cone are revealed, and long passphrases wrap onto a second line so the beam can still sweep them.
- The pointer on the Eye itself dims the beam. `Esc` closes it. Honours `prefers-reduced-motion`.

## Moria

The panel is shaped as the West-gate: an ithildin arch carrying *Ennyn Durin Aran Moria · pedo mellon a minno*, the crown and seven stars, the hammer and anvil, the Star of Fëanor, and the two trees rising from the pillars. Forging and copying make the ithildin flare. Say the password: type `mellon` anywhere.

## Files

- `index.html`: the door markup, ithildin SVG, controls, and the lens filters
- `styles.css`: stone and ithildin styling, cinematic layers, field, options, responsive layout
- `lexicon.js`: the word lists
- `generator.js`: generation, entropy, options, copy, and the `mellon` easter egg
- `script.js`: the atmosphere, the searchlight, the cone-based reveal, the Eye, and field auto-fit

No build step. Open `index.html` in a browser.
