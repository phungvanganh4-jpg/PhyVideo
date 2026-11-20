# NOIR style guide — 原子的精细结构 video series

Reference look (view these two images with the Read tool):
- /tmp/claude-0/-home-user/f247b9a8-3336-57f3-a6a9-8f200facd0c1/images/3.webp — contour-line "loss landscape" with a deep well; huge heavy white words typed along the slope in perspective, an orange spark cursor and an orange squiggle under them; small mono tags ("1e-6", "P(doom) 0.03") in dark pills, orange for the important one; camera low and rolled.
- /tmp/claude-0/-home-user/f247b9a8-3336-57f3-a6a9-8f200facd0c1/images/4.webp — warped spacetime grid funnel, black throat with an orange glowing ring, orange swirl streaks, heavy text curved around the hole.

Palette: warm black background, cream lines (C.LINE), one orange accent (C.O = C.S). Secondary semantic colours (already defined in `C` in engine.js) are muted: L cream, S orange, J amber, μ rose, B steel, E ice, F mint. Never reintroduce neon/cool UI colours.

## Files
- `engine.js` — shared engine (cards now render as 3D-tilted typographic panels with typewriter headlines; camera supports roll/fov/whip; `pathShot`; time-warp). DO NOT EDIT.
- `noir.js` — NOIR components. DO NOT EDIT.
- `ep.html` — CSS. DO NOT EDIT.
- `ep1.js` — the finished reference episode. Read it first and copy its patterns.
- `epN.js` — the episode you own. Only edit your own file.
- Original (pre-noir) sources for content comparison: /tmp/claude-0/-home-user/f247b9a8-3336-57f3-a6a9-8f200facd0c1/scratchpad/backup_v2/epN.js

## Components (import from './noir.js' and './engine.js')
```js
import { ContourTerrain, wellField, GridFunnel, KText, KPath, tag, ctag, dust, titleSequence, endSequence } from './noir.js';
import { pathShot, setFog, hooks } from './engine.js';
```
- `titleSequence({ epn:'02', main:'施特恩-盖拉赫实验', sub:'第 2 集 · 4.2 用实验看见空间量子化', ring:'STERN–GERLACH · 1921 · ' })` — music-synced opening (0–10.4 s, plays 1:1 with the Beethoven motif). Replaces `setTitle(...)`. Remove the old `setTitle` call. Scene content should start appearing around t ≈ 10.4 (hard cut with a dip to black at 10.4).
- `endSequence({ t0, t1, text:'第 N 集 · 完', next:'NEXT ▸ ...' })` returns `{cam}`; add a final shot `{ t0: t0-0.4, b: 1.4, whip: true, fn: END.cam }` and set `window.NO_END_FALLBACK = true;`. Remove the old `setEnd`. Episode 6 ends the chapter: text '第四章 · 完', next could be '一个假设 · 三个实验 · 四个量子数 · 五步进展'.
- `ContourTerrain({ f, size, res, step, y0, hotLevels, ... })` + `terr.set(op, revealRadius, [cx,cz])` per frame (use a `hooks.push(t => ...)`). `wellField({depth,a,noise,nscale,wells:[{x,z,d,a}]})` builds organic potential wells. `terr.point(x,z,lift)` gives a world point on the surface (for tags / text).
- `GridFunnel({R, depth, a, r0, streaks})` + `fun.set(t, op, {swirl, ringI})`; `fun.point(r, theta, lift)`. Good for "potential well / attraction / centre" moments. Put it where it does not fight the main subject (e.g. far below as a floor, or as a section backdrop).
- `KText({ text, t0, t1, screen:{ x, y, planeY, tilt, px }, align:'center', font:'heavy'|'mono' })` — kinetic world type. `screen` places it by a screen point (px) at anchor time t0+0.3; `planeY` = world height of the plane it lies on; `tilt` 0 = lying flat … 1 = standing; `px` ≈ on-screen cap height in pixels (64–120 typical). It then lives in 3D (perspective + parallax). Typing with orange spark cursor is automatic.
- `KPath` — text along a curve (see titleSequence in noir.js).
- `tag(text)` (orange mono tag) / `ctag(text)` (cream mono tag) return a `Label`; call `.place(worldPoint, opacity)` every frame in a hook. Use them for numbers/values pinned in the world: "μB 9.274e-24 J/T", "ΔE 2.1e-3 eV", "z₂ ±1.12 cm", "589.0 nm", "B ≈ 18.5 T", contour annotations like "1e-6".
- `setFog(near, far)` — depth fade for lines.
- Cards (`card`, `deriv`) now automatically become 3D panels: left-side cards tilt toward centre, with slight world parallax. Options: `card(t0,t1,style,html,{flat:true})` for no tilt; `{world:0}` for no parallax. Keep all cards and derivations.
- Camera: shots may return `{p, l, s, roll, fov}`. Use `pathShot([{u, p, l, roll, fov, s}, ...])` (u = seconds after shot start, Catmull-Rom) and `whip: true` with `b: 1.8–2.6` for punchy section transitions. `s` (px) shifts the subject right to make room for left-side cards (typ. 280–340 when a left card is up).

## Rules
1. KEEP EVERY KNOWLEDGE POINT, card text, derivation step, example and number from the current file. You restyle and re-stage; you do not cut content. Small wording/position changes are fine. Keep the script duration `DUR` within ±10 % of the current value (the time-warp compresses holds automatically).
2. Visual identity per section: give the episode a world floor (contour terrain or grid funnel or both), mono tags for key numbers, and 4–8 hero `KText` moments (short, punchy: a key formula or 2–6 Chinese characters) at section openings / punchlines. Hero words must sit in free screen space: not over cards (cards occupy roughly x 40–780 px on the left, or the centre top band for TC cards / bottom band for BC cards), not over the main 3D subject, not over another label, fully inside the frame.
3. Camera: low grazing angles across the floor, rolled horizon (−18° … +12°), slow push-ins/pull-backs, whip transitions between sections. Nothing should look like a static dashboard. Keep subjects clearly visible and readable (don't roll so much that diagrams become hard to read; level-diagram sections can use smaller roll, e.g. ±4°).
4. Diagrams drawn with `Levels`, arrows etc. stay; adapt their colours to the palette if any still look off.
5. Remove the old dashboard-ish leftovers that clash with the look if any (e.g. bright glass pills). Use `C.*` colours.
6. Verify visually. Render preview frames (script time, seconds):
   `cd /home/user/atom-video && PAGE="ep.html?ep=N" PD=pvN_<tag> node render.js preview t1,t2,t3,...`
   then build a sheet: `python3 sheet.py pvN_<tag>` (6 frames per sheet: pvN_<tag>/sheet0.png …) and Read the sheets. Cover: 1.0, 3.0, 7.5 (title), 11.5, every section start + 3 s, mid-derivation steps, every hero KText moment, the end sequence. Fix anything overlapping, cut off, unreadable, empty, or ugly. Iterate until clean. Page errors print as `PAGEERR ...` — there must be none.
   Duration check: `node durs.js N` prints the warped output duration.
7. The local server (http://127.0.0.1:8765) is already running; if a preview fails with ERR_CONNECTION_REFUSED, start it: `cd /home/user/atom-video && (nohup python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &)`.
8. Several episodes are being worked on in parallel by other agents; renders are slower than usual. Do not kill other node/chromium processes.
