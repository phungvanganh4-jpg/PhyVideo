// EP2 — 4.2 施特恩-盖拉赫实验
import {
  THREE, T, V, UP, C, hex, ep, win, rampInt, clamp, rng, scene, camera, setOp, phys, metal, glow, glowTex, fresnel, Arrow, Cone, ringLine, polyLine,
  nucleus, electron, Field, Label, card, overlay, POS, kick, chainHTML, setStations, setChips, svgDensity, gauss, edges,
  orbitShot, fixedShot, run
, deriv } from './engine.js';
import { ContourTerrain, KText, tag, ctag, dust, fbm, titleSequence, endSequence } from './noir.js';
import { pathShot, setFog, hooks } from './engine.js';

const DUR = 392;
titleSequence({ epn: '02', main: '施特恩-盖拉赫实验', sub: '第 2 集 · 4.2 用实验看见空间量子化', ring: 'STERN–GERLACH · 1921 · ' });
window.NO_END_FALLBACK = true;
const END = endSequence({ t0: 384, t1: 392, text: '第 2 集 · 完', next: 'NEXT ▸ 电子自旋假设 / ELECTRON SPIN' });
setFog(20, 66);
dust(700, 60, 0.3);
// ---------------------------------------------------------------- the world floor: a valley under the beam that splits in two after the magnet
const gss = (u, w) => Math.exp(-u * u / (2 * w * w));
const sepAt = x => x < -2.5 ? 0 : Math.min(4.2, 0.05 * (x + 2.5) ** 2);
const FF = (x, z) => { const s = sepAt(x), w = 1.25 + 0.04 * Math.max(0, x + 2.5); return -1.9 * Math.max(gss(z - s, w), gss(z + s, w)) * (0.55 + 0.45 * gss(x + 1, 22)) - 1.1 * (gss(x - 9.5, 2.2) * (gss(z - 4.2, 1.6) + gss(z + 4.2, 1.6))) + 0.5 * fbm(x * 0.11 + 3.1, z * 0.11 - 1.7); };
const terr = new ContourTerrain({ f: FF, size: 60, res: 240, step: 0.07, y0: -3.6, indexEvery: 5, hotLevels: [FF(9.5, 4.2) + 0.25, FF(9.5, 4.2) + 0.6], hotWidth: 0.5, fadeNear: 12, fadeFar: 58 });
const fl = (tx, x, z, orange = true, sz = 20) => ({ L: orange ? tag(tx, hex(C.O), sz) : ctag(tx, sz - 2), p: terr.point(x, z, 0.06) });
// apparatus numbers (pinned on the floor beneath the beam)
const tA = [{ L: ctag('v 750 m/s', 18), p: V(-6.0, -1.1, 1.0) }, { L: tag('∂B/∂z 1.4 T/mm', hex(C.O), 20), p: V(-2.9, -2.2, 1.3) }, { L: ctag('μB 9.274e-24 J/T', 18), p: V(6.5, -2.15, 0.4) }];
// expectation / result numbers near the screen
const tR = [{ L: tag('z₂ 0.08 mm', hex(C.O), 20), p: V(6.42, -1.8, 0), dy: 24 }, { L: ctag('Δ 0.16 mm', 18), p: V(6.42, -1.8, 0), dy: 60 }];
// oven / ground-state section
const tH = [{ L: tag('Ek 9.0 eV < 10.2 eV', hex(C.O), 20), p: V(0, 0, 0), dx: 0, dy: 125 }, { L: ctag('T 7e4 K', 18), p: V(0, 0, 0), dx: 0, dy: 162 }];
// example section (numbers of example 1)
const tX = [{ L: ctag('d 3.5 cm', 18), p: V(3.2, -2.0, 0), dx: -200, dy: 70 }, { L: ctag('m 1.79e-25 kg', 18), p: V(3.2, -2.0, 0), dx: 200, dy: 70 }, { L: ctag('v 750 m/s', 18), p: V(3.2, -2.0, 0), dx: 0, dy: 110 }, { L: tag('μz 9.39e-24 J/T', hex(C.O), 22), p: V(3.2, -2.0, 0), dx: 0, dy: 34 }];
const contourNums = [['1e-6', 6, -5], ['3e-9', -8, -6], ['2e-7', 9, 4.5], ['1e-8', -9, 5.5]].map(([tx, x, z]) => fl(tx, x, z, false, 18));
hooks.push(t => {
  const op = win(t, 10.0, 385, 0.3); terr.set(op, 9 + 50 * ep(t, 10.3, 15.0), [0, 5]);
  const pl = (arr, a, b, st = 0.5) => arr.forEach((e, i) => e.L.place(e.p, op * win(t, a + i * st, b)));
  const cno = Math.max(win(t, 13, 44.2, 0.6), win(t, 58.5, 116.6, 0.6));
  contourNums.forEach((e, i) => e.L.place(e.p, op * 0.85 * cno * ep(t, 13 + i * 0.4, 13.6 + i * 0.4)));
  tA.forEach((e, i) => e.L.place(e.p, op * win(t, 45 + i * 0.6, 76)));
  tR.forEach((e, i) => e.L.place(e.p, op * win(t, 251 + i * 0.5, 281), 0, e.dy)); tH.forEach((e, i) => e.L.place(e.p, op * win(t, 108 + i * 1.5, 130), e.dx, e.dy));
  tX.forEach((e, i) => e.L.place(e.p, op * win(t, i < 3 ? 284 + i * 0.6 : 318, 346), e.dx, e.dy));
});
// hero words: kinetic type laid into the world
const KT = (o) => new KText({ cps: 18, ...o });
setStations([['定位', 11, 36], ['实验装置', 36, 76], ['原子与速度', 76, 130], ['受力与轨迹', 130, 200], ['预期与结果', 200, 280], ['例题', 280, 346], ['小结', 346, 384]]);
setChips([[11, 36, '4.2', '本集在主线中的位置'], [36, 76, '4.2.1', '实验装置'], [76, 130, '4.2.2', '实验原理：原子从哪里来'], [130, 200, '4.2.2', '实验原理：受力与轨迹'], [200, 280, '4.2.3', '实验结果及分析'], [280, 346, '例题 1', '由偏转求银原子磁矩'], [346, 384, '✓', '本集小结']]);

// ---------------------------------------------------------------- intro: chain + motivation
card(12, 36, 'left:110px;bottom:84px;width:1700px;padding:22px 30px', chainHTML(0), { flat: true, world: 0 });
card(14, 36, POS.TC + 'width:1100px;text-align:center', `${kick('WHERE WE ARE')}<h3>非均匀磁场 → 受力 → 偏转</h3><div data-at="3">1921 年，施特恩（O. Stern）与盖拉赫（W. Gerlach）</div><div data-at="6">本想<span class="k">验证轨道角动量的空间量子化</span>，</div><div data-at="10">却意外发现了<span class="m">电子自旋</span>存在的证据</div><div class="s" data-at="14">原子物理中最重要的实验之一</div>`);

// ---------------------------------------------------------------- apparatus
const A = { g: new THREE.Group() }; scene.add(A.g);
{
  A.oven = new THREE.Group(); A.g.add(A.oven);
  const oven = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.2, 48), metal(0x5a3a28)); oven.rotation.z = Math.PI / 2; oven.position.set(-7.3, 0, 0); A.oven.add(oven, edges(oven, 0xff6a1f, 0.5));
  A.hole = glow(0xff7a2e, 1.6); A.hole.position.set(-6.68, 0, 0); A.oven.add(A.hole);
  A.slits = new THREE.Group(); A.g.add(A.slits);
  const plate = (x) => { for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.75, 1.6), metal(0x5a544c)); m.position.set(x, s * 0.44, 0); A.slits.add(m, edges(m, 0xd8d1c4, 0.35)); } };
  plate(-5.6); plate(-4.6);
  A.mag = new THREE.Group(); A.g.add(A.mag);
  const up = new THREE.Shape(); [[-1.2, 1.9], [1.2, 1.9], [1.2, 0.9], [0, 0.3], [-1.2, 0.9]].forEach(([x, y], i) => i ? up.lineTo(x, y) : up.moveTo(x, y));
  const lo = new THREE.Shape(); [[-1.2, -1.9], [1.2, -1.9], [1.2, -0.5], [0.42, -0.5], [0.2, -0.8], [-0.2, -0.8], [-0.42, -0.5], [-1.2, -0.5]].forEach(([x, y], i) => i ? lo.lineTo(x, y) : lo.moveTo(x, y));
  const ex = { depth: 5, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 };
  const mU = new THREE.Mesh(new THREE.ExtrudeGeometry(up, ex), metal(0x3a4650, { opacity: 0.95, roughness: 0.45 }));
  const mL = new THREE.Mesh(new THREE.ExtrudeGeometry(lo, ex), metal(0x5c2a1c, { opacity: 0.95, roughness: 0.45 }));
  for (const m of [mU, mL]) { m.rotation.y = Math.PI / 2; m.position.x = -2.5; A.mag.add(m); }
  A.mag.add(edges(mU, C.B, 0.8), edges(mL, C.MU, 0.8));
  A.scr = new THREE.Group(); A.g.add(A.scr);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.6), new THREE.MeshPhysicalMaterial({ color: 0xd8d1c4, transparent: true, opacity: 0.1, side: THREE.DoubleSide, roughness: 0.1, metalness: 0, clearcoat: 1 }));
  scr.rotation.y = -Math.PI / 2; scr.position.set(6.5, 0, 0); A.scr.add(scr, edges(scr, 0xd8d1c4, 0.6));
  // vacuum chamber (wire box)
  const box = new THREE.Mesh(new THREE.BoxGeometry(15.6, 4.6, 3.2)); box.position.set(-0.4, 0, 0);
  A.vac = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineDashedMaterial({ color: 0x9a9184, dashSize: 0.2, gapSize: 0.15, transparent: true, opacity: 0.5 }));
  A.vac.position.copy(box.position); A.vac.computeLineDistances(); A.g.add(A.vac);
  // screen patterns
  const pat = (draw) => {
    const c = document.createElement('canvas'); c.width = 260; c.height = 360; const g = c.getContext('2d'); draw(g);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.6), new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.y = -Math.PI / 2; m.position.set(6.47, 0, 0); A.g.add(m); return m;
  };
  const band = (g, yc, hh, col) => { const gr = g.createLinearGradient(0, yc - hh, 0, yc + hh); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(130, yc, 70, hh, 0, 0, Math.PI * 2); g.fill(); };
  A.p0 = pat(g => band(g, 180, 14, 'rgba(255,191,115,1)'));
  A.p1 = pat(g => { const gr = g.createLinearGradient(0, 40, 0, 320); gr.addColorStop(0, 'rgba(255,191,115,0)'); gr.addColorStop(0.15, 'rgba(255,191,115,.7)'); gr.addColorStop(0.85, 'rgba(255,191,115,.7)'); gr.addColorStop(1, 'rgba(255,191,115,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(130, 180, 70, 140, 0, 0, Math.PI * 2); g.fill(); });
  A.p2 = pat(g => { band(g, 180 - 120, 15, 'rgba(255,106,31,1)'); band(g, 180 + 120, 15, 'rgba(169,200,220,1)'); });
  A.p3 = pat(g => { [-2, -1, 0, 1, 2].forEach(k => band(g, 180 + k * 55, 11, 'rgba(255,191,115,.9)')); });
  // particles
  A.N = 480; A.pp = new Float32Array(A.N * 3); A.pc = new Float32Array(A.N * 3);
  const r = rng(11); A.par = Array.from({ length: A.N }, () => ({ off: r(), z: (r() - 0.5) * 0.6, s: r() * 2 - 1, two: r() < 0.5 ? 1 : -1, five: Math.floor(r() * 5) - 2 }));
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(A.pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(A.pc, 3));
  A.pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.15, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); A.g.add(A.pts);
  // orange streaks (tail of each atom)
  A.SK = 5; A.sp = new Float32Array(A.N * A.SK * 2 * 3); A.sc = new Float32Array(A.N * A.SK * 2 * 3);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(A.sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(A.sc, 3));
  A.streak = new THREE.LineSegments(sg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); A.g.add(A.streak); A.pts.frustumCulled = false; A.streak.frustumCulled = false;
  // screen glows (spots light up where atoms land)
  A.g0 = glow(C.O, 1.5, 0); A.g0.position.set(6.42, 0, 0); A.g.add(A.g0);
  A.g2a = glow(C.O, 1.6, 0); A.g2a.position.set(6.42, 1.2, 0); A.g2b = glow(C.E, 1.6, 0); A.g2b.position.set(6.42, -1.2, 0); A.g.add(A.g2a, A.g2b);
  A.g1 = glow(C.J, 3.2, 0); A.g1.position.set(6.42, 0, 0); A.g.add(A.g1);
  // trajectory geometry (side view): parabola in magnet then straight line
  A.traj = polyLine(Array.from({ length: 80 }, (_, i) => V(0, 0, 0)), C.J, 1); A.g.add(A.traj);
  A.trajDash = polyLine([V(-2.5, 0, 0), V(6.5, 0, 0)], 0xffffff, 0.35, true, 0.1); A.g.add(A.trajDash);
  // dimension lines d, D
  A.dimd = new THREE.Group(); A.g.add(A.dimd);
  A.dimd.add(polyLine([V(-2.5, -2.15, 1.0), V(2.5, -2.15, 1.0)], 0xe9e2d6, 0.8));
  [-2.5, 2.5].forEach(x => A.dimd.add(polyLine([V(x, -2.0, 1.0), V(x, -2.3, 1.0)], 0xe9e2d6, 0.8)));
  A.dimD = new THREE.Group(); A.g.add(A.dimD);
  A.dimD.add(polyLine([V(0, -2.55, 1.0), V(6.5, -2.55, 1.0)], 0xe9e2d6, 0.8));
  [0, 6.5].forEach(x => A.dimD.add(polyLine([V(x, -2.4, 1.0), V(x, -2.7, 1.0)], 0xe9e2d6, 0.8)));
  A.dimz = new Arrow(C.J, { r: 0.02, hr: 0.06, hl: 0.16, parent: A.g });
  A.fieldLines = new THREE.Group(); A.g.add(A.fieldLines);
  for (let k = -3; k <= 3; k++) {
    const pts = []; for (let i = 0; i <= 20; i++) { const y = -0.5 + 0.8 * i / 20; const z = k * 0.22 * (1 - 0.7 * (y + 0.5) / 0.8); pts.push(V(-2.5, y, z)); }
    const l = polyLine(pts, C.B, 0.7); A.fieldLines.add(l);
  }
}
A.lab = {
  o: new Label('电炉 O：加热原子气体', '#ff9a5a'), s: new Label('狭缝 S₁ S₂：准直成原子束', '#d8d1c4'), m: new Label('磁场区 SN（沿 z，非均匀）', hex(C.B)),
  S: new Label('S', hex(C.B), { bare: true, size: 34 }), N: new Label('N', hex(C.MU), { bare: true, size: 34 }), p: new Label('屏 P：记录原子位置', '#efe8dc'),
  vac: new Label('真空容器', '#9a9184', { size: 21 }), d: new Label(T`d`, '#e9e2d6', { bare: true, size: 30 }), D: new Label(T`D`, '#e9e2d6', { bare: true, size: 30 }),
  z1: new Label(T`z_1`, hex(C.J), { bare: true, size: 28 }), z2: new Label(T`z_2`, hex(C.J), { bare: true, size: 30 }), x: new Label(T`x`, '#e9e2d6', { bare: true, size: 28 }), zax: new Label(T`z`, '#e9e2d6', { bare: true, size: 28 }),
  grad: new Label(T`\partial B/\partial z\neq0`, hex(C.B), { size: 22 })
};
A.xax = new Arrow(0xe9e2d6, { r: 0.015, hr: 0.05, hl: 0.16, parent: A.g }); A.zax = new Arrow(0xe9e2d6, { r: 0.015, hr: 0.05, hl: 0.16, parent: A.g });
// modes: 0 none, 1 classical, 2 two, 3 odd(5), 4 straight(l=0)
let MODE_TL = [[0, 'off']];
function modeAt(te) { let m = 0; for (const [t0, md] of MODE_TL) if (te >= t0) m = md; return m; }
MODE_TL = [[0, 'off'], [44, 0], [214, 1], [226, 4], [238, 3], [250, 2]];
function sgDefl(x) { const a = 1.25 / 65; if (x < -2.5) return 0; if (x < 2.5) return a * (x + 2.5) ** 2; return a * 25 + a * 10 * (x - 2.5); }
function updateA(t) {
  const op = Math.max(win(t, 36, 77, 1.6), win(t, 129, 281, 1.6), win(t, 344.8, 385, 1.2));
  A.g.visible = op > 0.004; if (!A.g.visible) { Object.values(A.lab).forEach(l => l.place(V(), 0)); return; }
  setOp(A.oven, op * ep(t, 37, 39)); setOp(A.slits, op * ep(t, 40, 42)); setOp(A.mag, op * ep(t, 43, 45) * (1 - 0.72 * ep(t, 131, 134) * (1 - ep(t, 198, 201)))); setOp(A.scr, op * ep(t, 46, 48)); setOp(A.vac, op * win(t, 49, 76));
  A.hole.material.opacity = 0.45 * op * (0.8 + 0.2 * Math.sin(t * 3));
  // particles
  const x0 = -6.7, x1 = 6.45, Lb = x1 - x0, sp = 4.2;
  const sideView = ep(t, 130, 133) * (1 - ep(t, 198, 201));
  const SL = 0.6;
  for (let i = 0; i < A.N; i++) {
    const P = A.par[i]; const ph = ((t * sp / Lb + P.off) % 1); const x = x0 + ph * Lb; const te = t - ph * Lb / sp;
    const md = modeAt(te);
    if (md === 'off' || sideView > 0.5) { A.pp.set([0, -999, 0], i * 3); for (let k = 0; k < A.SK; k++) { A.sp.set([0, -999, 0, 0, -999, 0], (i * A.SK + k) * 6); A.sc.fill(0, (i * A.SK + k) * 6, (i * A.SK + k) * 6 + 6); } continue; }
    let col = [1, 0.42, 0.12];
    if (md === 2) col = P.two > 0 ? [1, 0.42, 0.12] : [0.62, 0.76, 0.86];
    const yAt = xx => md === 1 ? P.s * sgDefl(xx) : md === 2 ? P.two * sgDefl(xx) : md === 3 ? P.five / 2 * sgDefl(xx) * 0.88 : 0;
    const zAt = xx => P.z * (xx < -4.6 ? 0.3 : 1);
    A.pp.set([x, yAt(x), zAt(x)], i * 3); A.pc.set([1, 0.85, 0.7].map((c, j) => (c * 0.35 + col[j] * 0.65) * op * 0.9), i * 3);
    for (let k = 0; k < A.SK; k++) {
      const xa = Math.max(x0, x - SL * k / A.SK), xb = Math.max(x0, x - SL * (k + 1) / A.SK); const fa = (1 - k / A.SK) * op, fb = (1 - (k + 1) / A.SK) * op;
      const o6 = (i * A.SK + k) * 6; A.sp.set([xa, yAt(xa), zAt(xa), xb, yAt(xb), zAt(xb)], o6); A.sc.set([col[0] * fa, col[1] * fa, col[2] * fa, col[0] * fb, col[1] * fb, col[2] * fb], o6);
    }
  }
  A.streak.geometry.attributes.position.needsUpdate = true; A.streak.geometry.attributes.color.needsUpdate = true;
  A.pts.geometry.attributes.position.needsUpdate = true; A.pts.geometry.attributes.color.needsUpdate = true;
  const pw = (a, b) => win(t, a, b, 0.8) * op;
  setOp(A.p0, Math.max(pw(47, 217), pw(229, 241))); setOp(A.p1, pw(217, 229)); setOp(A.p3, pw(241, 253)); setOp(A.p2, Math.max(pw(253, 281), pw(346, 385)));
  const fl_ = 0.85 + 0.15 * Math.sin(t * 5.3);
  A.g0.material.opacity = 0.55 * fl_ * Math.max(pw(47, 217), pw(229, 241)); A.g1.material.opacity = 0.3 * fl_ * pw(217, 229);
  A.g2a.material.opacity = A.g2b.material.opacity = 0.6 * fl_ * Math.max(pw(253, 281), pw(346, 385));
  // side-view trajectory and dimensions (130-200)
  const trO = op * win(t, 150, 200);
  const pa = A.traj.geometry.attributes.position; const draw = ep(t, 150, 156);
  for (let i = 0; i < 80; i++) { const x = -2.5 + 9 * i / 79 * draw; pa.setXYZ(i, x, sgDefl(x), 0.0); }
  pa.needsUpdate = true; setOp(A.traj, trO); setOp(A.trajDash, trO);
  setOp(A.dimd, op * win(t, 165, 200)); setOp(A.dimD, op * win(t, 178, 200));
  A.dimz.set(V(6.5, 0, 0.6), V(0, sgDefl(6.5), 0), op * win(t, 180, 200));
  setOp(A.fieldLines, op * win(t, 132, 150));
  A.xax.set(V(-2.5, 0, 0), V(9.6, 0, 0), op * win(t, 152, 200) * 0.0); A.zax.set(V(-2.5, -0.1, 0), V(0, 2.3, 0), op * win(t, 152, 200));
  // labels
  const lo = (a, b) => op * win(t, a, b);
  A.lab.o.place(V(-7.3, 0.9, 0), lo(37.5, 76), -30, 0); A.lab.s.place(V(-5.1, 1.75, 0), lo(40.5, 76)); A.lab.m.place(V(0, 2.35, 0), lo(43.5, 76));
  A.lab.S.place(V(-2.2, 1.35, 0.9), Math.max(lo(43.5, 266.5), lo(346, 385))); A.lab.N.place(V(-2.2, -1.3, 0.9), Math.max(lo(43.5, 266.5), lo(346, 385)));
  A.lab.p.place(V(6.5, 2.15, 0), lo(46.5, 76)); A.lab.vac.place(V(-7.6, 2.4, 1.6), lo(49.5, 76));
  A.lab.d.place(V(0, -2.15, 1.0), lo(165, 200), 0, 22); A.lab.D.place(V(3.25, -2.55, 1.0), lo(178, 200), 0, -20);
  A.lab.z1.place(V(2.5, sgDefl(2.5), 0), lo(166, 200), 30, 10); A.lab.z2.place(V(6.5, sgDefl(6.5) / 2, 0.6), lo(181, 200), 40, 0);
  A.lab.zax.place(V(-2.5, 2.3, 0), lo(152, 200), 0, -18);
  A.lab.grad.place(V(-2.5, 0.65, -1.2), lo(133, 150), 0, -10);
}
card(37, 49.5, POS.TC + 'width:1150px;text-align:center', `${kick('4.2.1 · APPARATUS')}<h3>实验装置</h3><span data-at="0.5">电炉 O 加热原子气体</span><span data-at="3.5"> → 狭缝 S₁、S₂ 形成水平原子束</span><span data-at="6.5"> → 穿过磁场区 SN</span><span data-at="9.5"> → 打到屏 P 上</span>`);
card(50, 63, POS.TC + 'width:1150px;text-align:center', `${kick('4.2.1 · APPARATUS')}<h3>全部装置置于真空中</h3>原子束沿 x 方向飞行，磁场沿 <span class="k">z</span> 方向且<span class="b">不均匀</span><div class="s" data-at="5">屏上记录下每个原子到达的位置</div>`);
card(63.5, 76, POS.TC + 'width:1150px;text-align:center', `${kick('4.2.1 · APPARATUS')}<h3>先不加磁场</h3>原子沿直线飞行，屏上只有<span class="k">一条</span>细痕<div class="s" data-at="5">接下来分两步看原理：① 原子是什么状态？ ② 在磁场里怎样运动？</div>`);

// ---------------------------------------------------------------- atoms & Maxwell (76-130)
const B2 = { g: new THREE.Group() }; scene.add(B2.g);
B2.box = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.4, 3.4), fresnel(0xff6a1f, 2.2, 0.25)); B2.g.add(B2.box);
B2.boxE = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.4, 3.4, 3.4)), new THREE.LineBasicMaterial({ color: 0xff6a1f, transparent: true, opacity: 0.6 })); B2.g.add(B2.boxE);
B2.N = 60; B2.atoms = []; { const r = rng(5); for (let i = 0; i < B2.N; i++) { const a = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), phys(0xffd59a, 0.6)); B2.g.add(a); B2.atoms.push({ m: a, p: V(r() * 3 - 1.5, r() * 3 - 1.5, r() * 3 - 1.5), v: V(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(0.6 + r() * 1.4) }); } }
B2.hatom = new THREE.Group(); B2.g.add(B2.hatom);
B2.hn = nucleus(0.5, 1); B2.hatom.add(B2.hn); B2.he = electron(0.1); B2.hatom.add(B2.he);
B2.hring = ringLine(1.0, C.E, { dashed: true, op: 0.5 }); B2.hatom.add(B2.hring);
B2.lab = { box: new Label('电炉内：原子热运动', '#ff9a5a'), h: new Label('氢原子：只有 1 个电子', hex(C.E)) };
function updateB2(t) {
  const op = win(t, 76, 131, 1.5);
  B2.g.visible = op > 0.004; if (!B2.g.visible) { B2.lab.box.place(V(), 0); B2.lab.h.place(V(), 0); return; }
  const bo = op * win(t, 76, 106);
  setOp(B2.box, bo); setOp(B2.boxE, bo);
  for (const a of B2.atoms) {
    // deterministic bouncing: reflect in box via triangle wave
    const tri = (p, v) => { const L = 3.0; let x = (p + v * t + 1.5) % (2 * L); if (x < 0) x += 2 * L; return (x < L ? x : 2 * L - x) - 1.5; };
    a.m.position.set(tri(a.p.x, a.v.x), tri(a.p.y, a.v.y), tri(a.p.z, a.v.z)); setOp(a.m, bo);
  }
  B2.lab.box.place(V(0, 2.1, 0), bo, 0, -10);
  const ho = op * win(t, 106, 131);
  setOp(B2.hatom, ho); B2.hatom.position.set(0, 0, 0);
  const a = t * 1.6; B2.he.position.set(Math.cos(a), 0, Math.sin(a)); B2.hatom.rotation.x = 0.3;
  B2.lab.h.place(V(0, 1.5, 0), ho, 0, -10);
}
const maxw = (() => { // F(v) ∝ v^2 exp(-v^2), most probable
  let d = ''; const w = 520, h = 210; const vmax = 3;
  const f = v => v * v * Math.exp(-v * v); const fm = f(1);
  for (let i = 0; i <= 120; i++) { const v = vmax * i / 120; const x = 40 + (w - 60) * v / vmax, y = h - 30 - (h - 60) * f(v) / fm; d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); }
  const xm = 40 + (w - 60) / vmax;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d} L${w - 20},${h - 30} L40,${h - 30} Z" fill="rgba(255,106,31,.15)"/><path d="${d}" stroke="#ff6a1f" stroke-width="3" fill="none"/>
  <line x1="40" y1="${h - 30}" x2="${w - 10}" y2="${h - 30}" stroke="rgba(255,255,255,.3)"/><line x1="40" y1="10" x2="40" y2="${h - 30}" stroke="rgba(255,255,255,.3)"/>
  <line x1="${xm}" y1="30" x2="${xm}" y2="${h - 30}" stroke="#ffbf73" stroke-dasharray="5 5"/><text x="${xm + 8}" y="44" fill="#ffbf73" font-size="18">最可几速率</text>
  <text x="${w - 24}" y="${h - 8}" fill="#9a9184" font-size="18">v</text><text x="48" y="24" fill="#9a9184" font-size="18">F(v)</text></svg>`;
})();
card(77, 92, POS.L + 'width:640px', `${kick('4.2.2 · THE OVEN')}<h3>电炉：加热原子气体</h3>最初用<span class="k">银原子</span>，后来也用<span class="k">氢原子</span><div class="s" data-at="4">银原子最外层也只有一个电子，内层满壳层电子不贡献轨道磁矩</div><div data-at="8">原子从小孔射出，速率服从<span class="k">麦克斯韦分布</span></div>`);
card(92.5, 106, POS.L + 'width:640px', `${kick('4.2.2 · MAXWELL DISTRIBUTION')}<h3>射出原子的速率分布</h3><div class="f2">${T`F(v)=\pi\left(\dfrac{m}{2\pi kT}\right)e^{-\frac{mv^2}{2kT}}v^3`}</div><div data-at="3">${maxw}</div><div class="f2" data-at="6">${T`\dfrac{dF}{dv}=0\ \Rightarrow\ v=\sqrt{\dfrac{3kT}{m}},\ \ mv^2=3kT`}</div>`);
card(106.5, 130, POS.L + 'width:640px', `${kick('4.2.2 · GROUND STATE')}<h3>氢原子处于基态</h3>若 ${T`T=7\times10^4\,\mathrm K`}：${T`E_k=9.0\,\mathrm{eV}<10.2\,\mathrm{eV}`}（氢的第一激发能）
<div data-at="6">实际加热温度远低于 10⁵ K</div><div class="big" data-at="10" style="font-size:36px">⇒ 氢原子处于<span class="k">基态</span>，${T`l=0`}</div><div class="s" data-at="15">记住：基态轨道角动量为零！</div>`, { world: 0 });

// ---------------------------------------------------------------- force & trajectory cards (130-200)
card(131, 150, POS.TC + 'width:1200px;text-align:center', `${kick('4.2.2 · FORCE')}<h3>磁极形状造出非均匀磁场</h3>上极尖、下极凹 ⇒ 磁场沿 z 方向变化：${T`\partial B/\partial z\neq0`}
<div class="f" data-at="5">${T`\vec F=\nabla(\vec\mu\cdot\vec B)=\mu_z\dfrac{\partial B}{\partial z}\,\vec e_z`}</div><div class="s" data-at="10"><span class="r">实验难点</span>：要在 0.1 nm 尺度上产生显著不均匀的磁场</div>`);
deriv(150.5, POS.TC + 'width:1200px;text-align:center', { kicker: '4.2.2 · TRAJECTORY', title: '原子在磁场中的“平抛运动”', size: 38, height: 168, steps: [
  { tex: String.raw`x=[[v|v]]t,\qquad [[z|z]]=\dfrac12\,[[a|\dfrac{F_z}{m}]]\,[[t|t^2]]`, hold: 4.5, note: 'x 方向匀速，z 方向受恒力匀加速' },
  { tex: String.raw`[[z|z_1]]=\dfrac12\,[[a|\dfrac{F_z}{m}]]\,[[t|\left(\dfrac{d}{v}\right)^2]]`, hold: 4.5, box: ['t'], ann: [{ key: 't', text: '在磁场中飞行 t = d/v' }], note: '离开磁场时的偏移' },
  { tex: String.raw`[[z|z_2]]=[[z1|\dfrac12\dfrac{F_z}{m}\dfrac{d^2}{v^2}]]+[[vz|\dfrac{F_z}{m}\dfrac{d}{v}]]\cdot[[tt|\dfrac{D-d/2}{v}]]`, hold: 6, ann: [{ key: 'vz', text: '出场时 v_z' }, { key: 'tt', text: '再飞到屏的时间' }], note: '出磁场后不再受力，沿直线飞到屏（D 从磁场中点量起）' },
  { tex: String.raw`[[z|z_2]]=[[a|\dfrac{F_z}{m}\dfrac{d}{v^2}]]\left([[h|\dfrac d2]]+D-[[h2|\dfrac d2]]\right)`, hold: 4, note: '提出公因子' },
  { tex: String.raw`[[z|z_2]]=[[a|\dfrac{F_z}{m}]]\,\dfrac{dD}{v^2}`, hold: 3.5 },
  { tex: String.raw`[[z|z_2]]=[[a|\dfrac{\cM{\mu_z}}{m}\dfrac{\partial \cB{B}}{\partial z}]]\,\dfrac{dD}{v^2}`, hold: 4, box: ['a'], note: '代入 F_z = μ_z ∂B/∂z' },
  { tex: String.raw`[[z|z_2]]=\cM{\mu_z}\,\dfrac{\partial \cB{B}}{\partial z}\,\dfrac{dD}{[[k|3kT]]}`, hold: 6, box: ['k'], ann: [{ key: 'k', text: 'mv² = 3kT' }], note: '<span class="k">偏移量 z₂ ∝ μ_z</span>：测 z₂ 就能“称”出磁矩' },
] });

// ---------------------------------------------------------------- expectation & result (200-281)
card(201, 214, POS.TC + 'width:1250px;text-align:center', `${kick('4.2.3 · EXPECTATION')}<h3>理论预期：看 μ<sub>z</sub> 能取哪些值</h3><div class="f">${T`\mu_z=\mu\cos\theta`}</div><div data-at="4">经典理论：μ 方向任意，${T`\cos\theta`} 连续 ⇒ ${T`z_2`} <span class="k">连续</span></div><div data-at="8">只有 ${T`\cos\theta`} 取分立值（空间量子化），${T`z_2`} 才可能<span class="k">分立</span></div><div class="s" data-at="11">⇒ 从屏上图样可以反推：角动量（磁矩）是否空间取向量子化</div>`);
const pred = (at, title, f, col, note) => `<div data-at="${at}" style="display:flex;align-items:center;gap:16px;margin:8px 0"><div style="width:220px;font-size:24px;color:#e9e2d6;line-height:1.35">${title}<div class="s" style="font-size:18px">${note}</div></div>${svgDensity(f, col, 230, 80)}</div>`;
card(214, 281, POS.R + 'width:560px;padding:20px 26px', `${kick('PREDICTION vs RESULT')}<h3 style="font-size:30px">屏上会看到什么？</h3>
${pred(0, '不加磁场', x => gauss(x, 0, 0.06), '#ffbf73', '一条')}
${pred(1, '经典预言', x => clamp((0.85 - Math.abs(x)) * 8) * 0.55, '#ffbf73', 'μ 方向任意 → 连续一片')}
${pred(13, '量子·只有轨道磁矩', x => gauss(x, 0, 0.06), '#ffbf73', '基态 l=0 → μ=0，不偏')}
${pred(25, '量子·一般 l', x => [-2, -1, 0, 1, 2].reduce((s, k) => s + gauss(x, k * 0.35, 0.04), 0), '#ffbf73', '2l+1 条，总是奇数')}
${pred(37, '<span class="m">实验结果（氢）</span>', x => gauss(x, -0.6, 0.07) + gauss(x, 0.6, 0.07), '#ff6a1f', '<span class="m">两条！</span>')}`, { world: 0 });
card(214.5, 226, POS.L + 'width:520px', `${kick('CLASSICAL')}<h3>经典预言</h3>磁矩方向任意<br>⇒ 原子束展宽成<span class="k">连续的一片</span>`);
card(226.5, 238, POS.L + 'width:520px', `${kick('QUANTUM · ORBITAL ONLY')}<h3>只考虑轨道磁矩</h3>氢原子基态 ${T`l=0`} ⇒ ${T`\mu=0,\ \mu_z=0`}<div class="big" data-at="4" style="font-size:34px">${T`z_2=0`}：不偏转</div>`);
card(238.5, 250, POS.L + 'width:520px', `${kick('QUANTUM · GENERAL l')}<h3>若 l ≠ 0</h3>${T`\mu_z=-m_l\mu_B`} 取 2l+1 个值<br>⇒ 屏上 <span class="k">奇数</span> 条（图为 l = 2）`);
card(250.5, 266, POS.L + 'width:520px', `${kick('EXPERIMENT')}<h3>实验结果</h3>屏上出现<span class="m">两条</span>分立的痕迹<div class="s" data-at="5">银原子、氢原子都是如此</div>`);
card(266.5, 281, POS.L + 'width:500px', `${kick('4.2.3 · ANALYSIS')}<h3>分析</h3><span class="g">✓</span> 原子分布 z₂ <span class="k">分立</span> ⇒ 原子在磁场中的取向是量子化的<div class="s">—— 空间量子化最直接的证明</div><div data-at="6"><span class="r">✗</span> 但只有<span class="r">两个</span>取向，与“轨道奇数分裂”不符</div><div data-at="10">⇒ 对原子的描述<span class="r">还不完全</span></div>`);

// ---------------------------------------------------------------- example 1 (281-346)
deriv(282, POS.Lw + 'width:920px', { kicker: 'EXAMPLE 1', title: '例题 1：由偏转求银原子的磁矩', size: 34, intro: `<div style="font-size:23px;color:#d8d1c4">非均匀磁场区长 d = 3.5 cm，梯度 ∂B/∂z = 1.4 T/mm，银原子平均速率 v = 750 m/s，屏紧靠磁场区末端，两条斑纹间隔 0.16 mm。求 Ag 原子磁矩在磁场方向的分量。</div><hr>`, steps: [
  { tex: String.raw`[[m|m]]=107.9\,u=[[mv|1.79\times10^{-25}\ \mathrm{kg}]]`, hold: 4.5, note: '银原子质量' },
  { tex: String.raw`[[z|z_2]]=\dfrac{0.16\ \mathrm{mm}}{2}=8\times10^{-5}\ \mathrm{m},\qquad [[D|D=\dfrac d2]]`, hold: 5.5, note: '偏移是间隔的一半；屏紧靠磁场末端 ⇒ D = d/2' },
  { tex: String.raw`[[z|z_2]]=\dfrac{\mu_z}{m}\dfrac{\partial B}{\partial z}\dfrac{d\,[[D|D]]}{v^2}`, hold: 4 },
  { tex: String.raw`[[z|z_2]]=\dfrac{\mu_z}{2m}\dfrac{\partial B}{\partial z}\dfrac{[[D|d^2]]}{v^2}`, hold: 4, box: ['D'] },
  { tex: String.raw`\mu_z=\dfrac{2m\,[[z|z_2]]\,v^2}{[[D|d^2]]\,\partial B/\partial z}`, hold: 4.5, note: '解出 μ_z' },
  { tex: String.raw`\mu_z=\dfrac{2\times1.79\times10^{-25}\times8\times10^{-5}\times750^2}{(3.5\times10^{-2})^2\times1.4\times10^{3}}`, hold: 6, note: '代入数据（梯度化为 1.4×10³ T/m）' },
  { tex: String.raw`\mu_z=\cJ{9.39\times10^{-24}\ \mathrm{J/T}}\ \approx\ \cJ{\mu_B}`, hold: 8, note: '恰好约为 <span class="k">1 个玻尔磁子</span>' },
] });
// small 3D for example: screen with two spots + spacing marker
const EX = { g: new THREE.Group() }; scene.add(EX.g);
{
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), new THREE.MeshPhysicalMaterial({ color: 0xd8d1c4, transparent: true, opacity: 0.1, side: THREE.DoubleSide })); EX.g.add(scr, edges(scr, 0xd8d1c4, 0.6));
  const s1 = glow(C.S, 1.2); s1.position.set(0, 0.8, 0.02); const s2 = glow(C.E, 1.2); s2.position.set(0, -0.8, 0.02); EX.g.add(s1, s2);
  const b1 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.12), new THREE.MeshBasicMaterial({ color: C.S, transparent: true })); b1.position.set(0, 0.8, 0.01);
  const b2 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.12), new THREE.MeshBasicMaterial({ color: C.E, transparent: true })); b2.position.set(0, -0.8, 0.01); EX.g.add(b1, b2);
  EX.g.add(polyLine([V(1.1, 0.8, 0.02), V(1.1, -0.8, 0.02)], 0xffbf73, 1)); EX.g.add(polyLine([V(-1.2, 0, 0.02), V(1.2, 0, 0.02)], 0xffffff, 0.4, true, 0.08));
  EX.g.position.set(3.2, 0, 0);
}
EX.lab = new Label('间隔 0.16 mm', hex(C.J), { size: 22 }); EX.lab2 = new Label(T`z_2=0.08\ \mathrm{mm}`, hex(C.J), { size: 22 });
function updateEX(t) {
  const op = win(t, 281.2, 346, 1.5); setOp(EX.g, op);
  EX.lab.place(V(4.3, 0, 0), op, 80, 0); EX.lab2.place(V(3.2, 0.4, 0), op * win(t, 300, 346), -110, 0);
}

// ---------------------------------------------------------------- summary (346-384)
card(347, 384, POS.Lw + 'width:720px', `${kick('EPISODE 2 · SUMMARY')}<h3>本集小结</h3><ol>
<li data-at="1">装置：电炉 → 狭缝 → 非均匀磁场 → 屏（真空中）</li>
<li data-at="4">原理：${T`F_z=\mu_z\,\partial B/\partial z`}，偏移 ${T`z_2=\mu_z\frac{\partial B}{\partial z}\frac{dD}{3kT}\propto\mu_z`}</li>
<li data-at="8">结果：分立 ⇒ <span class="k">空间量子化</span>得到直接证明</li>
<li data-at="12">矛盾：氢基态 l = 0 却分成<span class="m">两条</span>（偶数）</li>
<li data-at="16">例题：银原子 ${T`\mu_z\approx\mu_B`}</li></ol>
<div class="s" data-at="20">科学人物：施特恩因发展分子束方法、发现质子磁矩，获 1943 年诺贝尔物理学奖</div>
<hr><div data-at="26">下一集：多出来的“两条”从哪来？ → <span class="m">电子自旋假设</span></div>`, { world: 0 });

// ---------------------------------------------------------------- hero words
KT({ text: '非均匀磁场', t0: 44.5, t1: 58, screen: { x: 1380, y: 955, planeY: -3.0, tilt: 0.4, px: 96 }, align: 'center' });
KT({ text: '基态 l = 0', t0: 117, t1: 128.9, screen: { x: 1390, y: 930, planeY: -3.0, tilt: 0.45, px: 96 }, align: 'center' });
KT({ text: 'z<sub>2</sub> ∝ μ<sub>z</sub>', html: true, t0: 192.8, t1: 198.7, screen: { x: 960, y: 290, planeY: 3.0, tilt: 0.9, px: 100 }, align: 'center' });
KT({ text: '两条！', t0: 251.5, t1: 265.5, screen: { x: 950, y: 930, planeY: -3.0, tilt: 0.45, px: 120 }, align: 'center' });
KT({ text: '空间量子化', t0: 267, t1: 279.9, screen: { x: 940, y: 960, planeY: -3.0, tilt: 0.45, px: 84 }, align: 'center' });
KT({ text: 'μ<sub>z</sub> ≈ μ<sub>B</sub>', html: true, t0: 320, t1: 344.9, screen: { x: 540, y: 930, planeY: -3.0, tilt: 0.5, px: 96 }, align: 'center' });

// ---------------------------------------------------------------- camera (low grazing angles, roll, whip transitions)
const shots = [
  { t0: 0, fn: fixedShot([-3, 6, 18], [0, 0, 0]) },
  { t0: 10, b: 0.5, fn: pathShot([{ u: 0, p: [12, 0.0, 14], l: [0, -4.6, -2], roll: -16, fov: 46 }, { u: 5, p: [7, 1.0, 15], l: [0, -3.8, -1], roll: -10, fov: 42 }, { u: 26, p: [-3, 2.0, 15.5], l: [0, -2.4, 0], roll: -5, fov: 40 }]) },
  { t0: 35.0, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [-10, 0.4, 13], l: [-1.5, 0.6, 0], roll: 9, fov: 42 }, { u: 14, p: [-4, 1.4, 15.5], l: [0, 0.9, 0], roll: 2, fov: 40 }, { u: 40, p: [3, 1.8, 15.5], l: [0.4, 0.9, 0], roll: -6, fov: 40 }]) },
  { t0: 75.0, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [7.5, -0.6, 7.5], l: [0, 0.2, 0], roll: -12, fov: 42, s: 330 }, { u: 27, p: [8.8, 1.0, 4.2], l: [0, 0.1, 0], roll: -5, fov: 40, s: 330 }, { u: 31, p: [5.4, 0.5, 2.8], l: [0, 0.05, 0], roll: -3, fov: 40, s: 330 }, { u: 55, p: [4.8, 1.1, 4.0], l: [0, 0, 0], roll: 4, fov: 40, s: 330 }]) },
  { t0: 129.0, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [-1.8, 0.6, 15.6], l: [-0.2, 1.85, 0], roll: 4, fov: 40 }, { u: 19, p: [-0.6, 0.9, 16.0], l: [0.2, 1.85, 0], roll: 2, fov: 40 }, { u: 25, p: [0.9, 0.8, 16.6], l: [0.6, 1.8, 0], roll: -1.5, fov: 40 }, { u: 71, p: [1.3, 0.7, 16.4], l: [0.7, 1.8, 0], roll: -3, fov: 40 }]) },
  { t0: 198.8, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [-4, 1.4, 16], l: [1.6, 1.8, 0], roll: 8, fov: 40, s: 0 }, { u: 14, p: [-1, 2.0, 16.5], l: [2, 1.8, 0], roll: -2, fov: 40, s: 0 }]) },
  { t0: 212.6, b: 1.8, fn: pathShot([{ u: 0, p: [14.2, 3.1, 10.6], l: [5.9, 1.5, 0], roll: -6, fov: 40 }, { u: 36, p: [13.2, 2.8, 9.6], l: [6.0, 1.5, 0], roll: -3, fov: 40 }]) },
  { t0: 249.0, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [18.2, 0.8, 5.8], l: [6.4, -0.8, 0], roll: 7, fov: 40, s: 60 }, { u: 32, p: [17.6, 1.4, 4.2], l: [6.4, -0.75, 0], roll: 3, fov: 40, s: 60 }]) },
  { t0: 280.0, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [5.6, -0.4, 9.8], l: [3.2, -0.3, 0], roll: -8, fov: 40, s: 560 }, { u: 64, p: [2.4, 0.5, 10.2], l: [3.2, -0.3, 0], roll: 2, fov: 40, s: 560 }]) },
  { t0: 345.0, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [7, 0.8, 19.5], l: [1.2, 0, 0], roll: -9, fov: 42, s: 450 }, { u: 39, p: [0.4, 1.9, 24.5], l: [1.2, 0.2, 0], roll: -3, fov: 40, s: 530 }]) },
  { t0: 383.6, b: 1.4, whip: true, fn: END.cam },
];
run({ duration: DUR, shots, update(t) { updateA(t); updateB2(t); updateEX(t); } });
