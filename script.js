const beamCanvas = document.querySelector('#beamCanvas')
const beamCtx = beamCanvas.getContext('2d')
const eyeCanvas = document.querySelector('#eyeCanvas')
const eyeCtx = eyeCanvas.getContext('2d')
const eyeButton = document.querySelector('#eyeButton')
const input = document.querySelector('#password')
const display = document.querySelector('#passwordDisplay')
const lensTargets = [
  { el: document.querySelector('#title'), map: document.querySelector('#lensTitle feDisplacementMap'), turb: document.querySelector('#lensTitle feTurbulence'), max: 10 },
  { el: document.querySelector('#label'), map: document.querySelector('#lensLabel feDisplacementMap'), turb: document.querySelector('#lensLabel feTurbulence'), max: 16 }
]

const TAU = Math.PI * 2
const HALF_ANGLE = 0.19          // cone half-angle in radians (~11°)
const EYE_SIZE = 200             // CSS px of the eye canvas
const NEAR_DIM_RADIUS = 90       // pointer this close to the eye dims it
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
let peek = 0

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
function lerp(a, b, t) { return a + (b - a) * t }

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2)
  beamCanvas.width = Math.round(innerWidth * dpr)
  beamCanvas.height = Math.round(innerHeight * dpr)
  beamCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
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
  const cone = (angle, blur, color) => {
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
    ctx.moveTo(eye.x, eye.y)
    ctx.lineTo(eye.x + ax * L, eye.y + ay * L)
    ctx.lineTo(eye.x + bx * L, eye.y + by * L)
    ctx.closePath()
    ctx.fill()
  }

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  // wide soft haze
  cone(HALF_ANGLE * 1.35, 40, a => `rgba(150, 140, 125, ${(0.10 * a * strength).toFixed(3)})`)
  // main cone
  cone(HALF_ANGLE, 14, a => `rgba(200, 190, 172, ${(0.24 * a * strength).toFixed(3)})`)
  // hot core near the eye
  cone(HALF_ANGLE * 0.6, 8, a => `rgba(255, 200, 150, ${(0.10 * a * a * strength).toFixed(3)})`)
  ctx.restore()
}

function buildRays() {
  rays = []
  const count = 110
  for (let i = 0; i < count; i++) {
    rays.push({
      angle: (i / count) * TAU + (Math.random() - 0.5) * 0.08,
      len: 0.55 + Math.random() * 0.45,
      speed: 3 + Math.random() * 6,
      phase: Math.random() * TAU,
      width: 0.6 + Math.random() * 1.8,
      wobble: 4 + Math.random() * 10,
      hue: Math.random()
    })
  }
}

function drawEye(time, dir, brightness) {
  const ctx = eyeCtx
  const s = EYE_SIZE
  ctx.clearRect(0, 0, s, s)
  ctx.save()
  ctx.translate(s / 2, s / 2)

  const t = time / 1000
  const flicker = reducedMotion ? 0 : 1
  const rx = 26, ry = 12   // almond half-axes

  // the spire: a dark tapered tower from the field corner up to the eye
  const spire = ctx.createLinearGradient(0, 0, 0, s / 2)
  spire.addColorStop(0, `rgba(30, 14, 8, ${0.95 * brightness})`)
  spire.addColorStop(1, `rgba(8, 6, 6, ${0.95 * brightness})`)
  ctx.fillStyle = spire
  ctx.beginPath()
  ctx.moveTo(-3, 6)
  ctx.lineTo(3, 6)
  ctx.lineTo(9, s / 2)
  ctx.lineTo(-9, s / 2)
  ctx.closePath()
  ctx.fill()
  const rim = ctx.createLinearGradient(0, 6, 0, s / 2)
  rim.addColorStop(0, `rgba(255, 150, 60, ${0.55 * brightness})`)
  rim.addColorStop(1, 'rgba(255, 120, 40, 0)')
  ctx.strokeStyle = rim
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(-3, 6); ctx.lineTo(-9, s / 2)
  ctx.moveTo(3, 6); ctx.lineTo(9, s / 2)
  ctx.stroke()

  // dark halo so the eye sits in front of the field corner
  const halo = ctx.createRadialGradient(0, 0, 10, 0, 0, 54)
  halo.addColorStop(0, `rgba(6, 4, 3, ${0.9 * brightness})`)
  halo.addColorStop(0.6, `rgba(6, 4, 3, ${0.55 * brightness})`)
  halo.addColorStop(1, 'rgba(6, 4, 3, 0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.ellipse(0, 0, 60, 44, 0, 0, TAU)
  ctx.fill()

  // flames: additive rays radiating from the almond edge
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  for (const r of rays) {
    const pulse = 0.5 + 0.5 * Math.sin(t * r.speed + r.phase) * flicker
    const jitter = flicker ? Math.sin(t * 17 + r.phase * 3) * 0.04 : 0
    const a = r.angle + jitter
    const ca = Math.cos(a), sa = Math.sin(a)
    // start on the almond edge, reach outward; flames lean slightly toward the beam
    const lean = 0.35 * (ca * dir.ux + sa * dir.uy)
    const reach = (6 + r.len * 20 * (0.5 + pulse * 0.9)) * (1 + lean)
    const sx = ca * rx * 0.9, sy = sa * ry * 0.9
    const ex = ca * (rx + reach), ey = sa * (ry + reach * 0.7)
    // bend each tongue sideways so the outline flickers instead of spoking
    const bend = Math.sin(t * r.wobble + r.phase) * reach * 0.35 * flicker
    const mx = (sx + ex) / 2 - sa * bend, my = (sy + ey) / 2 + ca * bend
    const g = ctx.createLinearGradient(sx, sy, ex, ey)
    const alpha = (0.35 + pulse * 0.45) * brightness
    const mid = r.hue < 0.5 ? `rgba(255, 150, 40, ${alpha * 0.8})` : `rgba(255, 190, 70, ${alpha * 0.8})`
    g.addColorStop(0, `rgba(255, 236, 170, ${alpha})`)
    g.addColorStop(0.35, mid)
    g.addColorStop(1, 'rgba(200, 50, 0, 0)')
    ctx.strokeStyle = g
    ctx.lineWidth = r.width
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(mx, my, ex, ey)
    ctx.stroke()
  }

  // glow behind the almond
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 40)
  glow.addColorStop(0, `rgba(255, 190, 90, ${0.55 * brightness})`)
  glow.addColorStop(0.5, `rgba(255, 110, 20, ${0.25 * brightness})`)
  glow.addColorStop(1, 'rgba(255, 80, 0, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.ellipse(0, 0, 46, 30, 0, 0, TAU)
  ctx.fill()

  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = brightness

  // almond body
  const body = ctx.createLinearGradient(-rx, 0, rx, 0)
  body.addColorStop(0, '#4a1204')
  body.addColorStop(0.2, '#f07a1c')
  body.addColorStop(0.5, '#ffe9a6')
  body.addColorStop(0.8, '#f07a1c')
  body.addColorStop(1, '#4a1204')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.moveTo(-rx, 0)
  ctx.quadraticCurveTo(0, -ry * 1.7, rx, 0)
  ctx.quadraticCurveTo(0, ry * 1.7, -rx, 0)
  ctx.closePath()
  ctx.fill()

  // iris haze
  const iris = ctx.createRadialGradient(0, 0, 0, 0, 0, 22)
  iris.addColorStop(0, 'rgba(255, 245, 200, 0.9)')
  iris.addColorStop(0.6, 'rgba(255, 150, 40, 0.5)')
  iris.addColorStop(1, 'rgba(255, 90, 0, 0)')
  ctx.fillStyle = iris
  ctx.beginPath()
  ctx.ellipse(0, 0, 18, 9, 0, 0, TAU)
  ctx.fill()

  // slit pupil
  const pw = 2.6 + Math.sin(t * 1.7) * 0.4 * flicker
  ctx.fillStyle = '#0a0301'
  ctx.beginPath()
  ctx.ellipse(0, 0, pw, ry * 0.95, 0, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 220, 120, 0.7)'
  ctx.lineWidth = 0.8
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
  eyeButton.setAttribute('aria-pressed', String(active))
  eyeButton.setAttribute('aria-label', active ? 'Close the eye' : 'Reveal password')
  if (active) {
    openedAt = performance.now()
    buildRays()
  } else {
    maskAll()
    resetLens()
    beamCtx.clearRect(0, 0, innerWidth, innerHeight)
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
addEventListener('resize', resize)
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { reducedMotion = e.matches })

resize()
rebuildDisplay()
buildRays()
input.focus({ preventScroll: true })
requestAnimationFrame(frame)
