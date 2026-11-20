// EP5 — 4.5 塞曼效应
import {
  THREE, T, V, UP, C, hex, ep, win, rampInt, clamp, rng, scene, camera, setOp, phys, glow, fresnel, Arrow, Cone, ringLine, polyLine,
  nucleus, electron, Label, card, overlay, POS, kick, chainHTML, setStations, setChips, svgSpectrum, Levels, bar, VectorModel, Field,
  orbitShot, fixedShot, run
, deriv } from './engine.js';
import { ContourTerrain, wellField, GridFunnel, KText, tag, ctag, dust, titleSequence, endSequence } from './noir.js';
import { pathShot, setFog, hooks } from './engine.js';

const DUR = 472;
titleSequence({ epn: '05', main: '塞曼效应', sub: '第 5 集 · 4.5 磁场中的谱线分裂 · 偏振 · 帕邢-巴克', ring: 'ZEEMAN EFFECT · 1896 · Δm = 0, ±1 · ', tags: ['643.847 nm', 'νL 14 GHz/T', 'μB 9.274e-24 J/T'] });
window.NO_END_FALLBACK = true;
const END = endSequence({ t0: 463, t1: 472, text: '第 5 集 · 完', next: 'NEXT ▸ 氢原子精细结构 · 兰姆移位 · 磁共振' });
setFog(16, 62);
dust(700, 60, 0.3);

// ---------------------------------------------------------------- world floor A: a landscape whose single well splits into a Zeeman triplet (three wells)
const WF = wellField({ depth: 2.0, a: 3.6, noise: 0.5, nscale: 0.1, wells: [{ x: -3.4, z: -5.5, d: 1.7, a: 1.2 }, { x: 0, z: -5.5, d: 1.7, a: 1.2 }, { x: 3.4, z: -5.5, d: 1.7, a: 1.2 }] });
const terr = new ContourTerrain({ f: WF, size: 56, res: 230, step: 0.075, y0: -4.7, indexEvery: 5, hotLevels: [WF(0, -5.5 + 1.5)], hotWidth: 0.55, fadeNear: 14, fadeFar: 60 });
const tTags = [
  [ctag('Faraday 1862 · ✗', 18), -5.0, -12.0, 45, 60],
  [tag('Zeeman 1896'), 1.0, -10.0, 45, 76],
  [ctag('Lorentz · e/m', 18), 4.5, -8.5, 46, 76],
  [tag('643.847 nm'), 3.0, -8.5, 78, 126],
  [tag('ν_L = eB/4πm_e'), 4.5, -8.5, 150, 170],
  [ctag('0.467 cm⁻¹/T', 18), 0.0, -9.0, 158, 170],
  [ctag('Na 589.6 / 589.0 nm', 18), 3.5, -8.5, 251, 266],
  [tag('D₁ 4 条'), -1.0, -9.5, 292, 330],
  [tag('D₂ 6 条'), 2.0, -9.5, 302, 330],
  [ctag('g = 4/3 · 2/3 · 2', 18), 4.3, -9.5, 272, 301],
  [ctag('弱场 μB·B ≪ ΔE_LS', 18), 0.0, -8.5, 387, 440],
  [ctag('强场 μB·B ≫ ΔE_LS', 18), 4.5, -9.5, 392, 440],
].map(([L, x, z, a, b]) => ({ L, p: terr.point(x, z, 0.06), a, b }));
// ---------------------------------------------------------------- world floor B: warped grid funnel under the Paschen–Back vector model (strong field)
const fun = new GridFunnel({ R: 21, depth: 5.0, a: 1.5, r0: 1.05, streaks: 420, fadeNear: 12, fadeFar: 58 });
fun.g.position.y = -4.4; fun.g.updateMatrixWorld(true);
const fTags = [
  [ctag('1912 · Paschen–Back', 18), 10.44, -1.862, 334, 362],
  [tag('ML + 2MS'), 9.0, 5.3, 361, 380],
  [ctag('ΔMS = 0', 18), 8.0, 4.4, 366, 380],
].map(([L, r, th, a, b]) => ({ L, p: fun.point(r, th, 0.06), a, b }));
hooks.push(t => {
  const opA = Math.max(win(t, 10.0, 330, 0.5), win(t, 379, 463.5, 1.0));
  terr.set(opA, t < 300 ? 4 + 46 * ep(t, 10.3, 15.5) : 4 + 46 * ep(t, 379.5, 384), [0, 0]);
  tTags.forEach(e => e.L.place(e.p, opA * win(t, e.a, e.b, 0.6)));
  const opB = win(t, 329, 381, 1.0);
  fun.set(t, opB, { swirl: opB, ringI: opB * (0.75 + 0.25 * Math.sin(t * 1.3)) });
  fTags.forEach(e => e.L.place(e.p, opB * win(t, e.a, e.b, 0.6)));
});
// ---------------------------------------------------------------- hero words (kinetic type laid into the world)
const KT = (o) => new KText({ cps: 18, ...o });
KT({ text: '谱线分裂', t0: 14.5, t1: 29.4, screen: { x: 1180, y: 560, planeY: -3.4, tilt: 0.45, px: 100 }, align: 'center' });
KT({ text: '1896', t0: 31.4, t1: 44.6, font: 'mono', screen: { x: 1500, y: 900, planeY: -3.4, tilt: 0.45, px: 110 }, align: 'center' });
KT({ text: 'Δm = 0, ±1', t0: 136.4, t1: 146.0, font: 'mono', screen: { x: 1480, y: 140, planeY: 2.6, tilt: 0.9, px: 64 }, align: 'center' });
KT({ text: '14 GHz / T', t0: 163.0, t1: 170.0, font: 'mono', screen: { x: 1480, y: 140, planeY: 2.6, tilt: 0.9, px: 72 }, align: 'center' });
KT({ text: 'σ / π', t0: 222.6, t1: 235.6, font: 'mono', screen: { x: 470, y: 900, planeY: -3.4, tilt: 0.45, px: 100 }, align: 'center' });
KT({ text: '反常', t0: 237.6, t1: 249.6, screen: { x: 1300, y: 640, planeY: -3.6, tilt: 0.4, px: 150 }, align: 'center' });
KT({ text: 'M<sub>L</sub> + 2M<sub>S</sub>', html: true, t0: 360.4, t1: 372.0, font: 'mono', screen: { x: 1440, y: 140, planeY: 0, tilt: 0.9, px: 66 }, align: 'center' });
setStations([['定位', 11, 30], ['历史', 30, 76], ['正常塞曼', 76, 170], ['偏振', 170, 236], ['反常塞曼', 236, 330], ['帕邢-巴克', 330, 380], ['小结', 380, 463]]);
setChips([[11, 30, '4.5', '本集在主线中的位置'], [30, 76, '4.5.1', '塞曼效应简介'], [76, 170, '4.5.2', '正常塞曼效应'], [170, 236, '4.5.4', '塞曼谱线的偏振特性'], [236, 330, '4.5.3', '反常塞曼效应'], [330, 380, '4.5.5', '帕邢-巴克效应'], [380, 440, '4.5', '小结：无场 · 弱场 · 强场'], [440, 463, '✓', '本集小结']]);

card(12, 30, 'left:110px;bottom:84px;width:1700px;padding:22px 30px', chainHTML(2), { flat: true, world: 0 });
card(13, 30, POS.TC + 'width:1100px;text-align:center', `${kick('WHERE WE ARE')}<h3>均匀外磁场：不偏转，但有能量</h3><div data-at="3">${T`U=-\vec\mu\cdot\vec B`} 随磁矩取向不同而不同</div><div data-at="7">⇒ 每个能级分裂成若干子能级 ⇒ <span class="b">谱线分裂</span></div>`);

// ================================================================ history (30-76): light source in magnet + spectrum
const HS = { g: new THREE.Group() }; scene.add(HS.g);
{
  const pole = (x, c, e) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.6, 48), phys(c, 0.15, { metalness: 0.7, roughness: 0.35 })); m.rotation.z = Math.PI / 2; m.position.set(x, 0, 0); HS.g.add(m); };
  pole(-2.0, 0x5c2a1c); pole(2.0, 0x3a4650);
  HS.src = glow(0xffbf73, 1.6); HS.g.add(HS.src); HS.core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), phys(0xffbf73, 1)); HS.g.add(HS.core);
  HS.fl = []; for (let k = -2; k <= 2; k++) { const l = polyLine([V(-1.2, k * 0.25, 0), V(1.2, k * 0.25, 0)], C.B, 0.45); HS.g.add(l); HS.fl.push(l); }
  HS.rayPar = new Arrow(0xffd59a, { r: 0.02, hr: 0.06, hl: 0.2, parent: HS.g }); HS.rayPerp = new Arrow(0xffd59a, { r: 0.02, hr: 0.06, hl: 0.2, parent: HS.g });
}
HS.lab = { B: new Label(T`\vec B`, hex(C.B), { bare: true, size: 32 }), src: new Label('光源（钠火焰 / 镉灯）', '#ffd59a'), par: new Label('沿磁场方向观察', '#ffd59a', { size: 21 }), perp: new Label('垂直磁场方向观察', '#ffd59a', { size: 21 }) };
function updateHS(t) {
  const op = win(t, 30, 105, 1.5); HS.g.visible = op > 0.004; if (!HS.g.visible) { Object.values(HS.lab).forEach(l => l.place(V(), 0)); return; }
  setOp(HS.g, op); HS.src.material.opacity = 0.45 * op * (0.85 + 0.15 * Math.sin(t * 4));
  HS.rayPar.set(V(2.9, 0, 0), V(1.8, 0, 0), op * win(t, 40, 105)); HS.rayPerp.set(V(0, 0, 0.4), V(0, 0, 2.6), op * win(t, 40, 105));
  HS.lab.B.place(V(0, 0.7, 0), op, 0, -10); HS.lab.src.place(V(0, -0.5, 0), op * win(t, 31, 50), 0, 20);
  HS.lab.par.place(V(4.8, 0, 0), op * win(t, 41, 77), 0, -26); HS.lab.perp.place(V(0, 0, 3.2), op * win(t, 41, 77), 0, 26);
}
card(31, 45, POS.L + 'width:600px', `${kick('4.5.1 · 1896')}<h3>塞曼的发现</h3>塞曼重做法拉第 1862 年未成功的实验：观察磁场中钠原子光谱<div data-at="5">发现钠的 D₁、D₂ 线都<span class="k">变宽</span>了</div><div class="s" data-at="9">（磁场不够强，没能分辨出钠的分裂）</div>`);
card(45.5, 60, POS.L + 'width:600px', `${kick('LORENTZ · CLASSICAL THEORY')}<h3>洛伦兹的经典电子论预言</h3><div><span class="k">平行</span>磁场方向观察：2 条圆偏振线</div><div data-at="3"><span class="k">垂直</span>磁场方向观察：3 条线偏振线</div><div data-at="7">塞曼在<span class="k">镉</span>光谱中看到了这一结果 ⇒ 似乎证实了洛伦兹理论</div>`);
card(60.5, 76, POS.L + 'width:620px', `${kick('NORMAL vs ANOMALOUS')}<h3>但并非所有谱线都分裂为 3 条</h3>垂直磁场观察：钠 D₁ 分裂成 <span class="k">4</span> 条，D₂ 分裂成 <span class="k">6</span> 条<div data-at="5">三条等间距：<span class="c">正常塞曼效应</span>；其余：<span class="m">反常塞曼效应</span></div><div class="s" data-at="9">量子力学：正常 = 单重项（总自旋 S = 0）之间的跃迁；反常 = 多重项（S ≠ 0）之间的跃迁，前者是后者的特例。1912 年帕邢、巴克发现：强磁场中反常分裂变回三条（帕邢-巴克效应）</div>`);

// ================================================================ normal Zeeman Cd (76-170)
const NZ = new Levels(scene); NZ.g.position.set(0.6, 0, 0);
{
  // 1D2 (5 sublevels) upper, 1P1 (3 sublevels) lower
  NZ.lvl('UB', -3.6, -2.0, 1.8, 0xefe8dc, T`5^1D_2`, 'l'); NZ.lvl('LB', -3.6, -2.0, -2.0, 0xefe8dc, T`5^1P_1`, 'l');
  const du = 0.36, dl = 0.36;
  for (let m = 2; m >= -2; m--) { NZ.link('ul' + m, -2.0, 1.8, -1.3, 1.8 + m * du); NZ.lvl('U' + m, -1.3, 3.4, 1.8 + m * du, m > 0 ? C.S : m < 0 ? C.E : 0xefe8dc, T`M=${m > 0 ? '+' + m : m}`); NZ.off('U' + m, 40, 0); }
  for (let m = 1; m >= -1; m--) { NZ.link('ll' + m, -2.0, -2.0, -1.3, -2.0 + m * dl); NZ.lvl('L' + m, -1.3, 3.4, -2.0 + m * dl, m > 0 ? C.S : m < 0 ? C.E : 0xefe8dc, T`M=${m > 0 ? '+' + m : m}`); }
  // 9 transitions
  let k = 0; const xs = [];
  for (let m1 = 1; m1 >= -1; m1--) for (const dm of [1, 0, -1]) { const m2 = m1 + dm; if (Math.abs(m2) > 2) continue; xs.push([m2, m1, dm]); }
  xs.sort((a, b) => a[2] - b[2] || b[1] - a[1]);
  xs.forEach(([m2, m1, dm], i) => { NZ.tr('t' + i, -1.0 + i * 0.42, 1.8 + m2 * du, -2.0 + m1 * dl, dm === 0 ? 0xffbf73 : dm > 0 ? C.S : C.E); });
  NZ.tr('t0f', -2.8, 1.8, -2.0, 0xffbf73, '643.847 nm'); NZ.off('t0f', -60, 0);
}
function updateNZ(t) {
  const op = win(t, 104, 171, 1.4); if (op < 0.004) { NZ.hideAll(); return; }
  const fieldOn = ep(t, 116, 118);
  NZ.show('UB', op); NZ.show('LB', op); NZ.show('t0f', op * (1 - fieldOn), 1);
  for (let m = -2; m <= 2; m++) { NZ.show('U' + m, op * fieldOn); NZ.show('ul' + m, op * fieldOn); }
  for (let m = -1; m <= 1; m++) { NZ.show('L' + m, op * fieldOn); NZ.show('ll' + m, op * fieldOn); }
  for (let i = 0; i < 9; i++) NZ.show('t' + i, op * ep(t, 126, 127), ep(t, 126 + i * 0.5, 127.5 + i * 0.5));
}
// spectrum overlay & cd lamp cards
card(77, 90, POS.L + 'width:620px', `${kick('4.5.2 · NORMAL ZEEMAN (Cd)')}<h3>把镉光源放进磁场</h3>每一条谱线都<span class="k">分裂成三条</span>，彼此间隔相等
<div data-at="4" style="margin-top:10px">无 B ${svgSpectrum([{ x: 0, c: '#e0503a', w: 6 }], 420, 46)}</div><div data-at="7">⊥B 观察 ${svgSpectrum([{ x: -0.4, c: '#e0503a', w: 6 }, { x: 0, c: '#e0503a', w: 6 }, { x: 0.4, c: '#e0503a', w: 6 }], 420, 46)}</div><div class="s" data-at="10">特征：三分裂、等间隔、中间位置不变</div>`);
card(90.5, 104, POS.L + 'width:620px', `${kick('EXPLANATION')}<h3>能级在磁场中的分裂</h3>原子磁矩 μ 在沿 z 方向的磁场 B 中具有势能<div class="f" data-at="3">${T`U=-\vec\mu\cdot\vec B=-\mu_zB=m\,g\,\mu_BB`}</div><div class="s" data-at="7">主要假设：总自旋 S = 0（单重态），只有轨道磁矩与磁场作用，这种谱线没有精细结构 ⇒ g = 1</div>`);
card(104.5, 126, POS.L + 'width:620px', `${kick('SPLITTING')}<h3>每个能级分裂成 2L+1 个</h3><div class="f2">${T`h\nu=E_2-E_1`}</div><div class="f2" data-at="3">${T`\xrightarrow{\ \ \vec B\ \ }\ E_2+m_2\mu_BB,\qquad E_1+m_1\mu_BB`}</div><div data-at="7">例：Cd 643.847 nm，${T`^1D_2\to{}^1P_1`}</div><div data-at="10">上能级 5 个，下能级 3 个子能级</div><div class="s" data-at="14">但并不是所有子能级之间都能跃迁——光子必须满足角动量守恒</div>`);
deriv(126.5, POS.L + 'width:720px', { kicker: 'SELECTION RULE → LORENTZ UNIT', title: '谱线频率怎样移动？', size: 34, lead: 0.6, trans: 1.1, steps: [
  { tex: String.raw`h\nu'=\big([[E2|E_2]]+[[m2|m_2]]\mu_BB\big)-\big([[E1|E_1]]+[[m1|m_1]]\mu_BB\big)`, hold: 3.5, note: '上、下子能级之差' },
  { tex: String.raw`h\nu'=[[E2|h\nu]]+\big([[m2|m_2]]-[[m1|m_1]]\big)\mu_BB`, hold: 3 },
  { tex: String.raw`h\nu'=[[E2|h\nu]]+[[m2|\Delta m]]\,\mu_BB,\qquad \cJ{\Delta m=0,\pm1}`, hold: 5, box: ['m2'], note: '选择定则：9 个跃迁只有 <span class="k">3 种</span>能量差' },
  { tex: String.raw`\nu'=\nu+[[m2|\Delta m]]\,[[c|\dfrac{\mu_BB}{h}]]`, hold: 3 },
  { tex: String.raw`\nu'=\nu+[[m2|\begin{bmatrix}1\\0\\-1\end{bmatrix}]]\,[[c|\dfrac{eB}{4\pi m_e}]]`, hold: 4.5, box: ['c'], note: '代入 μ_B = eħ/2mₑ：<span class="k">洛伦兹单位</span>' },
  { tex: String.raw`\nu_L=[[c|\dfrac{eB}{4\pi m_e}]]=\dfrac{\omega}{2\pi}`, hold: 4.5, note: '正是经典拉莫尔进动频率（第 1 集）——可认为是非量子效应' },
] });
card(158.5, 170, POS.L + 'width:640px', `${kick('NUMBERS')}<h3>数量级</h3><div class="f2">${T`\nu_L=\dfrac{e}{4\pi m_e}B=14\,B(\mathrm T)\ \mathrm{GHz}`}</div><div class="f2" data-at="4">${T`\tilde\nu'=\tilde\nu+(1,0,-1)\times0.467\,B(\mathrm T)\ \mathrm{cm^{-1}}`}</div><div data-at="8">外加 1 T 磁场 → 约 <span class="k">14 GHz</span> 的分裂</div><div class="s" data-at="11">无论磁场强弱，正常塞曼效应的分裂方式都不变；它也可看作 S = 0、J = L、g = 1 的特例</div>`);

// ================================================================ polarization (170-236)
const PO = { g: new THREE.Group() }; scene.add(PO.g);
PO.waves = [];
function waveGroup(kind, y) { // kind: 'lin', 'circ'
  const g = new THREE.Group(); PO.g.add(g); g.position.y = y; const arrows = []; for (let i = 0; i < 26; i++) arrows.push(new Arrow(kind === 'lin' ? 0xffd59a : C.S, { r: 0.015, hr: 0.045, hl: 0.12, em: 0.3, parent: g }));
  const axis = polyLine([V(-3.2, 0, 0), V(3.4, 0, 0)], 0x9a9184, 0.5); g.add(axis); const prop = new Arrow(0x9a9184, { r: 0.015, hr: 0.05, hl: 0.15, parent: g }); prop.set(V(3.0, 0, 0), V(0.6, 0, 0), 1);
  const helix = polyLine(Array.from({ length: 200 }, () => V()), kind === 'lin' ? 0xffd59a : C.S, 0.7); g.add(helix);
  return { g, kind, arrows, helix };
}
PO.lin = waveGroup('lin', 1.4); PO.circ = waveGroup('circ', -1.4);
// atom with B and two viewers (205-236)
PO.atom = new THREE.Group(); scene.add(PO.atom);
PO.atom.add(glow(0xffbf73, 1.2)); { const c = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), phys(0xffbf73, 1)); PO.atom.add(c); }
PO.Bax = new Arrow(C.B, { r: 0.03, hr: 0.09, hl: 0.26, parent: PO.atom });
PO.sigAlong = []; for (let i = 0; i < 2; i++) { const r = ringLine(0.4 + i * 0.25, i ? C.E : C.S, { dashed: false, op: 0.9 }); PO.atom.add(r); PO.sigAlong.push(r); }
PO.perp = []; for (let i = 0; i < 3; i++) { const a = new Arrow(i === 1 ? 0xffbf73 : (i ? C.E : C.S), { r: 0.02, hr: 0.06, hl: 0.15, parent: PO.atom }); PO.perp.push(a); }
PO.lab = { lin: new Label('线偏振：E 只在一个方向振动', '#ffd59a'), circ: new Label('圆偏振：E 旋转（携带角动量 ±ħ）', hex(C.S)), B: new Label(T`\vec B\ (z)`, hex(C.B), { bare: true, size: 30 }), along: new Label('沿 B 看：只有 σ⁺、σ⁻（圆偏振）', '#ffc9a8'), perp: new Label('⊥B 看：σ（⊥B 线偏振）+ π（∥B 线偏振）', '#ffd59a') };
function updatePO(t) {
  const op = win(t, 170, 206, 1.4);
  for (const W of [PO.lin, PO.circ]) {
    const o = op * (W.kind === 'lin' ? 1 : ep(t, 180, 182)); setOp(W.g, o);
    for (let i = 0; i < 26; i++) { const x = -3 + i * 0.24, ph = x * 2.6 - t * 3; const v = W.kind === 'lin' ? V(0, Math.cos(ph) * 0.7, 0) : V(0, Math.cos(ph) * 0.7, Math.sin(ph) * 0.7); W.arrows[i].set(V(x, 0, 0), v, o); }
    const pa = W.helix.geometry.attributes.position; for (let i = 0; i < 200; i++) { const x = -3 + i * 6.2 / 199, ph = x * 2.6 - t * 3; const p = W.kind === 'lin' ? V(x, Math.cos(ph) * 0.7, 0) : V(x, Math.cos(ph) * 0.7, Math.sin(ph) * 0.7); pa.setXYZ(i, p.x, p.y, p.z); } pa.needsUpdate = true;
  }
  PO.lab.lin.place(V(0, 2.4, 0), op * win(t, 171, 206)); PO.lab.circ.place(V(0, -2.4, 0), op * win(t, 181, 206));
  const ao = win(t, 205, 237, 1.4); PO.atom.visible = ao > 0.004;
  if (PO.atom.visible) {
    setOp(PO.atom, ao); PO.Bax.set(V(0, -2.2, 0), V(0, 4.4, 0), ao);
    PO.sigAlong.forEach((r, i) => { r.position.y = 0.6 + i * 0.3; r.rotation.y = (i ? -1 : 1) * t * 2; });
    PO.perp.forEach((a, i) => { const x = 1.6, osc = Math.sin(t * 5); if (i === 1) a.set(V(x + 0.6, -0.6 * osc, 0), V(0, 1.2 * osc, 0), ao); else a.set(V(x + 0.6 + (i ? 0.5 : -0.5), 0, -0.6 * osc), V(0, 0, 1.2 * osc + 0.001), ao); });
  }
  PO.lab.B.place(V(0, 2.4, 0), ao, 30, 0); PO.lab.along.place(V(0, 1.4, 0), ao * win(t, 212, 237), 0, -20); PO.lab.perp.place(V(2.2, -1.2, 0), ao * win(t, 220, 237), 0, 20);
}
card(171, 184, POS.L + 'width:600px', `${kick('4.5.4 · POLARIZATION')}<h3>复习：光的偏振</h3>沿 z 传播的电磁波，E 在 xy 平面内（横波）<div class="f2" data-at="3">${T`E_x=A\cos\omega t,\quad E_y=B\cos(\omega t-\alpha)`}</div><div data-at="6">α = 0：线偏振 &nbsp; α = π/2, A = B：圆偏振 &nbsp; 其余：椭圆偏振</div>`);
card(184.5, 205, POS.L + 'width:720px', `${kick('PHOTON ANGULAR MOMENTUM')}<h3>圆偏振光携带角动量</h3><span class="m">σ⁻ 右旋 / σ⁺ 左旋</span>：光子角动量 ${T`\pm\hbar`} 沿传播方向<div data-at="5">贝思（R. A. Beth）1936 年观察到了圆偏振光的角动量</div><div data-at="9">选择定则与<span class="k">角动量守恒</span>有关：</div><div class="f2" data-at="12">${T`\Delta m=\pm1\ \Rightarrow\ \sigma\ \text{偏振};\qquad \Delta m=0\ \Rightarrow\ \pi\ \text{偏振}`}</div>`);
card(205.5, 222, POS.L + 'width:620px', `${kick('ALONG B')}<h3>沿磁场方向观察</h3>Δm = ±1：光子角动量 ±ħ 沿磁场方向 ⇒ <span class="m">圆偏振</span>的 σ⁺、σ⁻<div data-at="6">Δm = 0：原子在 z 方向角动量不变，光子角动量必须垂直于 z ⇒ 光不能沿 z 传播</div><div class="big" data-at="11" style="font-size:30px">沿磁场方向<span class="r">看不到 π</span> 线</div>`);
card(222.5, 236, POS.L + 'width:620px', `${kick('PERPENDICULAR TO B')}<h3>垂直磁场方向观察</h3>σ 谱线：只能看到 E 的一个分量 ⇒ 表现为<span class="k">垂直于 B</span>的线偏振<div data-at="5">π 谱线：E 在包含 B 的平面内，<span class="k">平行于 B</span>的线偏振</div><div class="s" data-at="9">这正是洛伦兹预言的“沿 B 两条圆偏振、⊥B 三条线偏振”</div>`);

// ================================================================ anomalous Zeeman Na (236-330)
const AZ = new Levels(scene); AZ.g.position.set(0.1, 0, 0);
{
  const P32 = 2.1, P12 = 0.5, S12 = -2.4, k = 0.22;
  AZ.lvl('P32', -3.8, -2.4, P32, 0xefe8dc, T`3^2P_{3/2}`, 'l'); AZ.lvl('P12', -3.8, -2.4, P12, 0xefe8dc, T`3^2P_{1/2}`, 'l'); AZ.lvl('S12', -3.8, -2.4, S12, 0xefe8dc, T`3^2S_{1/2}`, 'l');
  const sub = (name, y0, mj, g) => mj.forEach(m => { const y = y0 + m * g * k; AZ.link(`${name}l${m}`, -2.4, y0, -1.8, y); AZ.lvl(`${name}${m}`, -1.8, 3.1, y, m > 0 ? C.S : C.E, `${T`M_J=${m > 0 ? '+' : ''}${fr(m)}`}&nbsp;&nbsp;${T`M_Jg=${m * g > 0 ? '+' : ''}${fr(m * g)}`}`); AZ.off(`${name}${m}`, 105, name === 'b' ? (m > 0 ? -8 : 8) : 0); });
  function fr(x) { const map = { 0.5: '\\tfrac12', 1.5: '\\tfrac32', 2: '2', 1: '1', '0.6666666666666666': '\\tfrac23', '0.3333333333333333': '\\tfrac13', '1.3333333333333333': '\\tfrac43' }; const s = x < 0 ? '-' : ''; const a = Math.abs(x); return s + (map[a] ?? map[String(a)] ?? a.toFixed(2)); }
  sub('a', P32, [1.5, 0.5, -0.5, -1.5], 4 / 3); sub('b', P12, [0.5, -0.5], 2 / 3); sub('c', S12, [0.5, -0.5], 2);
  // D1 transitions: P1/2 (mj) -> S1/2 (mj'), Δm=0,±1 => 4 lines ; D2: 6 lines
  let i = 0;
  for (const m2 of [0.5, -0.5]) for (const m1 of [0.5, -0.5]) { AZ.tr('d1_' + i, -1.4 + i * 0.32, P12 + m2 * 2 / 3 * k, S12 + m1 * 2 * k, m2 === m1 ? 0xffbf73 : C.E); i++; }
  let j = 0;
  for (const m2 of [1.5, 0.5, -0.5, -1.5]) for (const m1 of [0.5, -0.5]) { if (Math.abs(m2 - m1) > 1) continue; AZ.tr('d2_' + j, 0.3 + j * 0.32, P32 + m2 * 4 / 3 * k, S12 + m1 * 2 * k, m2 === m1 ? 0xffbf73 : C.S); j++; }
}
function updateAZ(t) {
  const op = win(t, 250, 331, 1.4); if (op < 0.004) { AZ.hideAll(); return; }
  ['P32', 'P12', 'S12'].forEach(k => AZ.show(k, op));
  const f = ep(t, 266, 268);
  for (const id in AZ.items) { if (/^[abc]/.test(id)) AZ.show(id, op * f); }
  for (let i = 0; i < 4; i++) AZ.show('d1_' + i, op * ep(t, 290, 291), ep(t, 290 + i * 0.6, 291.5 + i * 0.6));
  for (let i = 0; i < 6; i++) AZ.show('d2_' + i, op * ep(t, 300, 301), ep(t, 300 + i * 0.6, 301.5 + i * 0.6));
}
card(237, 250, POS.L + 'width:620px', `${kick('4.5.3 · ANOMALOUS ZEEMAN')}<h3>反常塞曼效应</h3>1897 年 12 月，普雷斯顿发现：在弱磁场中谱线分裂数目<span class="k">不一定是三条</span>，间隔也不尽相等<div data-at="6">此后近三十年无法解释 —— 故名“反常”</div><div data-at="10">自旋假设 + 量子力学可以完美解释 ⇒ 它是电子自旋假设的又一重要根据</div><div class="s" data-at="14">现在看来它“并不反常”：正常塞曼效应才是 S = 0 的特殊情形</div>`);
card(250.5, 266, POS.L + 'width:720px', `${kick('Na D LINES')}<h3>钠黄双线的塞曼分裂</h3>钠：单（价）电子体系，著名的黄色双线来自 3P → 3S<div class="f2" data-at="4">${T`D_1:\ 3^2P_{1/2}\to3^2S_{1/2}\qquad D_2:\ 3^2P_{3/2}\to3^2S_{1/2}`}</div><div data-at="8">无磁场 ${svgSpectrum([{ x: -0.4, w: 5 }, { x: 0.4, w: 5 }], 300, 40)}</div><div data-at="11">弱磁场 ${svgSpectrum([-0.62, -0.5, -0.32, -0.2, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65].map(x => ({ x, w: 3 })), 300, 40)}</div><div class="s" data-at="13">D₁ → 4 条，D₂ → 6 条</div>`);
card(266.5, 290, POS.L + 'width:640px', `${kick('THEORY')}<h3>能级分裂：各能级 g 不同</h3><div class="f2">${T`U=-\vec\mu\cdot\vec B=m_jg_j\mu_BB`}</div>
<table class="tbl" data-at="5"><tr><th>原子态</th><th>${T`m_j`}</th><th>${T`g_j`}</th><th>${T`m_jg_j`}</th></tr>
<tr><td>${T`^2P_{3/2}`}</td><td>±3/2, ±1/2</td><td>4/3</td><td>±2, ±2/3</td></tr><tr><td>${T`^2P_{1/2}`}</td><td>±1/2</td><td>2/3</td><td>±1/3</td></tr><tr><td>${T`^2S_{1/2}`}</td><td>±1/2</td><td>2</td><td>±1</td></tr></table>
<div class="s" data-at="12">由于 g 不同，上下能级的子能级间距不同 —— 这就是“反常”的根源</div>`);
card(290.5, 316, POS.L + 'width:700px', `${kick('TRANSITIONS')}<h3>跃迁频率</h3><div class="f2">${T`h\nu'=h\nu+(m_2g_2-m_1g_1)\mu_BB,\quad\Delta m_j=0,\pm1`}</div><div class="f2" data-at="4">${T`D_1:\ \nu'=\nu+\left(\pm\tfrac23,\ \pm\tfrac43\right)\dfrac{eB}{4\pi m_e}`}<span class="s">（4 条）</span></div><div class="f2" data-at="10">${T`D_2:\ \nu'=\nu+\left(\pm\tfrac13,\ \pm1,\ \pm\tfrac53\right)\dfrac{eB}{4\pi m_e}`}<span class="s">（6 条）</span></div><div data-at="16">分裂后在原谱线位置<span class="k">都不再出现</span>谱线 —— 完全解释了反常塞曼效应</div>`);
card(316.5, 330, POS.L + 'width:640px', `${kick('GROTRIAN DIAGRAM')}<h3>格罗春图</h3>把上下子能级按 ${T`m`} 排开，用连线表示允许的跃迁（Δm = 0 为 π，Δm = ±1 为 σ）
<div data-at="5"><svg width="560" height="210" viewBox="0 0 560 210">${(() => { let s = ''; const up = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5], lo = [-1.5, -0.5, 0.5, 1.5]; const X = m => 280 + m * 80; s += `<line x1="30" y1="40" x2="530" y2="40" stroke="#efe8dc"/><line x1="30" y1="150" x2="530" y2="150" stroke="#efe8dc"/>`; up.forEach(m => s += `<circle cx="${X(m)}" cy="40" r="4" fill="#ff6a1f"/><text x="${X(m)}" y="28" fill="#9a9184" font-size="14" text-anchor="middle">${m}</text>`); lo.forEach(m => s += `<circle cx="${X(m)}" cy="150" r="4" fill="#a9c8dc"/><text x="${X(m)}" y="172" fill="#9a9184" font-size="14" text-anchor="middle">${m}</text>`); lo.forEach(m1 => [-1, 0, 1].forEach(d => { const m2 = m1 + d; if (Math.abs(m2) <= 2.5) s += `<line x1="${X(m2)}" y1="40" x2="${X(m1)}" y2="150" stroke="${d ? '#ff6a1f' : '#ffbf73'}" stroke-width="1.6" opacity=".8"/>`; })); s += `<text x="40" y="195" fill="#9a9184" font-size="15">E₂ (m₂) → E₁ (m₁)：σ⁺ π σ⁻ 三组</text>`; return s; })()}</svg></div>`);

// ================================================================ Paschen-Back (330-380): vector model decoupling
const vm = new VectorModel(scene, { U: 1.3, R: 2.2, nuc: 0.9 }); vm.setState(1, 0.5, 1.5, 0.5);
const fieldPB = new Field([-3.2, -1.6, 0, 1.6, 3.2], [-1.6, 0, 1.6], -3.0, 3.4, C.B, 1.0);
const PBL = { w: new Label('弱场：L、S 先合成 J，J 绕 B 进动（慢）', '#ffd59a'), s: new Label('强场：L、S 各自绕 B 进动，L-S 耦合被破坏', '#ffc9a8') };
function updatePB(t) {
  const op = win(t, 330, 381, 1.4); fieldPB.update(t, op * 0.8);
  if (op < 0.004) { vm.g.visible = false; PBL.w.place(V(), 0); PBL.s.place(V(), 0); return; }
  const dec = ep(t, 346, 352);
  vm.draw({ all: 1, nuc: op, orbit: op * 0.5, L: op, S: op, J: op * (1 - dec), coneL: op * (1 - dec), coneJ: op * (1 - dec), coneLB: op * dec, coneSB: op * dec }, { phi: t * 0.5, psi: t * 1.6, eAng: t * 2.2, dec, mL: 1, mS: 0.5, psiL: t * 1.1, psiS: t * 1.8 }, 0.5);
  PBL.w.place(V(0, -3.0, 0), op * win(t, 331, 347)); PBL.s.place(V(0, -3.0, 0), op * win(t, 350, 381));
}
card(331, 346, POS.L + 'width:620px', `${kick('4.5.5 · PASCHEN–BACK')}<h3>帕邢-巴克效应（1912）</h3>在<span class="k">很强</span>的磁场中，原本反常分裂的谱线却表现为<span class="k">三重线</span><div data-at="5">与正常塞曼效应类似：分裂数目相同（3 条），偏振相同（中间 π、两旁 σ）</div><div class="s" data-at="9">差别：帕邢-巴克效应的三重线还可有更细小的分裂</div>`);
deriv(346.5, POS.L + 'width:740px', { kicker: 'STRONG FIELD', title: '强场：L-S 耦合被破坏', size: 34, lead: 0.6, trans: 1.1, steps: [
  { tex: String.raw`\Delta E=-[[a|\cL{\vec\mu_L}]]\cdot\cB{\vec B}-[[b|\cS{\vec\mu_S}]]\cdot\cB{\vec B}`, hold: 3, note: 'L、S 分别绕 B 进动，各自与外场作用' },
  { tex: String.raw`\Delta E=[[a|\dfrac{e}{2m}\cL{\vec L}]]\cdot\cB{\vec B}+[[b|\dfrac{e}{m}\cS{\vec S}]]\cdot\cB{\vec B}`, hold: 3.5, note: 'μ_L = −(e/2m)L，μ_S = −(e/m)S（g_s = 2）' },
  { tex: String.raw`\Delta E=\dfrac{eB}{2m}\big([[a|\cL{L_z}]]+[[b|2\cS{S_z}]]\big)`, hold: 3 },
  { tex: String.raw`\Delta E=\big([[a|M_L]]+[[b|2M_S]]\big)\,\mu_BB`, hold: 4, note: '能级按 M_L + 2M_S 分裂' },
] });
card(364.5, 380, POS.L + 'width:640px', `${kick('SELECTION RULES')}<h3>为什么回到三条？</h3><div class="f2">${T`\Delta M_L=0,\pm1,\qquad\Delta M_S=0`}</div><div class="f2" data-at="4">${T`\Delta\tilde\nu=\dfrac{(\Delta M_L+2\Delta M_S)\,\mu_BB}{hc}=(\Delta M_L)\,\tilde L`}</div><div class="big" data-at="8" style="font-size:32px">${T`\Delta\tilde\nu=\tilde L,\ 0,\ -\tilde L`}：三条</div><div class="s" data-at="11">L̃：洛伦兹单位（波数）；M_S 可取正负，无外场时 m_l = 0 的两个态能量相同</div>`);

// ================================================================ summary of three regimes (380-440)
const RG = new Levels(scene); RG.g.position.set(0.9, 0, 0);
{
  const x0 = [-4.4, -1.6, 1.4], w = 1.6;
  // no field
  RG.lvl('n32', x0[0], x0[0] + w, 2.0, 0xefe8dc, T`^2P_{3/2}`, 'l'); RG.lvl('n12', x0[0], x0[0] + w, 0.9, 0xefe8dc, T`^2P_{1/2}`, 'l'); RG.lvl('nS', x0[0], x0[0] + w, -2.4, 0xefe8dc, T`^2S_{1/2}`, 'l');
  // weak
  [1.5, 0.5, -0.5, -1.5].forEach(m => RG.lvl('w32' + m, x0[1], x0[1] + w, 2.0 + m * 4 / 3 * 0.15, C.S)); [0.5, -0.5].forEach(m => RG.lvl('w12' + m, x0[1], x0[1] + w, 0.9 + m * 2 / 3 * 0.15, C.E)); [0.5, -0.5].forEach(m => RG.lvl('wS' + m, x0[1], x0[1] + w, -2.4 + m * 2 * 0.15, 0xefe8dc));
  // strong: (ML+2MS)
  [2, 1, 0, -1, -2].forEach(v => RG.lvl('sP' + v, x0[2], x0[2] + w, 1.45 + v * 0.42, v > 0 ? C.S : v < 0 ? C.E : 0xefe8dc, T`${v}`)); [1, -1].forEach(v => RG.lvl('sS' + v, x0[2], x0[2] + w, -2.4 + v * 0.42, 0xefe8dc, T`${v}`));
  RG.text('h0', x0[0] + w / 2, 3.2, '无场', '#d8d1c4', 24); RG.text('h1', x0[1] + w / 2, 3.2, '弱场（反常塞曼）', '#d8d1c4', 24); RG.text('h2', x0[2] + w / 2, 3.2, '强场（帕邢-巴克）', '#d8d1c4', 24);
  RG.text('hM', x0[2] + w + 0.6, 3.2, T`M_L+2M_S`, '#9a9184', 20);
}
function updateRG(t) { const op = win(t, 380, 442, 1.4); if (op < 0.004) { RG.hideAll(); return; } for (const id in RG.items) { const g = id.startsWith('n') || id === 'h0' ? 380.4 : id.startsWith('w') || id === 'h1' ? 386 : 391; RG.show(id, op * ep(t, g, g + 1.5)); } }
card(381, 402, POS.L + 'width:640px', `${kick('SUMMARY · FIELD STRENGTH')}<h3>同一组能级，三种情形</h3><div data-at="1"><span class="k">无场</span>：只有精细结构（自旋-轨道耦合）</div><div data-at="5"><span class="m">弱场</span>：LS 耦合保持，按 ${T`m_jg_j`} 分裂 → 反常塞曼</div><div data-at="10"><span class="c">强场</span>：LS 解耦，按 ${T`M_L+2M_S`} 分裂 → 帕邢-巴克</div><div class="s" data-at="15">拉莫尔进动：弱场时 J 绕 B 慢进动（L、S 绕 J 快进动）；强场时反过来</div>`);
card(402.5, 422, POS.L + 'width:560px', `${kick('STARK EFFECT*')}<h3>斯塔克效应（拓展）</h3>原子能级在<span class="k">外加电场</span>中的位移和分裂<div data-at="5">例如：简并的氢原子能级在电场中分裂</div><div class="s" data-at="9">与塞曼效应对应：一个是电场，一个是磁场</div>`);
card(422.5, 440, POS.L + 'width:580px', `${kick('CHECKLIST')}<h3>塞曼效应：要会的 7 件事</h3><ol style="font-size:23px"><li>原子态符号</li><li>钠双线的劈裂（精细结构）</li><li>（反常）塞曼效应的能级与谱线</li><li>g 因子的计算 ${T`g_j=\frac32+\frac{\hat s^2-\hat l^2}{2\hat j^2}`}</li><li>拉莫尔进动（慢、快？）</li><li>跃迁选择定则</li><li>波数、波长、频率与能量的换算：外磁场引起的是哪个量的等差变化？</li></ol>`);
card(441, 463, POS.TC + 'width:1300px', `${kick('EPISODE 5 · SUMMARY')}<h3>本集小结</h3><div style="display:flex;gap:40px"><ol style="flex:1.6">
<li data-at="1">${T`U=m_jg_j\mu_BB`}；${T`h\nu'=h\nu+(m_2g_2-m_1g_1)\mu_BB`}</li><li data-at="3">正常塞曼（S = 0，g = 1）：三条等间距，洛伦兹单位 14 GHz/T</li><li data-at="5">偏振：Δm = ±1 → σ，Δm = 0 → π；沿 B 看不到 π</li></ol><ol start="4" style="flex:1">
<li data-at="7">反常塞曼：钠 D₁ 4 条、D₂ 6 条</li><li data-at="9">强场：帕邢-巴克效应，回到三条</li></ol></div><hr><div data-at="12" style="text-align:center">最后一集：氢原子光谱的精细结构 · 兰姆移位 · 磁共振 · 全章总结</div>`);

// ================================================================ camera
const shots = [
  { t0: 0, fn: fixedShot([12, 4, 14], [0, 0, 0]) },
  { t0: 10, b: 0.5, fn: pathShot([{ u: 0, p: [9.5, -1.0, 11.5], l: [0, -4.0, -1], roll: -18, fov: 46 }, { u: 5, p: [6.0, 0.6, 12.5], l: [0, -1.6, -1], roll: -9, fov: 42 }, { u: 20, p: [-2.5, 1.6, 12.5], l: [0, -1.0, -1], roll: 4, fov: 40 }]) },
  { t0: 30, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [7.6, 0.6, 7.6], l: [0, 0.1, 0], roll: -15, fov: 42, s: 330 }, { u: 14, p: [5.5, 2.0, 11.5], l: [0.8, 0, 0], roll: -7, fov: 40, s: 330 }, { u: 46, p: [-2.5, 3.0, 13.8], l: [1.0, 0, 0], roll: 5, fov: 40, s: 330 }]) },
  { t0: 76, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [4.0, 1.8, 13.0], l: [0.8, 0, 0], roll: -6, fov: 40, s: 330 }, { u: 26, p: [2.0, 1.0, 14.4], l: [0.8, 0, 0], roll: -3, fov: 38, s: 350 }, { u: 60, p: [0.6, 0.8, 14.8], l: [0.8, 0, 0], roll: -1, fov: 38, s: 350 }, { u: 94, p: [-1.0, 1.2, 14.8], l: [0.8, 0, 0], roll: 2, fov: 38, s: 350 }]) },
  { t0: 170, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [6.0, 0.9, 8.6], l: [0.2, 0, 0], roll: -12, fov: 42, s: 330 }, { u: 14, p: [3.4, 1.8, 10.4], l: [0.2, 0, 0], roll: -6, fov: 40, s: 330 }, { u: 35, p: [-1.6, 2.6, 10.4], l: [0.2, 0, 0], roll: 3, fov: 40, s: 330 }]) },
  { t0: 205, b: 2.0, whip: true, fn: pathShot([{ u: 0, p: [6.2, 1.4, 7.0], l: [0, 0.2, 0], roll: -12, fov: 40, s: 330 }, { u: 31, p: [-3.6, 2.6, 8.4], l: [0, 0.2, 0], roll: 6, fov: 40, s: 330 }]) },
  { t0: 236, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [8.0, -1.2, 8.0], l: [0, -4.4, -4], roll: -16, fov: 46, s: 300 }, { u: 14, p: [4.6, 0.4, 12.0], l: [0.5, -1.8, -2], roll: -7, fov: 42, s: 320 }]) },
  { t0: 250, b: 3.0, fn: pathShot([{ u: 0, p: [2.2, 0.9, 15.4], l: [0.6, 0, 0], roll: -3, fov: 38, s: 440 }, { u: 80, p: [-1.2, 1.1, 15.6], l: [0.6, 0, 0], roll: 2, fov: 38, s: 420 }]) },
  { t0: 330, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [8.4, 0.4, 8.6], l: [0, 0.2, 0], roll: -14, fov: 42, s: 330 }, { u: 18, p: [3.4, 2.2, 10.8], l: [0, 0.2, 0], roll: -5, fov: 40, s: 330 }, { u: 50, p: [-4.0, 3.0, 10.2], l: [0, 0.2, 0], roll: 4, fov: 40, s: 330 }]) },
  { t0: 380, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [3.2, 0.9, 14.0], l: [0.5, 0, 0], roll: -4, fov: 38, s: 330 }, { u: 60, p: [-1.0, 1.3, 14.3], l: [0.5, 0, 0], roll: 3, fov: 38, s: 330 }]) },
  { t0: 440, b: 2.6, whip: true, fn: pathShot([{ u: 0, p: [13, 1.2, 11], l: [0, -3.6, -1], roll: -10, fov: 42 }, { u: 23, p: [8, 0.4, 13.5], l: [0, -3.2, -1], roll: -4, fov: 40 }]) },
  { t0: 462.6, b: 1.4, whip: true, fn: END.cam },
];
run({ duration: DUR, shots, update(t) { updateHS(t); updateNZ(t); updatePO(t); updateAZ(t); updatePB(t); updateRG(t); } });
