const beamCanvas = document.querySelector('#beamCanvas')
const beamCtx = beamCanvas.getContext('2d')
const atmosphereCanvas = document.querySelector('#atmosphereCanvas')
const atmosphereCtx = atmosphereCanvas.getContext('2d')
const eyeCanvas = document.querySelector('#eyeCanvas')
const eyeCtx = eyeCanvas.getContext('2d')
const eyeButton = document.querySelector('#eyeButton')
const input = document.querySelector('#password')
const display = document.querySelector('#passwordDisplay')
const passwordField = document.querySelector('#passwordField')
const lensTargets = [
  { el: document.querySelector('#title'), map: document.querySelector('#lensTitle feDisplacementMap'), turb: document.querySelector('#lensTitle feTurbulence'), max: 4 },
  { el: document.querySelector('#label'), map: document.querySelector('#lensLabel feDisplacementMap'), turb: document.querySelector('#lensLabel feTurbulence'), max: 6 }
]

const TAU = Math.PI * 2
const HALF_ANGLE = 0.165         // a focused, cinematic searchlight (~9.5°)
const EYE_SIZE = 460             // a distant, scene-sized Eye rather than an icon
const NEAR_DIM_RADIUS = 105      // pointer this close to the eye dims it
const PEEK_RADIUS = 260          // idle eye starts to open when the pointer is this close
const PEEK_MAX = 0.8             // how far it opens before being clicked

let active = false
let spans = []
let dpr = 1
let pointer = { x: innerWidth * 0.3, y: innerHeight * 0.6 }
let target = { ...pointer }
let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
let lastTime = performance.now()
let openedAt = 0
let rays = []
let smoke = []
let embers = []
let peek = 0

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
function lerp(a, b, t) { return a + (b - a) * t }

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2)
  beamCanvas.width = Math.round(innerWidth * dpr)
  beamCanvas.height = Math.round(innerHeight * dpr)
  beamCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  atmosphereCanvas.width = Math.round(innerWidth * dpr)
  atmosphereCanvas.height = Math.round(innerHeight * dpr)
  atmosphereCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  eyeCanvas.width = Math.round(EYE_SIZE * dpr)
  eyeCanvas.height = Math.round(EYE_SIZE * dpr)
  eyeCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function rebuildDisplay() {
  display.replaceChildren()
  spans = Array.from(input.value).map(char => {
    const span = document.createElement('span')
    span.dataset.char = char
    span.textContent = '•'
    display.append(span)
    return span
  })
  fitField()
}

// Passphrases run long. Shrink the type to keep it on one line, and past the
// smallest comfortable size let the Eye's display wrap and the field grow.
function fitField() {
  const avail = (passwordField.clientWidth - 20 - 68) * 0.96   // slack for subpixel rounding
  const n = Math.max(spans.length, 1)
  const advance = 0.625                     // mono glyph + letter-spacing, in em
  let size = Math.min(17, avail / (n * advance))
  let lines = 1
  if (size < 13) {
    size = 13
    lines = Math.ceil((n * advance * size) / avail)
  }
  passwordField.style.setProperty('--pw-size', `${size.toFixed(2)}px`)
  passwordField.style.setProperty('--field-h', `${Math.max(64, Math.ceil(lines * size * 1.45 + 24))}px`)
}

function eyeCenter() {
  const r = eyeButton.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

function beamDirection(eye) {
  const dx = pointer.x - eye.x
  const dy = pointer.y - eye.y
  const dist = Math.hypot(dx, dy)
  if (dist < 1) return { ux: -1, uy: 0.2, dist }
  return { ux: dx / dist, uy: dy / dist, dist }
}

function maskAll() {
  for (const span of spans) {
    span.textContent = '•'
    span.classList.remove('revealed')
  }
}

// A character is revealed only while it sits inside the cone.
function updateReveal(eye, dir) {
  const cosLimit = Math.cos(HALF_ANGLE)
  for (const span of spans) {
    const r = span.getBoundingClientRect()
    const vx = r.left + r.width / 2 - eye.x
    const vy = r.top + r.height / 2 - eye.y
    const d = Math.hypot(vx, vy) || 1
    const along = (vx * dir.ux + vy * dir.uy) / d   // cos(angle to beam axis)
    const inside = along > cosLimit && d > 10
    if (inside !== span.classList.contains('revealed')) {
      span.classList.toggle('revealed', inside)
      span.textContent = inside ? span.dataset.char : '•'
    }
  }
}

// Text the beam crosses gets refracted: displacement scale follows how deep
// inside the cone the element sits.
function updateLens(eye, dir, strength, time) {
  for (const t of lensTargets) {
    const r = t.el.getBoundingClientRect()
    const vx = r.left + r.width / 2 - eye.x
    const vy = r.top + r.height / 2 - eye.y
    const d = Math.hypot(vx, vy) || 1
    const angle = Math.acos(clamp((vx * dir.ux + vy * dir.uy) / d, -1, 1))
    const coverage = clamp((HALF_ANGLE * 1.6 - angle) / (HALF_ANGLE * 0.9), 0, 1)
    const scale = coverage * t.max * strength
    t.map.setAttribute('scale', scale.toFixed(2))
    if (scale > 0.1 && !reducedMotion) {
      t.turb.setAttribute('seed', String(Math.floor(time / 90) % 40))
    }
  }
}

function resetLens() {
  for (const t of lensTargets) t.map.setAttribute('scale', '0')
}

function drawBeam(eye, dir, strength) {
  const ctx = beamCtx
  ctx.clearRect(0, 0, innerWidth, innerHeight)
  if (strength <= 0) return

  const L = Math.hypot(innerWidth, innerHeight) * 1.2
  const cone = (angle, blur, color, offset = 0) => {
    const c = Math.cos(angle), s = Math.sin(angle)
    const ax = dir.ux * c - dir.uy * s, ay = dir.ux * s + dir.uy * c
    const bx = dir.ux * c + dir.uy * s, by = -dir.ux * s + dir.uy * c
    const g = ctx.createLinearGradient(eye.x, eye.y, eye.x + dir.ux * L, eye.y + dir.uy * L)
    g.addColorStop(0, color(0))
    g.addColorStop(0.02, color(1))
    g.addColorStop(0.25, color(0.85))
    g.addColorStop(0.6, color(0.45))
    g.addColorStop(1, color(0))
    ctx.filter = `blur(${blur}px)`
    ctx.fillStyle = g
    ctx.beginPath()
    const ox = -dir.uy * offset, oy = dir.ux * offset
    ctx.moveTo(eye.x + ox, eye.y + oy)
    ctx.lineTo(eye.x + ax * L + ox, eye.y + ay * L + oy)
    ctx.lineTo(eye.x + bx * L + ox, eye.y + by * L + oy)
    ctx.closePath()
    ctx.fill()
  }

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  // Smoke-softened spill, then several imperfect ribbons of light. The tiny
  // offsets keep the beam from reading as a single computer-perfect triangle.
  cone(HALF_ANGLE * 1.55, 52, a => `rgba(128, 116, 101, ${(0.06 * a * strength).toFixed(3)})`)
  cone(HALF_ANGLE, 18, a => `rgba(211, 190, 158, ${(0.15 * a * strength).toFixed(3)})`)
  cone(HALF_ANGLE * 0.78, 12, a => `rgba(255, 194, 125, ${(0.07 * a * a * strength).toFixed(3)})`, -7)
  cone(HALF_ANGLE * 0.66, 10, a => `rgba(224, 211, 190, ${(0.055 * a * strength).toFixed(3)})`, 9)

  const sourceGlow = ctx.createRadialGradient(eye.x, eye.y, 3, eye.x, eye.y, 150)
  sourceGlow.addColorStop(0, `rgba(255, 218, 142, ${0.36 * strength})`)
  sourceGlow.addColorStop(0.28, `rgba(243, 107, 23, ${0.18 * strength})`)
  sourceGlow.addColorStop(1, 'rgba(130, 38, 5, 0)')
  ctx.filter = 'blur(7px)'
  ctx.fillStyle = sourceGlow
  ctx.fillRect(eye.x - 160, eye.y - 160, 320, 320)
  ctx.restore()
}

function buildRays() {
  rays = []
  const count = 230
  for (let i = 0; i < count; i++) {
    rays.push({
      side: Math.random() < 0.5 ? -1 : 1,
      lane: (Math.random() * 2 - 1),
      root: 0.65 + Math.random() * 0.16,
      len: 0.45 + Math.random() * 0.75,
      speed: 1.8 + Math.random() * 4.5,
      phase: Math.random() * TAU,
      width: 1.2 + Math.random() * 3.4,
      wobble: 2 + Math.random() * 7,
      hue: Math.random()
    })
  }
}

function buildAtmosphere() {
  smoke = Array.from({ length: 34 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 90 + Math.random() * 240,
    stretch: 1.2 + Math.random() * 2.8,
    speed: 0.7 + Math.random() * 1.6,
    phase: Math.random() * TAU,
    alpha: 0.018 + Math.random() * 0.04,
    warm: Math.random() < 0.38
  }))
  embers = Array.from({ length: 52 }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: 0.5 + Math.random() * 1.6,
    speed: 6 + Math.random() * 18,
    phase: Math.random() * TAU,
    alpha: 0.15 + Math.random() * 0.55
  }))
}

// Barad-dûr, in units relative to the Eye's centre (1 unit = 1 CSS px at the
// Eye's full size). Built once so the silhouette never shifts between opens.
let tower = null
function buildTower() {
  // Left half of the spire, top to bottom: a narrow neck under the prongs,
  // then ever-larger thorned tiers. The right half mirrors it.
  const edge = [[-66, 64], [-50, 84], [-44, 104]]
  const thorns = []
  let y = 104
  while (y < 2000) {
    const depth = y - 104
    const step = 38 + Math.random() * 26 + depth * 0.02
    const next = towerHalf(depth + step)
    edge.push([-(next - 3), y + step])
    const len = 6 + Math.random() * 8 + depth * 0.012
    thorns.push({ x: -(next - 3), y: y + step, len })
    edge.push([-(next + 5), y + step + 5])
    y += step
  }
  const windows = Array.from({ length: 22 }, () => {
    const wy = 150 + Math.pow(Math.random(), 1.4) * 520
    return { x: (Math.random() * 2 - 1) * towerHalf(wy - 104) * 0.65, y: wy, h: 3 + Math.random() * 4, phase: Math.random() * TAU, a: 0.2 + Math.random() * 0.45 }
  })
  const ridges = [-0.62, -0.34, -0.12, 0.12, 0.34, 0.62]
  tower = { edge, thorns, windows, ridges }
}

// Half-width of the spire `depth` units below its neck: tall and narrow near
// the summit, spreading into a massive base.
function towerHalf(depth) {
  return 44 + depth * 0.075 + Math.pow(depth / 400, 2) * 14
}

// One prong of the crown, as a closed path; `side` is -1 (left) or 1 (right).
function prongPath(ctx, side) {
  const s = side
  ctx.moveTo(40 * s, 60)
  ctx.bezierCurveTo(92 * s, 22, 88 * s, -118, 58 * s, -214)          // inner face, up to the tip
  ctx.bezierCurveTo(80 * s, -168, 96 * s, -120, 102 * s, -88)        // outer edge, top
  ctx.lineTo(112 * s, -96); ctx.lineTo(106 * s, -70)                // barb
  ctx.bezierCurveTo(114 * s, -52, 118 * s, -30, 116 * s, -4)
  ctx.lineTo(128 * s, -10); ctx.lineTo(116 * s, 14)                  // barb
  ctx.bezierCurveTo(110 * s, 34, 90 * s, 54, 66 * s, 64)
  ctx.closePath()
}

function drawTower(ctx, eye, time, strength) {
  if (!tower) buildTower()
  const k = eyeButton.getBoundingClientRect().width / 360
  const bottom = (innerHeight - eye.y) / k + 40
  const t = time / 1000
  ctx.save()
  ctx.translate(eye.x, eye.y)
  ctx.scale(k, k)
  ctx.globalAlpha = strength

  // Silhouette: prongs, crown and spire, filled darker the further from the fire.
  const body = new Path2D()
  const pts = tower.edge.filter(([, py]) => py < bottom + 80)
  body.moveTo(-66, 64)
  for (const [px, py] of pts) body.lineTo(px, py)
  body.lineTo(pts[pts.length - 1][0], bottom + 80)
  body.lineTo(-pts[pts.length - 1][0], bottom + 80)
  for (let i = pts.length - 1; i >= 0; i--) body.lineTo(-pts[i][0], pts[i][1])
  body.lineTo(66, 64)
  body.lineTo(40, 60); body.lineTo(22, 46); body.lineTo(0, 54); body.lineTo(-22, 46); body.lineTo(-40, 60)
  body.closePath()
  for (const th of tower.thorns) {
    if (th.y > bottom + 80) break
    for (const s of [-1, 1]) {
      body.moveTo(th.x * s, th.y - 2)
      body.lineTo((th.x - th.len) * s, th.y - th.len * 1.9)
      body.lineTo((th.x + 2) * s, th.y + 8)
      body.closePath()
    }
  }
  const prongs = new Path2D()
  prongPath(prongs, -1)
  prongPath(prongs, 1)

  const fill = ctx.createRadialGradient(0, 0, 40, 0, 0, 900)
  fill.addColorStop(0, '#1c0a05')
  fill.addColorStop(0.15, '#070506')
  fill.addColorStop(0.4, '#020203')
  fill.addColorStop(1, '#010102')
  ctx.fillStyle = fill
  ctx.fill(body)
  ctx.fill(prongs)

  // Buttress ridges converge on the summit and catch a little firelight.
  ctx.lineWidth = 1
  for (const r of tower.ridges) {
    const g = ctx.createLinearGradient(0, 100, 0, 480)
    g.addColorStop(0, 'rgba(214, 92, 34, 0.24)')
    g.addColorStop(1, 'rgba(214, 92, 34, 0)')
    ctx.strokeStyle = g
    ctx.beginPath()
    ctx.moveTo(r * 36, 100)
    ctx.lineTo(r * towerHalf(800) * 0.85, 900)
    ctx.stroke()
  }

  // Rim light: every edge facing the Eye glows, fading with distance.
  const rim = ctx.createRadialGradient(0, 0, 30, 0, 0, 420)
  rim.addColorStop(0, 'rgba(255, 150, 60, 0.8)')
  rim.addColorStop(0.4, 'rgba(230, 90, 25, 0.25)')
  rim.addColorStop(1, 'rgba(160, 40, 10, 0)')
  ctx.strokeStyle = rim
  ctx.lineWidth = 1.3
  ctx.stroke(body)
  ctx.stroke(prongs)

  // The prongs' inner faces take the full heat of the fire.
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.shadowColor = 'rgba(255, 90, 20, 0.9)'
  ctx.shadowBlur = 14
  ctx.lineWidth = 2.2
  const flick = reducedMotion ? 1 : 0.85 + Math.sin(t * 3.1) * 0.08 + Math.sin(t * 7.3) * 0.05
  for (const s of [-1, 1]) {
    const face = ctx.createLinearGradient(0, 60, 0, -214)
    face.addColorStop(0, `rgba(255, 170, 80, ${0.75 * flick})`)
    face.addColorStop(0.5, `rgba(255, 110, 30, ${0.55 * flick})`)
    face.addColorStop(1, 'rgba(200, 50, 10, 0.05)')
    ctx.strokeStyle = face
    ctx.beginPath()
    ctx.moveTo(40 * s, 60)
    ctx.bezierCurveTo(92 * s, 22, 88 * s, -118, 58 * s, -214)
    ctx.stroke()
  }
  ctx.restore()

  // Lit slits in the tower's face.
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.shadowColor = 'rgba(255, 80, 10, 0.8)'
  ctx.shadowBlur = 6
  for (const w of tower.windows) {
    if (w.y > bottom) continue
    const a = w.a * (reducedMotion ? 1 : 0.7 + 0.3 * Math.sin(t * 0.9 + w.phase))
    ctx.fillStyle = `rgba(255, 128, 40, ${a})`
    ctx.fillRect(w.x - 0.8, w.y, 1.6, w.h)
  }
  ctx.restore()
  ctx.restore()

  // Sink the base into the haze instead of ending on a hard edge.
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  const fadeTop = eye.y + 260 * k
  const fade = ctx.createLinearGradient(0, fadeTop, 0, innerHeight)
  fade.addColorStop(0, 'rgba(0, 0, 0, 0)')
  fade.addColorStop(1, 'rgba(0, 0, 0, 0.82)')
  ctx.fillStyle = fade
  ctx.fillRect(0, fadeTop, innerWidth, innerHeight - fadeTop)
  ctx.restore()
}

function drawAtmosphere(time, eye, strength) {
  const ctx = atmosphereCtx
  const t = time / 1000
  ctx.clearRect(0, 0, innerWidth, innerHeight)
  if (strength <= 0.005) return

  drawTower(ctx, eye, time, strength)

  // Deep orange bloom in the cloud bank behind the Eye (and behind the tower).
  ctx.save()
  ctx.globalCompositeOperation = 'destination-over'
  const bloom = ctx.createRadialGradient(eye.x, eye.y, 25, eye.x, eye.y, Math.min(innerWidth, innerHeight) * 0.42)
  bloom.addColorStop(0, `rgba(184, 58, 12, ${0.22 * strength})`)
  bloom.addColorStop(0.24, `rgba(93, 35, 17, ${0.13 * strength})`)
  bloom.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = bloom
  ctx.fillRect(0, 0, innerWidth, innerHeight)
  // Fire-lit haze in a column behind the tower, so its black mass reads.
  const k = eyeButton.getBoundingClientRect().width / 360
  ctx.save()
  ctx.translate(eye.x, eye.y + 260 * k)
  ctx.scale(1, 2.1)
  const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, 330 * k)
  haze.addColorStop(0, `rgba(120, 44, 14, ${0.2 * strength})`)
  haze.addColorStop(0.5, `rgba(70, 28, 12, ${0.1 * strength})`)
  haze.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = haze
  ctx.fillRect(-340 * k, -340 * k, 680 * k, 680 * k)
  ctx.restore()
  ctx.restore()

  ctx.save()
  ctx.filter = 'blur(32px)'
  for (const p of smoke) {
    const drift = Math.sin(t * p.speed * 0.12 + p.phase) * 80
    const rise = Math.cos(t * p.speed * 0.08 + p.phase) * 34
    const x = p.x * (innerWidth + 300) - 150 + drift
    const y = p.y * innerHeight + rise
    const g = ctx.createRadialGradient(x, y, 0, x, y, p.radius)
    const a = p.alpha * strength
    g.addColorStop(0, p.warm ? `rgba(102, 61, 42, ${a})` : `rgba(95, 100, 104, ${a})`)
    g.addColorStop(0.55, p.warm ? `rgba(54, 34, 27, ${a * 0.55})` : `rgba(50, 54, 58, ${a * 0.5})`)
    g.addColorStop(1, 'rgba(5, 6, 8, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, p.radius * p.stretch, p.radius, 0, 0, TAU)
    ctx.fill()
  }
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (const p of embers) {
    const y = ((p.y * innerHeight - t * p.speed) % (innerHeight + 30) + innerHeight + 30) % (innerHeight + 30) - 15
    const x = p.x * innerWidth + Math.sin(t * 0.7 + p.phase) * 18
    const proximity = clamp(1 - Math.hypot(x - eye.x, y - eye.y) / (innerWidth * 0.65), 0, 1)
    ctx.globalAlpha = p.alpha * proximity * strength
    ctx.fillStyle = '#f59a45'
    ctx.shadowColor = '#d84a10'
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.arc(x, y, p.size, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

function drawEye(time, dir, brightness) {
  const ctx = eyeCtx
  const s = EYE_SIZE
  ctx.clearRect(0, 0, s, s)
  ctx.save()
  ctx.translate(s / 2, s / 2)

  const t = time / 1000
  const flicker = reducedMotion ? 0 : 1
  const rx = 76, ry = 30   // broad, ragged furnace surrounding the slit

  // dark halo so the eye sits in the smoke
  // (kept tight so it doesn't blot out the tower's prongs behind it)
  const halo = ctx.createRadialGradient(0, 0, 18, 0, 0, 96)
  halo.addColorStop(0, `rgba(6, 4, 3, ${0.85 * brightness})`)
  halo.addColorStop(0.6, `rgba(6, 4, 3, ${0.4 * brightness})`)
  halo.addColorStop(1, 'rgba(6, 4, 3, 0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.ellipse(0, 0, 100, 70, 0, 0, TAU)
  ctx.fill()

  // Flames peel upward and downward from the eye's almond envelope. This
  // vertical flow is the strongest visual signature of the film shot.
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  ctx.filter = 'blur(1.6px)'
  ctx.shadowColor = 'rgba(255, 72, 8, 0.65)'
  ctx.shadowBlur = 9
  for (const r of rays) {
    const pulse = 0.5 + 0.5 * Math.sin(t * r.speed + r.phase) * flicker
    const x = r.lane * rx
    const edge = ry * Math.sqrt(Math.max(0, 1 - (x * x) / (rx * rx)))
    const sy = r.side * edge * r.root
    const reach = (22 + r.len * 78) * (0.55 + pulse * 0.75)
    const sx = x, ex = x * 0.65 + Math.sin(t * r.wobble + r.phase) * 25 * flicker
    const ey = sy + r.side * reach
    const bend = Math.sin(t * (r.wobble * 0.7) + r.phase) * 21 * flicker
    const mx = (sx + ex) / 2 + bend, my = sy + r.side * reach * 0.42
    const g = ctx.createLinearGradient(sx, sy, ex, ey)
    const alpha = (0.18 + pulse * 0.48) * brightness
    const mid = r.hue < 0.58 ? `rgba(255, 119, 23, ${alpha * 0.88})` : `rgba(255, 190, 63, ${alpha * 0.82})`
    g.addColorStop(0, `rgba(255, 225, 132, ${alpha})`)
    g.addColorStop(0.35, mid)
    g.addColorStop(1, 'rgba(170, 29, 0, 0)')
    ctx.strokeStyle = g
    ctx.lineWidth = r.width
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(mx, my, ex, ey)
    ctx.stroke()
  }
  ctx.filter = 'none'
  ctx.shadowBlur = 0

  // glow behind the almond
  const glow = ctx.createRadialGradient(0, 0, 6, 0, 0, 104)
  glow.addColorStop(0, `rgba(255, 190, 90, ${0.55 * brightness})`)
  glow.addColorStop(0.5, `rgba(255, 110, 20, ${0.25 * brightness})`)
  glow.addColorStop(1, 'rgba(255, 80, 0, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.ellipse(0, 0, 116, 72, 0, 0, TAU)
  ctx.fill()

  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = brightness

  const gazeX = clamp(dir.ux * 3.5, -3.5, 3.5)
  const gazeY = clamp(dir.uy * 2, -2, 2)
  const almondPath = () => {
    ctx.beginPath()
    ctx.moveTo(-rx, 0)
    ctx.quadraticCurveTo(0, -ry * 1.75, rx, 0)
    ctx.quadraticCurveTo(0, ry * 1.75, -rx, 0)
    ctx.closePath()
  }

  // The sclera is a moving furnace: deep edges, hot core, and irregular
  // horizontal currents clipped inside the almond.
  const body = ctx.createLinearGradient(-rx, -ry, rx, ry)
  body.addColorStop(0, '#180100')
  body.addColorStop(0.14, '#6e1002')
  body.addColorStop(0.34, '#e24c08')
  body.addColorStop(0.5, '#ffb52d')
  body.addColorStop(0.66, '#dd4005')
  body.addColorStop(0.87, '#5d0b01')
  body.addColorStop(1, '#130100')
  ctx.fillStyle = body
  almondPath()
  ctx.fill()

  ctx.save()
  almondPath()
  ctx.clip()
  ctx.globalCompositeOperation = 'screen'
  ctx.lineCap = 'round'
  for (let i = 0; i < 21; i++) {
    const fy = -24 + i * 2.5
    const wave = Math.sin(t * (1.1 + (i % 4) * 0.18) + i * 1.73) * 8 * flicker
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(255, 226, 126, 0.25)' : 'rgba(255, 103, 13, 0.18)'
    ctx.lineWidth = i % 4 === 0 ? 2.4 : 1.15
    ctx.beginPath()
    ctx.moveTo(-72, fy + wave * 0.15)
    ctx.bezierCurveTo(-35, fy + wave, 20, fy - wave * 0.6, 72, fy + wave * 0.2)
    ctx.stroke()
  }
  ctx.restore()

  // A scorched, irregular lid gives the eye weight and removes the clean
  // vector edge. The gaze itself shifts only slightly inside that fixed fire.
  ctx.save()
  almondPath()
  ctx.strokeStyle = 'rgba(31, 2, 0, 0.56)'
  ctx.lineWidth = 2.2
  ctx.shadowColor = 'rgba(255, 63, 5, 0.48)'
  ctx.shadowBlur = 12
  ctx.stroke()
  ctx.restore()

  const iris = ctx.createRadialGradient(gazeX, gazeY, 0, gazeX, gazeY, 48)
  iris.addColorStop(0, 'rgba(255, 226, 132, 0.66)')
  iris.addColorStop(0.55, 'rgba(255, 126, 24, 0.42)')
  iris.addColorStop(1, 'rgba(255, 90, 0, 0)')
  ctx.fillStyle = iris
  ctx.beginPath()
  ctx.ellipse(gazeX, gazeY, 43, 21, 0, 0, TAU)
  ctx.fill()

  // slit pupil
  const pw = 6.4 + Math.sin(t * 1.7) * 0.7 * flicker
  ctx.fillStyle = '#010000'
  ctx.shadowColor = 'rgba(15, 0, 0, 0.96)'
  ctx.shadowBlur = 9
  ctx.beginPath()
  ctx.ellipse(gazeX, gazeY, pw, ry * 1.45, 0, 0, TAU)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = 'rgba(103, 23, 3, 0.92)'
  ctx.lineWidth = 1.4
  ctx.stroke()

  ctx.restore()
}

// Closed eye with lashes; `o` (0..1) lifts the upper lid so it peeks.
function drawIdleEye(o, time) {
  const ctx = eyeCtx
  const s = EYE_SIZE
  ctx.clearRect(0, 0, s, s)
  ctx.save()
  ctx.translate(s / 2, s / 2)

  const hw = 9.5                       // half-width of the eye
  const lowerC = 5                     // lower-lid control point (bows down)
  const upperC = lowerC - 12.5 * o     // upper lid lifts from the lower lid
  const grey = 'rgba(160, 162, 172, 0.95)'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (o > 0.02) {
    // ember showing between the lids
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(-hw, 0)
    ctx.quadraticCurveTo(0, upperC, hw, 0)
    ctx.quadraticCurveTo(0, lowerC, -hw, 0)
    ctx.closePath()
    ctx.clip()
    const t = time / 1000
    const glow = ctx.createRadialGradient(0, 1, 0, 0, 1, 10)
    glow.addColorStop(0, `rgba(255, 232, 150, ${0.95 * o})`)
    glow.addColorStop(0.55, `rgba(255, 140, 30, ${0.9 * o})`)
    glow.addColorStop(1, `rgba(120, 30, 5, ${0.9 * o})`)
    ctx.fillStyle = glow
    ctx.fillRect(-hw, -8, hw * 2, 16)
    ctx.fillStyle = '#0a0301'
    ctx.beginPath()
    ctx.ellipse(0, 1, 1.1 + Math.sin(t * 2) * 0.15, 4.5, 0, 0, TAU)
    ctx.fill()
    ctx.restore()
    // leak of light around the slit
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const leak = ctx.createRadialGradient(0, 1, 2, 0, 1, 26)
    leak.addColorStop(0, `rgba(255, 150, 50, ${0.35 * o})`)
    leak.addColorStop(1, 'rgba(255, 100, 20, 0)')
    ctx.fillStyle = leak
    ctx.beginPath()
    ctx.ellipse(0, 1, 26, 16, 0, 0, TAU)
    ctx.fill()
    ctx.restore()
  }

  // lids
  ctx.strokeStyle = grey
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(-hw, 0)
  ctx.quadraticCurveTo(0, lowerC, hw, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-hw, 0)
  ctx.quadraticCurveTo(0, upperC, hw, 0)
  ctx.stroke()

  // lashes fade as the eye opens
  ctx.globalAlpha = clamp(1 - o * 1.6, 0, 1)
  ctx.lineWidth = 1.5
  const lashes = [[-0.9, -1.2], [-0.5, -0.45], [0, 0], [0.5, 0.45], [0.9, 1.2]]
  for (const [fx, spread] of lashes) {
    const x = fx * hw
    const y = lowerC * (1 - fx * fx) * 0.5 + 0.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + spread * 1.6, y + 3.2)
    ctx.stroke()
  }
  ctx.restore()
}

function setActive(next) {
  active = next
  document.body.classList.toggle('watching', active)
  // A transformed/backdrop-filtered form becomes a containing block for fixed
  // descendants. Move the awake Eye to the body so it truly lives in the scene.
  if (active) document.body.append(eyeButton)
  else passwordField.append(eyeButton)
  eyeButton.setAttribute('aria-pressed', String(active))
  eyeButton.setAttribute('aria-label', active ? 'Close the eye' : 'Reveal password')
  if (active) {
    openedAt = performance.now()
    buildRays()
  } else {
    maskAll()
    resetLens()
    beamCtx.clearRect(0, 0, innerWidth, innerHeight)
    atmosphereCtx.clearRect(0, 0, innerWidth, innerHeight)
  }
  input.focus({ preventScroll: true })
}

function frame(time) {
  const dt = Math.min((time - lastTime) / 16.667, 4)
  lastTime = time
  const k = reducedMotion ? 1 : 1 - Math.pow(0.78, dt)
  pointer.x = lerp(pointer.x, target.x, k)
  pointer.y = lerp(pointer.y, target.y, k)

  if (active) {
    const eye = eyeCenter()
    const dir = beamDirection(eye)
    const openness = reducedMotion ? 1 : clamp((time - openedAt) / 450, 0, 1)
    // the beam dies off when the pointer is right on top of the eye
    const near = clamp((dir.dist - 20) / NEAR_DIM_RADIUS, 0, 1)
    const strength = openness * near
    drawAtmosphere(time, eye, openness)
    drawBeam(eye, dir, strength)
    drawEye(time, dir, 0.35 + 0.65 * near)
    if (strength > 0.05) {
      updateReveal(eye, dir)
      updateLens(eye, dir, strength, time)
    } else {
      maskAll()
      resetLens()
    }
  } else {
    const eye = eyeCenter()
    const d = Math.hypot(pointer.x - eye.x, pointer.y - eye.y)
    const want = clamp(1 - d / PEEK_RADIUS, 0, 1)
    const eased = want * want * (3 - 2 * want) * PEEK_MAX
    peek = reducedMotion ? eased : lerp(peek, eased, 1 - Math.pow(0.85, dt))
    drawIdleEye(peek, time)
  }
  requestAnimationFrame(frame)
}

addEventListener('pointermove', e => { target.x = e.clientX; target.y = e.clientY })
eyeButton.addEventListener('click', () => setActive(!active))
input.addEventListener('input', rebuildDisplay)
addEventListener('keydown', e => { if (e.key === 'Escape' && active) setActive(false) })
addEventListener('resize', () => { resize(); fitField() })
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { reducedMotion = e.matches })

resize()
rebuildDisplay()
buildRays()
buildAtmosphere()
input.focus({ preventScroll: true })
requestAnimationFrame(frame)
