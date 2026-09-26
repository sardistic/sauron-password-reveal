// Passphrase / password generation for the Doors of Durin panel. The Eye in
// script.js only reads `#password`; this file owns what goes into it.
(() => {
  const $ = sel => document.querySelector(sel)
  const field = $('#password')
  const door = $('#door')
  const title = $('#title')
  const label = $('#label')
  const status = $('#status')
  const els = {
    wordCount: $('#wordCount'), wordCountOut: $('#wordCountOut'),
    separator: $('#separator'), caseMode: $('#caseMode'),
    addDigit: $('#addDigit'), keepAccents: $('#keepAccents'), forms: $('#forms'),
    lexicon: $('#lexicon'), pool: $('#pool'),
    length: $('#length'), lengthOut: $('#lengthOut'),
    charsets: $('#charsets'), noAmbiguous: $('#noAmbiguous'),
    phraseOptions: $('#phraseOptions'), passwordOptions: $('#passwordOptions'),
    meterFill: $('#meterFill'), tier: $('#tier'), bits: $('#bits'),
    crackSlow: $('#crackSlow'), crackFast: $('#crackFast')
  }

  const CHARSETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbols: '!@#$%^&*-_=+?~'
  }
  const AMBIGUOUS = /[Il1O0o]/g
  // Offline attacks on a stolen hash. A properly stored password (bcrypt,
  // scrypt, argon2) holds a GPU rig to roughly 10^4 guesses a second; a fast
  // unsalted hash (MD5, SHA-1, NTLM) lets it try around 10^10.
  const SLOW_HASH_RATE = 1e4
  const FAST_HASH_RATE = 1e10

  const TIERS = [
    [0, 'Fool of a Took!'],
    [30, 'A hobbit-hole latch'],
    [45, 'The gates of Bree'],
    [60, 'Walls of the Hornburg'],
    [75, 'The Doors of Durin'],
    [90, 'Coat of mithril'],
    [110, 'You shall not pass']
  ]

  const defaults = {
    mode: 'phrase',
    words: 6, separator: '-', caseMode: 'title', addDigit: true, keepAccents: false, forms: true,
    lexicon: Object.fromEntries(LEXICON.map(l => [l.id, l.on])),
    length: 24, sets: { upper: true, lower: true, digits: true, symbols: true }, noAmbiguous: true
  }
  const STORE_KEY = 'durin-forge-options'
  let opts = structuredClone(defaults)
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null')
    if (saved) opts = { ...opts, ...saved, lexicon: { ...opts.lexicon, ...saved.lexicon }, sets: { ...opts.sets, ...saved.sets } }
  } catch {}
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(opts)) } catch {} }

  // Uniform integer in [0, n) from the CSPRNG, with rejection sampling so no
  // value is favoured by modulo bias.
  const buf = new Uint32Array(1)
  function randomInt(n) {
    const limit = Math.floor(0x100000000 / n) * n
    let x
    do { crypto.getRandomValues(buf); x = buf[0] } while (x >= limit)
    return x % n
  }
  const pick = arr => arr[randomInt(arr.length)]

  const fold = w => w.normalize('NFD').replace(/[̀-ͯ]/g, '')

  function buildPool() {
    const set = new Set()
    for (const list of LEXICON) {
      if (!opts.lexicon[list.id]) continue
      const words = opts.forms ? [...list.words, ...list.forms] : list.words
      for (const w of words) set.add(opts.keepAccents ? w : fold(w))
    }
    return [...set]
  }

  function applyCase(w, mode) {
    const title = s => s.charAt(0).toUpperCase() + s.slice(1)
    if (mode === 'upper') return w.toUpperCase()
    if (mode === 'title') return title(w)
    if (mode === 'mixed') return randomInt(2) ? title(w) : w
    return w
  }

  function forgePhrase() {
    const pool = buildPool()
    const n = opts.words
    const words = Array.from({ length: n }, () => applyCase(pick(pool), opts.caseMode))
    let bits = n * Math.log2(pool.length)
    if (opts.caseMode === 'mixed') bits += n
    if (opts.addDigit) {
      words[randomInt(n)] += String(randomInt(10))
      bits += Math.log2(10) + Math.log2(n)
    }
    let text
    if (opts.separator === 'digit') {
      text = words.reduce((acc, w, i) => i ? acc + randomInt(10) + w : w, '')
      bits += (n - 1) * Math.log2(10)
    } else {
      text = words.join(opts.separator)
    }
    return { text, bits }
  }

  function forgePassword() {
    const active = Object.keys(CHARSETS).filter(k => opts.sets[k])
    const classes = active.map(k => opts.noAmbiguous ? CHARSETS[k].replace(AMBIGUOUS, '') : CHARSETS[k])
    const all = classes.join('')
    const L = opts.length
    const chars = Array.from({ length: L }, () => pick(all))
    // Guarantee one of each chosen class, at distinct random positions.
    const slots = Array.from({ length: L }, (_, i) => i)
    for (let i = L - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [slots[i], slots[j]] = [slots[j], slots[i]]
    }
    classes.forEach((cls, i) => { chars[slots[i]] = pick(cls) })
    return { text: chars.join(''), bits: L * Math.log2(all.length) }
  }

  // Expected time to find it: half the keyspace at the given guess rate.
  function formatCrack(bits, rate) {
    const seconds = Math.pow(2, bits - 1) / rate
    if (seconds < 1) return 'an instant'
    const units = [['second', 60], ['minute', 60], ['hour', 24], ['day', 365.25]]
    let v = seconds
    for (const [name, next] of units) {
      if (v < next) return `${Math.round(v)} ${name}${Math.round(v) === 1 ? '' : 's'}`
      v /= next
    }
    const years = v
    if (years < 1000) return `${Math.round(years)} year${Math.round(years) === 1 ? '' : 's'}`
    if (years < 1e15) {
      const span = new Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'long', maximumFractionDigits: 1 }).format(years)
      // The Third Age lasted 3,021 years.
      const ages = years >= 3021 * 3 ? ` (${new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 0 }).format(years / 3021)} Ages)` : ''
      return `${span} years${ages}`
    }
    return `10^${Math.floor(Math.log10(years))} years`
  }

  function showStrength(bits) {
    if (bits == null) {
      els.meterFill.style.width = '0%'
      els.tier.textContent = 'Altered by hand'
      els.bits.textContent = 'strength unknown until forged anew'
      els.crackSlow.textContent = els.crackFast.textContent = '—'
      door.dataset.tier = ''
      return
    }
    let tier = 0
    TIERS.forEach(([min], i) => { if (bits >= min) tier = i })
    els.meterFill.style.width = `${Math.min(100, (bits / 128) * 100)}%`
    els.tier.textContent = TIERS[tier][1]
    els.bits.textContent = `${Math.round(bits)} bits`
    els.crackSlow.textContent = formatCrack(bits, SLOW_HASH_RATE)
    els.crackFast.textContent = formatCrack(bits, FAST_HASH_RATE)
    door.dataset.tier = String(tier)
  }

  let flareTimer = 0
  function flare(cls = 'flare', ms = 900) {
    door.classList.remove('flare', 'mellon')
    void door.offsetWidth
    door.classList.add(cls)
    clearTimeout(flareTimer)
    flareTimer = setTimeout(() => door.classList.remove(cls), ms)
  }

  function forge({ quiet = false } = {}) {
    const { text, bits } = opts.mode === 'phrase' ? forgePhrase() : forgePassword()
    field.value = text
    // Untrusted event: script.js rebuilds the Eye's display, and the
    // hand-edit listener below ignores it.
    field.dispatchEvent(new Event('input'))
    showStrength(bits)
    if (!quiet) flare()
  }

  // ---- controls ----------------------------------------------------------

  function setRadio(group, value) {
    for (const b of group.querySelectorAll('[role="radio"]')) {
      const on = b.dataset.value === value || b.dataset.mode === value
      b.setAttribute('aria-checked', String(on))
      b.tabIndex = on ? 0 : -1
    }
  }

  function wireRadio(group, key) {
    group.addEventListener('click', e => {
      const b = e.target.closest('[role="radio"]')
      if (!b) return
      opts[key] = b.dataset.value ?? b.dataset.mode
      setRadio(group, opts[key])
      changed()
    })
    group.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
      const items = [...group.querySelectorAll('[role="radio"]')]
      const i = items.indexOf(document.activeElement)
      if (i < 0) return
      e.preventDefault()
      const next = items[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length]
      next.focus()
      next.click()
    })
  }

  function renderLexicon() {
    els.lexicon.replaceChildren(...LEXICON.map(list => {
      const b = document.createElement('button')
      b.type = 'button'
      b.dataset.id = list.id
      b.title = list.hint
      b.className = list.id === 'black' ? 'dark-tongue' : ''
      b.innerHTML = `${list.name}<small></small>`
      b.setAttribute('aria-pressed', String(!!opts.lexicon[list.id]))
      return b
    }))
  }

  function renderPool() {
    const n = buildPool().length
    els.pool.textContent = `${n.toLocaleString('en')} unique words · ${Math.log2(n).toFixed(1)} bits each`
    door.classList.toggle('dark-tongue', !!opts.lexicon.black)
  }

  function syncControls() {
    const modeGroup = document.querySelector('.mode')
    setRadio(modeGroup, opts.mode)
    els.phraseOptions.hidden = opts.mode !== 'phrase'
    els.passwordOptions.hidden = opts.mode !== 'password'
    label.textContent = opts.mode === 'phrase' ? 'Passphrase' : 'Password'
    els.wordCount.value = opts.words
    els.wordCountOut.value = opts.words
    setRadio(els.separator, opts.separator)
    setRadio(els.caseMode, opts.caseMode)
    els.addDigit.checked = opts.addDigit
    els.keepAccents.checked = opts.keepAccents
    els.forms.checked = opts.forms
    for (const b of els.lexicon.children) {
      const list = LEXICON.find(l => l.id === b.dataset.id)
      b.setAttribute('aria-pressed', String(!!opts.lexicon[b.dataset.id]))
      b.querySelector('small').textContent = (list.words.length + (opts.forms ? list.forms.length : 0)).toLocaleString('en')
    }
    renderPool()
    els.length.value = opts.length
    els.lengthOut.value = opts.length
    for (const b of els.charsets.children) b.setAttribute('aria-pressed', String(!!opts.sets[b.dataset.set]))
    els.noAmbiguous.checked = opts.noAmbiguous
  }

  function changed() {
    save()
    syncControls()
    forge({ quiet: true })
  }

  wireRadio(document.querySelector('.mode'), 'mode')
  wireRadio(els.separator, 'separator')
  wireRadio(els.caseMode, 'caseMode')

  els.wordCount.addEventListener('input', () => { opts.words = +els.wordCount.value; changed() })
  els.length.addEventListener('input', () => { opts.length = +els.length.value; changed() })
  els.addDigit.addEventListener('change', () => { opts.addDigit = els.addDigit.checked; changed() })
  els.keepAccents.addEventListener('change', () => { opts.keepAccents = els.keepAccents.checked; changed() })
  els.forms.addEventListener('change', () => { opts.forms = els.forms.checked; changed() })
  els.noAmbiguous.addEventListener('change', () => { opts.noAmbiguous = els.noAmbiguous.checked; changed() })

  els.lexicon.addEventListener('click', e => {
    const b = e.target.closest('button')
    if (!b) return
    const next = !opts.lexicon[b.dataset.id]
    // At least one lexicon must stay lit.
    if (!next && Object.values(opts.lexicon).filter(Boolean).length === 1) { flare('refuse', 500); return }
    opts.lexicon[b.dataset.id] = next
    changed()
  })

  els.charsets.addEventListener('click', e => {
    const b = e.target.closest('button')
    if (!b) return
    const next = !opts.sets[b.dataset.set]
    if (!next && Object.values(opts.sets).filter(Boolean).length === 1) { flare('refuse', 500); return }
    opts.sets[b.dataset.set] = next
    changed()
  })

  $('#forge').addEventListener('click', () => forge())

  let statusTimer = 0
  function say(msg) {
    status.textContent = msg
    clearTimeout(statusTimer)
    statusTimer = setTimeout(() => { status.textContent = '' }, 2600)
  }

  $('#copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(field.value)
    } catch {
      const type = field.type
      field.type = 'text'
      field.select()
      document.execCommand('copy')
      field.type = type
      field.setSelectionRange(0, 0)
    }
    say('Spoken. The doors will open.')
    flare()
  })

  // Hand edits: strength can no longer be derived from the recipe.
  field.addEventListener('input', e => {
    if (!e.isTrusted) return
    showStrength(null)
    if (field.value.trim().toLowerCase() === 'mellon') openDoors()
  })

  // Say "mellon" (typed anywhere outside a text field) and the doors answer.
  const originalTitle = title.textContent
  let spoken = ''
  let mellonTimer = 0
  function openDoors() {
    flare('mellon', 3200)
    title.textContent = 'Enter, friend.'
    say('The doors swing open.')
    clearTimeout(mellonTimer)
    mellonTimer = setTimeout(() => { title.textContent = originalTitle }, 3200)
  }
  addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement && e.target.type !== 'checkbox' && e.target.type !== 'range') return
    if (e.key.length !== 1) return
    spoken = (spoken + e.key.toLowerCase()).slice(-6)
    if (spoken === 'mellon') { spoken = ''; openDoors() }
  })

  renderLexicon()
  syncControls()
  forge({ quiet: true })
})()
