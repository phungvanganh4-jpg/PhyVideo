// EP6 — 4.6–4.11 氢原子光谱的精细结构 · 兰姆移位 · 双光子 · 磁共振 · 全章总结
import {
  THREE, T, V, UP, C, hex, ep, win, rampInt, clamp, rng, scene, camera, setOp, phys, glow, fresnel, Arrow, Cone, ringLine, polyLine,
  nucleus, electron, Label, card, overlay, POS, kick, chainHTML, setStations, setChips, svgSpectrum, Levels, bar, VectorModel, Field,
  orbitShot, fixedShot, run
, deriv } from './engine.js';
import { ContourTerrain, wellField, KText, tag, ctag, titleSequence, endSequence } from './noir.js';
import { pathShot, setFog, hooks } from './engine.js';

const DUR = 468;
titleSequence({ epn: '06', main: '精细结构的尽头', sub: '第 6 集 · 4.6–4.11 氢原子精细结构 · 兰姆移位 · 磁共振 · 全章总结', ring: 'FINE STRUCTURE OF HYDROGEN · LAMB SHIFT · RESONANCE · ', tags: ['α 1/137.036', '1057 MHz', 'gs 2.0023'] });
window.NO_END_FALLBACK = true;
const END = endSequence({ t0: 458, t1: 468, text: '第四章 · 完', next: '一个假设 · 三个实验 · 四个量子数 · 五步进展' });
setFog(16, 62);
// ---------------------------------------------------------------- world floor: the energy landscape (Coulomb well + a twin "Lamb" dimple pair far back)
const WF = wellField({ depth: 6.2, a: 1.7, noise: 0.42, nscale: 0.1, wells: [{ x: 9.5, z: -10, d: 1.5, a: 1.1 }, { x: 11.6, z: -9.2, d: 1.3, a: 1.0 }] });
const RN = [2.6, 5.4, 9.6];
const terr = new ContourTerrain({ f: WF, size: 58, res: 240, step: 0.075, y0: -4.7, indexEvery: 5, hotLevels: RN.map(r => WF(r, 0)), hotWidth: 0.55, fadeNear: 14, fadeFar: 62 });
// mono tags pinned on the floor: [label, x, z, t0, t1]
// mono tags: [label, world point (or [x, z] on the floor), t0, t1, dx, dy]
const TAGS = [
  [ctag('R = 1.0968e7 m⁻¹', 18), [-3.0, -11.5], 15, 60],
  [ctag('α ≈ 1/137', 18), [3.5, -11.0], 31, 60.5],
  [tag('ΔT ∝ α²/n³'), [4.0, -12.0], 61, 99],
  [ctag('1913 · 1916 · 1926 · 1928', 18), [0.5, -12.5], 100, 139],
  [tag('1057 MHz'), V(1.0, 0.7, 0), 156, 186],                 // the microwave cavity of Lamb's apparatus
  [tag('4.37 μeV'), V(4.6, -3.35, 0), 149, 186],               // under the magnified Lamb gap
  [ctag('gs 2.0023', 18), [-1.0, -12.5], 163, 186],
  [tag('121.6 nm'), V(2.8, -0.3, 0), 191, 210, 96, 34],          // on the Lyman-α line
  [ctag('τ(2S) ≈ 0.12 s', 18), V(-0.5, 2.15, 0), 194, 210],      // the metastable 2S level
  [ctag('μB 9.274e-24 J/T', 18), [4.5, -12.0], 260, 300],
  [tag('9.5 GHz ↔ 0.34 T'), [0.0, -11.0], 264, 300],
  [ctag('n · l · j · mj', 18), [5.5, -9.0], 394.5, 410],
  [ctag('2S₁/₂ – 2P₁/₂ · 1947', 18), [-0.5, -13.0], 426.5, 440],
];
TAGS.forEach(e => { e.p = Array.isArray(e[1]) ? terr.point(e[1][0], e[1][1], 0.06) : e[1]; });
hooks.push(t => {
  const op = win(t, 10.0, 458.5, 0.3); terr.set(op, 4 + 50 * ep(t, 10.3, 15), [0, 0]);
  TAGS.forEach(e => e[0].place(e.p, op * win(t, e[2], e[3], 0.6), e[4] || 0, e[5] || 0));
});
// hero words: kinetic type laid into the world
const KT = (o) => new KText({ cps: 20, ...o });
KT({ text: 'k → l+½ → j+½', t0: 81, t1: 98.5, font: 'mono', screen: { t: 82.5, x: 440, y: 880, planeY: -3.4, tilt: 0.5, px: 58 }, align: 'center' });
KT({ text: '1057 MHz', t0: 142.5, t1: 156, font: 'mono', screen: { x: 400, y: 900, planeY: -3.6, tilt: 0.5, px: 80 }, align: 'center' });
KT({ text: '10.2 eV', t0: 187.5, t1: 200, font: 'mono', screen: { x: 400, y: 900, planeY: -3.6, tilt: 0.5, px: 84 }, align: 'center' });
KT({ text: 'hν = gμ<sub>B</sub>B', html: true, t0: 258, t1: 272, font: 'mono', screen: { x: 420, y: 900, planeY: -3.6, tilt: 0.5, px: 70 }, align: 'center' });
KT({ text: '一个假设', t0: 301.5, t1: 317, screen: { x: 1380, y: 920, planeY: -3.4, tilt: 0.4, px: 110 }, align: 'center' });
KT({ text: '三个实验', t0: 331, t1: 346, screen: { x: 1560, y: 560, planeY: -2.0, tilt: 0.55, px: 80 }, align: 'center' });
KT({ text: '四个量子数', t0: 379, t1: 394, screen: { x: 1380, y: 890, planeY: -3.4, tilt: 0.4, px: 100 }, align: 'center' });
KT({ text: '五步进展', t0: 411, t1: 426, screen: { x: 1380, y: 860, planeY: -3.4, tilt: 0.4, px: 110 }, align: 'center' });
setStations([['五步进展', 11, 140], ['兰姆移位', 140, 186], ['双光子', 186, 210], ['磁共振', 210, 300], ['全章总结', 300, 458]]);
setChips([[11, 140, '4.6', '氢原子光谱的精细结构 · 五步进展'], [140, 186, '4.7', '兰姆移位'], [186, 210, '4.8', '双光子发射'], [210, 256, '4.9', '磁共振 · 物质的磁性'], [256, 300, '4.10–4.11', '电子顺磁共振 · 核磁共振'], [300, 458, '∑', '第四章 · 全章总结']]);

// ================================================================ hydrogen five steps (11-140)
const HD = new Levels(scene); HD.g.position.set(1.0, 0, 0);
{
  // schematic n=2,3 levels; three columns: Bohr | Dirac | Lamb
  const X = [-4.2, -1.0, 2.2], w = 2.0;
  HD.lvl('b3', X[0], X[0] + w, 2.0, 0xefe8dc, 'n = 3', 'l'); HD.lvl('b2', X[0], X[0] + w, -1.6, 0xefe8dc, 'n = 2', 'l');
  // Dirac: n=3: j=1/2 (3S1/2,3P1/2), j=3/2 (3P3/2,3D3/2), j=5/2 (3D5/2) ; n=2: j=1/2 (2S1/2,2P1/2), j=3/2 (2P3/2)
  [[2.6, '3D_{5/2}'], [2.25, '3P_{3/2},\\,3D_{3/2}'], [1.45, '3S_{1/2},\\,3P_{1/2}']].forEach(([y, s], i) => { HD.lvl('d3' + i, X[1], X[1] + w, y, i === 2 ? C.E : i === 1 ? C.S : 0xd9a88f, T`${s}`); HD.off('d3' + i, 70, 0); });
  [[-1.0, '2P_{3/2}'], [-2.2, '2S_{1/2},\\,2P_{1/2}']].forEach(([y, s], i) => { HD.lvl('d2' + i, X[1], X[1] + w, y, i ? C.E : C.S, T`${s}`); HD.off('d2' + i, 70, 0); });
  HD.link('l1', X[0] + w, 2.0, X[1], 2.6, 0x9a9184); HD.link('l2', X[0] + w, 2.0, X[1], 1.45, 0x9a9184); HD.link('l3', X[0] + w, -1.6, X[1], -1.0, 0x9a9184); HD.link('l4', X[0] + w, -1.6, X[1], -2.2, 0x9a9184);
  // Lamb: 2S1/2 above 2P1/2
  HD.lvl('lS', X[2] + 0.4, X[2] + w + 0.4, -1.95, C.J, T`2^2S_{1/2}`); HD.lvl('lP', X[2] + 0.4, X[2] + w + 0.4, -2.35, C.E, T`2^2P_{1/2}`);
  HD.link('ll1', X[1] + w + 1.4, -2.2, X[2] + 0.4, -1.95, 0x9a9184); HD.link('ll2', X[1] + w + 1.4, -2.2, X[2] + 0.4, -2.35, 0x9a9184);
  HD.tr('lamb', X[2] + w + 0.2, -2.35, -1.95, C.J); HD.text('lambT', X[2] + 1.4, -2.85, '1057 MHz', hex(C.J), 20);
  HD.text('h0', X[0] + w / 2, 3.3, '玻尔', '#d8d1c4', 24); HD.text('h1', X[1] + w / 2, 3.3, '索末菲 / 狄拉克', '#d8d1c4', 24); HD.text('h2', X[2] + w / 2 + 0.4, -0.6, '兰姆移位（放大）', hex(C.J), 22);
}
function updateHD(t) {
  const op = win(t, 12, 187, 1.4); if (op < 0.004) { HD.hideAll(); return; }
  const n3 = 1 - ep(t, 145, 148);
  ['b2'].forEach(k => HD.show(k, op * ep(t, 13, 15))); ['b3', 'h0'].forEach(k => HD.show(k, op * ep(t, 13, 15) * n3));
  const d = op * ep(t, 70, 73); ['d20', 'd21', 'l3', 'l4'].forEach(k => HD.show(k, d)); ['d30', 'd31', 'd32', 'l1', 'l2', 'h1'].forEach(k => HD.show(k, d * n3));
  const l = op * ep(t, 142, 145); ['lS', 'lP', 'll1', 'll2', 'lambT', 'h2'].forEach(k => HD.show(k, l)); HD.show('lamb', l, ep(t, 145, 147));
}
const step = (n, yr, who, html) => `<div style="display:flex;gap:16px;align-items:flex-start;margin:6px 0"><div class="yr" style="font-size:30px;color:#ffbf73;width:110px;font-weight:300">${yr}</div><div style="flex:1"><span class="k">${n}</span> ${who}<div>${html}</div></div></div>`;
deriv(13, POS.L + 'width:760px', { kicker: '4.6 · FOUR FORMULAS', title: '氢原子能级：一个公式的四次进化', size: 36, steps: [
  { tex: String.raw`T=[[a|\dfrac{R}{n^2}]]`, hold: 15, note: '<span class="k">① 1913 玻尔</span>：只考虑静电相互作用 ⇒ E_n = −hcR/n²<br><span class="s">成功解释巴尔末系；能量只与 n 有关</span>' },
  { tex: String.raw`T=[[a|\dfrac{R}{n^2}]]+[[b|\dfrac{R\alpha^2}{n^4}]]\left(\dfrac{n}{[[k|\cJ{k}]]}-\dfrac34\right)`, hold: 15, box: ['k'], note: '<span class="k">② 1916 索末菲</span>：椭圆轨道 + 相对论效应，k = 1, 2, …, n<br><span class="g">与当时的实验符合</span>' },
  { tex: String.raw`T=[[a|\dfrac{R}{n^2}]]+[[b|\dfrac{R\alpha^2}{n^4}]]\left(\dfrac{n}{[[k|\cL{l+\frac12}]]}-\dfrac34\right)`, hold: 14, box: ['k'], note: '<span class="k">③ 1926 海森堡</span>：严格量子力学 + 相对论效应<br><span class="r">与实验不符 —— 缺少电子自旋</span>' },
  { tex: String.raw`T=[[a|\dfrac{R}{n^2}]]+[[b|\dfrac{R\alpha^2}{n^4}]]\left(\dfrac{n}{[[k|\cS{j+\frac12}]]}-\dfrac34\right)`, hold: 18, box: ['k'], note: '<span class="k">④ 1928 狄拉克</span>：相对论量子力学，自然引入自旋 = R/n² + ΔT_r + ΔT_{l,s}<br><span class="g">与实验相符</span>；与索末菲公式一致（k ↔ j+½）' },
] });
card(100.5, 120, POS.L + 'width:640px', `${kick('A LUCKY COINCIDENCE')}<h3>“最值得庆贺的失败”</h3>索末菲理论与实验相符，纯属巧合<div data-at="4">（他引入的是“精细结构常数” α，却没有自旋）</div><div data-at="8">从狄拉克理论看：<span class="k">${T`T_n`} 只与 n、j 有关</span></div>`);
card(120.5, 140, POS.L + 'width:640px', `${kick('DEGENERACY')}<h3>相同 n、j 的能级简并</h3><div class="f2">${T`n=3,\ j=\tfrac12:\ \ 3^2S_{1/2},\ 3^2P_{1/2}\ \text{简并}`}</div><div class="f2" data-at="3">${T`n=3,\ j=\tfrac32:\ \ 3^2P_{3/2},\ 3^2D_{3/2}\ \text{简并}`}</div><div class="f2" data-at="6">${T`n=2,\ j=\tfrac12:\ \ 2^2S_{1/2},\ 2^2P_{1/2}\ \text{简并}`}</div><div class="s" data-at="10">真的完全简并吗？</div>`);
// ================================================================ Lamb shift (140-186)
const LB = { g: new THREE.Group() }; scene.add(LB.g);
{
  // schematic apparatus: dissociator -> electron bombarder -> magnet region with RF -> detector W
  const box = (x, w, c, lab) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.9, 0.9), phys(c, 0.2, { metalness: 0.5, roughness: 0.4 })); m.position.set(x, 0, 0); LB.g.add(m); return m; };
  box(-4.4, 1.0, 0x5a544c); box(-2.4, 0.6, 0xd9a88f); box(0.4, 2.6, 0x3a4650); box(3.6, 0.6, 0xbfe3cf);
  LB.beam = polyLine([V(-3.9, 0, 0), V(3.3, 0, 0)], C.J, 0.6, true, 0.1); LB.g.add(LB.beam);
  LB.rf = []; for (let i = 0; i < 6; i++) { const r = ringLine(0.3 + i * 0.12, 0xff6a1f, { dashed: false, op: 0.6 }); r.rotation.z = Math.PI / 2; r.position.set(0.4, 0, 0); LB.g.add(r); LB.rf.push(r); }
  LB.g.position.set(0.6, 1.4, 0);
}
LB.lab = [new Label('氢气分解器', '#d8d1c4', { size: 20 }), new Label('电子轰击 → 2S', '#f0d9cc', { size: 20 }), new Label('磁场 + 微波（共振）', '#d6e4ec', { size: 20 }), new Label('探测器 W', '#d9efe2', { size: 20 })];
function updateLB(t) {
  const op = win(t, 150, 187, 1.4); LB.g.visible = op > 0.004; if (!LB.g.visible) { LB.lab.forEach(l => l.place(V(), 0)); return; }
  setOp(LB.g, op); LB.rf.forEach((r, i) => { const s = 1 + ((t * 0.8 + i / 6) % 1) * 0.8; r.scale.set(1, s, s); });
  [-4.4, -2.4, 0.4, 3.6].forEach((x, i) => LB.lab[i].place(V(x + 0.6, 2.2, 0), op, 0, -6));
}
card(141, 160, POS.L + 'width:640px', `${kick('4.7 · LAMB SHIFT · 1947')}<h3>兰姆移位</h3>兰姆（W. Lamb）实验观察到：氢原子的 ${T`2^2S_{1/2}`} 与 ${T`2^2P_{1/2}`} <span class="k">发生分裂</span><div class="big" data-at="5" style="font-size:34px">1057 MHz（4.37 μeV）</div><div class="s" data-at="9">${T`2^2S_{1/2}`} 略高于 ${T`2^2P_{1/2}`}</div>`);
card(160.5, 186, POS.L + 'width:640px', `${kick('WHY')}<h3>原因：原子与辐射场的相互作用</h3>兰姆移位很小，约为自旋-轨道耦合的 1/10<div data-at="5">对 j ≠ ½ 的能级，兰姆移位几乎可以忽略</div><div data-at="9"><span class="k">量子电动力学（QED）</span>给出了精确解释</div><div class="s" data-at="13">与电子反常磁矩 g<sub>s</sub> = 2.0023 一样，是 QED 的标志性检验</div>`);
// ================================================================ two-photon (186-210)
const TP = new Levels(scene); TP.g.position.set(1.4, 0, 0);
TP.lvl('2S', -3.0, -0.6, 1.6, C.J, T`2S_{1/2}`, 'l'); TP.lvl('2P32', 0.6, 3.0, 2.3, C.S, T`2P_{3/2}`); TP.lvl('2P12', 0.6, 3.0, 1.75, C.E, T`2P_{1/2}`); TP.lvl('1S', -3.0, 3.0, -2.4, 0xefe8dc, T`1S_{1/2}`);
TP.line('virt', [[-3.0, -0.3], [-0.6, -0.3]], 0x9a9184, 0.5);
TP.tr('h1', -2.2, 1.6, -0.3, C.J, T`h\nu_1`); TP.tr('h2', -1.4, -0.3, -2.4, C.J, T`h\nu_2`); TP.trd('ly', 1.6, 1.75, 1.2, -2.4, C.E, '莱曼 α'); TP.text('e', -3.6, -0.4, '10.2 eV', '#9a9184', 18); TP.off('ly', 90, 0).off('h1', -40, 0).off('h2', -40, 0);
function updateTP(t) { const op = win(t, 187, 211, 1.2); if (op < 0.004) { TP.hideAll(); return; } ['2S', '2P32', '2P12', '1S', 'virt', 'e'].forEach(k => TP.show(k, op)); TP.show('ly', op, ep(t, 190, 192)); TP.show('h1', op, ep(t, 196, 197.5)); TP.show('h2', op, ep(t, 197.5, 199)); }
card(187, 210, POS.L + 'width:600px', `${kick('4.8 · TWO-PHOTON EMISSION')}<h3>双光子发射</h3>2P 态可以发射一个光子（莱曼 α，121.6 nm）回到基态<div data-at="5">而 ${T`2S_{1/2}\to1S_{1/2}`}：Δl = 0，单光子跃迁被禁戒 ⇒ 2S 是<span class="k">亚稳态</span></div><div data-at="10">它只能同时放出<span class="k">两个光子</span>：${T`h\nu_1+h\nu_2=10.2\ \mathrm{eV}`}</div><div class="s" data-at="14">两光子的能量可连续分配，形成连续谱</div>`);

// ================================================================ magnetism (210-256) + EPR/NMR (256-300)
const MG = { g: new THREE.Group() }; scene.add(MG.g);
MG.cols = [];
for (let c = 0; c < 3; c++) {
  const g = new THREE.Group(); g.position.set(-3.2 + c * 3.2, 0, 0); MG.g.add(g); const arrs = [];
  for (let i = 0; i < 9; i++) { const a = new Arrow([C.E, C.S, C.J][c], { r: 0.03, hr: 0.08, hl: 0.22, parent: g }); arrs.push({ a, p: V((i % 3 - 1) * 0.8, (Math.floor(i / 3) - 1) * 0.8, 0), seed: i * 1.7 + c }); }
  MG.cols.push({ g, arrs, c });
}
MG.Bx = new Arrow(C.B, { r: 0.025, hr: 0.08, hl: 0.24, parent: MG.g });
MG.lab = [new Label('抗磁性', hex(C.E)), new Label('顺磁性', hex(C.S)), new Label('铁磁性', hex(C.J)), new Label(T`\vec B`, hex(C.B), { bare: true, size: 30 })];
function updateMG(t) {
  const op = win(t, 211, 257, 1.4); MG.g.visible = op > 0.004; if (!MG.g.visible) { MG.lab.forEach(l => l.place(V(), 0)); return; }
  const Bon = ep(t, 224, 227);
  MG.Bx.set(V(-5.4, -1.6, 0), V(0, 3.2 * Bon, 0), op * Bon);
  for (const col of MG.cols) for (const it of col.arrs) {
    let d;
    if (col.c === 0) d = V(0, -0.5 * Bon, 0); // diamagnetic: induced opposite
    else if (col.c === 1) { const a = it.seed * 2.3 + t * 0.6 * (1 - Bon); const rnd = V(Math.cos(a), Math.sin(a * 1.3), 0).normalize(); d = rnd.lerp(V(0, 1, 0), Bon * 0.8).normalize().multiplyScalar(0.55); }
    else { const dom = it.p.x < 0 ? V(0.7, 0.7, 0) : V(-0.6, 0.8, 0); d = dom.normalize().lerp(V(0, 1, 0), Bon).normalize().multiplyScalar(0.55); }
    it.a.set(it.p.clone().sub(d.clone().multiplyScalar(0.5)), d, op * (col.c === 0 ? Bon : 1));
  }
  MG.lab.forEach((l, i) => i < 3 ? l.place(V(-3.2 + i * 3.2, 1.5, 0), op, 0, -10) : l.place(V(-5.4, 1.7, 0), op * Bon, 0, -10));
}
card(212, 224, POS.TC + 'width:760px;text-align:center', `${kick('4.9 · MAGNETISM OF MATTER')}<h3>物质的磁性</h3>抗磁性、顺磁性、铁磁性<div data-at="4">固有磁矩：电子轨道磁矩、电子自旋磁矩、核磁矩</div>`);
card(224.5, 256, POS.BC + 'width:1500px', `<div style="display:flex;gap:30px"><div style="flex:1" data-at="0"><span class="c" style="color:#a9c8dc;font-size:28px">抗磁性</span><div class="s" style="font-size:21px">诱导磁矩与外磁场方向相反；内部磁矩相互抵消。普遍存在，起因是楞次定律</div></div>
<div style="flex:1" data-at="6"><span class="m" style="font-size:28px">顺磁性</span><div class="s" style="font-size:21px">诱导磁矩与外场同向；主要来自<span class="m">未成对电子的自旋磁矩</span>（自旋无法两两抵消）。抗磁性仍存在，但被掩盖</div></div>
<div style="flex:1" data-at="12"><span class="k" style="font-size:28px">铁磁性</span><div class="s" style="font-size:21px">固有磁矩之间有交换耦合，无外场时形成<span class="k">磁畴</span>结构</div></div></div>`);
// EPR / NMR
const RS = new Levels(scene); RS.g.position.set(2.2, 0.4, 0);
RS.lvl('0', -3.2, -1.6, 0, 0xefe8dc, T`B=0`, 'l'); RS.link('a', -1.6, 0, -0.6, 0.9, 0x9a9184); RS.link('b', -1.6, 0, -0.6, -0.9, 0x9a9184);
RS.line('up', [[-0.6, 0.9], [2.6, 2.1]], C.S, 0.95); RS.line('dn', [[-0.6, -0.9], [2.6, -2.1]], C.E, 0.95);
RS.tr('res', 1.6, -1.72, 1.72, 0xff6a1f, T`h\nu=g\mu_BB`); RS.text('B', 2.9, -2.6, T`B\ \rightarrow`, '#9a9184', 22); RS.off('res', 70, 0);
function updateRS(t) { const op = win(t, 257, 301, 1.2); if (op < 0.004) { RS.hideAll(); return; } ['0', 'a', 'b', 'up', 'dn', 'B'].forEach(k => RS.show(k, op)); RS.show('res', op, ep(t, 262, 264)); }
const band = `<svg width="760" height="120" viewBox="0 0 760 120">${[['紫外/可见', '电子能级跃迁', '#d9a88f'], ['红外', '分子振动', '#ff5a6e'], ['微波', '转动 · 电子顺磁共振', '#ffbf73'], ['射频', '核磁共振', '#e9e1d2']].map(([a, b, c], i) => `<rect x="${10 + i * 187}" y="20" width="180" height="40" rx="8" fill="${c}" opacity=".22" stroke="${c}"/><text x="${100 + i * 187}" y="46" fill="#fff" font-size="18" text-anchor="middle">${a}</text><text x="${100 + i * 187}" y="86" fill="#9a9184" font-size="16" text-anchor="middle">${b}</text>`).join('')}<text x="10" y="112" fill="#5a544c" font-size="14">频率 10¹⁶ Hz</text><text x="750" y="112" fill="#5a544c" font-size="14" text-anchor="end">10⁶ Hz</text></svg>`;
card(257.5, 278, POS.L + 'width:640px', `${kick('4.10 · EPR / ESR')}<h3>电子顺磁共振</h3>又称电子自旋共振：含<span class="m">未成对电子</span>的物质置于外磁场中，因电子自旋磁矩与磁场作用产生塞曼分裂<div data-at="6">用频率满足 ${T`h\nu=g\mu_BB`} 的微波照射 ⇒ 共振吸收</div><div class="s" data-at="10">检测未成对电子的唯一方法，应用广泛</div>`);
card(278.5, 300, POS.L + 'width:800px', `${kick('4.11 · NMR')}<h3>核磁共振</h3>原子核自旋磁矩与外磁场作用产生塞曼能级分裂（射频波段）<div class="s" data-at="4">在化学、医学（MRI）、物理学、材料科学等领域应用广泛</div><div data-at="8">${band}</div>`);

// ================================================================ CHAPTER SUMMARY (300-458): full vector model returns
const vm = new VectorModel(scene, { U: 1.25, R: 2.3, nuc: 1.2 }); vm.setState(1, 0.5, 1.5, 1.5);
const fieldM = new Field([-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2], [-2.8, -1.4, 0, 1.4, 2.8], -3.8, 4.0, C.B, 1.0);
const VML = { L: new Label(T`\vec L`, hex(C.L), { bare: true, size: 30 }), S: new Label(T`\vec S` + ' 自旋（一个假设）', hex(C.S)), J: new Label(T`\vec J`, hex(C.J), { bare: true, size: 30 }), mu: new Label(T`\vec\mu`, hex(C.MU), { bare: true, size: 30 }), B: new Label(T`\vec B`, hex(C.B), { bare: true, size: 32 }) };
function updateVM(t) {
  const op = win(t, 300, 470, 2); fieldM.update(t, op * ep(t, 330, 334) * 0.9);
  if (op < 0.004) { vm.g.visible = false; Object.values(VML).forEach(l => l.place(V(), 0)); return; }
  const r = vm.draw({ all: 1, nuc: op, orbit: op, L: op, S: op, eS: op, J: op, coneL: op, mu: op, coneJ: op * ep(t, 330, 334) }, { phi: t * 0.35, psi: t * 1.2, eAng: t * 2.3 }, 0.55);
  vm.nuc.rotation.y = t * 0.3;
  VML.L.place(r.L.clone().multiplyScalar(0.6), op, -26, 0); VML.S.place(r.L.clone().add(r.S.clone().multiplyScalar(0.6)), op * win(t, 302, 330), 110, 0);
  VML.J.place(r.J.clone().multiplyScalar(1.1), op, 0, -20); VML.mu.place(r.mu.clone().multiplyScalar(1.1), op, 0, 24); VML.B.place(V(4.2, 2.4, 0), op * ep(t, 330, 334), 30, 0);
}
card(301, 330, POS.L + 'width:620px', `${kick('SUMMARY · 1 HYPOTHESIS')}<h3>一个假设：电子自旋</h3><div class="f2">${T`s=\tfrac12,\quad S_z=\pm\tfrac{\hbar}{2},\quad g_s=2`}</div><div data-at="5">轨道角动量 L 与自旋 S 耦合成 J，磁矩 μ 不沿 J，只有 ${T`\mu_j`} 起作用</div><div class="f2" data-at="10">${T`g_j=\tfrac32+\tfrac12\cdot\dfrac{\hat s^2-\hat l^2}{\hat j^2}`}</div><div class="s" data-at="15">它统一解释了下面三个实验</div>`);
card(330.5, 378, 'left:110px;bottom:46px;width:1700px;padding:22px 30px', chainHTML(-1));
card(331, 378, POS.TC + 'width:900px;text-align:center', `${kick('SUMMARY · 3 EXPERIMENTS')}<h3>三个实验 —— 同一个 ${T`U=-\vec\mu\cdot\vec B`}</h3><div data-at="6"><span class="m">施特恩-盖拉赫</span>：非均匀外场 ⇒ 受力 ⇒ 空间量子化 + 自旋（两条）</div><div data-at="14"><span class="k">碱金属双线</span>：原子内部磁场 ⇒ 自旋-轨道耦合 ⇒ j = l ± ½</div><div data-at="22"><span class="b">塞曼效应</span>：均匀外场 ⇒ ${T`m_jg_j\mu_BB`} ⇒ 谱线分裂与偏振</div>`);
card(378.5, 410, POS.L + 'width:640px', `${kick('SUMMARY · 4 QUANTUM NUMBERS')}<h3>四个量子数（单电子）</h3><table class="tbl" style="font-size:24px"><tr><th>量子数</th><th>决定</th><th>取值</th></tr>
<tr data-at="2"><td>${T`n`}</td><td>主要能量</td><td>1, 2, 3, …</td></tr><tr data-at="5"><td>${T`l`}</td><td>轨道角动量 ${T`\sqrt{l(l+1)}\hbar`}</td><td>0, 1, …, n−1</td></tr>
<tr data-at="8"><td>${T`j`}</td><td>总角动量 ${T`\sqrt{j(j+1)}\hbar`}</td><td>${T`l\pm\frac12`}</td></tr><tr data-at="11"><td>${T`m_j`}</td><td>J 在 z 方向投影 ${T`m_j\hbar`}</td><td>${T`-j,\dots,+j`}</td></tr></table>
<div class="s" data-at="15">（若不考虑耦合，也可用 ${T`n,\ l,\ m_l,\ m_s`} 描述）原子态：${T`n\,{}^{2s+1}L_j`}</div>`);
card(410.5, 440, POS.L + 'width:680px', `${kick('SUMMARY · 5 STEPS OF HYDROGEN')}<h3>氢原子光谱的五步进展</h3><ol style="font-size:24px">
<li data-at="1">玻尔（1913）：${T`E_n\propto1/n^2`}</li><li data-at="3">索末菲（1916）：椭圆轨道 + 相对论</li><li data-at="5">海森堡（1926）：量子力学，不含自旋 —— 不符</li><li data-at="7">狄拉克（1928）：相对论量子力学 + 自旋，只与 n、j 有关</li><li data-at="9">兰姆（1947）：2S₁/₂ 与 2P₁/₂ 分裂 —— QED</li></ol>`);
card(440.5, 458, POS.TC + 'width:860px;text-align:center', `${kick('CHAPTER 4')}<h3>原子的精细结构</h3><div class="big" style="font-size:34px">一个假设 · 三个实验 · 四个量子数 · 五步进展</div><div class="s" data-at="5">课后作业：4-2，4-3，4-5，4-8，4-10，4-12，4-13，4-14</div>`);

// ================================================================ camera
const shots = [
  { t0: 0, fn: fixedShot([0, 0, 15], [0, 0, 0]) },
  // 4.6 five steps: graze the floor, rise to the level ladder; slow drift with small roll (level diagram)
  { t0: 10, b: 0.5, fn: pathShot([{ u: 0, p: [8.0, -0.4, 10.0], l: [0, -7.0, 0], roll: -18, fov: 46, s: 200 }, { u: 3.4, p: [4.5, 1.0, 15.2], l: [0.8, 0.0, 0], roll: -5, fov: 40, s: 400 }, { u: 36, p: [1.5, 1.0, 15.6], l: [0.8, 0.2, 0], roll: -2, fov: 38, s: 400 }, { u: 68, p: [-1.0, 1.1, 15.6], l: [0.8, 0.2, 0], roll: 2, fov: 38, s: 400 }]) },
  { t0: 79.5, b: 2.2, whip: true, fn: pathShot([{ u: 0, p: [5.0, 0.2, 14.6], l: [1.0, -0.2, 0], roll: -7, fov: 40, s: 400 }, { u: 3.5, p: [2.8, 0.9, 15.4], l: [0.9, 0.1, 0], roll: -3, fov: 38, s: 400 }, { u: 20, p: [2.2, 1.0, 15.5], l: [0.9, 0.15, 0], roll: -2, fov: 38, s: 400 }, { u: 60, p: [-0.5, 1.1, 15.6], l: [0.9, 0.2, 0], roll: 2, fov: 38, s: 400 }]) },
  // 4.7 Lamb shift
  { t0: 139.8, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [6.0, 0.0, 16.0], l: [1.5, -0.3, 0], roll: -8, fov: 42, s: 400 }, { u: 2.5, p: [3.6, 0.9, 17.2], l: [1.4, 0.0, 0], roll: -4, fov: 40, s: 400 }, { u: 17, p: [2.8, 1.1, 17.4], l: [1.4, 0.05, 0], roll: -2, fov: 40, s: 400 }, { u: 46, p: [0.0, 1.5, 17.6], l: [1.4, 0.1, 0], roll: 2, fov: 40, s: 400 }]) },
  // 4.8 two-photon
  { t0: 185.8, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [-3.5, 0.2, 13.4], l: [1.3, 0.0, 0], roll: 4, fov: 40, s: 340 }, { u: 24, p: [2.6, 1.0, 14.0], l: [1.3, 0.1, 0], roll: -2, fov: 38, s: 340 }]) },
  // 4.9 magnetism of matter (TC card + BC card → subject in the middle band)
  { t0: 210.2, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [4.5, 0.2, 13.2], l: [0, 1.0, 0], roll: -9, fov: 42 }, { u: 3, p: [3.6, 0.5, 13.6], l: [0, 1.0, 0], roll: -6, fov: 41 }, { u: 14, p: [1.9, 0.6, 13.6], l: [0, 0.6, 0], roll: -3, fov: 40.5 }, { u: 46, p: [-3.0, 1.0, 13.6], l: [0, 0.7, 0], roll: 5, fov: 40 }]) },
  // 4.10–4.11 EPR / NMR
  { t0: 256.3, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [6.0, 0.2, 13.0], l: [2.0, 0.2, 0], roll: -9, fov: 42, s: 360 }, { u: 2.5, p: [4.2, 0.8, 13.6], l: [2.0, 0.3, 0], roll: -4, fov: 40, s: 360 }, { u: 16, p: [3.4, 1.0, 13.8], l: [2.0, 0.3, 0], roll: -2, fov: 40, s: 360 }, { u: 44, p: [0.5, 1.4, 14.0], l: [2.0, 0.3, 0], roll: 3, fov: 40, s: 360 }]) },
  // SUMMARY: the vector-model atom floats back over the landscape
  { t0: 299.8, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [8.6, -0.2, 10.2], l: [0, -0.6, 0], roll: -14, fov: 42, s: 300 }, { u: 2.5, p: [7.6, 0.5, 10.0], l: [0, -0.2, 0], roll: -11, fov: 41, s: 300 }, { u: 30, p: [4.5, 1.9, 10.6], l: [0, 0.0, 0], roll: -4, fov: 40, s: 300 }]) },
  { t0: 329.0, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [3.4, 4.6, 19.6], l: [0, 0.9, -1], roll: -7, fov: 42 }, { u: 49, p: [-2.8, 4.0, 19.6], l: [0, 0.9, -1], roll: 4, fov: 40 }]) },
  { t0: 377.3, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [-8.5, 0.6, 9.5], l: [0, -0.5, 0], roll: 10, fov: 42, s: 330 }, { u: 3, p: [-7.6, 1.0, 10.2], l: [0, -0.5, 0], roll: 8, fov: 41, s: 330 }, { u: 32, p: [-3.0, 2.6, 11.8], l: [0, -0.4, 0], roll: 3, fov: 40, s: 330 }]) },
  { t0: 409.3, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [9.8, 0.4, 8.6], l: [0, -0.5, 0], roll: -12, fov: 42, s: 330 }, { u: 3, p: [9.0, 0.9, 9.2], l: [0, -0.5, 0], roll: -10, fov: 41, s: 330 }, { u: 30, p: [4.8, 3.0, 11.4], l: [0, -0.4, 0], roll: -4, fov: 40, s: 330 }]) },
  { t0: 439.3, b: 1.8, whip: true, fn: pathShot([{ u: 0, p: [10, 0.8, 9.0], l: [0, 1.75, 0], roll: -10, fov: 44 }, { u: 18, p: [6.8, 1.8, 11.0], l: [0, 1.95, 0], roll: -4, fov: 42 }]) },
  { t0: 457.6, b: 1.4, whip: true, fn: END.cam },
];
run({ duration: DUR, shots, update(t) { updateHD(t); updateLB(t); updateTP(t); updateMG(t); updateRS(t); updateVM(t); } });
