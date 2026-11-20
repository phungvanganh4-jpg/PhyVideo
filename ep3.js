// EP3 — 4.3 电子自旋 · 朗德 g 因子 · 施特恩-盖拉赫实验的完美解释
import {
  THREE, T, V, UP, C, hex, ep, win, rampInt, clamp, rng, scene, camera, setOp, phys, metal, glow, glowTex, fresnel, Arrow, Cone, ringLine, polyLine,
  nucleus, electron, Label, card, overlay, POS, kick, setStations, setChips, svgDensity, gauss, edges, VectorModel,
  orbitShot, fixedShot, run
, deriv } from './engine.js';

import { ContourTerrain, wellField, GridFunnel, KText, KPath, tag, ctag, dust, titleSequence, endSequence } from './noir.js';
import { pathShot, setFog, hooks } from './engine.js';

const DUR = 444;
titleSequence({ epn: '03', main: '电子自旋', sub: '第 3 集 · 4.3 自旋假设 · 朗德 g 因子', ring: 'ELECTRON SPIN · LANDÉ g-FACTOR · ', tags: ['s = 1/2', 'gs 2.0023', 'μB 9.274e-24 J/T'] });
window.NO_END_FALLBACK = true;
const END = endSequence({ t0: 434, t1: 444, text: '第 3 集 · 完', next: 'NEXT ▸ 自旋-轨道相互作用 · 碱金属双线' });
setFog(16, 62);

// ---------------------------------------------------------------- world floor A: contour landscape under the Stern–Gerlach sections (two wells = two spots)
const WF = wellField({ depth: 1.6, a: 3.0, noise: 0.5, nscale: 0.1, wells: [{ x: 6.5, z: -3.2, d: 2.4, a: 1.3 }, { x: 6.5, z: 3.2, d: 2.4, a: 1.3 }] });
const terr = new ContourTerrain({ f: WF, size: 54, res: 220, step: 0.075, y0: -3.2, indexEvery: 5, hotLevels: [WF(6.5, 3.2 + 1.6)], hotWidth: 0.55, fadeNear: 14, fadeFar: 60 });
const tTags = [
  [ctag('2l+1 = 1, 3, 5 …', 18), -4, -3, 13, 26],
  [ctag('μB 9.274e-24 J/T', 18), -9, -6, 14, 40],
  [tag('z₂ ±1.12 cm'), 10, 0, 373.5, 404],
  [ctag('∂B/∂z 10 T/m', 18), -2, 6, 373.5, 404],
  [ctag('T 400 K · d 1 m · D 2 m', 18), 6, -4, 374, 404],
  [ctag('g(²S½) = 2', 18), -4, -3, 348, 369],
].map(([L, x, z, a, b]) => ({ L, p: terr.point(x, z, 0.06), a, b }));
// ---------------------------------------------------------------- world floor B: warped grid funnel under the spinning electron / vector model
const fun = new GridFunnel({ R: 21, depth: 5.5, a: 1.5, r0: 1.05, streaks: 420, fadeNear: 12, fadeFar: 58 });
fun.g.position.y = -3.7; fun.g.updateMatrixWorld(true);
const fTags = [
  [ctag('S = √3/2 ħ', 18), 7, 4.6, 54, 100],
  [tag('μ_s,z ∓μ_B'), 9, 5.2, 79, 100],
  [ctag('g_l = 1', 18), 7, 4.3, 117, 160],
  [tag('g_s 2.0023'), 11, 5.0, 147, 160],
  [ctag('g(¹P₁) = 1', 18), 11, 2.45, 323, 340],
  [ctag('g(²P3/2) = 4/3', 18), 8.5, 2.8, 328, 340],
  [tag('g(⁴D½) = 0'), 12, 3.1, 334.5, 340],
].map(([L, r, th, a, b]) => ({ L, p: fun.point(r, th, 0.06), a, b }));
hooks.push(t => {
  const opA = Math.max(win(t, 10.0, 41.5, 0.4), win(t, 339, 405, 1.0));
  terr.set(opA, t < 200 ? 4 + 46 * ep(t, 10.3, 15.5) : 4 + 46 * ep(t, 339.5, 344), t < 200 ? [0, 0] : [6.5, 0]);
  tTags.forEach(e => e.L.place(e.p, opA * win(t, e.a, e.b, 0.6)));
  const opB = Math.max(win(t, 39, 341, 1.0), win(t, 403, 435, 1.0));
  fun.set(t, opB, { swirl: opB, ringI: opB * (0.75 + 0.25 * Math.sin(t * 1.3)) });
  fTags.forEach(e => e.L.place(e.p, opB * win(t, e.a, e.b, 0.6)));
});
// ---------------------------------------------------------------- hero words (kinetic type laid into the world)
const KT = (o) => new KText({ cps: 18, ...o });
KT({ text: '2j + 1 = 2', t0: 26.2, t1: 36, font: 'mono', screen: { x: 1450, y: 900, planeY: -3.4, tilt: 0.45, px: 96 }, align: 'center' });
KT({ text: 's = ½', t0: 41.6, t1: 50.5, screen: { x: 560, y: 900, planeY: -3.6, tilt: 0.45, px: 110 }, align: 'center' });
KT({ text: '朗德 g 因子', t0: 101.4, t1: 115.5, screen: { x: 1450, y: 190, planeY: 1.0, tilt: 0.9, px: 76 }, align: 'center' });
KT({ text: 'g<sub>s</sub> = 2', html: true, t0: 140.8, t1: 146.2, screen: { x: 1250, y: 150, planeY: 1.0, tilt: 0.9, px: 84 }, align: 'center' });
KT({ text: 'μ 不沿 J', t0: 184.7, t1: 192.2, screen: { x: 1560, y: 230, planeY: 3.4, tilt: 0.9, px: 84 }, align: 'center' });
KT({ text: 'g<sub>j</sub> = 3/2 + …', html: true, t0: 249.0, t1: 259.0, screen: { x: 1580, y: 900, planeY: -3.4, tilt: 0.45, px: 80 }, align: 'center' });
KT({ text: '±1.12 cm', t0: 369.4, t1: 375.2, font: 'mono', screen: { x: 1450, y: 890, planeY: -3.4, tilt: 0.45, px: 100 }, align: 'center' });
KT({ text: '完美解释', t0: 391, t1: 403.6, screen: { x: 680, y: 900, planeY: -3.6, tilt: 0.4, px: 100 }, align: 'center' });
setStations([['动机', 11, 40], ['自旋假设', 40, 100], ['g 因子', 100, 160], ['g_j 推导', 160, 262], ['适用与推广', 262, 316], ['例题·解释', 316, 404], ['小结', 404, 434]]);
setChips([[11, 40, '4.3', '为什么需要新的角动量？'], [40, 100, '4.3.1', '自旋电子假设'], [100, 160, '4.3.2', '朗德 g 因子'], [160, 262, '4.3.3', '单电子 g 因子的一般表达式'], [262, 316, '4.3.3', '适用范围 · 推广 · 原子态符号'], [316, 340, '例 1', '求原子态的 g 因子'], [340, 404, '4.3.4', '施特恩-盖拉赫实验的完美解释'], [404, 434, '✓', '本集小结']]);

// ================================================================ SG mini (11-40, 340-372)
const SG = { g: new THREE.Group() }; scene.add(SG.g);
{
  const pole = (y, c, e) => { const m = new THREE.Mesh(new THREE.BoxGeometry(3, 0.9, 1.4), metal(c, { opacity: 0.9 })); m.position.set(0, y, 0); SG.g.add(m, edges(m, e, 0.7)); };
  pole(0.85, 0x3a4650, C.B); pole(-0.85, 0x5c2a1c, C.MU);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.8), new THREE.MeshPhysicalMaterial({ color: 0xd8d1c4, transparent: true, opacity: 0.1, side: THREE.DoubleSide })); scr.rotation.y = -Math.PI / 2; scr.position.set(4.2, 0, 0); SG.g.add(scr, edges(scr, 0xd8d1c4, 0.6));
  [[0.95, C.S], [-0.95, C.E]].forEach(([y, c]) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.12), new THREE.MeshBasicMaterial({ color: c, transparent: true, side: THREE.DoubleSide })); b.rotation.y = -Math.PI / 2; b.position.set(4.18, y, 0); SG.g.add(b); const gl = glow(c, 0.9); gl.position.set(4.15, y, 0); SG.g.add(gl); });
  SG.N = 200; SG.pp = new Float32Array(SG.N * 3); SG.pc = new Float32Array(SG.N * 3); const r = rng(9);
  SG.par = Array.from({ length: SG.N }, () => ({ off: r(), z: (r() - 0.5) * 0.4, s: r() < 0.5 ? 1 : -1 }));
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(SG.pp, 3)); pg.setAttribute('color', new THREE.BufferAttribute(SG.pc, 3));
  SG.pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.1, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); SG.g.add(SG.pts);
}
SG.lab = { a: new Label('氢原子基态 · l = 0', hex(C.J)), b: new Label('两条！', hex(C.S)) };
function defl(x) { const a = 0.95 / 27; if (x < -1.5) return 0; if (x < 1.5) return a * (x + 1.5) ** 2; return a * 9 + a * 6 * (x - 1.5); }
function updateSG(t) {
  const op = Math.max(win(t, 10, 41, 1.5), win(t, 340, 373, 1.5));
  SG.g.visible = op > 0.004; if (!SG.g.visible) { SG.lab.a.place(V(), 0); SG.lab.b.place(V(), 0); return; }
  setOp(SG.g, op);
  for (let i = 0; i < SG.N; i++) { const P = SG.par[i]; const ph = (t * 0.45 + P.off) % 1; const x = -5 + ph * 9.2; const y = P.s * defl(x); SG.pp.set([x, y, P.z], i * 3); const c = P.s > 0 ? [1.0, 0.42, 0.12] : [0.66, 0.78, 0.86]; SG.pc.set(c.map(v => v * op), i * 3); }
  SG.pts.geometry.attributes.position.needsUpdate = true; SG.pts.geometry.attributes.color.needsUpdate = true;
  SG.lab.a.place(V(-4.5, 0.5, 0), op * win(t, 10, 41, 1.5), 0, -20); SG.lab.b.place(V(4.2, 1.6, 0), op, 0, -10);
}
card(12, 25, POS.L + 'width:560px', `${kick('RECAP')}<h3>上一集留下的矛盾</h3>氢原子基态 ${T`l=0`}：轨道磁矩为零<div data-at="3">施特恩-盖拉赫实验却观察到<span class="m">两条</span></div><div class="s" data-at="7">轨道理论：2l+1 条，永远是奇数</div>`);
card(25.5, 40, POS.L + 'width:600px', `${kick('UHLENBECK & GOUDSMIT · 1925')}<h3>推理</h3>要得到<span class="k">偶数</span>分裂：${T`2j+1=2\Rightarrow j=\tfrac12`}<div data-at="4">只有角动量量子数为<span class="k">半整数</span>才可能</div><div data-at="8">而轨道角动量量子数都是整数，且基态为零</div><div data-at="11" class="big" style="font-size:32px">⇒ 必须考虑<span class="m">非轨道</span>的角动量</div>`);

// ================================================================ spin electron (40-100)
const SP = { g: new THREE.Group() }; scene.add(SP.g);
SP.ball = new THREE.Mesh(new THREE.SphereGeometry(0.45, 64, 48), phys(0xa9c8dc, 0.45, { roughness: 0.15 })); SP.g.add(SP.ball);
SP.halo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 32), fresnel(C.E, 2.6, 0.45)); SP.g.add(SP.halo);
SP.rot = new THREE.Group(); SP.g.add(SP.rot);
{ const arc = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.018, 12, 96, Math.PI * 1.5), phys(C.S, 0.8)); arc.rotation.x = Math.PI / 2; SP.rot.add(arc); const hd = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 24), phys(C.S, 0.8)); hd.position.set(0, 0, -0.78); hd.rotation.z = Math.PI / 2; SP.rot.add(hd); }
const us = 2.0, Ss = Math.sqrt(3) / 2 * us, th4 = Math.acos(0.5 / (Math.sqrt(3) / 2));
SP.S = new Arrow(C.S, { r: 0.055, hr: 0.15, hl: 0.45, parent: SP.g });
SP.sph = new THREE.Mesh(new THREE.SphereGeometry(Ss, 64, 48), fresnel(0xd9a88f, 3.2, 0.16)); SP.g.add(SP.sph);
SP.cu = new Cone(C.S, SP.g, 0.08); SP.cd = new Cone(C.E, SP.g, 0.08);
SP.Su = new Arrow(C.S, { r: 0.045, hr: 0.13, hl: 0.4, parent: SP.g }); SP.Sd = new Arrow(C.E, { r: 0.045, hr: 0.13, hl: 0.4, parent: SP.g });
SP.Mu = new Arrow(C.MU, { r: 0.035, hr: 0.1, hl: 0.3, parent: SP.g }); SP.Md = new Arrow(C.MU, { r: 0.035, hr: 0.1, hl: 0.3, parent: SP.g });
SP.zax = new Arrow(0xd8d1c4, { r: 0.018, hr: 0.06, hl: 0.22, parent: SP.g });
SP.lab = { S: new Label(T`\vec S` + '&nbsp;自旋角动量', hex(C.S)), r: new Label(T`|\vec S|=\tfrac{\sqrt3}{2}\hbar`, '#f0d9cc'), up: new Label(T`m_s=+\tfrac12\quad S_z=+\tfrac{\hbar}{2}`, hex(C.S)), dn: new Label(T`m_s=-\tfrac12\quad S_z=-\tfrac{\hbar}{2}`, hex(C.E)), mu1: new Label(T`\mu_{s,z}=-\mu_B`, hex(C.MU), { size: 21 }), mu2: new Label(T`\mu_{s,z}=+\mu_B`, hex(C.MU), { size: 21 }), z: new Label(T`z\ (\vec B)`, '#d8d1c4', { bare: true, size: 24 }) };
function updateSP(t) {
  const op = win(t, 40, 101, 1.5);
  SP.g.visible = op > 0.004; if (!SP.g.visible) { Object.values(SP.lab).forEach(l => l.place(V(), 0)); return; }
  setOp(SP.ball, op); setOp(SP.halo, op);
  const o1 = op * win(t, 41, 64);
  const sAx = V(0.25, 1, 0.1).normalize();
  SP.S.set(V(), sAx.clone().multiplyScalar(Ss * ep(t, 42, 45)), o1);
  SP.rot.quaternion.setFromUnitVectors(UP, sAx); SP.rot.rotateY(-t * 2.5); setOp(SP.rot, op * win(t, 41, 101));
  SP.lab.S.place(sAx.clone().multiplyScalar(Ss * 0.7), o1, 150, 0);
  setOp(SP.sph, op * win(t, 52, 101)); SP.lab.r.place(V(-Ss * 0.75, Ss * 0.75, 0), op * win(t, 53, 64), -40, 0);
  const o2 = op * ep(t, 64, 66), ph = t * 1.2;
  SP.zax.set(V(0, -2.1, 0), V(0, 4.3, 0), o2);
  SP.cu.set(V(), UP, th4, Ss, o2); SP.cd.set(V(), V(0, -1, 0), th4, Ss, o2);
  const r = Ss * Math.sin(th4), h = Ss * Math.cos(th4);
  const su = V(r * Math.cos(ph), h, r * Math.sin(ph)), sd = V(r * Math.cos(ph + Math.PI), -h, r * Math.sin(ph + Math.PI));
  SP.Su.set(V(), su, o2); SP.Sd.set(V(), sd, o2);
  SP.lab.up.place(V(r + 0.2, h, 0), o2, 160, 0); SP.lab.dn.place(V(r + 0.2, -h, 0), o2, 160, 0); SP.lab.z.place(V(0, 2.2, 0), o2, 70, 0);
  const o3 = op * ep(t, 78, 80);
  SP.Mu.set(V(), su.clone().multiplyScalar(-0.62), o3); SP.Md.set(V(), sd.clone().multiplyScalar(-0.62), o3);
  SP.lab.mu1.place(su.clone().multiplyScalar(-0.7), o3, -110, 0); SP.lab.mu2.place(sd.clone().multiplyScalar(-0.7), o3, -110, 0);
}
card(41, 52, POS.L, `${kick('HYPOTHESIS (1)')}<h3>电子有内禀运动——自旋</h3>电子不是简单的点电荷<div data-at="3">它具有<span class="m">自旋角动量</span>和<span class="r">自旋磁矩</span></div>`);
card(52.5, 64, POS.L, `${kick('HYPOTHESIS (2)')}<h3>自旋角动量大小固定</h3>与轨道角动量类似：<div class="f" data-at="2">${T`S=\sqrt{s(s+1)}\,\hbar,\qquad s=\tfrac12`}</div><div data-at="5">s 称为<span class="k">自旋量子数</span>，${T`S=\tfrac{\sqrt3}{2}\hbar`}</div>`);
card(64.5, 78, POS.L, `${kick('HYPOTHESIS (3)')}<h3>空间取向量子化，只有两种</h3><div class="f">${T`S_z=m_s\hbar,\qquad m_s=\pm\tfrac12`}</div><div data-at="4">${T`m_s`} 称为<span class="k">自旋磁量子数</span></div><div class="s" data-at="7">取向数 2s+1 = 2 —— 正好对应“两条”</div>`);
card(78.5, 90, POS.L, `${kick('HYPOTHESIS (4)')}<h3>自旋磁矩的投影 = 1 个玻尔磁子</h3><div class="f">${T`\mu_{s,z}=\pm\dfrac{e\hbar}{2m_e}=\pm\mu_B`}</div><div class="s" data-at="4">磁矩与自旋反向（电子带负电）</div>`);
card(90.5, 100, POS.L, `${kick('NOTE')}<h3>注意</h3>自旋角动量的来源无法用任何经典图像解释<div data-at="3">它是<span class="m">量子力学概念</span>，是微观粒子的<span class="k">内禀属性</span></div><div class="s" data-at="6">只能通过实验验证其存在的合理性（“小球自转”只是帮助想象）</div>`);

// ================================================================ g ratio (100-160)
const GR = { g: new THREE.Group() }; scene.add(GR.g);
GR.J = new Arrow(C.J, { r: 0.05, hr: 0.13, hl: 0.38, parent: GR.g }); GR.mJ = new Arrow(C.MU, { r: 0.05, hr: 0.13, hl: 0.38, parent: GR.g });
GR.L = new Arrow(C.L, { r: 0.05, hr: 0.13, hl: 0.38, parent: GR.g }); GR.mL = new Arrow(C.MU, { r: 0.05, hr: 0.13, hl: 0.38, parent: GR.g });
GR.S = new Arrow(C.S, { r: 0.05, hr: 0.13, hl: 0.38, parent: GR.g }); GR.mS = new Arrow(C.MU, { r: 0.05, hr: 0.13, hl: 0.38, parent: GR.g });
GR.ticks = new THREE.Group(); GR.g.add(GR.ticks);
for (let i = 1; i <= 4; i++) { [-2.2, 2.2].forEach(x => GR.ticks.add(polyLine([V(x - 0.25, -i * 0.8, 0), V(x + 0.25, -i * 0.8, 0)], 0x9a9184, 0.6))); }
GR.lab = { J: new Label(T`\vec J`, hex(C.J), { bare: true, size: 32 }), mJ: new Label(T`\vec\mu_j=-g_j\frac{e}{2m_e}\vec J`, hex(C.MU)), L: new Label(T`\vec L`, hex(C.L), { bare: true, size: 32 }), mL: new Label('轨道 ' + T`g_l=1`, hex(C.L)), S: new Label(T`\vec S`, hex(C.S), { bare: true, size: 32 }), mS: new Label('自旋 ' + T`g_s=2`, hex(C.S)) };
function updateGR(t) {
  const op = win(t, 100, 161, 1.5); GR.g.visible = op > 0.004; if (!GR.g.visible) { Object.values(GR.lab).forEach(l => l.place(V(), 0)); return; }
  const o0 = op * win(t, 101, 116.5);
  GR.J.set(V(0, 0, 0), V(0, 1.6, 0), o0); GR.mJ.set(V(0, 0, 0), V(0, -2.4, 0), o0);
  GR.lab.J.place(V(0, 1.8, 0), o0, 26, 0); GR.lab.mJ.place(V(0, -2.4, 0), o0, 0, 30);
  const o1 = op * win(t, 116.5, 161); const o2 = op * win(t, 130.5, 161);
  GR.L.set(V(-2.2, 0, 0), V(0, 1.6, 0), o1); GR.mL.set(V(-2.2, 0, 0), V(0, -1.6, 0), o1);
  GR.S.set(V(2.2, 0, 0), V(0, 1.6, 0), o2); GR.mS.set(V(2.2, 0, 0), V(0, -3.2 * Math.max(0.5, ep(t, 134, 140)), 0), o2);
  setOp(GR.ticks, Math.max(o1, o2) * 0.8);
  GR.lab.L.place(V(-2.2, 1.8, 0), o1, 26, 0); GR.lab.mL.place(V(-2.2, -1.6, 0), o1, 0, 34);
  GR.lab.S.place(V(2.2, 1.8, 0), o2, 26, 0); GR.lab.mS.place(V(2.2, -3.2, 0), o2, 0, 34);
}
card(101, 116, POS.L + 'width:620px', `${kick('4.3.2 · LANDÉ g-FACTOR')}<h3>朗德 g 因子：磁矩与角动量之比</h3><div class="f2">${T`\mu_j=-g_j\dfrac{e}{2m_e}J=-g_j\sqrt{j(j+1)}\,\mu_B`}</div><div class="f2" data-at="4">${T`\mu_{j,z}=-g_j\dfrac{e}{2m_e}J_z=-g_jm_j\mu_B`}</div><div class="f2" data-at="8">${T`g_j=\dfrac{\mu_{j,z}/\mu_B}{J_z/\hbar}=\dfrac{\text{测得的}\ \mu_z\ (\mu_B\ \text{为单位})}{J_z\ (\hbar\ \text{为单位})}`}</div>`);
card(116.5, 130, POS.L + 'width:700px', `${kick('ORBITAL')}<h3>轨道：g<sub>l</sub> = 1</h3>由轨道角动量的经典概念与量子化得到<div class="f2" data-at="3">${T`j=l:\quad \mu_l=-\sqrt{l(l+1)}\,\mu_B,\quad \mu_{l,z}=-m_l\mu_B`}</div><div class="big" data-at="7" style="font-size:34px">⇒ ${T`g_l=1`}</div>`);
card(130.5, 146, POS.L + 'width:700px', `${kick('SPIN')}<h3>自旋：g<sub>s</sub> = 2</h3>若照搬轨道（g = 1）：${T`\mu_{s,z}=-m_s\mu_B=\pm\tfrac12\mu_B`}<div data-at="4"><span class="r">✗</span> 与系列实验矛盾</div><div data-at="7">乌伦贝克和古德斯密特直接假定：${T`\mu_{s,z}=\pm\mu_B`}</div><div class="f2" data-at="10">${T`\Rightarrow\ g_s=2,\qquad \mu_s=-g_s\sqrt{s(s+1)}\,\mu_B=-\sqrt3\,\mu_B`}</div>`);
card(146.5, 160, POS.L + 'width:620px', `${kick('ANOMALOUS MOMENT')}<h3>更精确的 g<sub>s</sub></h3><div class="big">${T`g_s=2.0023193\dots`}</div><div data-at="4">与 2 的细微差别：<span class="m">电子的反常磁矩</span></div><div class="s" data-at="7">量子电动力学（QED）可以从理论上精确解释</div>`);

// ================================================================ vector model (160-340)
const vm = new VectorModel(scene, { U: 1.3, R: 2.3, nuc: 1.0 });
vm.setState(1, 0.5, 1.5, 1.5);
const jLine = polyLine([V(0, 0, 0), V(0, -1, 0)], C.J, 0.6, true, 0.08); scene.add(jLine);
const tri = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: C.J, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })); scene.add(tri);
tri.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
const VL = {
  L: new Label(T`\vec L`, hex(C.L), { bare: true, size: 32 }), S: new Label(T`\vec S`, hex(C.S), { bare: true, size: 32 }), J: new Label(T`\vec J`, hex(C.J), { bare: true, size: 32 }),
  ml: new Label(T`\vec\mu_l`, '#f2ece0', { bare: true, size: 28 }), ms: new Label(T`\vec\mu_s`, '#ffa070', { bare: true, size: 28 }), mu: new Label(T`\vec\mu`, hex(C.MU), { bare: true, size: 32 }),
  mj: new Label(T`\vec\mu_j`, '#ff8a96', { bare: true, size: 30 }), mp: new Label(T`\vec\mu_\perp`, '#ffc2c8', { bare: true, size: 28 }), ext: new Label('J 的延长线', hex(C.J), { size: 20 }),
  B: new Label(T`\vec B`, hex(C.B), { bare: true, size: 34 }), Lb: new Label('L 绕 B 进动', hex(C.L), { size: 20 }), Sb: new Label('S 绕 B 进动', hex(C.S), { size: 20 })
};
const Bax = new Arrow(C.B, { r: 0.025, hr: 0.08, hl: 0.25 });
function updateVM(t) {
  const op = Math.max(win(t, 160, 341, 1.5), win(t, 404, 446, 1.5));
  if (op < 0.004) { vm.g.visible = false; setOp(jLine, 0); setOp(tri, 0); Bax.set(V(), V(), 0); Object.values(VL).forEach(l => l.place(V(), 0)); return; }
  const dec = ep(t, 265, 269) * (1 - ep(t, 275, 279));
  const a = { phi: 0.5 + t * 0.12, psi: 0.3 + rampInt(t, 163, 3, 0.9), eAng: t * 2.2, dec, mL: 1, mS: 0.5, psiL: t * 0.9, psiS: t * 1.3 };
  const W = (x, y) => op * win(t, x, y);
  const mo = W(176, 262), mjO = W(192, 262);
  const r = vm.draw({
    all: 1, nuc: op, orbit: op * 0.6, L: op, S: op, J: op * (1 - dec * 0.7), coneL: W(161, 192) * (1 - dec), coneMu: W(192, 210),
    mul: W(176, 262) * 0.95, mus: W(176, 262) * 0.95, mu: mo, muj: mjO, muperp: W(192, 226), coneLB: op * dec, coneSB: op * dec, coneJ: 0
  }, a, 0.5);
  vm.nuc.rotation.y = t * 0.3;
  const jh = r.J.clone().normalize();
  const pa = jLine.geometry.attributes.position; pa.setXYZ(0, 0, 0, 0); const e = jh.clone().multiplyScalar(-3.2); pa.setXYZ(1, e.x, e.y, e.z); pa.needsUpdate = true; jLine.computeLineDistances(); setOp(jLine, W(180, 262));
  const tp = tri.geometry.attributes.position; tp.setXYZ(0, 0, 0, 0); tp.setXYZ(1, r.L.x, r.L.y, r.L.z); tp.setXYZ(2, r.J.x, r.J.y, r.J.z); tp.needsUpdate = true; setOp(tri, W(226, 262));
  Bax.set(V(0, -3.0, 0), V(0, 6.2, 0), op * win(t, 263, 280) * 0.9); VL.B.place(V(0, 3.3, 0), op * win(t, 263, 280), 30, 0);
  VL.L.place(r.L.clone().multiplyScalar(0.55), op * (1 - dec), -24, 0); VL.S.place(r.L.clone().add(r.S.clone().multiplyScalar(0.55)), op * (1 - dec), 24, 0); VL.J.place(r.J.clone().multiplyScalar(1.08), op * (1 - dec), 0, -20);
  VL.ml.place(r.ml.clone().multiplyScalar(0.6), W(177, 192), -26, 0); VL.ms.place(r.ml.clone().add(r.ms.clone().multiplyScalar(0.55)), W(177, 192), 26, 0);
  VL.mu.place(r.mu.clone().multiplyScalar(1.08), mo, 0, 24); VL.mj.place(r.mj.clone().multiplyScalar(0.6), mjO, -30, 0); VL.mp.place(r.mj.clone().add(r.mp.clone().multiplyScalar(0.6)), W(193, 226), 26, 0);
  VL.ext.place(e.clone().multiplyScalar(0.8), W(181, 200), 0, 22);
  VL.Lb.place(r.L.clone().multiplyScalar(1.1), op * dec, 0, -20); VL.Sb.place(r.S.clone().multiplyScalar(1.15), op * dec, 0, -20);
}
card(161, 176, POS.L + 'width:620px', `${kick('4.3.3 · (1) L–S COUPLING')}<h3>先合成角动量</h3>原子中电子既有轨道又有自旋角动量<div class="f" data-at="3">${T`\vec J=\vec L+\vec S`}</div><div data-at="6">L 和 S 绕 J 进动（<span class="k">L-S 耦合</span>）</div><div class="s" data-at="9">L、S 各自不再守恒；对孤立原子 J 仍守恒</div>`);
card(176.5, 192, POS.L + 'width:620px', `${kick('(2) MAGNETIC MOMENTS')}<h3>再合成磁矩</h3><div class="f2">${T`\mu_l=-\sqrt{l(l+1)}\,g_l\mu_B,\quad g_l=1`}</div><div class="f2" data-at="2">${T`\mu_s=-\sqrt{s(s+1)}\,g_s\mu_B,\quad g_s=2`}</div><div data-at="5">${T`\vec\mu=\vec\mu_l+\vec\mu_s`}</div><div class="big" data-at="8" style="font-size:30px">g<sub>s</sub> ≠ g<sub>l</sub> ⇒ <span class="r">μ 与 J 不在一条直线上！</span></div>`);
card(192.5, 210, POS.L + 'width:620px', `${kick('(2) AVERAGING')}<h3>μ 绕 J 转：只剩 J 方向分量</h3><div class="f">${T`\vec\mu=\vec\mu_j+\vec\mu_\perp`}</div><div data-at="4">${T`\vec\mu_\perp`} 绕 J 旋转，对外<span class="k">平均效果抵消</span></div><div data-at="8">${T`\vec\mu_j`} 沿 J 延长线方向、恒定不变，真正对外起作用</div><div class="big" data-at="12" style="font-size:30px">⇒ 定义 ${T`\mu_j`} 为电子<span class="r">总磁矩</span></div>`);
deriv(210.5, POS.L + 'width:760px', { kicker: '4.3.3 · DERIVING g_j', title: '把 μₗ、μₛ 投影到 J 上', size: 30, height: 130, steps: [
  { tex: String.raw`\mu_j=[[ml|\mu_l]]\,[[cl|\cos(\vec L,\vec J)]]+[[ms|\mu_s]]\,[[cs|\cos(\vec S,\vec J)]]`, hold: 4.5, note: 'μ_j 是 μ 在 J 方向上的投影' },
  { tex: String.raw`\mu_j=-\Big[[[ml|g_l\hat l]]\,[[cl|\cos(\vec L,\vec J)]]+[[ms|g_s\hat s]]\,[[cs|\cos(\vec S,\vec J)]]\Big]\mu_B`, hold: 4.5, note: '代入 μ_l = −g_l l̂ μ_B，μ_s = −g_s ŝ μ_B（l̂ = √l(l+1) 等）' },
  { tex: String.raw`\mu_j=-\Big[[[ml|g_l\hat l]]\,[[cl|\cJ{\dfrac{\hat j^2+\hat l^2-\hat s^2}{2\hat j\hat l}}]]+[[ms|g_s\hat s]]\,[[cs|\cJ{\dfrac{\hat j^2+\hat s^2-\hat l^2}{2\hat j\hat s}}]]\Big]\mu_B`, hold: 7, box: ['cl', 'cs'], note: '余弦定理：L、S、J 构成三角形，S² = L² + J² − 2LJ cos(L,J)' },
  { tex: String.raw`\mu_j=-\Big[[[ml|g_l]]\,[[cl|\dfrac{\hat j^2+\hat l^2-\hat s^2}{2\hat j}]]+[[ms|g_s]]\,[[cs|\dfrac{\hat j^2+\hat s^2-\hat l^2}{2\hat j}]]\Big]\mu_B`, hold: 4, note: '约去 l̂、ŝ' },
  { tex: String.raw`[[gj|g_j]]=[[ml|g_l]]\,[[cl|\dfrac{\hat j^2+\hat l^2-\hat s^2}{2\hat j^2}]]+[[ms|g_s]]\,[[cs|\dfrac{\hat j^2+\hat s^2-\hat l^2}{2\hat j^2}]]`, hold: 5, note: '按定义 μ_j = −g_j ĵ μ_B，两边除以 −ĵ μ_B' },
  { tex: String.raw`[[gj|g_j]]=\dfrac{g_l+g_s}{2}+\dfrac{g_l-g_s}{2}\cdot\dfrac{\hat l^2-\hat s^2}{\hat j^2}`, hold: 4.5, note: '整理' },
  { tex: String.raw`[[gj|g_j]]=\cJ{\dfrac32}+\cJ{\dfrac12}\cdot\dfrac{\hat s^2-\hat l^2}{\hat j^2}`, hold: 7, box: ['gj'], note: '代入 g_l = 1，g_s = 2 —— <span class="k">单电子朗德 g 因子</span>（L-S 耦合）' },
] });
card(263, 279, POS.L + 'width:640px', `${kick('SCOPE (1)')}<h3>前提一：L-S 耦合</h3>无外磁场或外磁场较弱：S 与 L 先合成 J，绕 J 进动，J 再绕外场进动<div data-at="6"><span class="r">外磁场较强时</span>：S 与 L 分别绕外场进动，L-S 不能耦合</div><div class="s" data-at="10">（第 5 集“帕邢-巴克效应”会再见到这一图像）</div>`);
card(279.5, 292, POS.L + 'width:640px', `${kick('SCOPE (2)')}<h3>前提二：单电子？其实不限</h3>对满壳（支）层电子：总轨道、总自旋角动量都为零
<div data-at="4" style="text-align:center;margin:10px 0;font-size:26px">S <span class="pill">↑↓</span> &nbsp;&nbsp; P <span class="pill">↑↓</span><span class="pill">↑↓</span><span class="pill">↑↓</span></div><div data-at="7">有贡献的只是外层（未满壳层）电子</div>`);
card(292.5, 304, POS.L + 'width:640px', `${kick('GENERALIZATION')}<h3>推广：多电子原子</h3><div class="f">${T`g_J=\dfrac32+\dfrac12\cdot\dfrac{\hat S^2-\hat L^2}{\hat J^2}`}</div><div data-at="4">S、L、J：原子总自旋、总轨道、总角动量（L-S 耦合）</div><div class="s" data-at="8">忽略原子核的贡献：核质量比电子大三个量级，而磁矩与质量成反比</div>`);
card(304.5, 316, POS.L + 'width:640px', `${kick('NOTATION')}<h3>原子态的表示</h3><div class="big">${T`^{2S+1}L_J`}</div><div data-at="3">S：自旋量子数 &nbsp; L：轨道量子数（S, P, D, F…对应 0, 1, 2, 3…） &nbsp; J：总角动量量子数</div><div class="s" data-at="7">2S+1 称为多重数</div>`);
deriv(316.5, POS.Lw + 'width:900px', { kicker: 'EXAMPLE 1', title: '例 1：求下列原子态的 g 因子', size: 34, steps: [
  { tex: String.raw`g=1+\dfrac{[[j|j(j+1)]]-[[l|l(l+1)]]+[[s|s(s+1)]]}{2\,[[j2|j(j+1)]]}`, hold: 3.5, note: '与上面的公式等价（ŝ² = s(s+1) 等）' },
  { tex: String.raw`{}^1P_1:\quad g=1+\dfrac{[[j|2]]-[[l|2]]+[[s|0]]}{2\cdot[[j2|2]]}=\cJ{1}`, hold: 4.5, note: 's = 0，l = 1，j = 1：纯轨道，g = 1' },
  { tex: String.raw`{}^2P_{3/2}:\quad g=1+\dfrac{[[j|\frac{15}{4}]]-[[l|2]]+[[s|\frac34]]}{2\cdot[[j2|\frac{15}{4}]]}=\cJ{\dfrac43}`, hold: 5, note: 's = ½，l = 1，j = 3/2' },
  { tex: String.raw`{}^4D_{1/2}:\quad g=1+\dfrac{[[j|\frac34]]-[[l|6]]+[[s|\frac{15}{4}]]}{2\cdot[[j2|\frac34]]}=\cJ{0}`, hold: 5, note: 's = 3/2，l = 2，j = ½：g = 0，磁矩为零！' },
] });

// ================================================================ perfect explanation (340-404)
deriv(341, POS.Lw + 'width:820px', { kicker: '4.3.4 · PERFECT EXPLANATION', title: '把自旋考虑进去：氢原子基态', size: 36, steps: [
  { tex: String.raw`1^2S_{1/2}:\ \ [[g|g_j]]=\dfrac32+\dfrac12\cdot\dfrac{[[s|\frac34]]-[[l|0]]}{[[j|\frac34]]}`, hold: 4, note: 'l = 0，j = s = ½' },
  { tex: String.raw`[[g|g_j]]=\cJ{2}`, hold: 2.5 },
  { tex: String.raw`\mu_{j,z}=-[[m|m_j]]\,[[g|g_j]]\,\mu_B`, hold: 2.5, note: 'm_j = ±½' },
  { tex: String.raw`\mu_{j,z}=-[[m|(\pm\tfrac12)]]\,[[g|(2)]]\,\mu_B=\cM{\mp\mu_B}`, hold: 3.5 },
  { tex: String.raw`z_2=[[m|\pm\mu_B]]\,\dfrac{\partial B}{\partial z}\,\dfrac{dD}{3kT}`, hold: 3, note: '代入施特恩-盖拉赫偏移公式' },
  { tex: String.raw`z_2=\pm\dfrac{[[m|0.5788\times10^{-4}]]\times10\times1\times2}{3\times8.617\times10^{-5}\times400}\ \mathrm m`, hold: 4, note: '∂B/∂z = 10 T/m，d = 1 m，D = 2 m，T = 400 K（μ_B、k 均以 eV 为单位）' },
  { tex: String.raw`z_2=\cJ{\pm1.12\ \mathrm{cm}}`, hold: 4.5, note: '<span class="g">✓ 与实验定量符合</span>：只有电子自旋磁矩起作用，屏上两个取向' },
] });
const tbl = (rows) => `<table class="tbl"><tr><th>原子</th><th>基态</th><th>g</th><th>Mg</th><th>相片图样</th></tr>${rows.map((r, i) => `<tr data-at="${1 + i * 1.6}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${svgPattern(r[4])}</td></tr>`).join('')}</table>`;
function svgPattern(xs) { const w = 220, h = 28; return `<svg width="${w}" height="${h}">${xs.map(x => `<rect x="${w / 2 + x * 30 - 3}" y="3" width="6" height="${h - 6}" fill="#ff6a1f"/>`).join('')}<line x1="${w / 2}" y1="0" x2="${w / 2}" y2="${h}" stroke="rgba(255,255,255,.25)" stroke-dasharray="2 3"/></svg>`; }
card(375, 390, POS.TC + 'width:1000px', `${kick('TABLE · STERN–GERLACH RESULTS')}<h3>各种原子的施特恩-盖拉赫实验结果</h3>${tbl([
  ['Sn, Cd, Hg, Pb', T`^1S_0`, '–', '0', [0]], ['Sn, Pb', T`^3P_0`, '–', '0', [0]], ['H, Li, Na, K, Cu, Ag, Au', T`^2S_{1/2}`, '2', '±1', [-1, 1]],
  ['Tl', T`^2P_{1/2}`, '2/3', '±1/3', [-1 / 3, 1 / 3]], ['O', T`^3P_2`, '3/2', '±3, ±3/2, 0', [-3, -1.5, 0, 1.5, 3]], ['O', T`^3P_1`, '3/2', '±3/2, 0', [-1.5, 0, 1.5]]])}<div class="s" data-at="10.5" style="text-align:center">分裂条数 = 2J+1；间距 ∝ Mg</div>`);
card(390.5, 404, POS.TC + 'width:1100px', `${kick('STERN–GERLACH · SUMMARY')}<h3>施特恩-盖拉赫实验小结</h3><ol>
<li data-at="1">原子角动量（磁矩）是<span class="k">空间量子化</span>的；自旋假设正确：s = ½，g<sub>s</sub> = 2</li>
<li data-at="3">原子角动量 = 电子轨道 + 电子自旋 + 原子核角动量，磁矩同理</li>
<li data-at="5">由原子束在非均匀磁场中的偏移可以<span class="k">测量原子磁矩</span></li>
<li data-at="7">氢原子基态磁矩为 1 个玻尔磁子，只能来自<span class="m">电子自旋</span></li></ol>`);
card(405, 434, POS.TC + 'width:1300px', `${kick('EPISODE 3 · SUMMARY')}<h3>本集小结</h3><div style="display:flex;gap:40px"><ol style="flex:1">
<li data-at="1">自旋假设：${T`s=\tfrac12,\ S_z=\pm\tfrac{\hbar}{2},\ \mu_{s,z}=\pm\mu_B`}</li><li data-at="3">${T`g_l=1,\ g_s=2\ (2.0023)`}</li><li data-at="5">μ 不沿 J，只有 μ<sub>j</sub> 起作用</li></ol><ol start="4" style="flex:1">
<li data-at="7">${T`g_j=\tfrac32+\tfrac12\frac{\hat s^2-\hat l^2}{\hat j^2}`}，原子态 ${T`^{2S+1}L_J`}</li><li data-at="9">氢基态 g = 2，μ<sub>z</sub> = ∓μ<sub>B</sub> ⇒ 两条，z₂ = ±1.12 cm</li></ol></div>
<hr><div data-at="12" style="text-align:center">下一集：电子在原子<span class="k">内部</span>也感受到磁场 → <span class="k">自旋-轨道相互作用</span> → 碱金属双线</div>`, { world: 0.08 });

// ================================================================ camera
const shots = [
  { t0: 0, fn: fixedShot([0, 3, 14], [0, 0, 0]) },
  { t0: 10, b: 0.5, fn: pathShot([{ u: 0, p: [9.0, 0.2, 8.0], l: [0.8, -1.2, 0], roll: -16, fov: 46, s: 300 }, { u: 5, p: [8.0, 1.0, 9.5], l: [0.8, -0.4, 0], roll: -9, fov: 42, s: 320 }, { u: 30, p: [5.5, 1.8, 11.5], l: [0.6, -0.2, 0], roll: 4, fov: 40, s: 360 }]) },
  { t0: 40, b: 2.2, whip: true, fn: pathShot([{ u: 0, p: [2.5, 9.5, 6.0], l: [0, -1.6, 0], roll: -14, fov: 46, s: 320 }, { u: 9, p: [3.3, 8.3, 7.2], l: [0, -1.3, 0], roll: -11, fov: 44, s: 320 }, { u: 16, p: [5.5, 4.0, 8.5], l: [0, -0.2, 0], roll: -8, fov: 40, s: 320 }, { u: 24, p: [4.0, 1.4, 9.4], l: [0, 0.2, 0], roll: -5, fov: 38, s: 320 }, { u: 60, p: [-3.5, 2.2, 9.6], l: [0, 0.3, 0], roll: 5, fov: 38, s: 320 }]) },
  { t0: 100, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [4.0, -1.6, 10.5], l: [0, -0.6, 0], roll: 8, fov: 42, s: 360 }, { u: 30, p: [1.0, -0.6, 11.2], l: [0, -0.6, 0], roll: 2, fov: 40, s: 360 }, { u: 60, p: [-2.6, 0.4, 11.0], l: [0, -0.6, 0], roll: -4, fov: 40, s: 360 }]) },
  { t0: 160, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [-2.5, 4.4, 9.6], l: [0, -0.4, 0], roll: -12, fov: 42, s: 360 }, { u: 16, p: [-3.1, 1.6, 10.0], l: [0, 0.2, 0], roll: -6, fov: 40, s: 360 }, { u: 50, p: [3.1, 2.4, 10.0], l: [0, -0.1, 0], roll: 3, fov: 38, s: 360 }, { u: 100, p: [8.6, 1.6, 6.8], l: [0, 0.6, 0], roll: -6, fov: 39, s: 360 }, { u: 112, p: [9.6, 1.8, 6.6], l: [0, 1.0, 0], roll: -4, fov: 40, s: 360 }, { u: 156, p: [10.8, 2.8, 0.0], l: [0, 1.1, 0], roll: 3, fov: 38, s: 360 }]) },
  { t0: 316, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [10.6, 1.4, -0.6], l: [0, 1.0, 0], roll: -7, fov: 40, s: 560 }, { u: 24, p: [10.0, 2.8, -3.4], l: [0, 1.0, 0], roll: 2, fov: 38, s: 560 }]) },
  { t0: 340, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [9.0, 0.8, 9.0], l: [1.5, -0.2, 0], roll: -10, fov: 42, s: 440 }, { u: 32, p: [6.5, 1.6, 12.0], l: [1.2, -0.2, 0], roll: 3, fov: 40, s: 440 }]) },
  { t0: 372, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [13, 0.6, 11], l: [2, -3.2, 0], roll: -10, fov: 44 }, { u: 32, p: [7, 0.2, 15], l: [2, -3.0, 0], roll: -4, fov: 42 }]) },
  { t0: 404, b: 2.6, whip: true, fn: pathShot([{ u: 0, p: [9.0, 3.2, 9.5], l: [0, 2.9, 0], roll: -6, fov: 42 }, { u: 30, p: [-5.5, 3.6, 11.0], l: [0, 2.9, 0], roll: 4, fov: 42 }]) },
  { t0: 433.6, b: 1.4, whip: true, fn: END.cam },
];
run({ duration: DUR, shots, update(t) { updateSG(t); updateSP(t); updateGR(t); updateVM(t); } });
