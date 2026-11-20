// Shared rendering engine for all episodes
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import katex from './node_modules/katex/dist/katex.mjs';
export { THREE };

// ---------------------------------------------------------------- utils
export const W = 1920, H = 1080;
export const MAC = { '\\cL': '\\textcolor{##e9e1d2}{#1}', '\\cS': '\\textcolor{##ff6a1f}{#1}', '\\cJ': '\\textcolor{##ffbf73}{#1}', '\\cM': '\\textcolor{##ff5a6e}{#1}', '\\cB': '\\textcolor{##9fb8ca}{#1}', '\\cG': '\\textcolor{##bfe3cf}{#1}', '\\cO': '\\textcolor{##ff6a1f}{#1}', '\\cP': '\\textcolor{##d9a88f}{#1}', '\\cW': '\\textcolor{##9a9184}{#1}', '\\cE': '\\textcolor{##a9c8dc}{#1}' };
export const T = (s, ...v) => katex.renderToString(String.raw(s, ...v), { throwOnError: false, macros: { ...MAC } });
export const TD = (s, ...v) => katex.renderToString(String.raw(s, ...v), { throwOnError: false, displayMode: false });
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const ep = (t, a, b) => ease(prog(t, a, b));
export const win = (t, a, b, d = 0.8) => Math.max(0, Math.min(ep(t, a, a + d), 1 - ep(t, b - d, b)));
export const rampInt = (t, t0, d, rate) => t < t0 ? 0 : t < t0 + d ? rate * (t - t0) ** 2 / (2 * d) : rate * (t - t0 - d / 2);
export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const UP = V(0, 1, 0);
export const C = { L: 0xe9e1d2, S: 0xff6a1f, J: 0xffbf73, MU: 0xff5a6e, B: 0x7f9fb6, E: 0xa9c8dc, NUC: 0xff7a2e, F: 0xbfe3cf, W: 0xefe8dc, P: 0xd9a88f, O: 0xff6a1f, G: 0x9a9184, LINE: 0xe9e1d2, DIM: 0x6b645a, BG: 0x0a0806 };
export const hex = c => '#' + c.toString(16).padStart(6, '0');
export const gauss = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
// sequential time builder:  const s = new Seq(); const A = s.at(12) -> start, and s.t advances
export class Seq { constructor(t = 0) { this.t = t; } next(d) { const a = this.t; this.t += d; return a; } }

// ---------------------------------------------------------------- renderer
const canvas = document.getElementById('c');
const QP = new URLSearchParams(location.search);
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: !QP.has('noaa'), preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 400);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.AmbientLight(0xd8cbb8, 0.35));
const key = new THREE.DirectionalLight(0xfff1e0, 1.35); key.position.set(5, 9, 7); scene.add(key);
const rim = new THREE.DirectionalLight(0xff7a3a, 1.25); rim.position.set(-7, 2, -6); scene.add(rim);
export function setFog(near, far) { scene.fog = far ? new THREE.Fog(0x0a0806, near, far) : null; }
setFog(22, 70);
{
  const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d');
  g.fillStyle = '#0a0806'; g.fillRect(0, 0, 1920, 1080);
  const blob = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080); };
  blob(980, 470, 1100, 'rgba(46,34,24,0.55)'); blob(1500, 820, 700, 'rgba(70,32,12,0.18)'); blob(300, 200, 700, 'rgba(30,26,22,0.35)');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t;
}
export const glowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,.6)');
  gr.addColorStop(0.5, 'rgba(255,255,255,.14)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
})();
export function glow(color, size, op = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op * 0.45 }));
  s.scale.set(size, size, 1); return s;
}
export function setOp(obj, op) {
  obj.visible = op > 0.004;
  obj.traverse(o => {
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) {
      if (m.userData.base === undefined) m.userData.base = m.opacity;
      m.transparent = true; m.opacity = m.userData.base * op;
      if (m.uniforms && m.uniforms.op) m.uniforms.op.value = op;
    }
  });
}
export function phys(color, em = 0.35, extra = {}) {
  return new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: em * 0.45, metalness: 0.15, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12, transparent: true, ...extra });
}
export function metal(color, extra = {}) {
  return new THREE.MeshPhysicalMaterial({ color, metalness: 0.9, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.2, transparent: true, ...extra });
}
export function fresnel(color, power = 3, k = 0.2) {
  return new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color(color) }, p: { value: power }, k: { value: k }, op: { value: 1 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 c; uniform float p,k,op; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.-abs(dot(normalize(vN),normalize(vV))),p); gl_FragColor = vec4(c*f*k*op, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  });
}
export class Arrow {
  constructor(color, { r = 0.034, hl = 0.34, hr = 0.095, em = 0.45, parent = scene } = {}) {
    this.g = new THREE.Group(); this.mat = phys(color, em); this.hl0 = hl;
    this.shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 20), this.mat);
    this.head = new THREE.Mesh(new THREE.ConeGeometry(hr, hl, 32), this.mat);
    this.g.add(this.shaft, this.head); parent.add(this.g); this.g.visible = false;
  }
  set(from, vec, op = 1) {
    const len = vec.length();
    if (len < 1e-3 || op <= 0.004) { this.g.visible = false; return; }
    this.g.visible = true; this.mat.opacity = op; this.mat.depthWrite = op > 0.95;
    this.g.position.copy(from);
    this.g.quaternion.setFromUnitVectors(UP, vec.clone().normalize());
    const hl = Math.min(this.hl0, len * 0.45), sl = len - hl;
    this.shaft.scale.set(1, Math.max(sl, 1e-3), 1); this.shaft.position.y = sl / 2;
    this.head.scale.set(1, hl / this.hl0, 1); this.head.position.y = sl + hl / 2;
  }
}
export function ringLine(radius, color, { dashed = true, op = 0.7, seg = 160 } = {}) {
  const pts = []; for (let i = 0; i <= seg; i++) { const a = i / seg * Math.PI * 2; pts.push(V(Math.cos(a) * radius, 0, Math.sin(a) * radius)); }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.1, gapSize: 0.07, transparent: true, opacity: op })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity: op });
  const l = new THREE.Line(geo, mat); if (dashed) l.computeLineDistances(); return l;
}
export function polyLine(pts, color, op = 1, dashed = false, dash = 0.07) {
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = dashed ? new THREE.LineDashedMaterial({ color, dashSize: dash, gapSize: dash * 0.85, transparent: true, opacity: op })
    : new THREE.LineBasicMaterial({ color, transparent: true, opacity: op });
  const l = new THREE.Line(geo, mat); if (dashed) l.computeLineDistances(); return l;
}
// thick flat line (ribbon) in XY plane — for level diagrams
export function bar(x0, x1, y, color, th = 0.035, z = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide }));
  m.scale.set(x1 - x0, th, 1); m.position.set((x0 + x1) / 2, y, z); return m;
}
export class Cone {
  constructor(color, parent = scene, op = 0.07) {
    this.g = new THREE.Group(); parent.add(this.g);
    const geo = new THREE.ConeGeometry(1, 1, 72, 1, true); geo.rotateX(Math.PI); geo.translate(0, 0.5, 0);
    this.mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.ring = ringLine(1, color, { dashed: true, op: 0.85 });
    this.g.add(this.mesh, this.ring); this.g.visible = false;
  }
  set(apex, axis, half, len, op) {
    if (op < 0.004) { this.g.visible = false; return; }
    const R = len * Math.sin(half), h = len * Math.cos(half);
    this.g.position.copy(apex); this.g.quaternion.setFromUnitVectors(UP, axis.clone().normalize());
    this.mesh.scale.set(R, h, R); this.ring.scale.set(R, 1, R); this.ring.position.y = h;
    setOp(this.g, op);
  }
}
export function perpBasis(n) {
  const a = Math.abs(n.y) < 0.9 ? UP : V(1, 0, 0);
  const e1 = new THREE.Vector3().crossVectors(a, n).normalize();
  const e2 = new THREE.Vector3().crossVectors(n, e1).normalize();
  return [e1, e2];
}
export function nucleus(scale = 1, n = 18) {
  const g = new THREE.Group(), r = rng(3), pm = phys(0xff6a1f, 0.55), nm = phys(0xe9e1d2, 0.12, { metalness: 0.3 });
  const geo = new THREE.SphereGeometry(0.11 * scale, 24, 16);
  for (let i = 0; i < n; i++) {
    let p; do { p = V(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1); } while (p.length() > 1);
    const m = new THREE.Mesh(geo, i % 2 ? pm : nm); m.position.copy(p.multiplyScalar(0.2 * scale * Math.cbrt(n / 18))); g.add(m);
  }
  g.add(glow(0xff6a1f, 2.4 * scale, 0.6));
  return g;
}
export function electron(r = 0.13, color = C.E) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), phys(color, 0.9)));
  g.add(glow(color, r * 8, 0.8)); return g;
}
export class Trail {
  constructor(color, R, parent, n = 100, arc = 2.6) {
    this.R = R; this.n = n; this.arc = arc;
    this.pos = new Float32Array((n + 1) * 3); this.col = new Float32Array((n + 1) * 3); this.c = new THREE.Color(color);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.line = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    parent.add(this.line); this.line.visible = false;
  }
  set(e1, e2, ang, op, center = V()) {
    for (let i = 0; i <= this.n; i++) {
      const a = ang - this.arc * i / this.n, f = Math.pow(1 - i / this.n, 1.6) * op;
      const p = e1.clone().multiplyScalar(this.R * Math.cos(a)).add(e2.clone().multiplyScalar(this.R * Math.sin(a))).add(center);
      this.pos.set([p.x, p.y, p.z], i * 3); this.col.set([this.c.r * f, this.c.g * f, this.c.b * f], i * 3);
    }
    this.line.geometry.attributes.position.needsUpdate = true; this.line.geometry.attributes.color.needsUpdate = true;
    this.line.visible = op > 0.004;
  }
}
export function edges(mesh, color, op = 0.9) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25), new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending })); e.position.copy(mesh.position); e.rotation.copy(mesh.rotation); e.scale.copy(mesh.scale); return e; }

// ---------------------------------------------------------------- overlay: labels & cards
const ov = document.getElementById('ov');
const labels = [];
export class Label {
  constructor(html, color = '#fff', { size, bare = false, dot = true, tag = false } = {}) {
    this.el = document.createElement('div'); this.el.className = 'lbl' + (bare ? ' bare' : '') + (tag ? ' tag' : '');
    this.el.innerHTML = (dot && !bare && !tag ? `<span class="dot" style="background:${color};color:${color}"></span>` : '') + `<span style="color:${bare || tag ? color : '#ece6da'}">${html}</span>`;
    if (size) this.el.style.fontSize = size + 'px'; ov.appendChild(this.el); labels.push(this); this.op = 0;
  }
  place(p, op, dx = 0, dy = 0) { this.p = p.clone(); this.op = op; this.dx = dx; this.dy = dy; return this; }
  placeW(obj, p, op, dx = 0, dy = 0) { obj.updateMatrixWorld(); return this.place(p.clone().applyMatrix4(obj.matrixWorld), op, dx, dy); }
  flush() {
    if (this.op < 0.004 || !this.p) { this.el.style.opacity = 0; this.op = 0; return; }
    const q = this.p.clone().project(camera);
    const x = (q.x * 0.5 + 0.5) * W + this.dx, y = (-q.y * 0.5 + 0.5) * H + this.dy;
    this.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
    this.el.style.opacity = q.z < 1 ? this.op : 0; this.op = 0;
  }
}
const cards = [];
// staged reveal: elements with data-at="seconds after card start" fade in
// opts: { flat: no 3D tilt, yaw/pitch (deg), depth, world: parallax blend 0..1 }
export function card(t0, t1, style, html, opts = {}) {
  const el = document.createElement('div'); el.className = 'card'; el.style.cssText = style; el.innerHTML = html; ov.appendChild(el);
  const stg = [...el.querySelectorAll('[data-at]')];
  const cd = { t0, t1, el, base: el.style.transform || '', stg, opts }; cards.push(cd); el._cd = cd; return el;
}
export function overlay(t0, t1, cls, html, style = '', opts = {}) {
  const el = document.createElement('div'); el.className = cls; el.style.cssText = style; el.innerHTML = html; ov.appendChild(el);
  const stg = [...el.querySelectorAll('[data-at]')];
  const cd = { t0, t1, el, base: el.style.transform || '', stg, noSlide: true, opts }; cards.push(cd); el._cd = cd; return el;
}
// ---- projective mapping of an HTML box (w x h) onto 4 screen points TL,TR,BR,BL
export function homography(w, h, P) {
  const [x0, y0] = P[0], [x1, y1] = P[1], [x2, y2] = P[2], [x3, y3] = P[3];
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  let g = 0, hh = 0;
  if (Math.abs(sx) > 1e-9 || Math.abs(sy) > 1e-9) { const det = dx1 * dy2 - dx2 * dy1; g = (sx * dy2 - dx2 * sy) / det; hh = (dx1 * sy - sx * dy1) / det; }
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
  return 'matrix3d(' + m.map(v => (Math.abs(v) < 1e-12 ? 0 : v).toPrecision(9)).join(',') + ')';
}
// project a world point to screen px; returns null if behind camera
export function toScreen(p, cam = camera) { const q = p.clone().project(cam); if (q.z > 1 || q.z < -1) return null; return [(q.x * 0.5 + 0.5) * W, (-q.y * 0.5 + 0.5) * H]; }
export const hooks = [], postHooks = [];
export const POS = {
  L: 'left:64px;top:180px;width:600px;',
  Lw: 'left:64px;top:180px;width:700px;',
  R: 'right:64px;top:180px;width:600px;',
  Rw: 'right:64px;top:180px;width:700px;',
  TC: 'left:50%;top:150px;transform:translateX(-50%);',
  BC: 'left:50%;bottom:56px;transform:translateX(-50%);',
};
export const kick = s => `<div class="kick">${s}</div>`;
let svgId = 0;
export function svgDensity(f, color, w = 250, h = 100) {
  let d = ''; const n = 90, id = 'g' + (svgId++);
  for (let i = 0; i <= n; i++) { const x = -1 + 2 * i / n; const y = f(x); d += (i ? 'L' : 'M') + (8 + (w - 16) * i / n).toFixed(1) + ',' + (h - 12 - y * (h - 26)).toFixed(1); }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <path d="${d} L${w - 8},${h - 12} L8,${h - 12} Z" fill="url(#${id})"/>
    <line x1="6" y1="${h - 12}" x2="${w - 6}" y2="${h - 12}" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>
    <line x1="${w / 2}" y1="6" x2="${w / 2}" y2="${h - 8}" stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="3 4"/>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round"/></svg>`;
}
// spectrum strip: lines [{x in -1..1, c:color, w:width, lab}]
export function svgSpectrum(lines, w = 420, h = 70, labelTop = false) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="#080605" stroke="rgba(239,232,220,.14)"/>` +
    lines.map(l => { const x = w / 2 + l.x * (w / 2 - 20); return `<rect x="${(x - (l.w || 3) / 2).toFixed(1)}" y="8" width="${l.w || 3}" height="${h - 16 - (l.lab ? 14 : 0)}" fill="${l.c || '#ffbf73'}" opacity="${l.o ?? 1}"/>` + (l.lab ? `<text x="${x}" y="${h - 6}" fill="#9a9184" font-size="13" text-anchor="middle">${l.lab}</text>` : ''); }).join('') + `</svg>`;
}

// ---------------------------------------------------------------- 3B1B-style equation morphing
// markup: [[key|tex]] marks a term; matching keys glide between consecutive steps, others cross-fade.
const derivs = [];
const KX = s => katex.renderToString(s.replace(/\[\[([\w-]+)\|/g, '\\htmlClass{kk k-$1}{').replace(/\]\]/g, '}'), { throwOnError: false, trust: true, strict: false, macros: { ...MAC } });
const SUBF = h => (h || '').replace(/([A-Za-zμσπ])_\{([^}<]+)\}/g, '$1<sub>$2</sub>').replace(/([A-Za-zμσπ])_([A-Za-z0-9,]+)/g, '$1<sub>$2</sub>');
export class Deriv {
  // steps: [{tex, hold, note, box:[keys], ann:[{key,text,dir:'below'|'above',color}]}]
  constructor(t0, style, { kicker = '', title = '', steps, trans = 1.3, size = 40, height = 0, lead = 0.8, tail = 1.0, intro = '' }) {
    this.t0 = t0; this.steps = steps; this.trans = trans; this.lead = lead;
    let tt = t0 + lead; this.starts = steps.map(st => { const a = tt; tt += st.hold + trans; return a; });
    this.t1 = tt - trans + tail; this.size = size;
    this.el = card(t0, this.t1, style, `${kicker ? kick(kicker) : ''}${title ? `<h3>${SUBF(title)}</h3>` : ''}${intro}<div class="dstage" style="position:relative;height:${height || size * 3.3}px"></div><div class="dnote" style="position:relative;min-height:70px;text-align:center;font-size:24px;color:#cfc7b9;margin-top:8px"></div>`);
    this.stage = this.el.querySelector('.dstage'); this.noteBox = this.el.querySelector('.dnote');
    this.base = []; this.keys = []; this.notes = []; this.boxes = []; this.anns = [];
    steps.forEach((st, i) => {
      const mk = cls => { const d = document.createElement('div'); d.className = 'dstep ' + cls; d.style.cssText = `position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;font-size:${size}px;color:#fff;opacity:0;white-space:nowrap`; d.innerHTML = KX(st.tex); this.stage.appendChild(d); return d; };
      this.base.push(mk('dbase')); const k = mk('dkeys'); k.style.visibility = 'hidden'; k.style.opacity = 1; this.keys.push(k);
      const n = document.createElement('div'); n.style.cssText = 'position:absolute;left:0;right:0;top:0;opacity:0'; n.innerHTML = SUBF(st.note); this.noteBox.appendChild(n); this.notes.push(n);
      this.boxes.push((st.box || []).map(key => { const b = document.createElement('div'); b.style.cssText = `position:absolute;border:2px solid ${st.boxColor || '#ff6a1f'};border-radius:3px;opacity:0;box-shadow:0 0 18px rgba(255,106,31,.35)`; this.stage.appendChild(b); return { key, b }; }));
      this.anns.push((st.ann || []).map(a => { const d = document.createElement('div'); d.style.cssText = `position:absolute;font-size:20px;color:${a.color || '#ff6a1f'};font-family:var(--mono);font-weight:700;white-space:nowrap;opacity:0;text-align:center`; d.innerHTML = (a.dir === 'above' ? '' : `<div style="height:10px;border:2px solid ${a.color || '#ff6a1f'};border-top:none;border-radius:0 0 6px 6px;margin-bottom:2px"></div>`) + SUBF(a.text) + (a.dir === 'above' ? `<div style="height:10px;border:2px solid ${a.color || '#ff6a1f'};border-bottom:none;border-radius:6px 6px 0 0;margin-top:2px"></div>` : ''); this.stage.appendChild(d); return { ...a, d }; }));
    });
    derivs.push(this); this.measured = false;
  }
  fit() {
    const W0 = this.stage.clientWidth - 16;
    this.base.forEach((b, i) => { const k = b.querySelector('.katex'); if (!k) return; const w = k.getBoundingClientRect().width; if (w > W0) { const fs = Math.floor(this.size * W0 / w); b.style.fontSize = fs + 'px'; this.keys[i].style.fontSize = fs + 'px'; } });
  }
  measure() {
    const sr = this.stage.getBoundingClientRect();
    this.pos = this.base.map(b => { const m = {}; b.querySelectorAll('.kk').forEach(e => { const key = [...e.classList].find(c => c.startsWith('k-')); if (!key || m[key]) return; const r = e.getBoundingClientRect(); m[key] = { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2, w: r.width, h: r.height, txt: e.textContent }; }); return m; });
    this.kel = this.keys.map(k => { const m = {}; k.querySelectorAll('.kk').forEach(e => { const key = [...e.classList].find(c => c.startsWith('k-')); if (key && !m[key]) { m[key] = e; e.style.visibility = 'visible'; e.style.display = 'inline-block'; } }); return m; });
    this.boxes.forEach((bs, i) => bs.forEach(({ key, b }) => { const p = this.pos[i]['k-' + key]; if (!p) return; b.style.left = (p.x - p.w / 2 - 8) + 'px'; b.style.top = (p.y - p.h / 2 - 6) + 'px'; b.style.width = (p.w + 16) + 'px'; b.style.height = (p.h + 12) + 'px'; }));
    this.anns.forEach((as, i) => as.forEach(a => { const p = this.pos[i]['k-' + a.key]; if (!p) return; a.d.style.width = Math.max(p.w, 40) + 'px'; a.d.style.left = (p.x - Math.max(p.w, 40) / 2) + 'px'; if (a.dir === 'above') a.d.style.bottom = (this.stage.clientHeight - (p.y - p.h / 2) + 4) + 'px'; else a.d.style.top = (p.y + p.h / 2 + 4) + 'px'; }));
    this.measured = true;
  }
  update(t) {
    if (!this.measured) return;
    const n = this.steps.length;
    let i = 0; while (i + 1 < n && t >= this.starts[i + 1]) i++;
    // phase: transition from i to i+1 if t in [starts[i+1]-trans, starts[i+1])
    for (let k = 0; k < n; k++) { this.base[k].style.opacity = 0; this.keys[k].style.visibility = 'hidden'; for (const e of Object.values(this.kel[k])) e.style.opacity = 0; this.notes[k].style.opacity = 0; }
    const hideKeys = (k, on) => { for (const e of this.base[k].querySelectorAll('.kk')) e.style.visibility = on ? 'hidden' : 'visible'; };
    const ts = this.starts[i + 1] !== undefined ? this.starts[i + 1] - this.trans : Infinity;
    if (t < ts) {
      // holding step i (or first fade-in)
      hideKeys(i, false); this.base[i].style.opacity = 1; this.notes[i].style.opacity = ep(t, this.starts[i] + 0.2, this.starts[i] + 0.9);
      if (i === 0) this.base[0].style.opacity = ep(t, this.t0 + 0.2, this.starts[0] + 0.2);
    } else {
      const e = ease(clamp((t - ts) / this.trans)); const A = this.pos[i], Bp = this.pos[i + 1];
      hideKeys(i, true); hideKeys(i + 1, true);
      this.base[i].style.opacity = 1 - Math.min(1, e * 1.6); this.base[i + 1].style.opacity = Math.max(0, e * 1.6 - 0.6);
      this.notes[i].style.opacity = 1 - e; this.notes[i + 1].style.opacity = e;
      for (const key of new Set([...Object.keys(A), ...Object.keys(Bp)])) {
        const a = A[key], b = Bp[key], ea = this.kel[i][key], eb = this.kel[i + 1][key];
        if (a && b) {
          const same = a.txt === b.txt && Math.abs(a.w - b.w) < 2;
          const dx = b.x - a.x, dy = b.y - a.y;
          if (ea) { ea.style.transform = `translate(${(dx * e).toFixed(1)}px,${(dy * e).toFixed(1)}px)`; ea.style.opacity = same ? 0 : 1 - e; }
          if (eb) { eb.style.transform = `translate(${(-dx * (1 - e)).toFixed(1)}px,${(-dy * (1 - e)).toFixed(1)}px)`; eb.style.opacity = same ? 1 : e; }
        } else if (a && ea) { ea.style.transform = `translate(0px,${(-14 * e).toFixed(1)}px)`; ea.style.opacity = 1 - Math.min(1, e * 1.5); }
        else if (b && eb) { eb.style.transform = `translate(0px,${(14 * (1 - e)).toFixed(1)}px)`; eb.style.opacity = Math.max(0, e * 1.5 - 0.5); }
      }
      this.keys[i].style.visibility = 'hidden'; this.keys[i + 1].style.visibility = 'hidden';
    }
    // boxes & annotations during hold of step i
    this.boxes.forEach((bs, k) => bs.forEach(({ b }, j) => { b.style.opacity = k === i ? ep(t, this.starts[k] + 0.6 + j * 0.5, this.starts[k] + 1.1 + j * 0.5) * (t < ts ? 1 : 0) : 0; }));
    this.anns.forEach((as, k) => as.forEach((a, j) => { a.d.style.opacity = k === i ? ep(t, this.starts[k] + 0.8 + (a.at || j * 0.6), this.starts[k] + 1.4 + (a.at || j * 0.6)) * (t < ts ? 1 : 0) : 0; }));
  }
}
export function deriv(t0, style, opts) { return new Deriv(t0, style, opts); }

// ---------------------------------------------------------------- stars
const R1 = rng(7);
export const stars = new THREE.Group(); scene.add(stars);
for (const [n, size, op] of [[1200, 0.2, 0.22], [90, 0.4, 0.3]]) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = R1() * 2 - 1, th = R1() * Math.PI * 2, r = 80 + R1() * 60, s = Math.sqrt(1 - u * u);
    pos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
    const c = new THREE.Color().setHSL(0.06 + R1() * 0.04, 0.35, 0.55 + R1() * 0.3); col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  stars.add(new THREE.Points(g, new THREE.PointsMaterial({ size, map: glowTex, vertexColors: true, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })));
}

// ---------------------------------------------------------------- field lines (B along +Y)
export class Field {
  constructor(xs, zs, y0, y1, color = C.B, skip = 0.9, parent = scene) {
    this.g = new THREE.Group(); parent.add(this.g); this.lines = []; this.y0 = y0; this.y1 = y1;
    for (const x of xs) for (const z of zs) {
      if (Math.abs(x) < skip && Math.abs(z) < skip) continue;
      const pts = []; for (let i = 0; i <= 24; i++) pts.push(V(x, y0 + (y1 - y0) * i / 24, z));
      const l = polyLine(pts, color, 0.1); l.material.blending = THREE.AdditiveBlending; l.userData = { x, z }; this.g.add(l); this.lines.push(l);
    }
    const np = this.lines.length * 4; this.ppos = new Float32Array(np * 3);
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(this.ppos, 3));
    this.pts = new THREE.Points(pg, new THREE.PointsMaterial({ color, size: 0.1, map: glowTex, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.g.add(this.pts); this.g.visible = false;
  }
  shape(x, y, conv) { return x * (1 - conv * 0.55 * (y - this.y0) / (this.y1 - this.y0)); }
  update(t, op, conv = 0) {
    setOp(this.g, op); if (op < 0.004) return;
    let k = 0;
    for (const l of this.lines) {
      const { x, z } = l.userData, a = l.geometry.attributes.position;
      for (let i = 0; i < a.count; i++) { const y = a.getY(i); a.setX(i, this.shape(x, y, conv)); a.setZ(i, this.shape(z, y, conv)); }
      a.needsUpdate = true;
      for (let j = 0; j < 4; j++) {
        const L = this.y1 - this.y0, y = this.y0 + ((t * 0.8 + j * L / 4 + (x * 0.37 + z * 0.61)) % L + L) % L;
        this.ppos.set([this.shape(x, y, conv), y, this.shape(z, y, conv)], k * 3); k++;
      }
    }
    this.pts.geometry.attributes.position.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- Level diagram (flat, in a group; billboarded or fixed)
// usage: const D = new Levels(parent); D.lvl('3P', -2, -0.5, 1.2, color, label html)...
export class Levels {
  constructor(parent = scene) { this.g = new THREE.Group(); parent.add(this.g); this.items = {}; this.labels = {}; }
  _add(id, obj, lab, lp, ldx = 0, ldy = 0) { this.g.add(obj); this.items[id] = { obj, lp, ldx, ldy }; if (lab) this.labels[id] = lab; obj.visible = false; return obj; }
  lvl(id, x0, x1, y, color = C.W, html = null, side = 'r', th = 0.03) {
    const lab = html ? new Label(html, hex(color), { bare: true, size: 22 }) : null;
    return this._add(id, bar(x0, x1, y, color, th), lab, V(side === 'r' ? x1 : x0, y, 0), side === 'r' ? 46 : -46, 0);
  }
  link(id, x0, y0, x1, y1, color = 0x94a3b8) { return this._add(id, polyLine([V(x0, y0, 0), V(x1, y1, 0)], color, 0.6, true, 0.05)); }
  line(id, pts, color, op = 0.8) { return this._add(id, polyLine(pts.map(p => V(p[0], p[1], 0)), color, op)); }
  // transition arrow (downwards typically)
  tr(id, x, y0, y1, color = C.J, html = null, r = 0.016) {
    const a = new Arrow(color, { r, hr: r * 3, hl: 0.14, parent: this.g });
    this.items[id] = { arrow: a, x, y0, y1, lp: V(x, (y0 + y1) / 2, 0), ldx: 0, ldy: 0 };
    if (html) this.labels[id] = new Label(html, hex(color), { bare: true, size: 20 });
    return a;
  }
  trd(id, x0, y0, x1, y1, color = C.J, html = null, r = 0.016) {
    const a = new Arrow(color, { r, hr: r * 3, hl: 0.14, parent: this.g });
    this.items[id] = { arrowD: a, p0: V(x0, y0, 0), p1: V(x1, y1, 0), lp: V((x0 + x1) / 2, (y0 + y1) / 2, 0), ldx: 0, ldy: 0 };
    if (html) this.labels[id] = new Label(html, hex(color), { bare: true, size: 20 });
    return a;
  }
  off(id, dx, dy) { if (this.items[id]) { this.items[id].ldx = dx; this.items[id].ldy = dy; } return this; }
  text(id, x, y, html, color = '#e6eef8', size = 22) { this.items[id] = { lp: V(x, y, 0), ldx: 0, ldy: 0, textOnly: true }; this.labels[id] = new Label(html, color, { bare: true, size }); }
  show(id, op, draw = 1) {
    const it = this.items[id]; if (!it) return;
    if (it.arrow) it.arrow.set(V(it.x, it.y0, 0), V(0, (it.y1 - it.y0) * draw, 0), op);
    else if (it.arrowD) it.arrowD.set(it.p0, it.p1.clone().sub(it.p0).multiplyScalar(draw), op);
    else if (it.obj) { setOp(it.obj, op); if (it.obj.isMesh && it.obj.geometry.type === 'PlaneGeometry') { /* draw-in from left */ } }
    const lab = this.labels[id];
    if (lab) { this.g.updateMatrixWorld(); lab.place(it.lp.clone().applyMatrix4(this.g.matrixWorld), op, it.ldx, it.ldy); }
  }
  showAll(op, prefix = '') { for (const id in this.items) if (id.startsWith(prefix)) this.show(id, op); }
  hideAll() { for (const id in this.items) this.show(id, 0); }
}

// ---------------------------------------------------------------- Vector model of a one-electron atom
// state: l, s, j, mj ; options: coupling (0 = LS coupled around J, 1 = decoupled: L,S each around B)
export class VectorModel {
  constructor(parent = scene, { U = 1.25, R = 2.3, nuc = 1.2 } = {}) {
    this.g = new THREE.Group(); parent.add(this.g); this.U = U; this.R = R;
    this.nuc = nucleus(nuc); this.g.add(this.nuc);
    this.orbit = new THREE.Group(); this.g.add(this.orbit);
    const ring = ringLine(R, C.E, { dashed: false, op: 0.16 }); ring.rotation.x = Math.PI / 2; this.orbit.add(ring);
    this.trail = new Trail(C.E, R, this.g, 110, 2.6);
    this.el = electron(0.12); this.g.add(this.el);
    this.L = new Arrow(C.L, { parent: this.g }); this.S = new Arrow(C.S, { parent: this.g }); this.J = new Arrow(C.J, { r: 0.05, hr: 0.13, hl: 0.4, parent: this.g });
    this.eS = new Arrow(C.S, { r: 0.02, hr: 0.055, hl: 0.15, parent: this.g });
    this.mul = new Arrow(0x99f6e4, { r: 0.026, hr: 0.07, hl: 0.22, em: 0.2, parent: this.g });
    this.mus = new Arrow(0xf9a8d4, { r: 0.026, hr: 0.07, hl: 0.22, em: 0.2, parent: this.g });
    this.mu = new Arrow(C.MU, { r: 0.04, hr: 0.11, hl: 0.34, parent: this.g });
    this.muj = new Arrow(0xfda4af, { r: 0.04, hr: 0.11, hl: 0.34, parent: this.g });
    this.muperp = new Arrow(0xfecdd3, { r: 0.022, hr: 0.06, hl: 0.18, em: 0.2, parent: this.g });
    this.coneL = new Cone(C.L, this.g); this.coneS = new Cone(C.S, this.g); this.coneJ = new Cone(C.J, this.g, 0.045); this.coneMu = new Cone(C.MU, this.g, 0.05);
    this.coneLB = new Cone(C.L, this.g, 0.05); this.coneSB = new Cone(C.S, this.g, 0.05);
    this.setState(1, 0.5, 1.5, 1.5);
  }
  setState(l, s, j, mj) {
    const U = this.U; this.l = l; this.s = s; this.j = j; this.mj = mj;
    this.Lm = Math.sqrt(l * (l + 1)) * U; this.Sm = Math.sqrt(s * (s + 1)) * U; this.Jm = Math.sqrt(j * (j + 1)) * U;
    const cosLJ = (j * (j + 1) + l * (l + 1) - s * (s + 1)) / (2 * Math.sqrt(j * (j + 1) * l * (l + 1)));
    this.aLJ = Math.acos(clamp(cosLJ, -1, 1));
    this.thJ = Math.acos(clamp(mj / Math.sqrt(j * (j + 1)), -1, 1));
  }
  // returns vectors; phi: J around B ; psi: L,S around J ; dec: 0..1 decoupling blend
  vectors(phi, psi, dec = 0, mL = 1, mS = 0.5, psiL = 0, psiS = 0) {
    const jh = V(Math.sin(this.thJ) * Math.cos(phi), Math.cos(this.thJ), Math.sin(this.thJ) * Math.sin(phi));
    const [e1, e2] = perpBasis(jh);
    const Lc = jh.clone().multiplyScalar(this.Lm * Math.cos(this.aLJ)).add(e1.clone().multiplyScalar(this.Lm * Math.sin(this.aLJ) * Math.cos(psi))).add(e2.clone().multiplyScalar(this.Lm * Math.sin(this.aLJ) * Math.sin(psi)));
    const Sc = jh.clone().multiplyScalar(this.Jm).sub(Lc);
    if (dec <= 0) return { jh, L: Lc, S: Sc, J: Lc.clone().add(Sc) };
    // decoupled: L around B with Lz = mL, S around B with Sz = mS
    const thL = Math.acos(clamp(mL / Math.sqrt(this.l * (this.l + 1)), -1, 1)), thS = Math.acos(clamp(mS / Math.sqrt(this.s * (this.s + 1)), -1, 1));
    const Ld = V(Math.sin(thL) * Math.cos(psiL), Math.cos(thL), Math.sin(thL) * Math.sin(psiL)).multiplyScalar(this.Lm);
    const Sd = V(Math.sin(thS) * Math.cos(psiS), Math.cos(thS), Math.sin(thS) * Math.sin(psiS)).multiplyScalar(this.Sm);
    const L = Lc.clone().lerp(Ld, dec), S = Sc.clone().lerp(Sd, dec);
    return { jh, L, S, J: L.clone().add(S) };
  }
  // o: opacities {all, nuc, orbit, L, S, eS, J, coneL, coneS, coneJ, mul, mus, mu, muj, muperp, coneMu, coneLB, coneSB}
  // a: angles {phi, psi, dec, mL, mS, psiL, psiS, eAng}, k = magnetic-moment scale
  draw(o, a, k = 0.55) {
    const all = o.all ?? 1; const g = n => (o[n] ?? 0) * all;
    this.g.visible = all > 0.004; if (!this.g.visible) return null;
    const v = this.vectors(a.phi ?? 0, a.psi ?? 0, a.dec ?? 0, a.mL ?? 1, a.mS ?? 0.5, a.psiL ?? 0, a.psiS ?? 0);
    setOp(this.nuc, g('nuc'));
    const Lh = v.L.length() > 1e-3 ? v.L.clone().normalize() : UP;
    this.orbit.quaternion.setFromUnitVectors(UP, Lh); setOp(this.orbit, g('orbit'));
    const [b1, b2] = perpBasis(Lh), ang = a.eAng ?? 0;
    const ep_ = b1.clone().multiplyScalar(this.R * Math.cos(ang)).add(b2.clone().multiplyScalar(this.R * Math.sin(ang)));
    this.trail.set(b1, b2, ang, g('orbit')); this.el.position.copy(ep_); setOp(this.el, g('orbit'));
    const gl = o.growL ?? 1, gs = o.growS ?? 1, gj = o.growJ ?? 1, gm = o.growMu ?? 1;
    this.L.set(V(), v.L.clone().multiplyScalar(gl), g('L'));
    const sFrom = (a.dec ?? 0) > 0.5 ? V() : v.L;
    this.S.set(sFrom, v.S.clone().multiplyScalar(gs), g('S'));
    this.eS.set(ep_, v.S.clone().normalize().multiplyScalar(0.55), g('eS'));
    this.J.set(V(), v.J.clone().multiplyScalar(gj), g('J'));
    this.coneL.set(V(), v.jh, this.aLJ, this.Lm, g('coneL'));
    const jS = v.J.clone().normalize(); const aSJ = Math.acos(clamp(v.S.clone().normalize().dot(jS), -1, 1));
    this.coneS.set(v.L, jS, 0, 0, 0); // (S cone drawn from L tip is implicit)
    this.coneJ.set(V(), UP, this.thJ, this.Jm, g('coneJ'));
    const ml = v.L.clone().multiplyScalar(-k), ms = v.S.clone().multiplyScalar(-2 * k), mu = ml.clone().add(ms);
    this.mul.set(V(), ml.clone().multiplyScalar(gm), g('mul'));
    this.mus.set(ml.clone().multiplyScalar(gm), ms.clone().multiplyScalar(gm), g('mus'));
    this.mu.set(V(), mu.clone().multiplyScalar(gm), g('mu'));
    const mj = jS.clone().multiplyScalar(mu.dot(jS)), mp = mu.clone().sub(mj);
    this.muj.set(V(), mj, g('muj')); this.muperp.set(mj, mp, g('muperp'));
    const aMu = Math.acos(clamp(mu.clone().normalize().dot(jS.clone().negate()), -1, 1));
    this.coneMu.set(V(), jS.clone().negate(), aMu, mu.length(), g('coneMu'));
    // decoupled cones around B
    const thL = Math.acos(clamp(v.L.y / Math.max(v.L.length(), 1e-6), -1, 1)), thS = Math.acos(clamp(v.S.y / Math.max(v.S.length(), 1e-6), -1, 1));
    this.coneLB.set(V(), UP, thL, this.Lm, g('coneLB')); this.coneSB.set(V(), UP, thS, this.Sm, g('coneSB'));
    return { ...v, ml, ms, mu, mj, mp, ep: ep_ };
  }
}

// ---------------------------------------------------------------- chips, progress, titles
const chip = document.createElement('div'); chip.id = 'chip'; chip.innerHTML = '<span class="n"></span><span class="t"></span><span class="u"></span>'; ov.appendChild(chip);
const progEl = document.createElement('div'); progEl.id = 'prog'; ov.appendChild(progEl);
let stations = [], chips = [];
export function setStations(list) { stations = list; progEl.innerHTML = list.map(s => `<div class="st"><i></i><b>${s[0]}</b></div>`).join(''); }
export function setChips(list) { chips = list; } // [t0, t1, num, title]
const titleEl = document.createElement('div'); titleEl.className = 'title'; ov.appendChild(titleEl);
const endEl = document.createElement('div'); endEl.className = 'title'; ov.appendChild(endEl);
let titleT = [0, 0], endT = [1e9, 1e9];
export function setTitle(kickTxt, main, sub, sub2, t1) {
  titleEl.innerHTML = `<div class="k1">${kickTxt}</div><div class="t1">${main}</div><div class="line" id="tline"></div><div class="t2">${sub}</div><div class="t3">${sub2}</div>`; titleT = [0.8, t1];
}
export function setEnd(kickTxt, main, t0, t1) { endEl.innerHTML = `<div class="k1">${kickTxt}</div><div class="t1" style="font-size:80px">${main}</div>`; endT = [t0, t1]; }

// ---------------------------------------------------------------- the master chain (whole chapter logic), highlight one branch
export function chainHTML(hl = -1) {
  const dim = i => (hl < 0 || hl === i) ? '' : 'opacity:.25;';
  return `<div class="chain">
  <div class="node" data-at="0.5"><div class="h k">角动量</div>${T`\vec L,\ \vec S,\ \vec J`}</div><div class="arr" data-at="1.5">⟶</div>
  <div class="node" data-at="2"><div class="h r">磁矩</div>${T`\vec\mu=-g\frac{e}{2m_e}\vec J`}</div><div class="arr" data-at="3">⟶</div>
  <div class="node" data-at="3.5"><div class="h b">磁场中的能量</div>${T`U=-\vec\mu\cdot\vec B`}</div><div class="arr" data-at="4.5">⟶</div>
  <div class="branches">
    <div class="br" data-at="5" style="${dim(0)}"><span class="tag">非均匀外场</span><div class="node">受力偏转</div><div class="arr">→</div><div class="node" style="border-color:rgba(255,106,31,.8);color:#ffc9a8">施特恩-盖拉赫实验</div></div>
    <div class="br" data-at="6" style="${dim(1)}"><span class="tag">原子内部场</span><div class="node">自旋-轨道耦合</div><div class="arr">→</div><div class="node" style="border-color:rgba(255,191,115,.8);color:#ffd59a">碱金属双线</div></div>
    <div class="br" data-at="7" style="${dim(2)}"><span class="tag">均匀外场</span><div class="node">能级分裂</div><div class="arr">→</div><div class="node" style="border-color:rgba(169,200,220,.8);color:#d6e4ec">塞曼效应</div></div>
  </div></div>`;
}

// ---------------------------------------------------------------- camera shots & master loop
// a shot fn(u) returns { p:[x,y,z], l:[x,y,z], s?: viewOffsetPx, roll?: deg, fov?: deg }
const lerpA = (a, c, k) => a.map((x, j) => x + (c[j] - x) * k);
const easeQ = x => x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2;   // quintic: whip-like transition
export function camAt(shots, t) {
  let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
  const cur = { s: 0, roll: 0, fov: 38, ...shots[i].fn(t - shots[i].t0) };
  const b = shots[i].b ?? 2.5;
  if (i > 0 && t - shots[i].t0 < b) {
    const prev = { s: 0, roll: 0, fov: 38, ...shots[i - 1].fn(t - shots[i - 1].t0) };
    const e = shots[i].whip ? easeQ : ease; const k = e((t - shots[i].t0) / b);
    return { p: lerpA(prev.p, cur.p, k), l: lerpA(prev.l, cur.l, k), s: prev.s + (cur.s - prev.s) * k, roll: prev.roll + (cur.roll - prev.roll) * k, fov: prev.fov + (cur.fov - prev.fov) * k };
  }
  return cur;
}
export const orbitShot = (r, h, a0, da, l = [0, 0, 0], s = 0, extra = {}) => u => { const a = a0 + u * da; return { p: [r * Math.sin(a) + l[0], h, r * Math.cos(a) + l[2]], l, s, ...(typeof extra === 'function' ? extra(u) : extra) }; };
export const fixedShot = (p, l, s = 0, drift = [0, 0, 0], extra = {}) => u => ({ p: [p[0] + drift[0] * u, p[1] + drift[1] * u, p[2] + drift[2] * u], l, s, ...(typeof extra === 'function' ? extra(u) : extra) });
// Catmull-Rom camera path through keys [{u, p, l, roll?, fov?, s?}] (u = seconds since shot start)
function cr(p0, p1, p2, p3, f) { const f2 = f * f, f3 = f2 * f; return p1.map((_, j) => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * f + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * f2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * f3)); }
export const pathShot = (keys, { easeEnds = true } = {}) => u => {
  const K = keys; if (u <= K[0].u) return { s: 0, roll: 0, fov: 38, ...K[0] };
  if (u >= K[K.length - 1].u) return { s: 0, roll: 0, fov: 38, ...K[K.length - 1] };
  let i = 0; while (i + 1 < K.length && K[i + 1].u <= u) i++;
  const a = K[Math.max(0, i - 1)], b = K[i], c = K[i + 1], d = K[Math.min(K.length - 1, i + 2)];
  let f = (u - b.u) / (c.u - b.u); if (easeEnds) { const first = i === 0, last = i + 1 === K.length - 1; if (first && last) f = ease(f); else if (first) f = f * f * (2 - f); else if (last) f = f * (1 + f - f * f); }
  const sm = x => x * x * (3 - 2 * x), q = sm(f);
  return { p: cr(a.p, b.p, c.p, d.p, f), l: cr(a.l, b.l, c.l, d.l, f), roll: (b.roll || 0) + ((c.roll || 0) - (b.roll || 0)) * q, fov: (b.fov || 38) + ((c.fov || 38) - (b.fov || 38)) * q, s: (b.s || 0) + ((c.s || 0) - (b.s || 0)) * q };
};
// subtle deterministic handheld drift
let HANDHELD = 0.035;
export function setHandheld(a) { HANDHELD = a; }
const nz = (t, k) => Math.sin(t * 0.73 + k) * 0.6 + Math.sin(t * 1.31 + k * 2.1) * 0.3 + Math.sin(t * 2.17 + k * 3.7) * 0.1;
const tmpObj = new THREE.Object3D();
function poseMatrix(c, t) {
  tmpObj.position.set(...c.p); tmpObj.up.set(0, 1, 0); tmpObj.lookAt(V(...c.l));
  // three's Object3D.lookAt points +z at target for non-cameras; flip to camera convention
  tmpObj.rotateY(Math.PI); tmpObj.rotateZ((c.roll || 0) * Math.PI / 180); tmpObj.updateMatrixWorld(true); return tmpObj.matrixWorld.clone();
}
// ---- title-sequence camera override (registered by noir.js)
export const titleCtl = { cam: null, end: 0, blend: 1.6 };
// world ray through a screen point at script time t (filled in by run)
export const rayCtl = { ray: null };

export function run({ duration, shots, update, ratio = 0.7, events = [], titleEnd = 11.2 }) {
  const camPose = t => {
    let c = camAt(shots, t);
    if (titleCtl.cam && t < titleCtl.end + titleCtl.blend) {
      const tc = titleCtl.cam(Math.min(t, titleCtl.end + titleCtl.blend));
      if (t <= titleCtl.end) c = tc; else { const k = easeQ((t - titleCtl.end) / titleCtl.blend); c = { p: lerpA(tc.p, c.p, k), l: lerpA(tc.l, c.l, k), s: (tc.s || 0) * (1 - k) + (c.s || 0) * k, roll: (tc.roll || 0) * (1 - k) + (c.roll || 0) * k, fov: (tc.fov || 38) * (1 - k) + (c.fov || 38) * k }; }
    }
    return c;
  };
  const tmpCam = camera.clone();
  rayCtl.ray = (t, sx, sy) => { const c = camPose(t); setCam(tmpCam, c, t, false); const o = tmpCam.position.clone(); const d = V((sx / W) * 2 - 1, -(sy / H) * 2 + 1, 0.5).unproject(tmpCam).sub(o).normalize(); const fwd = V(0, 0, -1).applyQuaternion(tmpCam.quaternion); const right = V(1, 0, 0).applyQuaternion(tmpCam.quaternion); return { o, d, fwd, right, fov: tmpCam.fov }; };
  function setCam(cam, c, t, wobble = true) {
    const hw = wobble ? HANDHELD : 0;
    cam.fov = c.fov || 38; cam.position.set(c.p[0] + hw * nz(t, 1), c.p[1] + hw * nz(t, 2), c.p[2] + hw * nz(t, 3));
    cam.up.set(0, 1, 0); cam.lookAt(V(...c.l)); cam.rotateZ(((c.roll || 0) + hw * 12 * nz(t, 4)) * Math.PI / 180);
    cam.setViewOffset(W, H, -(c.s || 0), 0, W, H); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  }
  // ---- 3D panel mapping for cards
  const panelOf = (cd, t) => {
    const P = cd.panel; if (!P) return null;
    const o = cd.opts || {};
    const enter = ep(t, cd.t0 - 0.1, cd.t0 + 0.75), exit = ep(t, cd.t1 - 0.7, cd.t1);
    const yaw = (P.yaw + (1 - enter) * P.yawIn - exit * P.yawIn * 0.6) * Math.PI / 180, pitch = (P.pitch + (1 - enter) * 10) * Math.PI / 180;
    const D = P.depth + (1 - enter) * 2.2 + exit * 1.2;
    // camera-space frame
    const tanh = Math.tan(camera.fov * Math.PI / 360), px = 2 * D * tanh / H;
    const cx = (P.cx - W / 2) * px, cy = -(P.cy - H / 2) * px;
    const r = V(Math.cos(yaw), 0, -Math.sin(yaw)), u = V(0, Math.cos(pitch), -Math.sin(pitch));
    const ww = P.w * px, hh = P.h * px, c = V(cx, cy, -D);
    const cornersCam = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([a, b]) => c.clone().add(r.clone().multiplyScalar(a * ww / 2)).add(u.clone().multiplyScalar(b * hh / 2)));
    // static projection (camera-space) — ignore view offset so cards keep their designed screen place
    const projCam = q => { const z = -q.z; return [W / 2 + q.x / (z * 2 * tanh / H), H / 2 - q.y / (z * 2 * tanh / H)]; };
    let pts = cornersCam.map(projCam);
    const kw = o.flat ? 0 : (o.world ?? 0.3);
    if (kw > 0 && P.anchor) {
      const wp = cornersCam.map(q => toScreen(q.clone().applyMatrix4(P.anchor)));
      if (wp.every(Boolean)) {
        // anchor reference: where the static panel would land at anchor time (so blend starts at zero offset)
        pts = pts.map((q, j) => [q[0] + (wp[j][0] - P.ref[j][0]) * kw, q[1] + (wp[j][1] - P.ref[j][1]) * kw]);
      }
    }
    return pts;
  };
  function renderAt(t) {
    const c = camPose(t);
    setCam(camera, c, t);
    stars.rotation.y = t * 0.004;
    update(t);
    for (const h of hooks) h(t);
    renderer.render(scene, camera);
    labels.forEach(l => l.flush());
    for (const d of derivs) d.update(t);
    for (const cd of cards) {
      const o = win(t, cd.t0, cd.t1, 0.7); cd.el.style.opacity = o; cd.el.style.visibility = o > 0.003 ? 'visible' : 'hidden';
      if (cd.panel && window.PANELS_READY && o > 0.003) {
        const pts = panelOf(cd, t); cd.el.style.transform = homography(cd.panel.w, cd.panel.h, pts);
        cd.el.style.setProperty('--rule', (Math.max(0, cd.panel.h - 70) * ep(t, cd.t0 + 0.1, cd.t0 + 1.1)).toFixed(1) + 'px');
      } else if (!cd.noSlide && !window.PANELS_READY) cd.el.style.transform = cd.base + ` translateY(${((1 - o) * 14).toFixed(1)}px)`;
      for (const s of cd.stg) { const a = cd.t0 + +s.dataset.at; const so = ep(t, a, a + 0.8); s.style.opacity = s.dataset.dim !== undefined ? 0.2 + 0.8 * so : so; }
      // typewriter headline
      if (cd.chars && o > 0.003) {
        const N = cd.chars.length, dur = Math.min(1.0, 0.25 + N * 0.045), k = clamp((t - cd.t0 - 0.2) / dur), n = Math.floor(k * N + 1e-6);
        cd.chars.forEach((e, j) => { const on = j < n; const cur = j === n - 1 && k < 1; const cls = 'ch' + (on ? ' on' : '') + (cur ? ' cur' : ''); if (e.className !== cls) e.className = cls; });
      }
      // kicker decode
      if (cd.kick && o > 0.003) {
        const full = cd.kickTxt, k = clamp((t - cd.t0) / 0.7), n = Math.floor(k * full.length);
        const G = '/\\_<>#01▮▯+=·', fr = Math.floor(t * 24);
        let out = full.slice(0, n); for (let j = n; j < full.length; j++) out += full[j] === ' ' ? ' ' : G[(j * 7 + fr * 13 + j * fr) % G.length];
        if (cd.kick.textContent !== out) cd.kick.textContent = out;
      }
    }
    for (const h of postHooks) h(t);
    titleEl.style.opacity = titleCtl.cam ? 0 : win(t, titleT[0], titleT[1], 1.2);
    const tl = document.getElementById('tline'); if (tl) tl.style.width = (560 * ep(t, 1.6, 3.6)) + 'px';
    endEl.style.opacity = window.NO_END_FALLBACK ? 0 : win(t, endT[0], endT[1], 1);
    const dip = titleCtl.cam && titleCtl.blend === 0 ? Math.max(0, 1 - Math.abs(t - titleCtl.end) / 0.22) : 0;
    document.getElementById('fade').style.opacity = Math.max(1 - ep(t, 0, 0.35), ep(t, duration - 1.6, duration), dip);
    let ci = chips.findIndex(c => t >= c[0] && t < c[1]);
    chip.style.opacity = ci >= 0 ? win(t, chips[ci][0], chips[ci][1], 0.6) : 0;
    if (ci >= 0 && chip.dataset.i != ci) { chip.querySelector('.n').textContent = chips[ci][2]; chip.querySelector('.t').textContent = chips[ci][3]; chip.dataset.i = ci; }
    let si = -1; stations.forEach((s, i) => { if (t >= s[1] && t < s[2]) si = i; });
    progEl.style.opacity = stations.length ? win(t, stations[0][1], stations[stations.length - 1][2], 1) * 0.9 : 0;
    [...progEl.children].forEach((e, i) => { e.className = 'st ' + (i === si ? 'on' : (t >= stations[i][2] ? 'done' : '')); });
  }
  // ---- smart time warp: normal speed right after events, faster during holds; title region runs 1:1 (music-synced)
  const ev = [...events, 0, duration];
  for (const cd of cards) { ev.push(cd.t0, cd.t1 - 0.7); for (const st of cd.stg) ev.push(cd.t0 + +st.dataset.at); }
  for (const d of derivs) { d.starts.forEach((a, i) => { ev.push(a); if (i) ev.push(a - d.trans); }); }
  ev.sort((a, b) => a - b);
  const dt = 0.02, N = Math.ceil(duration / dt) + 1;
  const near = new Float32Array(N);
  for (const e of ev) { const i0 = Math.max(0, Math.floor((e - 0.3) / dt)), i1 = Math.min(N - 1, Math.ceil((e + 1.6) / dt)); for (let i = i0; i <= i1; i++) near[i] = 1; }
  const smooth = a => { const P = new Float64Array(N + 1); for (let i = 0; i < N; i++) P[i + 1] = P[i] + a[i]; const w = Math.round(0.4 / dt), r = new Float32Array(N); for (let i = 0; i < N; i++) { const x0 = Math.max(0, i - w), x1 = Math.min(N, i + w + 1); r[i] = (P[x1] - P[x0]) / (x1 - x0); } return r; };
  const nb = smooth(smooth(near));
  const lock = Math.round((titleEnd + 1.0) / dt); for (let i = 0; i < Math.min(N, lock); i++) nb[i] = 1;
  const tauFor = vmax => { const tau = new Float32Array(N); for (let i = 1; i < N; i++) { const v = 1 + (vmax - 1) * (1 - Math.min(1, nb[i])); tau[i] = tau[i - 1] + dt / v; } return tau; };
  let lo = 1, hi = 6, tau = tauFor(1);
  if (ratio < 1) { for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; const tt = tauFor(m); if (tt[N - 1] > ratio * duration) lo = m; else hi = m; } tau = tauFor(hi); }
  const outDur = tau[N - 1];
  const tOf = x => { let a = 0, b = N - 1; while (b - a > 1) { const m = (a + b) >> 1; if (tau[m] <= x) a = m; else b = m; } const f = (x - tau[a]) / Math.max(1e-9, tau[b] - tau[a]); return (a + Math.min(1, Math.max(0, f))) * dt; };
  window.renderAt = x => renderAt(Math.min(duration, tOf(x))); window.renderScript = renderAt; window.DURATION = outDur; window.VMAX = hi; window.NEARFRAC = nb.reduce((a, b) => a + b, 0) / N; window.tOf = tOf;
  (async () => {
    await document.fonts.ready;
    await Promise.all(['300', '400', '500', '700', '900'].map(w => document.fonts.load(`${w} 20px "Noto Sans SC"`, '原子的精细结构角动量磁矩')));
    await Promise.all(['400', '500', '700'].map(w => document.fonts.load(`${w} 20px "JetBrains Mono"`, 'ABC 0.123 e-6')));
    // grain (static)
    { const gc = document.getElementById('grain'); if (gc) { const g = gc.getContext('2d'), im = g.createImageData(gc.width, gc.height), r = rng(99); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); } }
    for (const d of derivs) { d.base.forEach(x => x.querySelectorAll('.kk').forEach(e => e.style.display = 'inline-block')); }
    // typewriter + kicker prep
    for (const cd of cards) {
      const h3 = cd.el.querySelector('h3');
      if (h3) { const chars = []; const walk = n => { for (const ch of [...n.childNodes]) { if (ch.nodeType === 3) { const frag = document.createDocumentFragment(); for (const c of ch.textContent) { const sp = document.createElement('span'); sp.className = 'ch'; sp.textContent = c; frag.appendChild(sp); chars.push(sp); } ch.replaceWith(frag); } else if (ch.nodeType === 1 && !ch.classList.contains('katex')) walk(ch); } }; walk(h3); cd.chars = chars; }
      const k = cd.el.querySelector('.kick'); if (k) { cd.kick = k; cd.kickTxt = k.textContent; }
    }
    renderAt(0.01); await new Promise(r => setTimeout(r, 400)); await document.fonts.ready;
    for (const d of derivs) d.fit();
    await new Promise(r => setTimeout(r, 100));
    for (const d of derivs) d.measure();
    // capture card geometry, switch to 3D panel mode
    for (const cd of cards) {
      const el = cd.el; el.style.transform = cd.base; el.style.visibility = 'visible';
      const rc = el.getBoundingClientRect(); const w = Math.ceil(rc.width) + 2, h = Math.ceil(rc.height) + 2;
      const o = cd.opts || {}; const cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2;
      const side = cx < W * 0.42 ? 1 : cx > W * 0.58 ? -1 : 0;
      el.style.boxSizing = 'border-box'; el.style.width = w + 'px'; el.style.left = '0px'; el.style.top = '0px'; el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.transformOrigin = '0 0'; el.style.maxWidth = 'none';
      cd.panel = { w, h, cx, cy, yaw: o.yaw ?? side * (o.flat ? 0 : 13), pitch: o.pitch ?? (side === 0 ? (cy > H * 0.6 ? -9 : 8) : 3), yawIn: o.flat ? 0 : (side === 0 ? 0 : side * 22), depth: o.depth ?? 10 };
      if (!o.flat) {
        const ta = cd.t0 + 0.6; const pc = camPose(ta); setCam(tmpCam, pc, ta, false);
        cd.panel.anchor = tmpCam.matrixWorld.clone();
        // reference projection at anchor time
        cd.panel.ref = null; const save = camera.matrixWorld.clone();
        const D = cd.panel.depth, tanh = Math.tan(tmpCam.fov * Math.PI / 360), px = 2 * D * tanh / H;
        const c0 = V((cx - W / 2) * px, -(cy - H / 2) * px, -D), yaw = cd.panel.yaw * Math.PI / 180, pitch = cd.panel.pitch * Math.PI / 180;
        const r = V(Math.cos(yaw), 0, -Math.sin(yaw)), u = V(0, Math.cos(pitch), -Math.sin(pitch));
        const corners = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([a, b]) => c0.clone().add(r.clone().multiplyScalar(a * w * px / 2)).add(u.clone().multiplyScalar(b * h * px / 2)));
        cd.panel.ref = corners.map(q => { const p = q.clone().applyMatrix4(cd.panel.anchor).project(tmpCam); return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H]; });
      }
    }
    window.PANELS_READY = true;
    renderAt(0.01);
    window.READY = true;
  })();
}
