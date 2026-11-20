// EP1 — 全景 + 4.1 原子中电子轨道运动的磁矩
import {
  THREE, T, V, UP, C, hex, ep, win, rampInt, clamp, scene, camera, setOp, phys, glow, fresnel, Arrow, Cone, ringLine, polyLine,
  nucleus, electron, Trail, Field, Label, card, overlay, POS, kick, chainHTML, VectorModel, setStations, setChips, setTitle, setEnd,
  orbitShot, fixedShot, run, Levels, bar, deriv
} from './engine.js';
import { ContourTerrain, wellField, GridFunnel, KText, KPath, tag, ctag, dust, titleSequence, endSequence } from './noir.js';
import { pathShot, setFog, hooks } from './engine.js';

const DUR = 386;
titleSequence({ epn: '01', main: '原子的精细结构', sub: '第 1 集 · 全景与轨道磁矩', ring: 'ANGULAR MOMENTUM → MAGNETIC MOMENT · ' });
window.NO_END_FALLBACK = true;
const END = endSequence({ t0: 377, t1: 386, text: '第 1 集 · 完', next: 'NEXT ▸ 施特恩-盖拉赫实验 / STERN–GERLACH' });
setFog(16, 62);
// ---------------------------------------------------------------- the world floor: an energy landscape (Coulomb well + organic noise)
const RN = [2.6, 5.4, 9.6];                    // radii of the n = 1, 2, 3 "energy contours"
const WF = wellField({ depth: 6.2, a: 1.7, noise: 0.42, nscale: 0.1 });
const terr = new ContourTerrain({ f: WF, size: 52, res: 230, step: 0.075, y0: -4.9, indexEvery: 5, hotLevels: RN.map(r => WF(r, 0)), hotWidth: 0.55, fadeNear: 14, fadeFar: 60 });
const eTags = [['n=1  E₁ −13.6 eV', RN[0], 2.4], ['n=2  E₂ −3.40 eV', RN[1], 2.0], ['n=3  E₃ −1.51 eV', RN[2], 1.75]].map(([tx, r, th]) => ({ L: tag(tx), p: terr.point(r * Math.cos(th), r * Math.sin(th), 0.08) }));
const nums = [['1e-6', 7.2, 0.6], ['3e-9', 12.5, -0.4], ['1e-8', 11, 2.9], ['2e-7', 6.5, -2.2]].map(([tx, r, th]) => ({ L: ctag(tx, 17), p: terr.point(r * Math.cos(th), r * Math.sin(th), 0.05) }));
hooks.push(t => {
  const op = win(t, 10.0, 377.5, 0.3); terr.set(op, 4 + 44 * ep(t, 10.3, 15.5), [0, 0]);
  eTags.forEach((e, i) => e.L.place(e.p, op * win(t, 13 + i * 0.5, 70)));
  nums.forEach((e, i) => e.L.place(e.p, op * 0.85 * win(t, 14 + i * 0.4, 106)));
});
// hero words: kinetic type laid into the world
const KT = (o) => new KText({ cps: 20, ...o });
KT({ text: '矢量模型', t0: 12.2, t1: 30, screen: { x: 1390, y: 900, planeY: -3.6, tilt: 0.35, px: 120 }, align: 'center' });
KT({ text: '角动量 → 磁矩 → 磁场', t0: 74.5, t1: 88.6, screen: { x: 960, y: 190, planeY: -1.2, tilt: 0.85, px: 64 }, align: 'center' });
KT({ text: '电流环 = 磁矩', t0: 108.3, t1: 121, screen: { x: 1330, y: 920, planeY: -2.4, tilt: 0.4, px: 96 }, align: 'center' });
KT({ text: '拉莫尔进动', t0: 216.8, t1: 232, screen: { x: 1360, y: 930, planeY: -2.8, tilt: 0.4, px: 96 }, align: 'center' });
KT({ text: 'μB = eħ/2mₑ', t0: 277, t1: 291, font: 'mono', screen: { x: 1520, y: 900, planeY: -2.6, tilt: 0.5, px: 72 }, align: 'center' });
KT({ text: '2l + 1', t0: 306.5, t1: 330, font: 'mono', screen: { x: 1600, y: 880, planeY: -3.2, tilt: 0.45, px: 110 }, align: 'center' });
setStations([['全景', 11, 108], ['经典磁矩', 108, 160], ['受力与进动', 160, 248], ['量子表达式', 248, 304], ['取向量子化', 304, 360]]);
setChips([[11, 108, '00', '全景 · 单电子原子的矢量模型'], [108, 160, '4.1.1', '磁矩的经典表达式'], [160, 248, '4.1.1', '磁矩在外磁场中：受力与进动'], [248, 304, '4.1.2', '磁矩的量子表达式'], [304, 360, '4.1.3', '角动量取向量子化'], [360, 378, '✓', '本集小结']]);

// ================================================================ overview model
const vm = new VectorModel(scene);
const fieldM = new Field([-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2], [-2.8, -1.4, 0, 1.4, 2.8], -3.8, 4.0, C.B, 1.0);
const floor = new THREE.Group(); scene.add(floor);
function satSG() {
  const g = new THREE.Group();
  const add = (pts, c, op = 1) => { const l = polyLine(pts, c, op); g.add(l); };
  add([V(-1.7, 0, 0), V(-0.45, 0, 0)], C.J);
  const curve = (s, c) => { const pts = []; for (let i = 0; i <= 30; i++) { const x = -0.45 + 2.0 * i / 30; const y = s * (x < 0.45 ? 0.35 * ((x + 0.45) / 0.9) ** 2 : 0.35 + 0.78 * (x - 0.45)); pts.push(V(x, y, 0)); } add(pts, c); };
  curve(1, C.S); curve(-1, C.E);
  const pole = (y, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.35), phys(c, 0.2)); m.position.set(0, y, 0); g.add(m); };
  pole(0.42, 0x3a4650); pole(-0.42, 0x5c2a1c);
  add([V(1.55, -1.3, 0), V(1.55, 1.3, 0)], 0xffffff, 0.35);
  return g;
}
function satLevels() {
  const g = new THREE.Group();
  const h = (x0, x1, y, c = 0xefe8dc) => g.add(polyLine([V(x0, y, 0), V(x1, y, 0)], c, 0.95));
  const d = (x0, y0, x1, y1) => g.add(polyLine([V(x0, y0, 0), V(x1, y1, 0)], 0x9a9184, 0.6, true));
  h(-1.7, -1.0, 1.05); d(-1.0, 1.05, -0.6, 1.4); d(-1.0, 1.05, -0.6, 0.8); h(-0.6, 0.3, 1.4, C.S); h(-0.6, 0.3, 0.8, C.E);
  [1.58, 1.46, 1.34, 1.22].forEach(y => { d(0.3, 1.4, 0.7, y); h(0.7, 1.3, y, C.S); });
  [0.87, 0.73].forEach(y => { d(0.3, 0.8, 0.7, y); h(0.7, 1.3, y, C.E); });
  h(-1.7, 0.3, -1.2); [-1.12, -1.28].forEach(y => { d(0.3, -1.2, 0.7, y); h(0.7, 1.3, y); });
  const ar = (x, y0, c) => { const a = new Arrow(c, { r: 0.018, hr: 0.05, hl: 0.14, parent: g }); a.set(V(x, y0, 0), V(0, -1.2 - y0, 0)); };
  ar(-0.35, 1.4, C.J); ar(0.05, 0.8, 0xffa64d);
  return g;
}
const sg = satSG(); sg.position.set(-6.3, 0.6, 0); scene.add(sg);
const lv = satLevels(); lv.position.set(6.5, 0.3, 0); scene.add(lv);
const ML = {
  nuc: new Label('原子实（核 + 内层电子）', hex(C.NUC)), el: new Label('价电子', hex(C.E)),
  L: new Label(T`\vec L` + '&nbsp;轨道角动量', hex(C.L)), S: new Label(T`\vec S` + '&nbsp;自旋角动量', hex(C.S)),
  J: new Label(T`\vec J=\vec L+\vec S`, hex(C.J)), mu: new Label(T`\vec\mu` + '&nbsp;磁矩', hex(C.MU)),
  B: new Label(T`\vec B` + '&nbsp;外磁场', hex(C.B)), sg: new Label('施特恩-盖拉赫 · 一分为二', hex(C.S)), lv: new Label('钠双线 → 塞曼分裂', hex(C.J)),
};
function updateModel(t) {
  const mop = Math.max(win(t, 6, 108, 2), win(t, 361, 390, 2));
  if (mop < 0.004) { vm.g.visible = false; fieldM.update(t, 0); setOp(floor, 0); setOp(sg, 0); setOp(lv, 0); return; }
  const A = a => ep(t, a, a + 2) * mop;
  const phi = 0.6 + rampInt(t, 61, 3, 0.4), psi = 0.3 + rampInt(t, 42, 3, 1.3);
  const r = vm.draw({
    all: 1, nuc: mop * ep(t, 7, 11), orbit: A(15), L: A(22), S: A(31), eS: A(31), J: A(40), coneL: A(42), coneJ: A(61),
    mul: A(50) * (1 - ep(t, 57, 59)), mus: A(50) * (1 - ep(t, 57, 59)), mu: A(52),
    growL: ep(t, 22, 25), growS: ep(t, 31, 34), growJ: ep(t, 40, 43), growMu: ep(t, 50, 53)
  }, { phi, psi, eAng: t * 2.4 });
  vm.nuc.rotation.y = t * 0.3;
  fieldM.update(t, A(60)); setOp(floor, A(12) * 0.8);
  [sg, lv].forEach(s => s.quaternion.copy(camera.quaternion)); setOp(sg, A(70)); setOp(lv, A(72));
  const lo = (a, b) => mop * win(t, a, b);
  ML.nuc.place(V(0, -0.75, 0), lo(12, 21), 0, 18);
  ML.el.place(r.ep, lo(16, 21), 0, -40);
  ML.L.place(r.L.clone().multiplyScalar(0.6), lo(23, 70), -140, 0);
  ML.S.place(r.L.clone().add(r.S.clone().multiplyScalar(0.5)), lo(32, 41), 120, 10);
  ML.J.place(r.J.clone().multiplyScalar(1.12), lo(41, 70), 0, -24);
  ML.mu.place(r.mu.clone().multiplyScalar(1.12), lo(53, 70), 0, 30);
  ML.B.place(V(4.2, 2.4, 0), lo(61, 70), 30, 0);
  ML.sg.place(sg.position.clone().add(V(0, -1.8, 0)), lo(71, 106));
  ML.lv.place(lv.position.clone().add(V(0, -1.95, 0)), lo(73, 106));
}
card(12, 21.5, POS.L, `${kick('OVERVIEW')}<h3>先看全貌</h3>原子实 + 一个价电子<div class="s" data-at="2">碱金属、氢原子都可看成“单电子”体系：<br>内层满壳层电子与核一起构成原子实</div>`);
card(22, 30.5, POS.L, `${kick('ANGULAR MOMENTUM · 1')}<h3>轨道角动量 L</h3>电子绕原子实运动<div class="f" data-at="2">${T`\vec L=\vec r\times m_e\vec v`}</div>`);
card(31, 39.5, POS.L, `${kick('ANGULAR MOMENTUM · 2')}<h3>自旋角动量 S</h3>电子自身的<span class="m">内禀</span>角动量<div class="s" data-at="2">第 3 集详细讲（4.3 电子自旋假设）</div>`);
card(40, 49.5, POS.L, `${kick('ANGULAR MOMENTUM · 3')}<h3>总角动量 J</h3><div class="f">${T`\vec J=\vec L+\vec S`}</div><div data-at="3">L 与 S 耦合，共同绕 <span class="k">J</span> 进动</div>`);
card(50, 59.5, POS.L, `${kick('MAGNETIC MOMENT')}<h3>角动量 ⇒ 磁矩</h3>每个角动量都伴随一个<span class="r">磁矩</span><div class="f" data-at="2">${T`\vec\mu=-g\,\dfrac{e}{2m_e}\vec J`}</div><div class="s" data-at="4">轨道磁矩 + 自旋磁矩 = 总磁矩 μ</div>`);
card(60, 69.5, POS.L, `${kick('EXTERNAL FIELD')}<h3>放入外磁场 B</h3>磁矩受磁场作用<div class="f" data-at="2">${T`U=-\vec\mu\cdot\vec B`}</div><div data-at="4"><span class="k">J</span> 绕 <span class="b">B</span> 进动</div>`);
card(74, 106, 'left:110px;bottom:46px;width:1700px;padding:22px 30px', chainHTML(-1));
card(88.5, 106, POS.L + 'top:150px;', `${kick('WHY MAGNETIC MOMENT?')}<h3>为什么关注磁矩？</h3>光谱的<span class="k">精细结构</span>，来自磁矩与磁场的相互作用能<div class="s" data-at="4">本集：从电子的轨道运动出发，求出它的磁矩</div>`);

// ================================================================ STATION A: current loop (4.1.1)
const SA = { g: new THREE.Group() }; scene.add(SA.g);
const RA = 2.4;
SA.nuc = nucleus(1.0); SA.g.add(SA.nuc);
SA.ring = ringLine(RA, C.E, { dashed: false, op: 0.35 }); SA.g.add(SA.ring);
SA.trail = new Trail(C.E, RA, SA.g, 110, 2.8);
{
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(233,225,210,.04)'); gr.addColorStop(0.85, 'rgba(233,225,210,.11)'); gr.addColorStop(1, 'rgba(233,225,210,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  SA.disk = new THREE.Mesh(new THREE.CircleGeometry(RA * 1.02, 96), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  SA.disk.rotation.x = -Math.PI / 2; SA.g.add(SA.disk);
}
SA.el = electron(0.15); SA.g.add(SA.el);
SA.r = polyLine([V(), V(1, 0, 0)], 0xffffff, 0.5, true); SA.g.add(SA.r);
SA.v = new Arrow(C.F, { r: 0.028, hr: 0.08, hl: 0.24, parent: SA.g });
SA.cur = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.24, 24), phys(C.J, 0.3)); SA.g.add(m); SA.cur.push(m); }
SA.n = new Arrow(0xe9e2d6, { r: 0.02, hr: 0.06, hl: 0.2, parent: SA.g });
SA.mu = new Arrow(C.MU, { r: 0.055, hr: 0.15, hl: 0.45, parent: SA.g }); SA.L = new Arrow(C.L, { r: 0.055, hr: 0.15, hl: 0.45, parent: SA.g });
SA.proton = new THREE.Group(); SA.g.add(SA.proton);
SA.lab = {
  I: new Label(T`I` + '&nbsp;电流', hex(C.J)), v: new Label(T`\vec v`, hex(C.F), { bare: true, size: 30 }), S: new Label('面积&nbsp;' + T`S=\pi r^2`, hex(C.L), { size: 22 }),
  mu: new Label(T`\vec\mu`, hex(C.MU), { bare: true, size: 38 }), L: new Label(T`\vec L`, hex(C.L), { bare: true, size: 38 }), r: new Label(T`r`, '#efe8dc', { bare: true, size: 28 }),
  n: new Label(T`\vec n`, '#e9e2d6', { bare: true, size: 30 }), e: new Label('电子 −e', hex(C.E), { size: 21 })
};
function updateA(t) {
  const op = Math.max(win(t, 106, 162, 1.6), win(t, 246, 305, 1.4));
  SA.g.visible = op > 0.004; if (!SA.g.visible) return;
  const a = t * 1.0;
  const ep_ = V(RA * Math.cos(a), 0, RA * Math.sin(a)), vd = V(-Math.sin(a), 0, Math.cos(a));
  SA.nuc.rotation.y = t * 0.3; setOp(SA.nuc, op); setOp(SA.ring, op); setOp(SA.el, op);
  SA.trail.set(V(1, 0, 0), V(0, 0, 1), a, op);
  SA.el.position.copy(ep_);
  const pr = SA.r.geometry.attributes.position; pr.setXYZ(1, ep_.x, 0, ep_.z); pr.needsUpdate = true; SA.r.computeLineDistances(); setOp(SA.r, op * win(t, 120, 146));
  SA.v.set(ep_, vd.clone().multiplyScalar(1.0), op * win(t, 120, 160));
  const co = op * win(t, 109, 160);
  SA.cur.forEach((m, i) => { const b = -t * 0.75 + i * Math.PI / 5; m.position.set(RA * Math.cos(b), 0, RA * Math.sin(b)); m.quaternion.setFromUnitVectors(UP, V(Math.sin(b), 0, -Math.cos(b))); setOp(m, co); });
  setOp(SA.disk, op * win(t, 110, 160));
  SA.n.set(V(0, 0, 0), V(0, 1.4, 0), op * win(t, 111, 121));
  const muO = op * Math.max(win(t, 113, 160), win(t, 246, 305));
  SA.mu.set(V(), V(0, 2.4 * Math.max(ep(t, 113, 116), ep(t, 246, 248)), 0), muO);
  const LO = op * Math.max(win(t, 134, 160), win(t, 246, 305));
  SA.L.set(V(), V(0, -2.4 * Math.max(ep(t, 134, 137), ep(t, 246, 248)), 0), LO);
  SA.lab.I.place(V(RA * Math.cos(-t * 0.75 + 0.3), 0, RA * Math.sin(-t * 0.75 + 0.3)), co * win(t, 110, 146), 0, 34);
  SA.lab.v.place(ep_.clone().add(vd.clone().multiplyScalar(1.15)), op * win(t, 121, 160));
  SA.lab.e.place(ep_, op * win(t, 121, 134), 0, -38);
  SA.lab.r.place(ep_.clone().multiplyScalar(0.5), op * win(t, 121, 146), 0, -22);
  SA.lab.S.place(V(-0.9, 0, 1.2), op * win(t, 111, 146));
  SA.lab.n.place(V(0, 1.5, 0), op * win(t, 111, 121), 30, 0);
  SA.lab.mu.place(V(0, 2.2, 0), muO, 44, 0);
  SA.lab.L.place(V(0, -2.75, 0), LO, 0, 8);
}
card(109, 121, POS.L, `${kick('4.1.1 · CLASSICAL')}<h3>载流小线圈的磁矩</h3><div class="f">${T`\vec\mu=IS\,\vec n`}</div><div data-at="3"><span class="k">I</span> 电流强度 &nbsp; <span class="c">S</span> 线圈面积</div><div class="s" data-at="5">n：面积法向单位矢量，与电流方向成右手关系</div>`);
deriv(121.5, POS.L + 'width:680px', { kicker: '4.1.1 · DERIVATION', title: '电子轨道 ⇒ 磁矩', size: 40, steps: [
  { tex: String.raw`[[mu|\cM{\vec\mu}]]=[[I|I]]\,[[S|S]]\,[[n|\vec n]]`, hold: 4, note: '载流小线圈的磁矩' },
  { tex: String.raw`[[mu|\cM{\vec\mu}]]=[[I|\dfrac{ev}{2\pi r}]]\cdot[[S|\pi r^2]]\,[[n|\vec n]]`, hold: 6, box: ['I', 'S'], ann: [{ key: 'I', text: 'I = e/T' }, { key: 'S', text: '轨道面积', color: '#e9e1d2' }], note: '代入等效电流与面积' },
  { tex: String.raw`[[mu|\cM{\vec\mu}]]=[[c|\dfrac{e}{2}]]\,[[rv|rv]]\,[[n|\vec n]]`, hold: 4, note: '约去 π 和一个 r' },
  { tex: String.raw`[[mu|\cM{\vec\mu}]]=[[c|-\dfrac{e}{2m_e}]]\,[[rv|\big(\vec r\times m_e\vec v\big)]]`, hold: 6, box: ['rv'], ann: [{ key: 'rv', text: '这正是角动量 L', color: '#e9e1d2' }], note: '分子分母同乘 mₑ；电子带负电 ⇒ 负号' },
  { tex: String.raw`[[mu|\cM{\vec\mu}]]=[[c|-\dfrac{e}{2m_e}]]\,[[rv|\cL{\vec L}]]`, hold: 4 },
  { tex: String.raw`[[mu|\cM{\vec\mu}]]=[[c|-\gamma]]\,[[rv|\cL{\vec L}]]`, hold: 6, box: ['c'], ann: [{ key: 'c', text: 'γ = e/2mₑ 旋磁比' }], note: '负号：<span class="r">μ</span> 与 <span class="c">L</span> 方向相反' },
] });

// ================================================================ STATION B: dipole in fields (force, torque, precession)
const SB = { g: new THREE.Group() }; scene.add(SB.g);
SB.field = new Field([-3.2, -1.6, 0, 1.6, 3.2], [-1.6, 0, 1.6], -3.2, 3.4, C.B, 0.5);
SB.d = new Arrow(C.MU, { r: 0.055, hr: 0.15, hl: 0.45, parent: SB.g });
SB.pN = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 24), phys(C.MU, 0.7)); SB.pS = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 24), phys(0xa9c8dc, 0.7)); SB.g.add(SB.pN, SB.pS);
SB.F1 = new Arrow(C.F, { r: 0.03, hr: 0.09, hl: 0.26, parent: SB.g }); SB.F2 = new Arrow(C.F, { r: 0.03, hr: 0.09, hl: 0.26, parent: SB.g });
SB.cone = new Cone(C.MU, SB.g, 0.08);
SB.dmu = new Arrow(C.J, { r: 0.025, hr: 0.07, hl: 0.2, parent: SB.g });
SB.rad = polyLine([V(), V(1, 0, 0)], 0xffffff, 0.6, true); SB.g.add(SB.rad);
SB.dA = new Arrow(C.MU, { r: 0.05, hr: 0.13, hl: 0.38, parent: SB.g }); SB.dB = new Arrow(C.MU, { r: 0.05, hr: 0.13, hl: 0.38, parent: SB.g });
SB.FA = new Arrow(C.F, { r: 0.035, hr: 0.1, hl: 0.28, parent: SB.g }); SB.FB = new Arrow(C.F, { r: 0.035, hr: 0.1, hl: 0.28, parent: SB.g });
SB.lab = {
  B: new Label(T`\vec B`, hex(C.B), { bare: true, size: 38 }), E: new Label(T`\vec E`, hex(C.B), { bare: true, size: 38 }),
  F1: new Label(T`\vec F`, hex(C.F), { bare: true, size: 30 }), F2: new Label(T`-\vec F`, hex(C.F), { bare: true, size: 30 }),
  pe: new Label(T`+e`, hex(C.MU), { bare: true, size: 30 }), ne: new Label(T`-e`, '#a9c8dc', { bare: true, size: 30 }),
  pm: new Label(T`+m`, hex(C.MU), { bare: true, size: 30 }), nm: new Label(T`-m`, '#a9c8dc', { bare: true, size: 30 }),
  d: new Label(T`\vec d=-e\vec l`, hex(C.MU), { size: 24 }), mu: new Label(T`\vec\mu=m\vec l`, hex(C.MU), { size: 24 }), mu2: new Label(T`\vec\mu`, hex(C.MU), { bare: true, size: 32 }),
  w: new Label('拉莫尔进动&nbsp;' + T`\vec\omega=\gamma\vec B`, hex(C.J)), dmu: new Label(T`d\vec\mu`, hex(C.J), { bare: true, size: 28 }), rs: new Label(T`\mu\sin\theta`, '#fff', { bare: true, size: 24 }),
  A: new Label(T`\mu_z>0` + '&nbsp;被推向强场', hex(C.F)), Bb: new Label(T`\mu_z<0` + '&nbsp;被推向弱场', hex(C.F)), st: new Label('强', '#a9c8dc', { bare: true, size: 26 }), wk: new Label('弱', '#a9c8dc', { bare: true, size: 26 })
};
function updateB(t) {
  const op = win(t, 160, 249, 1.6);
  const conv = Math.max(ep(t, 172, 175) * (1 - ep(t, 186, 189)), ep(t, 188, 191) * (1 - ep(t, 203, 205)));
  SB.field.update(t, op, conv); SB.g.visible = op > 0.004; if (!SB.g.visible) return;
  // phase 1 (160-188): dipole static tilted with poles; 172-186 non-uniform electric then magnetic analog
  // phase 2 (188-204): two dipoles in non-uniform field
  // phase 3 (204-248): uniform field, torque, precession
  const dipO = op * Math.max(win(t, 161, 189), win(t, 204, 249));
  const tilt = 0.62, phi = 0.4 + rampInt(t, 216, 3, 0.7);
  const dv = V(Math.sin(tilt) * Math.cos(phi), Math.cos(tilt), Math.sin(tilt) * Math.sin(phi)).multiplyScalar(2.4);
  SB.d.set(dv.clone().multiplyScalar(-0.5), dv, dipO);
  SB.pN.position.copy(dv.clone().multiplyScalar(0.5)); SB.pS.position.copy(dv.clone().multiplyScalar(-0.5));
  const poleO = op * Math.max(win(t, 161, 189), win(t, 204, 216));
  setOp(SB.pN, poleO); setOp(SB.pS, poleO);
  const isE = t < 177;
  SB.lab.pe.place(SB.pN.position, op * win(t, 161, 177), 30, -10); SB.lab.ne.place(SB.pS.position, op * win(t, 161, 177), -30, 10);
  SB.lab.pm.place(SB.pN.position, op * Math.max(win(t, 177, 189), win(t, 204, 216)), 30, -10); SB.lab.nm.place(SB.pS.position, op * Math.max(win(t, 177, 189), win(t, 204, 216)), -30, 10);
  // forces: uniform -> equal opposite ; non-uniform -> unequal
  const nonU = conv;
  const fo = op * Math.max(win(t, 163, 189), win(t, 205, 216));
  SB.F1.set(SB.pN.position, V(0, 1.0 + 0.5 * nonU, 0), fo); SB.F2.set(SB.pS.position, V(0, -1.0 + 0.45 * nonU, 0), fo);
  SB.lab.F1.place(SB.pN.position.clone().add(V(0, 1.3 + 0.5 * nonU, 0)), fo, 0, -6); SB.lab.F2.place(SB.pS.position.clone().add(V(0, -1.2, 0)), fo, 0, 8);
  SB.lab.E.place(V(3.2, 2.4, 0), op * win(t, 160, 177), 30, 0); SB.lab.B.place(V(3.2, 2.4, 0), op * win(t, 177, 249), 30, 0);
  SB.lab.d.place(V(-1.5, -1.6, 0), op * win(t, 162, 177)); SB.lab.mu.place(V(-1.5, -1.6, 0), op * win(t, 177.5, 189));
  // non-uniform two dipoles
  const no = op * win(t, 189, 205);
  const dy = 0.9 * ep(t, 192, 197);
  const pA = V(-1.7, -0.6 + dy, 0), pB = V(1.7, -0.6 - dy, 0);
  SB.dA.set(pA.clone().add(V(0, -0.8, 0)), V(0, 1.6, 0), no); SB.dB.set(pB.clone().add(V(0, 0.8, 0)), V(0, -1.6, 0), no);
  SB.FA.set(pA.clone().add(V(0.45, 0, 0)), V(0, 1.2, 0), no * ep(t, 190.5, 191.5)); SB.FB.set(pB.clone().add(V(0.45, 0, 0)), V(0, -1.2, 0), no * ep(t, 190.5, 191.5));
  SB.lab.A.place(pA.clone().add(V(0, -1.35, 0)), no); SB.lab.Bb.place(pB.clone().add(V(0, 1.4, 0)), no);
  SB.lab.st.place(V(0, 2.5, 0), op * win(t, 173, 205) * conv, 0, -10); SB.lab.wk.place(V(0, -2.9, 0), op * win(t, 173, 205) * conv, 0, 10);
  // precession
  const po = op * win(t, 216, 249);
  SB.cone.set(V(), UP, tilt, 1.2, po);
  SB.lab.mu2.place(dv.clone().multiplyScalar(0.62), op * win(t, 204, 249), 30, -10);
  SB.lab.w.place(V(1.8, 1.9, 0), po, 120, 0);
  const tip = dv.clone().multiplyScalar(0.5), tang = V(-Math.sin(phi), 0, Math.cos(phi));
  const geo = op * win(t, 229, 247);
  SB.dmu.set(tip, tang.clone().multiplyScalar(0.7), geo);
  const c = V(0, tip.y, 0); const pr = SB.rad.geometry.attributes.position; pr.setXYZ(0, c.x, c.y, c.z); pr.setXYZ(1, tip.x, tip.y, tip.z); pr.needsUpdate = true; SB.rad.computeLineDistances(); setOp(SB.rad, geo);
  SB.lab.dmu.place(tip.clone().add(tang.clone().multiplyScalar(0.8)), geo, 10, -16); SB.lab.rs.place(c.clone().lerp(tip, 0.5), geo, 0, -18);
}
deriv(161.5, POS.Lw + 'width:720px', { kicker: 'FORCE ON A DIPOLE', title: '偶极子在非均匀场中受力', size: 38, steps: [
  { tex: String.raw`F=[[a|-eE(z_1)]]+[[b|eE(z_2)]]`, hold: 4, note: '电偶极子两端受力（均匀场时两项抵消）' },
  { tex: String.raw`F=[[m|-e\,l]]\,[[g|\dfrac{\partial E}{\partial z}]]`, hold: 4, ann: [{ key: 'm', text: 'z₂ − z₁ = l' }], note: '电场沿 z 不均匀：E(z₂) − E(z₁) ≈ l ∂E/∂z' },
  { tex: String.raw`F=[[m|\vec d]]\cdot[[g|\nabla\vec E]]`, hold: 4, box: ['m'], ann: [{ key: 'm', text: 'd = −e l 电偶极矩' }] },
  { tex: String.raw`F=[[m|\cM{\vec\mu}]]\cdot[[g|\nabla\cB{\vec B}]]`, hold: 4, note: '磁偶极子同理：±e → ±m，d → μ，E → B' },
  { tex: String.raw`F_z=[[m|\cM{\mu_z}]]\,[[g|\dfrac{\partial \cB{B}}{\partial z}]]`, hold: 5, box: ['g'], note: '磁场沿 z 不均匀时，磁矩受力' },
] });

card(189, 204, POS.L, `${kick('NON-UNIFORM FIELD')}<h3>非均匀磁场：受力偏转</h3><div class="f">${T`F_z=\mu_z\dfrac{\partial B}{\partial z}`}</div><div data-at="3">μ<sub>z</sub> 的正负、大小不同 → 受力不同</div><div class="s" data-at="6">这正是第 2 集“施特恩-盖拉赫实验”的原理</div>`);
card(205, 216, POS.L, `${kick('UNIFORM FIELD')}<h3>均匀磁场：合力为零</h3>但两端受力不共线 ⇒ <span class="k">力矩</span><div class="f" data-at="3">${T`\vec M=\vec\mu\times\vec B`}</div>`);
deriv(216.5, POS.L + 'width:660px', { kicker: 'LARMOR PRECESSION', title: '力矩 ⇒ 拉莫尔进动', size: 40, steps: [
  { tex: String.raw`\dfrac{d[[L|\cL{\vec L}]]}{dt}=[[M|\vec M]]`, hold: 3, note: '角动量定理' },
  { tex: String.raw`\dfrac{d[[L|\cL{\vec L}]]}{dt}=[[mu|\cM{\vec\mu}]]\times[[B|\cB{\vec B}]]`, hold: 3 },
  { tex: String.raw`\dfrac{d[[L|\cM{\vec\mu}]]}{dt}=[[g|-\gamma]]\,[[mu|\cM{\vec\mu}]]\times[[B|\cB{\vec B}]]`, hold: 4, box: ['g'], note: '两边同乘 −γ（因为 μ = −γL）' },
  { tex: String.raw`\dfrac{d[[L|\cM{\vec\mu}]]}{dt}=[[g|\gamma]]\,[[B|\cB{\vec B}]]\times[[mu|\cM{\vec\mu}]]`, hold: 3, note: '交换叉乘顺序，负号消失' },
  { tex: String.raw`\dfrac{d[[L|\cM{\vec\mu}]]}{dt}=[[w|\cJ{\vec\omega}]]\times[[mu|\cM{\vec\mu}]]`, hold: 3, ann: [{ key: 'w', text: 'ω = γB' }], note: '绕 B 以角速度 ω 匀速转动 —— 拉莫尔进动' },
  { tex: String.raw`[[dm|d\mu]]=[[r|\mu\sin\theta]]\,[[dp|d\phi]]`, hold: 3, note: '几何上：μ 的端点在半径 μ sinθ 的圆上转过 dφ' },
  { tex: String.raw`\dfrac{[[dm|d\mu]]}{dt}=[[r|\mu\sin\theta]]\,[[dp|\omega]]`, hold: 4, note: '磁矩不倒向 B，而是绕 B 转圈；ω 的方向与 B 一致' },
] });
// ================================================================ STATION C: quantum expression (bars + μB)
deriv(250, POS.L + 'width:660px', { kicker: '4.1.2 · QUANTUM', title: '磁矩的量子表达式', size: 40, steps: [
  { tex: String.raw`[[mu|\cM{\mu}]]=[[c|\dfrac{e}{2m_e}]]\,[[L|\cL{L}]]`, hold: 5, note: '对应原理：形式与经典相同<br><span class="s">（质子质量 ≈ 1836 mₑ，质子轨道磁矩远小于电子）</span>' },
  { tex: String.raw`[[mu|\cM{\mu}]]=[[c|\dfrac{e}{2m_e}]]\,[[L|\sqrt{l(l+1)}\,\hbar]]`, hold: 4, box: ['L'], note: '但 L 的大小是量子化的' },
  { tex: String.raw`[[mu|\cM{\mu}]]=[[s|\sqrt{l(l+1)}]]\,[[c|\dfrac{e\hbar}{2m_e}]]`, hold: 4, note: '把 ħ 并入常数' },
  { tex: String.raw`[[mu|\cM{\mu}]]=[[s|\sqrt{l(l+1)}]]\,[[c|\cJ{\mu_B}]]`, hold: 10, box: ['c'], ann: [{ key: 'c', text: 'μ_B = eħ/2mₑ = 9.274×10⁻²⁴ J/T' }], note: '<span class="k">玻尔磁子</span>：轨道磁矩的最小单元 &nbsp; l = 0, 1, 2 → 0, √2, √6 μ<sub>B</sub>' },
  { tex: String.raw`[[mu|\cM{\mu_z}]]=-[[c2|\dfrac{e}{2m_e}]]\,[[L|\cL{L_z}]]`, hold: 4, note: '再看 z 方向投影' },
  { tex: String.raw`[[mu|\cM{\mu_z}]]=-[[c2|\dfrac{e}{2m_e}]]\,[[L|m_l\hbar]]`, hold: 4, box: ['L'], note: 'L<sub>z</sub> 也量子化：m<sub>l</sub> = 0, ±1, …, ±l' },
  { tex: String.raw`[[mu|\cM{\mu_z}]]=-[[L|m_l]]\,[[c2|\cJ{\mu_B}]]`, hold: 8, note: '方向也是量子化的 → 下一节' },
] });

// ================================================================ STATION D: orientation quantization l = 1,2,3
const SD = { g: new THREE.Group() }; scene.add(SD.g);
const uq = 0.74;
const qcols = [0xff6a1f, 0xff8f5a, 0xd9a88f, 0xffbf73, 0xa9c8dc, 0xe9e1d2, 0xbfe3cf];
function qGroup(l) {
  const G = { g: new THREE.Group(), l, arrows: [], rings: [], labs: [] }; SD.g.add(G.g);
  const R = Math.sqrt(l * (l + 1)) * uq;
  G.sph = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), fresnel(C.L, 3.2, 0.16)); G.g.add(G.sph);
  for (let i = 0; i < 3; i++) { const r = ringLine(R, C.L, { dashed: false, op: 0.1 }); r.rotation.z = Math.PI / 2; r.rotation.y = i * Math.PI / 3; G.g.add(r); }
  for (let m = l; m >= -l; m--) {
    const col = qcols[(m + 3) % 7]; const rr = Math.sqrt(Math.max(l * (l + 1) - m * m, 0)) * uq;
    const ring = ringLine(rr, col, { dashed: true, op: 0.9 }); ring.position.y = m * uq; G.g.add(ring); G.rings.push(ring);
    G.arrows.push(new Arrow(col, { r: 0.028, hr: 0.08, hl: 0.24, parent: G.g }));
    G.labs.push(new Label(T`m_l=${m > 0 ? '+' + m : m}`, hex(col), { size: 20 }));
  }
  G.tag = new Label(T`l=${l}:\ |\vec L|=\sqrt{${l * (l + 1)}}\,\hbar` + `&nbsp;· ${2 * l + 1} 种取向`, hex(C.L), { size: 24 });
  return G;
}
SD.q = [qGroup(1), qGroup(2), qGroup(3)];
SD.nuc = nucleus(0.7); SD.g.add(SD.nuc);
SD.zax = new Arrow(0xd8d1c4, { r: 0.018, hr: 0.06, hl: 0.22, parent: SD.g });
SD.zlab = new Label(T`z\ (\vec B\ \text{方向})`, '#d8d1c4', { bare: true, size: 24 });
const qT = [[305, 322], [322, 340], [340, 361]];
function updateD(t) {
  const op = win(t, 304, 362, 1.5);
  SD.g.visible = op > 0.004; if (!SD.g.visible) return;
  setOp(SD.nuc, op); SD.nuc.rotation.y = t * 0.3;
  SD.zax.set(V(0, -2.9, 0), V(0, 5.9, 0), op); SD.zlab.place(V(0, 3.05, 0), op, 90, 0);
  SD.q.forEach((G, gi) => {
    const go = op * win(t, qT[gi][0], qT[gi][1], 1.2);
    G.g.visible = go > 0.004; if (!G.g.visible) { G.labs.forEach(l => l.place(V(), 0)); G.tag.place(V(), 0); return; }
    setOp(G.g, go);
    const l = G.l;
    for (let k = 0; k < 2 * l + 1; k++) {
      const m = l - k; const rr = Math.sqrt(Math.max(l * (l + 1) - m * m, 0)) * uq; const ph = t * 0.9 + k * 1.1;
      const gi2 = go * ep(t, qT[gi][0] + 1 + k * 0.6, qT[gi][0] + 2 + k * 0.6);
      setOp(G.rings[k], gi2); G.arrows[k].set(V(), V(rr * Math.cos(ph), m * uq, rr * Math.sin(ph)), gi2);
      G.labs[k].place(V(rr + 0.1, m * uq, 0), gi2, 70, 0);
    }
    setOp(G.sph, go);
    G.tag.place(V(0, -3.3, 0), go, 0, 20);
  });
}
card(306, 361, POS.L, `${kick('4.1.3 · SPACE QUANTIZATION')}<h3>角动量取向量子化</h3>L 的大小固定，但它在 z 方向的投影只能取
<div class="f" data-at="2">${T`L_z=m_l\hbar,\ \ m_l=0,\pm1,\dots,\pm l`}</div>
<table class="tbl" data-at="5"><tr><th>l</th><th>|L| / ħ</th><th>取向数 2l+1</th></tr><tr data-at="5"><td>1</td><td>√2</td><td>3</td></tr><tr data-at="17"><td>2</td><td>√6</td><td>5</td></tr><tr data-at="35"><td>3</td><td>√12</td><td>7</td></tr></table>
<div class="s" data-at="42">取向数总是<span class="k">奇数</span> —— 记住它，第 2 集会用到</div>`);

// ================================================================ recap
card(362, 378, POS.BC + 'width:1300px;', `${kick('EPISODE 1 · SUMMARY')}<h3>本集小结</h3>
<div style="display:flex;gap:40px"><ol style="flex:1">
<li data-at="1">电子轨道运动 ⇒ 磁矩 ${T`\vec\mu=-\gamma\vec L`}，μ 与 L 反向</li>
<li data-at="2.5">均匀磁场：不受力，只做拉莫尔进动 ${T`\omega=\gamma B`}</li>
<li data-at="4">非均匀磁场：受力 ${T`F_z=\mu_z\,\partial B/\partial z`}</li></ol><ol start="4" style="flex:1">
<li data-at="5.5">大小量子化：${T`\mu=\sqrt{l(l+1)}\,\mu_B`}，μ<sub>B</sub> 玻尔磁子</li>
<li data-at="7">方向量子化：${T`\mu_z=-m_l\mu_B`}，共 2l+1（奇数）种取向</li></ol></div>
<hr><div data-at="9" style="text-align:center">下一集：怎样在实验中<span class="k">亲眼看到</span>取向量子化？ → <span class="m">施特恩-盖拉赫实验</span></div>`);

// ================================================================ camera (low grazing angles, roll, whip transitions)
const shots = [
  { t0: 0, fn: fixedShot([12, 4, 14], [0, 0, 0]) },
  { t0: 10, b: 0.5, fn: pathShot([{ u: 0, p: [10, -1.0, 11.5], l: [0, -4.2, 0], roll: -18, fov: 46, s: 300 }, { u: 4, p: [6.5, 0.2, 11.5], l: [0, -1.4, 0], roll: -12, fov: 42, s: 300 }, { u: 14, p: [-1.5, 1.4, 10.6], l: [0, 0.2, 0], roll: -6, fov: 38, s: 290 }, { u: 60, p: [-6.5, 3.0, 8.4], l: [0, 0.2, 0], roll: 5, fov: 38, s: 290 }]) },
  { t0: 70, b: 2.6, whip: true, fn: pathShot([{ u: 0, p: [5, 8.5, 17.5], l: [0, -1.4, -1], roll: -9, fov: 42 }, { u: 37, p: [-5, 5.5, 16.5], l: [0, -1.4, -1], roll: 7, fov: 40 }]) },
  { t0: 107, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [7.2, 0.9, 7.2], l: [0, 0.5, 0], roll: -15, fov: 42, s: 320 }, { u: 25, p: [4.5, 3.8, 8.6], l: [0, 0.0, 0], roll: -6, fov: 38, s: 320 }, { u: 54, p: [2.0, 5.2, 8.6], l: [0, -0.2, 0], roll: -2, fov: 38, s: 320 }]) },
  { t0: 160, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [-7.5, 1.2, 8.2], l: [0, 0.5, 0], roll: 12, fov: 40, s: 320 }, { u: 44, p: [-1, 1.8, 11], l: [0, 0.2, 0], roll: 2, fov: 38, s: 320 }, { u: 89, p: [7, 2.6, 8.6], l: [0, 0.2, 0], roll: -9, fov: 38, s: 320 }]) },
  { t0: 249, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [2.5, 6.5, 8.8], l: [0, -0.3, 0], roll: -12, fov: 40, s: 320 }, { u: 56, p: [7.5, 2.8, 6.4], l: [0, 0, 0], roll: -3, fov: 38, s: 320 }]) },
  { t0: 304, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [10, 0.6, 8.2], l: [0, 0.4, 0], roll: -14, fov: 40, s: 330 }, { u: 57, p: [4, 4.6, 11.5], l: [0, 0.3, 0], roll: 3, fov: 40, s: 330 }]) },
  { t0: 361, b: 2.6, whip: true, fn: pathShot([{ u: 0, p: [13, 1.2, 11], l: [0, -3.4, 0], roll: -10, fov: 42 }, { u: 16, p: [8, 0.4, 13.5], l: [0, -3.0, 0], roll: -4, fov: 40 }]) },
  { t0: 376.6, b: 1.4, whip: true, fn: END.cam },
];
run({
  duration: DUR, shots, update(t) {
    updateModel(t); updateA(t); updateB(t); updateD(t);
  }
});
