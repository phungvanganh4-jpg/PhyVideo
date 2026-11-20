// NOIR visual vocabulary: contour terrain · warped-grid funnel · swirl streaks · kinetic world type · mono tags · title/end sequences
import {
  THREE, V, UP, C, hex, clamp, ease, ep, win, rng, scene, camera, setOp, glow, glowTex, Label, homography, toScreen, hooks, postHooks, titleCtl, rayCtl, W, H, T
} from './engine.js';

const ov = document.getElementById('ov');
const wtLayer = document.createElement('div'); wtLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none'; ov.prepend(wtLayer);

// ---------------------------------------------------------------- deterministic noise
function hash2(x, y) { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; h = h ^ (h >> 16); return (h & 0xffffff) / 0xffffff; }
function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const s = v => v * v * (3 - 2 * v); const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1); const u = s(xf), v = s(yf); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
export function fbm(x, y, oct = 4) { let a = 0, f = 1, amp = 0.5; for (let i = 0; i < oct; i++) { a += amp * (vnoise(x * f, y * f) * 2 - 1); f *= 2.03; amp *= 0.5; } return a; }

// ---------------------------------------------------------------- line material with depth fade + radial reveal
function lineMat({ color = C.LINE, op = 1, fadeNear = 14, fadeFar = 60, additive = false } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(color) }, op: { value: op }, fN: { value: fadeNear }, fF: { value: fadeFar }, rev: { value: 1e6 }, revC: { value: new THREE.Vector3() }, hot: { value: new THREE.Color(C.O) } },
    vertexShader: `attribute float b; attribute float hotA; varying float vB; varying float vD; varying float vR; varying float vH; uniform vec3 revC;
      void main(){ vB=b; vH=hotA; vec4 wp = modelMatrix*vec4(position,1.); vR = length(wp.xz-revC.xz); vec4 mv = viewMatrix*wp; vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 col; uniform vec3 hot; uniform float op,fN,fF,rev; varying float vB; varying float vD; varying float vR; varying float vH;
      void main(){ if(vR>rev) discard; float f = 1.-smoothstep(fN,fF,vD); float edge = smoothstep(rev, rev-1.2, vR); vec3 c = mix(col, hot, vH); gl_FragColor = vec4(c, op*vB*f*edge); }`,
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
  });
}
function segGeom(pos, bright, hot) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('b', new THREE.Float32BufferAttribute(bright, 1));
  g.setAttribute('hotA', new THREE.Float32BufferAttribute(hot || new Array(bright.length).fill(0), 1));
  return g;
}

// ---------------------------------------------------------------- CONTOUR TERRAIN (marching squares)
// f(x,z) -> height ; draws iso-lines of height (topographic look), index contours brighter
export class ContourTerrain {
  constructor({ f, size = 30, res = 200, step = 0.08, y0 = 0, scaleY = 1, indexEvery = 5, color = C.LINE, op = 0.85, fadeNear = 12, fadeFar = 55, hotLevels = [], hotWidth = 0.5, parent = scene, center = [0, 0] } = {}) {
    this.g = new THREE.Group(); parent.add(this.g); this.g.position.y = y0;
    const N = res, S = size, cx0 = center[0], cz0 = center[1];
    const hgt = new Float32Array((N + 1) * (N + 1)); let hmin = 1e9, hmax = -1e9;
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const x = cx0 - S / 2 + S * i / N, z = cz0 - S / 2 + S * j / N; const h = f(x, z); hgt[j * (N + 1) + i] = h; hmin = Math.min(hmin, h); hmax = Math.max(hmax, h); }
    this.hmin = hmin; this.hmax = hmax; this.f = f; this.scaleY = scaleY;
    const pos = [], br = [], hot = [];
    const L0 = Math.ceil(hmin / step), L1 = Math.floor(hmax / step);
    const P = (i, j) => [cx0 - S / 2 + S * i / N, cz0 - S / 2 + S * j / N];
    for (let L = L0; L <= L1; L++) {
      const lv = L * step, b = (L % indexEvery === 0) ? 1.0 : 0.5;
      const isHot = hotLevels.some(h => Math.abs(h - lv) < step * hotWidth) ? 1 : 0;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const a = hgt[j * (N + 1) + i], bb = hgt[j * (N + 1) + i + 1], c = hgt[(j + 1) * (N + 1) + i + 1], d = hgt[(j + 1) * (N + 1) + i];
        let idx = 0; if (a > lv) idx |= 1; if (bb > lv) idx |= 2; if (c > lv) idx |= 4; if (d > lv) idx |= 8;
        if (idx === 0 || idx === 15) continue;
        const e = (p, q, ha, hb) => { const k = (lv - ha) / (hb - ha); return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]; };
        const p00 = P(i, j), p10 = P(i + 1, j), p11 = P(i + 1, j + 1), p01 = P(i, j + 1);
        const E0 = () => e(p00, p10, a, bb), E1 = () => e(p10, p11, bb, c), E2 = () => e(p01, p11, d, c), E3 = () => e(p00, p01, a, d);
        const segs = { 1: [[E3, E0]], 2: [[E0, E1]], 3: [[E3, E1]], 4: [[E1, E2]], 5: [[E3, E0], [E1, E2]], 6: [[E0, E2]], 7: [[E3, E2]], 8: [[E2, E3]], 9: [[E0, E2]], 10: [[E0, E1], [E2, E3]], 11: [[E1, E2]], 12: [[E1, E3]], 13: [[E0, E1]], 14: [[E0, E3]] }[idx];
        for (const [u, v] of segs) { const A = u(), B = v(); pos.push(A[0], lv * scaleY, A[1], B[0], lv * scaleY, B[1]); br.push(b, b); hot.push(isHot, isHot); }
      }
    }
    this.mat = lineMat({ color, op, fadeNear, fadeFar });
    this.lines = new THREE.LineSegments(segGeom(pos, br, hot), this.mat); this.g.add(this.lines);
    this.nseg = pos.length / 6;
  }
  heightAt(x, z) { return this.f(x, z) * this.scaleY + this.g.position.y; }
  point(x, z, lift = 0) { return V(x, this.heightAt(x, z) + lift, z); }
  set(op, reveal = 1e6, revC = [0, 0]) { this.g.visible = op > 0.004; this.mat.uniforms.op.value = op; this.mat.uniforms.rev.value = reveal; this.mat.uniforms.revC.value.set(revC[0], 0, revC[1]); }
}
// a funnel-ish potential with organic noise (Coulomb well + terrain)
export const wellField = ({ depth = 6, a = 1.2, noise = 0.35, nscale = 0.12, wells = [] } = {}) => (x, z) => {
  let h = -depth * a / Math.sqrt(x * x + z * z + a * a);
  for (const w of wells) h += -w.d * w.a / Math.sqrt((x - w.x) ** 2 + (z - w.z) ** 2 + w.a * w.a);
  return h + noise * fbm(x * nscale + 3.1, z * nscale - 1.7);
};

// ---------------------------------------------------------------- GRID FUNNEL (warped spacetime grid) + throat ring + swirl streaks
export class GridFunnel {
  constructor({ R = 22, depth = 9, a = 1.4, r0 = 1.25, lines = 46, twist = 2.2, color = C.LINE, op = 0.75, streaks = 520, parent = scene, ring = true, fadeNear = 10, fadeFar = 60 } = {}) {
    this.g = new THREE.Group(); parent.add(this.g); this.R = R; this.depth = depth; this.a = a; this.r0 = r0; this.twist = twist;
    const F = r => -depth * a / Math.sqrt(r * r + a * a); this.F = F;
    const pos = [], br = [];
    const map = (x, z) => { const r = Math.hypot(x, z); if (r < r0) return null; const th = Math.atan2(z, x) + twist * Math.exp(-(r - r0) / 3.2); return [r * Math.cos(th), F(r), r * Math.sin(th)]; };
    const n = 260;
    for (let k = 0; k <= lines; k++) {
      const c = -R + 2 * R * k / lines, b = (k % 5 === 0) ? 1 : 0.5;
      for (const dir of [0, 1]) {
        let prev = null;
        for (let i = 0; i <= n; i++) { const v = -R + 2 * R * i / n; const x = dir ? c : v, z = dir ? v : c; if (Math.hypot(x, z) > R) { prev = null; continue; } const q = map(x, z); if (q && prev) { pos.push(...prev, ...q); br.push(b, b); } prev = q; }
      }
    }
    // concentric rings for depth cue
    for (let k = 1; k <= 14; k++) { const r = r0 + (R - r0) * (k / 14) ** 1.6; let prev = null; for (let i = 0; i <= 180; i++) { const th = i / 180 * Math.PI * 2; const q = [r * Math.cos(th), F(r), r * Math.sin(th)]; if (prev) { pos.push(...prev, ...q); br.push(0.28, 0.28); } prev = q; } }
    this.mat = lineMat({ color, op, fadeNear, fadeFar });
    this.grid = new THREE.LineSegments(segGeom(pos, br), this.mat); this.g.add(this.grid);
    // throat: black core + glowing orange ring
    const yT = F(r0);
    this.core = new THREE.Mesh(new THREE.CircleGeometry(r0 * 1.02, 96), new THREE.MeshBasicMaterial({ color: 0x050403, side: THREE.DoubleSide, transparent: true }));
    this.core.rotation.x = -Math.PI / 2; this.core.position.y = yT - 0.02; this.g.add(this.core);
    this.ring = new THREE.Group(); this.g.add(this.ring); this.ring.position.y = yT;
    if (ring) {
      const rc = document.createElement('canvas'); rc.width = rc.height = 512; const gx = rc.getContext('2d');
      const gr = gx.createRadialGradient(256, 256, 256 * 0.38, 256, 256, 256);
      gr.addColorStop(0, 'rgba(255,120,40,0)'); gr.addColorStop(0.08, 'rgba(255,230,190,1)'); gr.addColorStop(0.14, 'rgba(255,130,50,.9)'); gr.addColorStop(0.35, 'rgba(255,90,20,.28)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
      gx.fillStyle = gr; gx.fillRect(0, 0, 512, 512);
      const tx = new THREE.CanvasTexture(rc);
      this.halo = new THREE.Mesh(new THREE.PlaneGeometry(r0 * 4.2, r0 * 4.2), new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      this.halo.rotation.x = -Math.PI / 2; this.ring.add(this.halo);
      this.haloB = glow(C.O, r0 * 6.5, 1); this.ring.add(this.haloB); // soft billboard bloom
    }
    // swirl streaks
    this.ns = streaks; const TL = 6; this.TL = TL;
    this.sp = new Float32Array(streaks * (TL - 1) * 2 * 3); this.sc = new Float32Array(streaks * (TL - 1) * 2 * 3);
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(this.sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(this.sc, 3));
    this.streak = new THREE.LineSegments(sg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); this.g.add(this.streak);
    const r = rng(41); this.par = Array.from({ length: streaks }, () => ({ ph: r(), th: r() * Math.PI * 2, lift: (r() - 0.3) * 0.5, sp: 0.5 + r(), w: r() < 0.82 ? 0 : 1 }));
  }
  surf(r, th, lift = 0) { return V(r * Math.cos(th), this.F(r) + lift, r * Math.sin(th)); }
  // point on the funnel surface (world) for text placement
  point(r, th, lift = 0) { const p = this.surf(r, th, lift); return p.applyMatrix4(this.g.matrixWorld); }
  set(t, op, { swirl = 1, ringI = 1 } = {}) {
    this.g.visible = op > 0.004; if (!this.g.visible) return;
    this.mat.uniforms.op.value = op * 0.8; setOp(this.core, op);
    if (this.halo) { this.halo.material.opacity = op * ringI; this.haloB.material.opacity = op * ringI * 0.32; }
    const { r0, TL } = this; const span = 9;
    const cO = new THREE.Color(C.O), cW = new THREE.Color(0xffe2c4);
    let k = 0;
    for (const P of this.par) {
      const life = (P.ph + t * 0.05 * P.sp) % 1;               // 0 → 1 spiral inward
      const rr = (u) => r0 * 1.05 + span * Math.pow(1 - u, 1.7);
      for (let s = 0; s < TL - 1; s++) {
        const u0 = life - s * 0.0045, u1 = life - (s + 1) * 0.0045;
        const r_0 = rr(u0), r_1 = rr(u1);
        const spin = u => 7.5 * Math.pow(Math.max(0, u), 2.4) * P.sp;   // winds up as it falls in
        const th0 = P.th + t * 0.22 * P.sp + spin(u0), th1 = P.th + t * 0.22 * P.sp + spin(u1);
        const a = this.surf(r_0, th0, P.lift * (r_0 / span) + 0.05), b = this.surf(r_1, th1, P.lift * (r_1 / span) + 0.05);
        const fade = (1 - s / (TL - 1)) * swirl * op * (0.35 + 0.65 * (1 - Math.min(1, (r_0 - r0) / span))) * Math.min(1, life * 6) * Math.min(1, (1 - life) * 12);
        const col = P.w ? cW : cO;
        this.sp.set([a.x, a.y, a.z, b.x, b.y, b.z], k * 6); this.sc.set([col.r * fade, col.g * fade, col.b * fade, col.r * fade * 0.6, col.g * fade * 0.6, col.b * fade * 0.6], k * 6); k++;
      }
    }
    this.streak.geometry.attributes.position.needsUpdate = true; this.streak.geometry.attributes.color.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- dust (sparse warm specks replacing stars)
export function dust(n = 900, R = 60, op = 0.45) {
  const r = rng(5), pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pos.set([(r() - 0.5) * R, (r() - 0.5) * R * 0.5, (r() - 0.5) * R], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.06, map: glowTex, color: 0xffd6b0, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(p); return p;
}

// ---------------------------------------------------------------- KINETIC WORLD TYPE
// Text laid on a 3D plane (anchor = baseline-left, right/up = in-plane axes), typed on with an orange spark cursor.
const kts = [];
export class KText {
  // screen: { x, y, planeY, tilt (0 = lying on the plane, 1 = standing), t (anchor time, default t0) } — place by screen point, resolved in world
  constructor({ text, t0, t1 = 1e9, at, right = V(1, 0, 0), up = V(0, 1, 0), h = 1, font = 'heavy', color, cps = 18, align = 'left', spark = true, underline = true, exit = 0.5, size = 150, html = false, screen = null } = {}) {
    Object.assign(this, { text, t0, t1, at, right, up, h, cps, align, spark, underline, exit, screen });
    this.el = document.createElement('div'); this.el.className = 'wt ' + font; this.el.style.fontSize = size + 'px'; if (color) this.el.style.color = color;
    if (html) { this.el.innerHTML = text; this.chars = []; } else { this.chars = [...text].map(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c === ' ' ? ' ' : c; this.el.appendChild(s); return s; }); }
    wtLayer.appendChild(this.el); this.size = size; kts.push(this);
    if (spark) { this.sp = glow(C.O, 1, 1); this.sp.material.depthTest = false; scene.add(this.sp); this.sp.visible = false; }
    if (underline) { this.ulN = 60; this.ulPos = new Float32Array((this.ulN + 1) * 3); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.ulPos, 3)); this.ul = new THREE.Line(g, new THREE.LineBasicMaterial({ color: C.O, transparent: true, blending: THREE.AdditiveBlending, depthTest: false })); scene.add(this.ul); this.ul.visible = false; }
  }
  measure() {
    this.w = this.el.offsetWidth; this.hp = this.el.offsetHeight; this.offs = this.chars.map(c => c.offsetLeft + c.offsetWidth);
    if (this.screen && rayCtl.ray) {
      const S = this.screen, R = rayCtl.ray(S.t ?? this.t0 + 0.3, S.x, S.y); const py = S.planeY ?? -2.5;
      const k = (py - R.o.y) / R.d.y; this.at = R.o.clone().add(R.d.clone().multiplyScalar(k > 0 ? k : 12));
      const right = R.right.clone(); right.y = 0; right.normalize(); const fwd = R.fwd.clone(); fwd.y = 0; fwd.normalize();
      const tilt = S.tilt ?? 0.45; this.right = right; this.up = fwd.multiplyScalar(1 - tilt).add(V(0, tilt, 0)).normalize();
      if (S.h) this.h = S.h;
      if (S.px) { const dist = this.at.distanceTo(R.o); this.h = S.px * dist * 2 * Math.tan(R.fov * Math.PI / 360) / H / Math.max(0.35, Math.abs(this.up.dot(R.d.clone().negate().cross(this.right).normalize())) || 0.6); }
    }
  }
  frame(t) {
    const o = win(t, this.t0 - 0.05, this.t1, this.exit);
    if (o < 0.003) { this.el.style.opacity = 0; if (this.sp) this.sp.visible = false; if (this.ul) this.ul.visible = false; return; }
    const at = typeof this.at === 'function' ? this.at(t) : this.at;
    const right = (typeof this.right === 'function' ? this.right(t) : this.right).clone().normalize(), up = (typeof this.up === 'function' ? this.up(t) : this.up).clone().normalize();
    const Ww = this.h * this.w / this.hp, Hh = this.h;
    const base = at.clone().sub(right.clone().multiplyScalar(this.align === 'center' ? Ww / 2 : this.align === 'right' ? Ww : 0));
    const TL = base.clone().add(up.clone().multiplyScalar(Hh)), TR = TL.clone().add(right.clone().multiplyScalar(Ww)), BR = base.clone().add(right.clone().multiplyScalar(Ww)), BL = base;
    const pts = [TL, TR, BR, BL].map(p => toScreen(p));
    if (!pts.every(Boolean)) { this.el.style.opacity = 0; return; }
    this.el.style.transform = homography(this.w, this.hp, pts); this.el.style.opacity = o;
    // typing
    const N = this.chars.length; const k = N ? clamp((t - this.t0) * this.cps / N) : 1; const n = Math.ceil(k * N - 1e-6);
    const ex = clamp((t - (this.t1 - this.exit)) / this.exit);
    this.chars.forEach((e, j) => { const on = j < n && (ex <= 0 || j / N > ex); const cur = j === n - 1 && k < 1; const cls = 'ch' + (on ? ' on' : '') + (cur ? ' cur' : ''); if (e.className !== cls) e.className = cls; });
    const fr = N ? (n > 0 ? this.offs[n - 1] / this.w : 0) : 1;
    const cursor = base.clone().add(right.clone().multiplyScalar(Ww * fr)).add(up.clone().multiplyScalar(Hh * 0.45));
    if (this.sp) { const on = k < 1 && k > 0; this.sp.visible = on; if (on) { this.sp.position.copy(cursor); const d = cursor.distanceTo(camera.position); const fl = 0.75 + 0.25 * Math.sin(t * 47); this.sp.scale.setScalar(Hh * 1.1 * fl); this.sp.material.opacity = 0.9 * o; } }
    if (this.ul) {
      const uo = o * (k < 1 ? 1 : Math.max(0.0, 1 - (t - this.t0 - N / this.cps) * 1.2)) ;
      this.ul.visible = uo > 0.01; if (this.ul.visible) {
        for (let i = 0; i <= this.ulN; i++) { const f = i / this.ulN * fr; const jit = Math.sin(i * 1.7 + t * 30) * 0.06 * Hh * (1 - i / this.ulN) + Math.sin(i * 0.33) * 0.03 * Hh; const p = base.clone().add(right.clone().multiplyScalar(Ww * f)).add(up.clone().multiplyScalar(-0.12 * Hh + jit)); this.ulPos.set([p.x, p.y, p.z], i * 3); }
        this.ul.geometry.attributes.position.needsUpdate = true; this.ul.material.opacity = uo;
      }
    }
  }
}
// text bent along a path: path(s) -> {p, right, up} with s = arc length from start (world units)
export class KPath {
  constructor({ text, t0, t1 = 1e9, path, h = 1, font = 'heavy', color, cps = 22, size = 150, spacing = 1.0, exit = 0.5, s0 = 0, fit = 0 } = {}) {
    Object.assign(this, { text, t0, t1, path, h, cps, spacing, exit, s0, fit });
    this.chars = [...text].map(c => { const e = document.createElement('div'); e.className = 'wt ' + font; e.style.fontSize = size + 'px'; if (color) e.style.color = color; const sp = document.createElement('span'); sp.className = 'ch'; sp.textContent = c === ' ' ? ' ' : c; e.appendChild(sp); wtLayer.appendChild(e); return { e, sp }; });
    kts.push(this);
  }
  measure() { this.cw = this.chars.map(c => [c.e.offsetWidth, c.e.offsetHeight]); if (this.fit) { const L = this.cw.reduce((a, [w, h]) => a + this.h * w / h, 0); this.spacing = this.fit / L; } }
  frame(t) {
    const o = win(t, this.t0 - 0.05, this.t1, this.exit);
    const N = this.chars.length, k = clamp((t - this.t0) * this.cps / N), n = Math.ceil(k * N - 1e-6);
    let s = typeof this.s0 === 'function' ? this.s0(t) : this.s0;
    this.chars.forEach((c, j) => {
      const [wp, hp] = this.cw[j]; const ww = this.h * wp / hp * this.spacing; const sm = s + ww / 2; s += ww;
      if (o < 0.003 || j >= n) { c.e.style.opacity = 0; return; }
      const fr = this.path(sm, t); const r = fr.right.clone().normalize(), u = fr.up.clone().normalize(); const hw = this.h * wp / hp / 2;
      const base = fr.p.clone().sub(r.clone().multiplyScalar(hw));
      const TL = base.clone().add(u.clone().multiplyScalar(this.h)), TR = TL.clone().add(r.clone().multiplyScalar(2 * hw)), BR = base.clone().add(r.clone().multiplyScalar(2 * hw)), BL = base;
      const pts = [TL, TR, BR, BL].map(p => toScreen(p)); if (!pts.every(Boolean)) { c.e.style.opacity = 0; return; }
      c.e.style.transform = homography(wp, hp, pts); c.e.style.opacity = o; const cls = 'ch on' + (j === n - 1 && k < 1 ? ' cur' : ''); if (c.sp.className !== cls) c.sp.className = cls;
    });
  }
}
let measured = false;
postHooks.push(t => { if (!measured) { kts.forEach(k => k.measure()); measured = true; } kts.forEach(k => k.frame(t)); });
export function remeasureKT() { measured = false; }

// ---------------------------------------------------------------- mono tags attached to 3D points (e.g. "1e-6", "ΔE 2.1e-3 eV")
export function tag(text, color = hex(C.O), size = 20) { return new Label(text, color, { tag: true, size }); }
export function ctag(text, size = 20) { return new Label(text, hex(C.LINE), { tag: true, size }); }

// ---------------------------------------------------------------- beat map of the recording's opening ("da-da-da-DUM")
export const BEATS = { b1: 0.44, b2: 0.60, b3: 0.74, dum: 0.84, b5: 3.70, b6: 3.78, b7: 3.86, dum2: 4.0 };

// ---------------------------------------------------------------- TITLE SEQUENCE (music-synced, 0 – ~11 s)
// Builds its own funnel far below the main scene and overrides the camera until `end`.
export function titleSequence({ epn = '01', main = '原子的精细结构', sub = '', ring = 'ATOMIC FINE STRUCTURE · CHAPTER 04 · ', tags = ['μB 9.274e-24 J/T', 'gs 2.0023', 'ΔE 2.1e-3 eV'], end = 10.4, origin = V(0, -80, 0) } = {}) {
  const fun = new GridFunnel({ R: 24, depth: 9, a: 1.5, r0: 1.4, streaks: 560 });
  fun.g.position.copy(origin); fun.g.updateMatrixWorld(true);
  const O = origin;
  // three beat tags pinned onto the funnel slope
  const tagPts = [[6.5, 0.6], [9.5, 2.5], [5.0, 4.2]];
  const tl = tags.map((tx, i) => ({ L: tag(tx, hex(C.O), 24), p: () => fun.point(tagPts[i][0], tagPts[i][1], 0.05), t: [BEATS.b1, BEATS.b2, BEATS.b3][i] }));
  // big title typed on the slope (receding), at DUM
  const thT = 2.35; const rT = 5.2;
  const mainKT = new KText({ text: main, t0: BEATS.dum, t1: end - 0.2, cps: 26, h: 1.55, at: fun.point(rT, thT, 0.12), right: V(Math.cos(thT + Math.PI / 2), 0, Math.sin(thT + Math.PI / 2)).multiplyScalar(-1).add(V(0, -0.05, 0)), up: V(-Math.cos(thT), 0.55, -Math.sin(thT)), align: 'center' });
  // episode line at second DUM
  const epKT = new KText({ text: sub, t0: BEATS.dum2, t1: end - 0.2, cps: 24, h: 0.62, at: fun.point(rT + 2.2, thT, 0.1), right: mainKT.right, up: mainKT.up, align: 'center', underline: false });
  const epNum = new KText({ text: 'EP.' + epn, t0: BEATS.b5, t1: end - 0.2, cps: 30, h: 0.45, font: 'mono', at: fun.point(rT - 1.9, thT, 0.1), right: mainKT.right, up: mainKT.up, align: 'center', underline: false, spark: false });
  // ring text curved around throat
  const rr = fun.r0 * 1.9;
  const ringKT = new KPath({ text: ring, fit: 2 * Math.PI * fun.r0 * 1.9, t0: 1.6, t1: end - 0.2, h: 0.42, font: 'heavy', cps: 40, size: 120, s0: t => -t * 0.35, path: (s, t) => { const th = -s / rr; const p = fun.point(rr, th, 0.05); const tang = V(-Math.sin(th), 0, Math.cos(th)).multiplyScalar(-1); const radial = V(Math.cos(th), 0, Math.sin(th)).multiplyScalar(-1); return { p, right: tang, up: radial.add(V(0, 0.25, 0)) }; } });
  // camera: high crane → push along slope (rolled) → dive into throat
  const cam = t => {
    const keys = [
      { u: 0.0, p: [6, 26, 17], l: [0, -4, 0], roll: -6, fov: 46 },
      { u: 0.84, p: [4.5, 16, 14], l: [0, -4.5, 0], roll: -10, fov: 44 },
      { u: 3.9, p: [-2.5, 8.5, 12.5], l: [-2.5, -3.0, 2.5], roll: -16, fov: 40 },
      { u: 7.2, p: [-4.5, 4.2, 6.5], l: [0, -6.5, 0], roll: -20, fov: 42 },
      { u: end, p: [0.4, 1.5, 1.0], l: [0, -12, 0], roll: 8, fov: 60 },
    ];
    const i = keys.findIndex((k, j) => j + 1 < keys.length && t >= k.u && t < keys[j + 1].u);
    const a = keys[Math.max(0, i)], b = keys[Math.min(keys.length - 1, Math.max(0, i) + 1)];
    const f = i < 0 ? (t < keys[0].u ? 0 : 1) : (t - a.u) / (b.u - a.u); const e = i === keys.length - 2 ? f * f * f : ease(f);
    const A = i < 0 && t >= keys[keys.length - 1].u ? keys[keys.length - 1] : a, Bk = i < 0 && t >= keys[keys.length - 1].u ? keys[keys.length - 1] : b;
    const L = (x, y) => x.map((v, j) => v + (y[j] - v) * e);
    return { p: L(A.p, Bk.p).map((v, j) => v + O.toArray()[j]), l: L(A.l, Bk.l).map((v, j) => v + O.toArray()[j]), roll: A.roll + (Bk.roll - A.roll) * e, fov: A.fov + (Bk.fov - A.fov) * e, s: 0 };
  };
  titleCtl.cam = cam; titleCtl.end = end; titleCtl.blend = 0;
  hooks.push(t => {
    const op = t < end ? 1 : 0; const pulse = 1 + 0.5 * Math.exp(-((t - BEATS.dum) ** 2) / 0.02) + 0.4 * Math.exp(-((t - BEATS.dum2) ** 2) / 0.02);
    fun.set(t, op * ep(t, 0.05, 0.5), { swirl: ep(t, 0.3, 1.2), ringI: pulse * ep(t, 0.6, 1.0) });
    for (const x of tl) x.L.place(x.p(), op * ep(t, x.t, x.t + 0.06) * (1 - ep(t, end - 1.2, end - 0.4)));
  });
  return { fun, mainKT, epKT };
}

// ---------------------------------------------------------------- END SEQUENCE: funnel + "第 N 集 · 完" + next
export function endSequence({ t0, t1, text = '第 1 集 · 完', next = '', origin = V(0, -80, 0) } = {}) {
  const fun = new GridFunnel({ R: 22, depth: 8, a: 1.4, r0: 1.3, streaks: 420 });
  fun.g.position.copy(origin); fun.g.updateMatrixWorld(true);
  const th = 2.2;
  const kt = new KText({ text, t0: t0 + 1.0, t1, cps: 16, h: 0.95, at: fun.point(5.6, th, 0.12), right: V(-Math.cos(th + Math.PI / 2), -0.05, -Math.sin(th + Math.PI / 2)), up: V(-Math.cos(th), 0.55, -Math.sin(th)), align: 'center' });
  const nx = next ? new KText({ text: next, t0: t0 + 2.4, t1, cps: 34, h: 0.36, font: 'mono', at: fun.point(7.3, th, 0.1), right: kt.right, up: kt.up, align: 'center', underline: false, spark: false }) : null;
  hooks.push(t => { const op = win(t, t0, t1 + 2, 0.8); fun.set(t, op, { swirl: op, ringI: op }); });
  const ex = Math.cos(th), ez = Math.sin(th);
  return { fun, cam: u => ({ p: [origin.x + ex * (13.5 - u * 0.25) + ez * 2.0, origin.y + 7.2 - u * 0.2, origin.z + ez * (13.5 - u * 0.25) - ex * 2.0], l: [origin.x + ex * 3.5, origin.y - 3.6, origin.z + ez * 3.5], roll: -10 + u * 0.8, fov: 44 }) };
}
