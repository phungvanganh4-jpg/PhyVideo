#!/usr/bin/env node
// 原子的精细结构 —— 一键渲染脚本（Windows / macOS / Linux 通用）
// 用法： node render-all.js [--ep 1,2,3] [--workers 3] [--fps 24] [--gpu] [--crf 18] [--noaa]
//        node render-all.js --ep 1 --seconds 12          （试渲染前 12 秒）
//        node render-all.js --preview --ep 2 --times 3,30,120   （渲染几张预览图到 preview/）
const http = require('http'), fs = require('fs'), path = require('path'), { spawn, spawnSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = __dirname;
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const EPS = String(opt('ep', '1,2,3,4,5,6')).split(',').map(Number);
const WORKERS = +opt('workers', 3), FPS = +opt('fps', 24), CRF = +opt('crf', 18);
const GPU = !!opt('gpu', false), NOAA = !!opt('noaa', false), PREVIEW = !!opt('preview', false);
const MUSIC = path.join(ROOT, 'assets', 'music', 'fate.mp3');
const NAMES = ['', '第1集_全景与轨道磁矩', '第2集_施特恩-盖拉赫实验', '第3集_电子自旋与朗德g因子', '第4集_碱金属双线', '第5集_塞曼效应', '第6集_氢原子精细结构与全章总结'];

// ---- ffmpeg: system ffmpeg, else ffmpeg-static
function findFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const r = spawnSync('ffmpeg', ['-version']); if (!r.error && r.status === 0) return 'ffmpeg';
  try { return require('ffmpeg-static'); } catch { console.error('找不到 ffmpeg：请安装 ffmpeg 或运行 npm i ffmpeg-static'); process.exit(1); }
}
const FF = findFfmpeg();
const run = (a) => new Promise((res, rej) => { const p = spawn(FF, a, { stdio: ['ignore', 'inherit', 'inherit'] }); p.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))); });

// ---- tiny static server (no python needed)
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
function serve() {
  return new Promise(res => {
    const s = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT)) { rsp.writeHead(403); return rsp.end(); }
      fs.readFile(p, (e, d) => { if (e) { rsp.writeHead(404); return rsp.end(); } rsp.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); rsp.end(d); });
    });
    s.listen(0, '127.0.0.1', () => res(s));
  });
}
const launchArgs = GPU ? ['--ignore-gpu-blocklist', '--enable-gpu-rasterization'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
async function openPage(base, ep) {
  const br = await chromium.launch({ args: launchArgs });
  const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on('pageerror', e => console.error(`[EP${ep}] PAGEERR`, e.message));
  await pg.goto(`${base}/ep.html?ep=${ep}${NOAA ? '&noaa' : ''}`);
  await pg.waitForFunction('window.READY === true', null, { timeout: 180000 });
  return { br, pg };
}
async function renderPart(base, ep, f0, f1, out, tag) {
  const { br, pg } = await openPage(base, ep);
  const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF), '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const cdp = await pg.context().newCDPSession(pg); const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    await pg.evaluate(t => window.renderAt(t), f / FPS);
    const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, optimizeForSpeed: true });
    const buf = Buffer.from(r.data, 'base64'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    const n = f - f0 + 1; if (n % 120 === 0 || f === f1 - 1) { const el = (Date.now() - t0) / 1000; process.stdout.write(`  ${tag} ${n}/${f1 - f0} 帧  ${(el / n).toFixed(2)} s/帧  剩余约 ${Math.round(el / n * (f1 - f - 1) / 60)} 分钟\n`); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close();
}
(async () => {
  const srv = await serve(); const base = `http://127.0.0.1:${srv.address().port}`;
  fs.mkdirSync(path.join(ROOT, 'final'), { recursive: true });
  if (PREVIEW) {
    const times = String(opt('times', '3,20,60')).split(',').map(Number); fs.mkdirSync(path.join(ROOT, 'preview'), { recursive: true });
    for (const ep of EPS) { const { br, pg } = await openPage(base, ep); for (const t of times) { await pg.evaluate(t => (window.renderScript || window.renderAt)(t), t); await pg.screenshot({ path: path.join(ROOT, 'preview', `ep${ep}_t${t}.jpg`), type: 'jpeg', quality: 85 }); console.log(`preview/ep${ep}_t${t}.jpg`); } await br.close(); }
    srv.close(); return;
  }
  for (const ep of EPS) {
    const T0 = Date.now(); const dir = path.join(ROOT, 'out', 'ep' + ep); fs.mkdirSync(dir, { recursive: true });
    const probe = await openPage(base, ep); let dur = await probe.pg.evaluate(() => window.DURATION); await probe.br.close();
    if (opt('seconds', 0)) dur = Math.min(dur, +opt('seconds'));  // 试渲染：只渲前 N 秒
    const N = Math.ceil(dur * FPS); console.log(`\n=== 第 ${ep} 集：${dur.toFixed(1)} 秒，${N} 帧，${WORKERS} 路并行 ===`);
    const parts = [];
    for (let k = 0; k < WORKERS; k++) { const a = Math.floor(N * k / WORKERS), b = Math.floor(N * (k + 1) / WORKERS); parts.push(renderPart(base, ep, a, b, path.join(dir, `part${k}.mp4`), `EP${ep}#${k}`)); }
    await Promise.all(parts);
    const list = path.join(dir, 'list.txt'); fs.writeFileSync(list, Array.from({ length: WORKERS }, (_, k) => `file 'part${k}.mp4'`).join('\n'));
    const video = path.join(dir, 'video.mp4'); await run(['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video]);
    const final = path.join(ROOT, 'final', `原子的精细结构_${NAMES[ep]}.mp4`);
    if (fs.existsSync(MUSIC)) {
      const fo = Math.max(0, dur - 6).toFixed(2);
      await run(['-y', '-loglevel', 'error', '-i', video, '-i', MUSIC, '-filter_complex', `[1:a]atrim=0:${dur.toFixed(2)},asetpts=PTS-STARTPTS,loudnorm=I=-19:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.5,afade=t=out:st=${fo}:d=6[a]`, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
    } else fs.copyFileSync(video, final);
    console.log(`✓ ${final}  （用时 ${Math.round((Date.now() - T0) / 60000)} 分钟）`);
  }
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });
