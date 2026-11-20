// EP4 — 4.4 碱金属原子谱线的双线结构 · 自旋-轨道相互作用
import {
  THREE, T, V, UP, C, hex, ep, win, rampInt, clamp, rng, scene, camera, setOp, phys, glow, fresnel, Arrow, Cone, ringLine, polyLine,
  nucleus, electron, Trail, Label, card, overlay, POS, kick, chainHTML, setStations, setChips, setTitle, setEnd, svgSpectrum, Levels, bar,
  orbitShot, fixedShot, run
, deriv } from './engine.js';
import { ContourTerrain, wellField, GridFunnel, KText, tag, ctag, titleSequence, endSequence } from './noir.js';
import { pathShot, setFog, hooks, rayCtl } from './engine.js';

const DUR = 470;
titleSequence({ epn: '04', main: '碱金属双线', sub: '第 4 集 · 4.4 自旋-轨道相互作用', ring: 'ALKALI DOUBLETS · SPIN–ORBIT COUPLING · ', tags: ['D₂ 589.0 nm', 'D₁ 589.6 nm', 'B ≈ 18.5 T'] });
window.NO_END_FALLBACK = true;
const END = endSequence({ t0: 462, t1: 470, text: '第 4 集 · 完', next: 'NEXT ▸ 塞曼效应 / ZEEMAN EFFECT' });
setFog(16, 62);
// ---------------------------------------------------------------- world floor: a landscape whose hot contours come in PAIRS (doublets)
const WF = wellField({ depth: 5.2, a: 2.2, noise: 0.38, nscale: 0.11, wells: [{ x: -9, z: -7, d: 1.6, a: 1.6 }, { x: 10, z: -9, d: 1.2, a: 1.4 }] });
const H1 = WF(5.2, 3.4), H2 = WF(9.0, 5.0);
const terr = new ContourTerrain({ f: WF, size: 56, res: 230, step: 0.07, y0: -4.7, indexEvery: 5, hotLevels: [H1, H1 + 0.14, H2, H2 + 0.14], hotWidth: 0.5, fadeNear: 14, fadeFar: 60 });
// grid funnel = the screened Coulomb well of the atomic core (internal-field section)
const FUN = new GridFunnel({ R: 20, depth: 6.5, a: 1.7, r0: 1.1, streaks: 360, fadeNear: 10, fadeFar: 46 });
FUN.g.position.set(0, -3.4, 0); FUN.g.updateMatrixWorld(true);
// mono tags pinned to the floor: each is anchored by a SCREEN point (px) at its start time, then lives in the world
const onSurf = (hf, t, sx, sy, lift) => { const R = rayCtl.ray(t, sx, sy); let y = hf(R.o.x, R.o.z) - 1, p = R.o.clone(); for (let i = 0; i < 8; i++) { const k = (y - R.o.y) / R.d.y; if (!(k > 0)) return null; p = R.o.clone().add(R.d.clone().multiplyScalar(k)); y = hf(p.x, p.z); } return V(p.x, y + lift, p.z); };
const hTerr = (x, z) => terr.heightAt(x, z), hFun = (x, z) => FUN.g.position.y + FUN.F(Math.max(Math.hypot(x, z), FUN.r0));
const TG = (L, sx, sy, a, b, k = 1, hf = hTerr, ta) => ({ L, sx, sy, a, b, k, hf, ta: ta ?? a + 0.4, p: undefined });
const tg = [
  TG(ctag('3P · 2.10 eV', 17), 1330, 925, 38, 96, 0.85), TG(ctag('电离限 5.14 eV', 17), 1590, 900, 37, 96, 0.85), TG(ctag('Na · Z = 11', 17), 1790, 935, 38.5, 96, 0.85),
  TG(tag('589.0 nm'), 1200, 925, 101, 110), TG(tag('589.6 nm'), 1500, 905, 101.5, 110),
  TG(ctag('ΔE ∝ Z*⁴ / n³l(l+1)', 17), 1520, 930, 261, 268.5, 0.85),
  TG(tag('Z* 3.5'), 880, 945, 276, 300, 1, hTerr, 285), TG(tag('589.0 nm'), 1090, 905, 271, 300, 1, hTerr, 285), TG(tag('589.6 nm'), 1340, 940, 271.5, 300, 1, hTerr, 285),
  TG(tag('ΔU 2.1e-3 eV'), 1600, 925, 270, 300, 1, hTerr, 285), TG(ctag('Δλ 0.6 nm', 18), 1740, 890, 270.5, 300, 0.9, hTerr, 285), TG(tag('B ≈ 18.5 T'), 1150, 975, 296, 300.6),
  TG(tag('B ≈ 18.5 T'), 1560, 925, 303, 330),
  TG(tag('Δj = 0, ±1'), 1500, 915, 392, 440), TG(ctag('Δl = ±1', 17), 1770, 935, 392.5, 440, 0.85),
  TG(ctag('Z*e', 18), 1520, 905, 126, 138, 0.85, hFun), TG(ctag('1/r³', 18), 1720, 905, 173, 205, 0.85, hFun),
  TG(ctag('μ₀ = 1/ε₀c²', 17), 1010, 965, 183, 214, 0.85, hFun), TG(ctag('g_s = 2', 17), 1800, 1000, 195, 214, 0.85, hFun),
];
hooks.push(t => {
  const top = Math.max(win(t, 10.0, 112, 0.5), win(t, 250, 462.5, 1.2));
  terr.set(top, 4 + 44 * Math.max(ep(t, 10.3, 15.5), ep(t, 250, 254)), [0, 0]);
  const fop = win(t, 108.5, 254, 1.6); FUN.set(t, fop, { swirl: 0.55 * fop, ringI: 0.45 });
  for (const x of tg) {
    const o = (x.hf === hFun ? fop : top) * x.k * win(t, x.a, x.b, 0.6);
    if (o > 0.003 && x.p === undefined) x.p = onSurf(x.hf, x.ta, x.sx, x.sy, 0.06);
    x.L.place(x.p || V(), x.p ? o : 0);
  }
});
// hero words: kinetic type laid into the world
const KT = (o) => new KText({ cps: 20, ...o });
KT({ text: '内部磁场', t0: 11.6, t1: 18.8, screen: { t: 13.4, x: 960, y: 700, planeY: -3.9, tilt: 0.4, px: 96 }, align: 'center' });
KT({ text: '自旋-轨道耦合', t0: 111.4, t1: 123.8, screen: { x: 1360, y: 850, planeY: -3.2, tilt: 0.45, px: 80 }, align: 'center' });
KT({ text: 's · l', t0: 205.5, t1: 213.8, font: 'mono', screen: { x: 1360, y: 960, planeY: -3.2, tilt: 0.45, px: 100 }, align: 'center' });
KT({ text: '×½ 托马斯', t0: 216.2, t1: 225.8, screen: { x: 1340, y: 960, planeY: -3.2, tilt: 0.45, px: 84 }, align: 'center' });
KT({ text: 'j = l ± ½', t0: 253.2, t1: 267.8, font: 'mono', screen: { x: 1360, y: 230, planeY: 3.4, tilt: 0.9, px: 84 }, align: 'center' });
KT({ text: '18.5 T', t0: 295.6, t1: 300.3, font: 'mono', screen: { x: 1660, y: 730, planeY: -1.2, tilt: 0.6, px: 92 }, align: 'center' });
KT({ text: '三条谱线', t0: 396.6, t1: 411.6, screen: { x: 1360, y: 230, planeY: 3.6, tilt: 0.9, px: 80 }, align: 'center' });
setStations([['定位', 11, 34], ['四个线系', 34, 110], ['内部磁场', 110, 186], ['耦合能', 186, 252], ['能级分裂', 252, 330], ['线系解释', 330, 440], ['小结', 440, 461]]);
setChips([[11, 34, '4.4', '本集在主线中的位置'], [34, 110, '4.4.1', '碱金属谱线的精细结构'], [110, 186, '4.4.2', '自旋-轨道相互作用：原子内部的磁场'], [186, 252, '4.4.2', '自旋-轨道相互作用能'], [252, 330, '4.4.2', '能级分裂与结论'], [330, 440, '4.4.3', '碱金属光谱精细结构解释'], [440, 461, '✓', '本集小结']]);

card(12, 34, 'left:110px;bottom:60px;width:1700px;padding:22px 30px', chainHTML(1));
card(14, 34, POS.TC + 'width:1100px;text-align:center', `${kick('WHERE WE ARE')}<h3>不加外场，磁矩也有“磁场”可感受</h3><div data-at="3">电子的轨道运动 ⇒ 原子<span class="k">内部磁场</span></div><div data-at="6">电子的<span class="m">自旋磁矩</span>处在这个磁场中 ⇒ 附加能量</div><div data-at="10">⇒ 能级一分为二 ⇒ 光谱出现<span class="k">双线</span></div>`);

// ================================================================ Grotrian diagram of Na (34-110)
const GD = new Levels(scene); GD.g.position.set(0.6, 0, 0);
const Ey = E => -3.4 + E * 1.18;
const cols = { S: -3.0, P: -1.0, D: 1.0, F: 3.0 }, hw = 0.6;
const NaE = { '3S': ['S', 0], '4S': ['S', 3.19], '5S': ['S', 4.12], '3P': ['P', 2.10], '4P': ['P', 3.75], '5P': ['P', 4.34], '3D': ['D', 3.62], '4D': ['D', 4.28], '4F': ['F', 4.29] };
for (const [k, [c, E]] of Object.entries(NaE)) GD.lvl(k, cols[c] - hw, cols[c] + hw, Ey(E), 0xefe8dc, k, c === 'S' ? 'l' : 'r', 0.028);
GD.line('lim', [[-3.8, Ey(5.14)], [3.8, Ey(5.14)]], 0x9a9184, 0.5); GD.text('limT', 4.4, Ey(5.14), '电离限', '#9a9184', 18);
['S', 'P', 'D', 'F'].forEach(c => GD.text('col' + c, cols[c], 3.25, c, '#d8d1c4', 30));
const tr = (id, a, b, col) => { const [ca, ea] = NaE[a], [cb, eb] = NaE[b]; GD.trd(id, cols[ca] + (ca < cb ? 0.3 : -0.3), Ey(ea), cols[cb] + (ca < cb ? -0.3 : 0.3), Ey(eb), col); };
tr('p3', '3P', '3S', 0xffbf73); tr('p4', '4P', '3S', 0xffbf73); tr('p5', '5P', '3S', 0xffbf73);
tr('s4', '4S', '3P', 0xff6a1f); tr('s5', '5S', '3P', 0xff6a1f);
tr('d3', '3D', '3P', 0xa9c8dc); tr('d4', '4D', '3P', 0xa9c8dc);
tr('f4', '4F', '3D', 0xbfe3cf);
function updateGD(t) {
  const op = win(t, 34, 96, 1.5);
  if (op < 0.004) { GD.hideAll(); return; }
  for (const k in NaE) GD.show(k, op * ep(t, 35, 37));
  GD.show('lim', op * ep(t, 36, 38)); GD.show('limT', op * ep(t, 36, 38)); ['S', 'P', 'D', 'F'].forEach(c => GD.show('col' + c, op * ep(t, 35, 37)));
  const d = (a) => ep(t, a, a + 2);
  ['p3', 'p4', 'p5'].forEach((k, i) => GD.show(k, op, d(40 + i * 0.6)));
  ['s4', 's5'].forEach((k, i) => GD.show(k, op, d(50 + i * 0.6)));
  ['d3', 'd4'].forEach((k, i) => GD.show(k, op, d(60 + i * 0.6)));
  GD.show('f4', op, d(70));
}
card(35, 96, POS.L + 'width:560px', `${kick('4.4.1 · FOUR SERIES (Na)')}<h3>碱金属的四个主要线系</h3>以钠为例：
<div data-at="5" style="margin-top:8px"><span class="k">● 主线系</span>：nP → 3S</div>
<div data-at="15"><span class="m">● 锐线系</span>（第二辅线系）：nS → 3P</div>
<div data-at="25"><span class="c" style="color:#a9c8dc">● 漫线系</span>（第一辅线系）：nD → 3P</div>
<div data-at="35"><span class="g">● 基线系</span>（柏格曼线系）：nF → 3D</div>
<div class="s" data-at="45">与氢原子不同：同一 n 的 S、P、D、F 能级不再简并（原子实的极化与轨道贯穿）</div>`);
// zoom: 3P splitting (96-110)
const ZP = new Levels(scene); ZP.g.position.set(1.0, 0, 0);
ZP.lvl('3P', -3.2, -1.6, 1.0, 0xefe8dc, '3P', 'l'); ZP.link('a', -1.6, 1.0, -0.8, 1.7); ZP.link('b', -1.6, 1.0, -0.8, 0.5);
ZP.lvl('P32', -0.8, 1.2, 1.7, C.S, T`3^2P_{3/2}`); ZP.lvl('P12', -0.8, 1.2, 0.5, C.E, T`3^2P_{1/2}`);
ZP.lvl('3S', -3.2, 1.2, -2.6, 0xefe8dc, T`3^2S_{1/2}`);
ZP.tr('D2', -0.2, 1.7, -2.6, 0xffbf73, 'D₂ 589.0 nm'); ZP.tr('D1', 0.6, 0.5, -2.6, 0xffa64d, 'D₁ 589.6 nm');
ZP.off('D2', -70, 0).off('D1', 80, 0);
function updateZP(t) {
  const op = win(t, 96, 111, 1.2); if (op < 0.004) { ZP.hideAll(); return; }
  ZP.show('3P', op); ZP.show('3S', op); ZP.show('a', op * ep(t, 98, 99.5)); ZP.show('b', op * ep(t, 98, 99.5)); ZP.show('P32', op * ep(t, 99, 100.5)); ZP.show('P12', op * ep(t, 99, 100.5));
  ZP.show('D2', op, ep(t, 101, 103)); ZP.show('D1', op, ep(t, 101.5, 103.5));
}
card(96.5, 110, POS.L + 'width:620px', `${kick('FINE STRUCTURE')}<h3>高分辨率光谱：双线（或三线）</h3>
<div data-at="1"><span class="k">主线系</span>双线：间距随波数增加而减小</div><div data-at="2">${svgSpectrum([{ x: -0.8 }, { x: -0.62 }, { x: 0.1, o: .8 }, { x: 0.2, o: .8 }, { x: 0.55, o: .6 }, { x: 0.6, o: .6 }, { x: 0.8, o: .4 }, { x: 0.82, o: .4 }], 520, 46)}</div>
<div data-at="4"><span class="m">锐线系</span>双线：间距保持不变</div><div data-at="5">${svgSpectrum([{ x: -0.8, c: '#ff6a1f' }, { x: -0.68, c: '#ff6a1f' }, { x: -0.1, c: '#ff6a1f', o: .8 }, { x: 0.02, c: '#ff6a1f', o: .8 }, { x: 0.5, c: '#ff6a1f', o: .6 }, { x: 0.62, c: '#ff6a1f', o: .6 }], 520, 46)}</div>
<div data-at="7">钠黄光 D 线：<span class="k">589.0 nm / 589.6 nm</span> ← 3P 能级一分为二</div>`);

// ================================================================ internal field: frames (110-252)
const FR = { g: new THREE.Group() }; scene.add(FR.g);
FR.core = new THREE.Group(); FR.g.add(FR.core);
FR.core.add(nucleus(1.0)); FR.shell = new THREE.Mesh(new THREE.SphereGeometry(0.75, 48, 32), fresnel(0xff9a5a, 2.4, 0.35)); FR.core.add(FR.shell);
FR.el = electron(0.15); FR.g.add(FR.el);
FR.orbitE = ringLine(2.6, C.E, { dashed: false, op: 0.3 }); FR.g.add(FR.orbitE);
FR.orbitC = ringLine(2.6, 0xff9a5a, { dashed: true, op: 0.6 }); FR.g.add(FR.orbitC);
FR.Er = []; for (let i = 0; i < 12; i++) { const a = new Arrow(0xffd59a, { r: 0.015, hr: 0.05, hl: 0.14, em: 0.2, parent: FR.g }); FR.Er.push(a); }
FR.B = new Arrow(C.B, { r: 0.05, hr: 0.14, hl: 0.4, parent: FR.g });
FR.S = new Arrow(C.S, { r: 0.045, hr: 0.12, hl: 0.34, parent: FR.g });
FR.Lv = new Arrow(C.L, { r: 0.045, hr: 0.12, hl: 0.34, parent: FR.g });
FR.cur = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 20), phys(0xff9a5a, 0.3)); FR.g.add(m); FR.cur.push(m); }
FR.gauge = new Levels(scene);
FR.gauge.lvl('up', -0.5, 0.5, 0.8, C.S, T`j=l+\tfrac12`); FR.gauge.lvl('dn', -0.5, 0.5, -0.8, C.E, T`j=l-\tfrac12`); FR.gauge.line('ax', [[0, -1.3], [0, 1.3]], 0x9a9184, 0.4);
FR.dot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), phys(C.J, 0.8)); FR.gauge.g.add(FR.dot);
FR.lab = { core: new Label(T`原子实\ Z^*e`, '#ff9a5a'), el: new Label('价电子 −e', hex(C.E)), E: new Label('只有静电场，没有磁场', '#ffd59a'), B: new Label(T`\vec B` + '&nbsp;原子实运动产生的磁场', hex(C.B)), frameL: new Label('实验室坐标系：原子实静止', '#efe8dc', { size: 24 }), frameE: new Label('电子静止坐标系：原子实绕电子转', '#efe8dc', { size: 24 }), S: new Label(T`\vec s`, hex(C.S), { bare: true, size: 32 }), L: new Label(T`\vec l`, hex(C.L), { bare: true, size: 32 }), U: new Label('附加能量 U', hex(C.J), { size: 22 }) };
function updateFR(t) {
  const op = win(t, 110, 253, 1.5); FR.g.visible = op > 0.004;
  if (!FR.g.visible) { Object.values(FR.lab).forEach(l => l.place(V(), 0)); FR.gauge.hideAll(); setOp(FR.dot, 0); return; }
  const k = ep(t, 152, 158) * (1 - ep(t, 214, 220)); // 0 = core frame, 1 = electron frame
  const a = t * 0.9; const re = V(2.6 * Math.cos(a), 0, -2.6 * Math.sin(a)); // electron relative position (counter-clockwise seen from +y)
  const pE = re.clone().multiplyScalar(1 - k), pC = re.clone().multiplyScalar(-k);
  FR.core.position.copy(pC); FR.core.rotation.y = t * 0.3; FR.el.position.copy(pE); setOp(FR.core, op); setOp(FR.el, op);
  FR.orbitE.position.copy(V()); setOp(FR.orbitE, op * (1 - k)); setOp(FR.orbitC, op * k);
  setOp(FR.shell, op * win(t, 124, 253));
  // radial E field (lab frame, 138-152)
  const eo = op * win(t, 138, 153);
  FR.Er.forEach((ar, i) => { const th = i / 12 * Math.PI * 2; const d = V(Math.cos(th), 0, Math.sin(th)); ar.set(pC.clone().add(d.clone().multiplyScalar(0.95)), d.clone().multiplyScalar(0.8), eo); });
  // current of moving core (electron frame)
  const co = op * k * win(t, 153, 214);
  FR.cur.forEach((m, i) => { const b = a + Math.PI + i * Math.PI / 4; const p = V(2.6 * Math.cos(b), 0, -2.6 * Math.sin(b)).add(pE); m.position.copy(p); m.quaternion.setFromUnitVectors(UP, V(-Math.sin(b), 0, -Math.cos(b))); setOp(m, co); });
  // B at electron (electron frame), along l (= +y here since electron moves counter-clockwise from above? choose +y)
  const bo = op * win(t, 158, 253);
  FR.B.set(pE, V(0, 1.6 * ep(t, 158, 160), 0), bo * Math.max(k, ep(t, 214, 216) * (1 - 0)));
  FR.Lv.set(V(), V(0, 1.6, 0), op * win(t, 186, 253) * (1 - k * 0.0) * (t > 214 ? 1 : 0.0));
  // spin at electron: rotates between parallel and antiparallel (202-214), else tilted
  const so = op * win(t, 186, 253);
  const sw = t < 202 ? 0.35 : 0.35 + (t - 202) * 0.55; // angle from +y
  const ang = t < 202 ? 0.5 : (Math.cos((t - 202) * 0.55) * 0.5 + 0.5) * Math.PI; // 0 parallel -> pi antiparallel oscillating
  const sv = V(Math.sin(ang) * 0.4, Math.cos(ang), Math.sin(ang) * 0.2).normalize().multiplyScalar(1.1);
  FR.S.set(pE, sv, so);
  // gauge (202-214): energy depends on relative orientation
  const go = op * win(t, 202, 214.5);
  FR.gauge.g.position.set(4.6, 0.3, 0); FR.gauge.g.quaternion.copy(camera.quaternion);
  if (go > 0.004) { ['up', 'dn', 'ax'].forEach(id => FR.gauge.show(id, go)); } else FR.gauge.hideAll();
  FR.dot.position.set(0, 0.8 * Math.cos(ang), 0.02); setOp(FR.dot, go);
  const lo = (x, y) => op * win(t, x, y);
  FR.lab.core.place(pC, lo(124, 152), 0, 60); FR.lab.el.place(pE, lo(124, 152), 0, -36);
  FR.lab.E.place(V(0, 1.2, 0), lo(140, 152)); FR.lab.frameL.place(V(0, -2.2, 0), lo(139, 152));
  FR.lab.frameE.place(V(0, -2.4, 0), lo(154, 170)); FR.lab.B.place(pE.clone().add(V(0, 1.7, 0)), lo(160, 202), 0, -20);
  FR.lab.S.place(pE.clone().add(sv.clone().multiplyScalar(1.12)), so, 20, 0); FR.lab.U.place(V(4.6, 1.6, 0), go);
}
card(111, 124, POS.L + 'width:620px', `${kick('4.4.2 · SPIN–ORBIT')}<h3>原子内部的两种相互作用</h3>电子与核之间的<span class="k">静电库仑作用</span>最重要，决定谱线系的主要特征<div data-at="5">同时，轨道运动产生<span class="b">内部磁场</span>，电子<span class="m">自旋磁矩</span>必然受它作用</div><div class="big" data-at="9" style="font-size:30px">⇒ 自旋-轨道相互作用 ⇒ 精细结构</div>`);
card(124.5, 138, POS.L + 'width:620px', `${kick('MODEL')}<h3>碱金属 = 原子实 + 价电子</h3>原子实（核 + 内层电子）总角动量、总磁矩为零（忽略核）<div data-at="5">价电子感受到的平均是一个球对称的<span class="k">屏蔽库仑势</span></div><div data-at="9">简单起见：有效核电荷数 ${T`Z^*<Z`}</div>`);
card(138.5, 152, POS.L + 'width:620px', `${kick('LAB FRAME')}<h3>原子实静止看</h3>电子绕原子实运动<div data-at="3">电子所在处<span class="k">只有原子实的静电场</span>，没有磁场</div><div class="s" data-at="7">磁场从哪里来？换个参考系</div>`);
card(152.5, 170, POS.L + 'width:620px', `${kick('ELECTRON REST FRAME')}<h3>电子静止看</h3>暂时忽略其非惯性——从电子上看，<span class="k">原子实绕电子运动</span><div data-at="5">带正电的原子实运动 ⇒ “等效”电流</div><div data-at="9">⇒ 在电子处产生<span class="b">磁场 B</span></div><div class="s" data-at="12">结论对任意轨道都成立</div>`);
deriv(170.5, POS.L + 'width:740px', { kicker: 'INTERNAL FIELD → ENERGY', title: '内部磁场与自旋-轨道相互作用能', size: 36, steps: [
  { tex: String.raw`\cB{\vec B}=-\dfrac{\mu_0}{4\pi}\,\dfrac{Z^*e\;[[vr|\vec v\times\vec r]]}{r^3}`, hold: 4.5, note: '毕奥-萨伐尔：电子静止系中原子实以 −v 运动' },
  { tex: String.raw`\cB{\vec B}=\dfrac{\mu_0}{4\pi}\,\dfrac{Z^*e}{[[m|m_e]]\,r^3}\;[[vr|\cL{\vec l}]]`, hold: 4.5, box: ['vr'], ann: [{ key: 'vr', text: 'l = mₑ r × v', color: '#e9e1d2' }], note: '−v×r = r×v，配出轨道角动量' },
  { tex: String.raw`\cB{\vec B}=[[c|\dfrac{Z^*e}{4\pi\varepsilon_0m_ec^2r^3}]]\;[[vr|\cL{\vec l}]]`, hold: 4, note: '利用 μ₀ = 1/(ε₀c²)：B 平行于 l' },
  { tex: String.raw`U=-[[mu|\cS{\vec\mu_s}]]\cdot[[B|\cB{\vec B}]]`, hold: 3, note: '自旋磁矩在内部磁场中的势能' },
  { tex: String.raw`U=[[mu|\dfrac{g_se}{2m_e}\cS{\vec s}]]\cdot[[B|\dfrac{Z^*e}{4\pi\varepsilon_0m_ec^2r^3}\cL{\vec l}]]`, hold: 5, note: '代入 μ_s = −g_s (e/2mₑ) s 与 B' },
  { tex: String.raw`U=\dfrac{Z^*g_se^2}{8\pi\varepsilon_0m_e^2c^2r^3}\;\cS{\vec s}\cdot\cL{\vec l}`, hold: 3.5 },
  { tex: String.raw`U=\dfrac{1}{4\pi\varepsilon_0}\dfrac{Z^*e^2}{2m_e^2c^2}\dfrac{1}{r^3}\;[[sl|\cS{\vec s}\cdot\cL{\vec l}]]`, hold: 6, box: ['sl'], note: 'g_s = 2。能量由 <span class="k">s·l</span>（相对取向）决定 ⇒ 自旋-轨道耦合' },
] });
card(214.5, 226, POS.L + 'width:620px', `${kick('THOMAS PRECESSION')}<h3>回到原子实静止的坐标系</h3>电子坐标系与原子实坐标系并不完全对称<div data-at="4">电子坐标系的非惯性效应引起<span class="k">托马斯进动</span></div><div class="big" data-at="7" style="font-size:32px">相对论修正因子：×½</div><div class="f2" data-at="10">${T`E_{l,s}=\dfrac{\mu_0Z^*e^2}{8\pi m_e^2r^3}\,\vec s\cdot\vec l`}</div>`);
deriv(226.5, POS.L + 'width:780px', { kicker: 'EVALUATE', title: '计算 E_{l,s}', size: 32, steps: [
  { tex: String.raw`E_{l,s}=K\,[[r|\dfrac{1}{r^3}]]\;[[sl|\vec s\cdot\vec l]],\qquad K=\dfrac{\mu_0Z^*e^2}{8\pi m_e^2}`, hold: 3.5, note: '托马斯修正后的表达式' },
  { tex: String.raw`E_{l,s}=K\,[[r|\dfrac{1}{r^3}]]\;[[sl|\tfrac12\big[j(j+1)-l(l+1)-s(s+1)\big]\hbar^2]]`, hold: 4.5, box: ['sl'], note: '由 J² = (L+S)² ⇒ 2 s·l = J² − L² − S²' },
  { tex: String.raw`E_{l,s}=K\,[[r|\dfrac{Z^{*3}}{a_1^3n^3l(l+\frac12)(l+1)}]]\;[[sl|\tfrac12\big[j(j+1)-l(l+1)-s(s+1)\big]\hbar^2]]`, hold: 4.5, box: ['r'], note: 'r 是变量，用量子力学平均值代替（a₁ 为玻尔半径）' },
  { tex: String.raw`E_{l,s}=\dfrac{Rhc\,\alpha^2Z^{*4}}{n^3l(l+\frac12)(l+1)}\cdot[[sl|\dfrac{j(j+1)-l(l+1)-s(s+1)}{2}]]`, hold: 6, note: '整理常数；Z* 越大分裂越大，n、l 越大分裂越小' },
] });

// ================================================================ splitting (252-330)
const SPL = new Levels(scene); SPL.g.position.set(1.2, 0, 0);
SPL.lvl('nl', -3.2, -1.5, 0, 0xefe8dc, T`E_{nl}`, 'l'); SPL.link('a', -1.5, 0, -0.6, 1.3); SPL.link('b', -1.5, 0, -0.6, -1.6);
SPL.lvl('up', -0.6, 1.6, 1.3, C.S, T`j=l+\tfrac12`); SPL.lvl('dn', -0.6, 1.6, -1.6, C.E, T`j=l-\tfrac12`);
SPL.tr('dE', 0.0, -1.6, 1.3, C.J, T`\Delta E`); SPL.tr('dE2', 0.0, 1.3, -1.6, C.J); SPL.off('dE', -36, 0);
function updateSPL(t) {
  const op = win(t, 252, 268.5, 1.2); if (op < 0.004) { SPL.hideAll(); return; }
  SPL.show('nl', op); ['a', 'b'].forEach(k => SPL.show(k, op * ep(t, 254, 255))); SPL.show('up', op * ep(t, 255, 256.5)); SPL.show('dn', op * ep(t, 255, 256.5));
  SPL.show('dE', op * ep(t, 260, 261)); SPL.show('dE2', op * ep(t, 260, 261));
}
deriv(252.5, POS.L + 'width:760px', { kicker: 'SPLITTING', title: '碱金属能级一分为二', size: 32, lead: 0.6, trans: 1.1, steps: [
  { tex: String.raw`E_{l,s}=A\cdot[[b|\dfrac{j(j+1)-l(l+1)-s(s+1)}{2}]],\quad A=\dfrac{Rhc\alpha^2Z^{*4}}{n^3l(l+\frac12)(l+1)}`, hold: 2.7 },
  { tex: String.raw`j=l+\tfrac12:\quad E_{l,s}=A\cdot[[b|\dfrac{l}{2}]]=+\dfrac{Rhc\alpha^2Z^{*4}}{2n^3(l+\frac12)(l+1)}`, hold: 2.7 },
  { tex: String.raw`j=l-\tfrac12:\quad E_{l,s}=A\cdot[[b|\dfrac{-(l+1)}{2}]]=-\dfrac{Rhc\alpha^2Z^{*4}}{2n^3l(l+\frac12)}`, hold: 2.7 },
  { tex: String.raw`\Delta E=\dfrac{Rhc\,\alpha^2Z^{*4}}{n^3\,l\,(l+1)}`, hold: 3, note: '两层之差' },
] });
// Na D example (268-300)
const NA = new Levels(scene); NA.g.position.set(0.8, 0, 0);
NA.lvl('P32', -1.6, 1.0, 1.8, C.S, T`3^2P_{3/2}`); NA.lvl('P12', -1.6, 1.0, 0.9, C.E, T`3^2P_{1/2}`); NA.lvl('S', -1.6, 1.0, -2.4, 0xefe8dc, T`3^2S_{1/2}`);
NA.trd('D2', -0.9, 1.8, -0.6, -2.4, 0xffbf73, '589.0 nm'); NA.trd('D1', 0.2, 0.9, 0.5, -2.4, 0xffa64d, '589.6 nm'); NA.off('D2', -70, 0).off('D1', 70, 30);
NA.icon = new THREE.Group(); NA.g.add(NA.icon);
{ const mk = (y, par) => { const l = new Arrow(C.L, { r: 0.02, hr: 0.06, hl: 0.15, parent: NA.icon }); l.set(V(2.3, y, 0), V(0.45, 0.25, 0)); const s = new Arrow(C.S, { r: 0.02, hr: 0.06, hl: 0.15, parent: NA.icon }); s.set(V(2.75, y + 0.25, 0), V(par ? 0.3 : -0.3, par ? 0.17 : -0.17, 0)); }; mk(1.7, true); mk(0.8, false); }
function updateNA(t) {
  const op = Math.max(win(t, 268, 300.5, 1.2), win(t, 441, 462.5, 1.2)); if (op < 0.004) { NA.hideAll(); setOp(NA.icon, 0); return; }
  ['P32', 'P12', 'S'].forEach(k => NA.show(k, op)); NA.show('D2', op, ep(t, 270, 272)); NA.show('D1', op, ep(t, 270.5, 272.5)); setOp(NA.icon, op * ep(t, 273, 275));
}
card(268.5, 284, POS.L + 'width:640px', `${kick('EXAMPLE · Na')}<h3>钠原子著名的黄色双线</h3><div class="f2">${T`\Delta U=2.1\times10^{-3}\,\mathrm{eV},\qquad\Delta\lambda=0.6\,\mathrm{nm}`}</div><div data-at="4">实验上容易观察，还可以估计钠原子实的有效核电荷数：</div><div class="f2" data-at="7">${T`\Delta U=\dfrac{Z^{*4}\alpha^4E_0}{2n^3l(l+1)};\ \ l=1,\ n=3\ \Rightarrow\ Z^*=3.5`}</div><div class="s" data-at="11">理论计算较繁：既要确定原子实的等效电荷，还要确定屏蔽库仑势的形式</div>`);
deriv(284.5, POS.L + 'width:760px', { kicker: 'INTERNAL FIELD ESTIMATE', title: '原子内部磁场有多强？', size: 34, lead: 0.6, trans: 1.1, steps: [
  { tex: String.raw`U=-\vec\mu_s\cdot\vec B=\pm\mu_BB\ \Rightarrow\ [[dU|\Delta U]]=2\mu_B[[B|B]]`, hold: 2.5 },
  { tex: String.raw`[[dU|\dfrac{hc\,\Delta\lambda}{\lambda^2}]]=2\mu_B[[B|B]]`, hold: 2.5, note: 'ΔE = Δ(hc/λ) ≈ hcΔλ/λ²' },
  { tex: String.raw`[[B|B]]=\dfrac{hc\,\Delta\lambda}{2\lambda^2\mu_B}=\dfrac{1.24\ \mathrm{nm\cdot keV}\times0.6\ \mathrm{nm}}{2\times(589\ \mathrm{nm})^2\times0.5788\times10^{-4}\ \mathrm{eV/T}}`, hold: 3.5 },
  { tex: String.raw`[[B|B]]\approx\cJ{18.5\ \mathrm T}`, hold: 2.6, note: '约为地磁场的 30 万倍' },
] });
// conclusions diagram (300-330): n=3,4 with exaggerated splitting
const CN = new Levels(scene); CN.g.position.set(1.4, 0, 0);
{
  const col = { S: -2.7, P: -0.9, D: 0.9, F: 2.7 }, w = 0.55;
  const base = { 3: { S: -2.6, P: -0.9, D: 0.6 }, 4: { S: 0.0, P: 1.0, D: 2.0, F: 2.1 } };
  const ds = (n, l) => l === 0 ? 0 : 1.6 / (n ** 3 * l * (l + 1)) * 9;
  for (const n of [3, 4]) for (const [L, y] of Object.entries(base[n])) {
    const l = { S: 0, P: 1, D: 2, F: 3 }[L]; const d = ds(n, l);
    if (l === 0) CN.lvl(`${n}${L}`, col[L] - w, col[L] + w, y, 0xefe8dc, `${n}²S₁/₂`, 'l');
    else { CN.lvl(`${n}${L}u`, col[L] - w, col[L] + w, y + d / 2, C.S, null); CN.lvl(`${n}${L}d`, col[L] - w, col[L] + w, y - d / 2, C.E, null); CN.text(`${n}${L}t`, col[L] + w + 0.45, y, `${n}${L}`, '#d8d1c4', 18); }
  }
  ['S', 'P', 'D', 'F'].forEach(L => CN.text('h' + L, col[L], 3.0, L, '#d8d1c4', 28));
}
function updateCN(t) { const op = win(t, 300, 331, 1.2); if (op < 0.004) { CN.hideAll(); return; } CN.showAll(op); }
card(300.5, 330, POS.L + 'width:640px', `${kick('CONCLUSIONS')}<h3>碱金属能级的结论</h3><ol style="font-size:24px">
<li data-at="1">能级由 n、l、j 决定：l = 0 时 j = s，<span class="k">不分裂</span>；l ≠ 0 时 j = l ± ½，<span class="k">分裂为双层</span></li>
<li data-at="6">分裂大小 ${T`\Delta E\propto\frac{Z^{*4}}{n^3l(l+1)}`}：n 定 l↑ ΔE↓（ΔE₄ₚ>ΔE₄d>ΔE₄f）；l 定 n↑ ΔE↓（ΔE₃ₚ>ΔE₄ₚ）</li>
<li data-at="12">双层能级中 <span class="k">j 大的能级高</span></li>
<li data-at="16">原子态符号 ${T`n\,{}^{2s+1}L_j`}：如 3²S₁/₂、3²P₃/₂、3²P₁/₂、3²D₅/₂、3²D₃/₂</li>
<li data-at="21">单光子跃迁选择定则：<span class="k">${T`\Delta l=\pm1,\ \Delta j=0,\pm1`}</span><span class="s">（光子角动量为 1）</span></li></ol>`);

// ================================================================ series explanation (330-440)
function seriesDiagram(kind) {
  const D = new Levels(scene); D.g.position.set(0.9, 0, 0);
  const sp = { P: [0.32, 0.14, 0.07], D: [0.12, 0.06], F: [0.05] };
  if (kind === 'main') {
    D.lvl('S', -3, 2.6, -2.8, 0xefe8dc, T`3^2S_{1/2}`);
    [[3, -0.6], [4, 0.9], [5, 1.9]].forEach(([n, y], i) => { const d = sp.P[i]; D.lvl(`u${n}`, -3, 2.6, y + d, C.S, i === 0 ? T`n^2P_{3/2}` : null); D.lvl(`d${n}`, -3, 2.6, y - d, C.E, i === 0 ? T`n^2P_{1/2}` : null); D.text(`t${n}`, -3.5, y, `${n}P`, '#d8d1c4', 18);
      D.tr(`a${n}`, -2.4 + i * 1.6, y + d, -2.8, C.J); D.tr(`b${n}`, -2.0 + i * 1.6, y - d, -2.8, 0xffa64d); });
  } else if (kind === 'sharp') {
    D.lvl('Pu', -3, 2.6, -2.2, C.S, T`3^2P_{3/2}`); D.lvl('Pd', -3, 2.6, -2.75, C.E, T`3^2P_{1/2}`);
    [[4, 0.2], [5, 1.4], [6, 2.2]].forEach(([n, y], i) => { D.lvl(`s${n}`, -3, 2.6, y, 0xefe8dc, i === 0 ? T`n^2S_{1/2}` : null); D.text(`t${n}`, -3.5, y, `${n}S`, '#d8d1c4', 18);
      D.tr(`a${n}`, -2.4 + i * 1.6, y, -2.2, C.S); D.tr(`b${n}`, -2.0 + i * 1.6, y, -2.75, C.E); });
  } else if (kind === 'diffuse') {
    D.lvl('Pu', -3, 2.6, -2.2, C.S, T`3^2P_{3/2}`); D.lvl('Pd', -3, 2.6, -2.75, C.E, T`3^2P_{1/2}`);
    D.lvl('Du', -3, 2.6, 1.15, 0xd9a88f, T`3^2D_{5/2}`); D.lvl('Dd', -3, 2.6, 0.75, 0xa9c8dc, T`3^2D_{3/2}`);
    D.tr('a', -1.8, 1.15, -2.2, C.J, T`D_{5/2}\to P_{3/2}`); D.tr('b', -0.6, 0.75, -2.2, C.J, T`D_{3/2}\to P_{3/2}`); D.tr('c', 0.6, 0.75, -2.75, C.J, T`D_{3/2}\to P_{1/2}`);
    D.tr('x', 1.8, 1.15, -2.75, 0xff3b3b, T`D_{5/2}\to P_{1/2}\ \times`); D.off('a', -80, -40).off('b', -70, 40).off('c', 70, -40).off('x', 90, 40);
  } else {
    D.lvl('Du', -3, 2.6, -2.1, 0xd9a88f, T`3^2D_{5/2}`); D.lvl('Dd', -3, 2.6, -2.55, 0xa9c8dc, T`3^2D_{3/2}`);
    D.lvl('Fu', -3, 2.6, 1.15, 0xbfe3cf, T`4^2F_{7/2}`); D.lvl('Fd', -3, 2.6, 0.85, 0xbfe3cf, T`4^2F_{5/2}`);
    D.tr('a', -1.8, 1.15, -2.1, C.J, T`F_{7/2}\to D_{5/2}`); D.tr('b', -0.6, 0.85, -2.1, C.J, T`F_{5/2}\to D_{5/2}`); D.tr('c', 0.6, 0.85, -2.55, C.J, T`F_{5/2}\to D_{3/2}`);
    D.tr('x', 1.8, 1.15, -2.55, 0xff3b3b, T`F_{7/2}\to D_{3/2}\ \times`); D.off('a', -80, -40).off('b', -70, 40).off('c', 70, -40).off('x', 90, 40);
  }
  return D;
}
const SER = [['main', 330, 356], ['sharp', 356, 382], ['diffuse', 382, 412], ['fund', 412, 440]].map(([k, a, b]) => ({ D: seriesDiagram(k), a, b }));
function updateSER(t) {
  for (const s of SER) {
    const op = win(t, s.a, s.b + 0.5, 1.2); if (op < 0.004) { s.D.hideAll(); continue; }
    let i = 0; for (const id in s.D.items) { const it = s.D.items[id]; const isTr = it.arrow || it.arrowD; s.D.show(id, op * (isTr ? 1 : ep(t, s.a + 0.5, s.a + 2)), isTr ? ep(t, s.a + 3 + i * 0.5, s.a + 4.5 + i * 0.5) : 1); if (isTr) i++; }
  }
}
card(331, 356, POS.L + 'width:600px', `${kick('4.4.3 · PRINCIPAL SERIES')}<h3>1. 主线系</h3><div class="f2">${T`n^2P_{1/2},\,n^2P_{3/2}\to3^2S_{1/2}`}</div><div data-at="4">上能级双层、下能级单层 ⇒ <span class="k">双线</span></div><div data-at="9">n 增大，P 能级分裂变小 ⇒ <span class="k">双线间距随波数增加而减小</span></div><div data-at="12">${svgSpectrum([{ x: -0.8 }, { x: -0.6 }, { x: 0.1 }, { x: 0.2 }, { x: 0.58 }, { x: 0.63 }], 520, 46)}</div>`);
card(356.5, 382, POS.L + 'width:600px', `${kick('SHARP SERIES')}<h3>2. 第二辅线系（锐线系）</h3><div class="f2">${T`n^2S_{1/2}\to3^2P_{1/2},\,3^2P_{3/2}`}</div><div data-at="4">上能级单层、下能级双层 ⇒ <span class="k">双线</span></div><div data-at="9">分裂来自共同的下能级 3P ⇒ <span class="k">双线间距保持不变</span></div><div data-at="12">${svgSpectrum([{ x: -0.8, c: '#ff6a1f' }, { x: -0.66, c: '#ff6a1f' }, { x: -0.05, c: '#ff6a1f' }, { x: 0.09, c: '#ff6a1f' }, { x: 0.5, c: '#ff6a1f' }, { x: 0.64, c: '#ff6a1f' }], 520, 46)}</div>`);
card(382.5, 412, POS.L + 'width:700px', `${kick('DIFFUSE SERIES')}<h3>3. 第一辅线系（漫线系）</h3><div class="f2">${T`n^2D_{3/2,5/2}\to3^2P_{1/2,3/2}`}</div><div data-at="4">上下能级都是双层：四种组合</div><div data-at="9">选择定则 ${T`\Delta j=0,\pm1`}：${T`D_{5/2}\to P_{1/2}`} 的 ${T`\Delta j=2`}，<span class="r">被禁戒</span></div><div class="big" data-at="14" style="font-size:30px">⇒ <span class="k">三条</span>谱线（复双线）</div>`);
card(412.5, 440, POS.L + 'width:600px', `${kick('FUNDAMENTAL SERIES')}<h3>4. 基线系（柏格曼线系）</h3><div class="f2">${T`n^2F_{5/2,7/2}\to3^2D_{3/2,5/2}`}</div><div data-at="4">与漫线系同理：${T`F_{7/2}\to D_{3/2}`} 被禁戒</div><div class="big" data-at="9" style="font-size:30px">⇒ 同样是<span class="k">三条</span>谱线</div><div class="s" data-at="13">所有精细结构都由“自旋-轨道耦合 + 选择定则”统一解释</div>`);
card(441, 461, POS.TC + 'width:1300px', `${kick('EPISODE 4 · SUMMARY')}<h3>本集小结</h3><div style="display:flex;gap:40px"><ol style="flex:1">
<li data-at="1">电子静止系中，原子实运动产生内部磁场（钠约 18.5 T）</li><li data-at="3">自旋-轨道耦合能 ${T`\propto\vec s\cdot\vec l`}，含托马斯因子 ½</li><li data-at="5">${T`j=l\pm\frac12`}，${T`\Delta E=\frac{Rhc\alpha^2Z^{*4}}{n^3l(l+1)}`}</li></ol><ol start="4" style="flex:1">
<li data-at="7">S 不分裂，j 大的能级高；${T`\Delta l=\pm1,\ \Delta j=0,\pm1`}</li><li data-at="9">主线系、锐线系：双线；漫线系、基线系：三线</li></ol></div>
<hr><div data-at="12" style="text-align:center">下一集：把原子放进<span class="b">外加均匀磁场</span> → <span class="b">塞曼效应</span></div>`);
// recap visual: atom with spin & B (reuse FR group at 440-470)
// ================================================================ camera
const shots = [
  { t0: 0, fn: fixedShot([0, 0, 15], [0, 0, 0]) },
  { t0: 10, b: 0.5, fn: pathShot([{ u: 0, p: [7.4, -1.1, 13.2], l: [0, -3.7, -1], roll: -12, fov: 44 }, { u: 9, p: [6.2, -0.6, 13.8], l: [0, -3.3, -1], roll: -9, fov: 42 }, { u: 24, p: [4.4, -0.2, 14.4], l: [0, -2.9, -1], roll: -5, fov: 40 }]) },
  { t0: 34, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [3.0, -2.2, 13.8], l: [0.6, -0.1, 0], roll: -4, fov: 42, s: 300 }, { u: 30, p: [1.0, -1.5, 14.0], l: [0.6, 0, 0], roll: -1.5, fov: 40, s: 300 }, { u: 62, p: [-1.4, -1.0, 13.8], l: [0.6, 0, 0], roll: 2.5, fov: 40, s: 300 }]) },
  { t0: 96, b: 2.0, fn: pathShot([{ u: 0, p: [-0.2, -1.4, 11.2], l: [1.0, -0.4, 0], roll: 3, fov: 40, s: 320 }, { u: 14, p: [2.0, -0.9, 10.6], l: [1.0, -0.4, 0], roll: -2.5, fov: 40, s: 320 }]) },
  { t0: 110, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [5.0, 0.9, 5.4], l: [0, -0.2, 0], roll: -13, fov: 42, s: 330 }, { u: 28, p: [3.6, 2.4, 6.6], l: [0, -0.3, 0], roll: -7, fov: 40, s: 330 }, { u: 60, p: [1.6, 3.8, 9.0], l: [0.5, -0.3, 0], roll: -3, fov: 40, s: 370 }, { u: 88, p: [-0.4, 4.2, 12.2], l: [1.8, -0.2, 0], roll: 1, fov: 40, s: 360 }, { u: 104, p: [-1.6, 4.0, 12.0], l: [1.8, -0.2, 0], roll: 3, fov: 40, s: 360 }, { u: 112, p: [-2.6, 3.6, 10.0], l: [0.4, -0.3, 0], roll: 4, fov: 40, s: 380 }, { u: 143, p: [-5.6, 2.6, 8.4], l: [0, -0.3, 0], roll: 8, fov: 40, s: 400 }]) },
  { t0: 252, b: 2.2, whip: true, fn: pathShot([{ u: 0, p: [3.4, -1.8, 12.0], l: [1.0, -0.2, 0], roll: -4, fov: 42, s: 340 }, { u: 16, p: [1.6, -1.0, 12.2], l: [1.0, -0.1, 0], roll: -1, fov: 40, s: 340 }]) },
  { t0: 268, b: 2.0, fn: pathShot([{ u: 0, p: [0.2, -1.5, 11.6], l: [1.0, -0.2, 0], roll: 2.5, fov: 40, s: 340 }, { u: 32, p: [1.8, -0.9, 11.4], l: [1.0, -0.2, 0], roll: -2, fov: 40, s: 340 }]) },
  { t0: 300, b: 2.2, whip: true, fn: pathShot([{ u: 0, p: [4.6, -2.0, 12.6], l: [1.4, 0.1, 0], roll: -4, fov: 42, s: 340 }, { u: 30, p: [1.6, -1.0, 13.0], l: [1.4, 0.1, 0], roll: 1, fov: 40, s: 340 }]) },
  { t0: 330, b: 2.4, whip: true, fn: pathShot([{ u: 0, p: [-1.2, -1.8, 12.6], l: [0.9, -0.2, 0], roll: 3.5, fov: 42, s: 260 }, { u: 26, p: [0.6, -1.0, 12.8], l: [0.9, -0.2, 0], roll: 1, fov: 40, s: 260 }, { u: 52, p: [2.4, -1.6, 12.6], l: [0.9, -0.2, 0], roll: -2.5, fov: 40, s: 260 }, { u: 82, p: [0.6, -0.8, 13.0], l: [0.9, -0.2, 0], roll: 0, fov: 40, s: 260 }, { u: 110, p: [-1.2, -1.4, 12.6], l: [0.9, -0.2, 0], roll: 3, fov: 40, s: 260 }]) },
  { t0: 440, b: 2.6, whip: true, fn: pathShot([{ u: 0, p: [4.8, 1.2, 20.4], l: [0.8, 3.1, 0], roll: -4, fov: 39 }, { u: 21, p: [1.6, 2.0, 20.6], l: [0.8, 3.1, 0], roll: -1.5, fov: 38 }]) },
  { t0: 461.6, b: 1.4, whip: true, fn: END.cam },
];
run({ duration: DUR, shots, update(t) { updateGD(t); updateZP(t); updateFR(t); updateSPL(t); updateNA(t); updateCN(t); updateSER(t); } });
