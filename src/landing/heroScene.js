import * as THREE from 'three';
import { NOTE_LINES } from './guilloche.js';

function noteCanvas() {
  const c = document.createElement('canvas');
  c.width = 1120; c.height = 540;
  const x = c.getContext('2d');
  x.scale(2, 2);
  const rr = (px, py, w, h, r) => {
    x.beginPath(); x.moveTo(px + r, py);
    x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
    x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
  };
  rr(0, 0, 560, 270, 22); x.fillStyle = '#2b3fa0'; x.fill();
  x.save(); x.clip();
  NOTE_LINES.forEach((l) => { x.strokeStyle = l.stroke; x.lineWidth = l.w; x.stroke(new Path2D(l.d)); });
  x.restore();
  rr(10, 10, 540, 250, 14); x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 1; x.stroke();
  x.fillStyle = '#f2f4ff'; x.textBaseline = 'alphabetic';
  x.font = '500 15px "Instrument Sans", sans-serif'; x.fillText('Total balance', 30, 50);
  x.beginPath(); x.arc(507, 45, 23, 0, Math.PI * 2); x.fillStyle = '#e8a531'; x.fill();
  x.lineWidth = 5; x.strokeStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.arc(507, 45, 25.5, 0, Math.PI * 2); x.stroke();
  x.fillStyle = '#2a1d05'; x.font = '800 22px "Bricolage Grotesque", sans-serif'; x.textAlign = 'center'; x.fillText('F', 507, 53); x.textAlign = 'left';
  x.fillStyle = '#f2f4ff'; x.font = '700 58px "Bricolage Grotesque", sans-serif';
  const amt = '1\u202f240\u202f000'; x.fillText(amt, 30, 196);
  const wA = x.measureText(amt).width;
  x.font = '600 22px "Bricolage Grotesque", sans-serif'; x.globalAlpha = 0.85; x.fillText('F CFA', 30 + wA + 10, 196);
  x.globalAlpha = 0.82; x.font = '400 13px "Instrument Sans", sans-serif'; x.fillText('Main 940\u202f000 and Savings 300\u202f000', 30, 244);
  x.textAlign = 'right'; x.fillText('Updated just now', 530, 244); x.globalAlpha = 1;
  return c;
}

function coinCanvas() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(100, 96, 10, 128, 128, 128);
  g.addColorStop(0, '#f8d27a'); g.addColorStop(0.7, '#e3a531'); g.addColorStop(1, '#b97c14');
  x.fillStyle = g; x.beginPath(); x.arc(128, 128, 128, 0, Math.PI * 2); x.fill();
  x.strokeStyle = 'rgba(90,58,0,.35)'; x.lineWidth = 6; x.beginPath(); x.arc(128, 128, 112, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 2; x.beginPath(); x.arc(128, 128, 92, 0, Math.PI * 2); x.stroke();
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    x.beginPath(); x.moveTo(128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96); x.lineTo(128 + Math.cos(a) * 106, 128 + Math.sin(a) * 106);
    x.lineWidth = 1.5; x.stroke();
  }
  x.fillStyle = 'rgba(90,55,0,.72)'; x.font = '800 104px "Bricolage Grotesque", sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('F', 128, 134);
  return c;
}

function shadowCanvas(dark) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, dark ? 'rgba(0,0,0,.55)' : 'rgba(16,32,58,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return c;
}

const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
function bounceOut(p) {
  const n = 7.5625, d = 2.75;
  if (p < 1 / d) return n * p * p;
  if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
  if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
  return n * (p -= 2.625 / d) * p + 0.984375;
}
function backOut(p, c1 = 1.70158) { const c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }

/**
 * Mounts the 3D banknote and coins on the canvas.
 * Returns a cleanup function, or null when WebGL is unavailable (the flat card stays visible).
 */
export function mountHeroScene({ host, canvas, reduce, onIntroDone }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    if (!renderer.getContext()) throw new Error('no context');
  } catch {
    return null;
  }
  host.classList.add('gl');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, 0.68));
  const key = new THREE.DirectionalLight(0xffffff, 0.85); key.position.set(3, 4, 6); scene.add(key);
  const rim = new THREE.PointLight(0x93a4ff, 0.9, 20); rim.position.set(-4, 2, 3); scene.add(rim);
  const warm = new THREE.PointLight(0xffc766, 0.7, 15); warm.position.set(3, -3, 4); scene.add(warm);

  const rig = new THREE.Group(); scene.add(rig);
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const disposables = [];

  const nCanvas = noteCanvas();
  const noteTex = new THREE.CanvasTexture(nCanvas); noteTex.encoding = THREE.sRGBEncoding; noteTex.anisotropy = aniso;
  const W = 4.6;
  const noteGeo = new THREE.PlaneGeometry(W, (W * 270) / 560, 64, 32);
  const posAttr = noteGeo.attributes.position;
  const base = posAttr.array.slice();
  const noteMat = new THREE.MeshStandardMaterial({ map: noteTex, transparent: true, roughness: 0.6, metalness: 0.05, side: THREE.DoubleSide });
  const noteHolder = new THREE.Group(); noteHolder.add(new THREE.Mesh(noteGeo, noteMat));
  noteHolder.position.set(-0.25, 0.3, 0); noteHolder.rotation.z = -0.06; rig.add(noteHolder);

  const shTex = new THREE.CanvasTexture(shadowCanvas(dark));
  const shGeo = new THREE.PlaneGeometry(1, 1);
  const shMat = new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(shGeo, shMat);
  shadow.scale.set(5.2, 0.9, 1); shadow.position.set(-0.15, -1.55, -0.8); rig.add(shadow);

  const faceTex = new THREE.CanvasTexture(coinCanvas()); faceTex.encoding = THREE.sRGBEncoding; faceTex.anisotropy = aniso;
  const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 56);
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xc98a1a, metalness: 0.55, roughness: 0.32 });
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, metalness: 0.35, roughness: 0.38 });
  const mats = [edgeMat, faceMat, faceMat];
  disposables.push(noteTex, noteGeo, noteMat, shTex, shGeo, shMat, faceTex, coinGeo, edgeMat, faceMat);

  const stack = new THREE.Group(); stack.position.set(1.9, -1.3, 0.9); stack.rotation.set(0.42, -0.3, 0); rig.add(stack);
  const stackCoins = Array.from({ length: 6 }, (_, i) => {
    const m = new THREE.Mesh(coinGeo, mats);
    m.rotation.y = i * 1.3; m.visible = false; stack.add(m);
    return { m, y: i * 0.105, delay: 0.3 + i * 0.08 };
  });
  const floaters = [
    { x: -2.55, y: 1.5, z: 0.6, s: 0.72, spd: 0.9, ph: 0 },
    { x: 2.4, y: 1.55, z: -0.4, s: 0.58, spd: 1.25, ph: 2 },
    { x: -2.15, y: -1.45, z: 0.9, s: 0.52, spd: 1.05, ph: 4 },
  ].map((d, i) => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(coinGeo, mats); m.rotation.x = Math.PI / 2; g.add(m);
    g.position.set(d.x, d.y, d.z); g.scale.setScalar(0.0001); rig.add(g);
    return { g, d, delay: 0.75 + i * 0.1, angle: d.ph, lean: 0 };
  });

  // Strong response while the cursor moves, calm at rest
  let tx = 0, ty = 0, pxN = 0, scrollTilt = 0, energy = 0, lastMove = -1e9;
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    pxN = ((e.clientX - r.left) / r.width) * 2 - 1;
    const py = ((e.clientY - r.top) / r.height) * 2 - 1;
    ty = pxN * 0.6; tx = py * 0.36; lastMove = performance.now();
  };
  const onLeave = () => { tx = 0; ty = 0; pxN = 0; };
  const onScroll = () => { scrollTilt = Math.min(1, window.scrollY / 700) * 0.45; };
  if (!reduce) {
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function frame(t, dt, now) {
    const e = backOut(clamp((t - 0.05) / 0.6), 1.1);
    noteHolder.position.y = 0.3 + (1 - e) * 1.3;
    noteHolder.rotation.x = (1 - e) * -0.9;
    noteMat.opacity = clamp((t - 0.05) / 0.3);
    shMat.opacity = noteMat.opacity;

    const wt = reduce ? 0 : t;
    const arr = posAttr.array;
    for (let v = 0; v < arr.length; v += 3) {
      const bx = base[v], by = base[v + 1], nx = bx / W;
      arr[v + 2] = Math.sin(bx * 1.1 + wt * 0.8) * 0.035 + Math.sin(by * 1.8 + wt * 0.55) * 0.018 + nx * nx * 0.14;
    }
    posAttr.needsUpdate = true;
    noteGeo.computeVertexNormals();

    stackCoins.forEach((c) => {
      const q = clamp((t - c.delay) / 0.4);
      c.m.visible = t >= c.delay;
      c.m.position.y = c.y + (1 - bounceOut(q)) * 2.6;
    });

    energy += ((now - lastMove < 250 ? 1 : 0) - energy) * (reduce ? 1 : 0.08);
    floaters.forEach((f) => {
      f.g.scale.setScalar(Math.max(0.0001, backOut(clamp((t - f.delay) / 0.45)) * f.d.s));
      f.angle += dt * f.d.spd * (0.35 + energy * 3);
      f.g.rotation.y = reduce ? f.d.ph : f.angle;
      const away = f.d.x > pxN * 2.5 ? 1 : -1;
      f.lean += (away * 0.28 * energy - f.lean) * 0.1;
      f.g.position.x = f.d.x + f.lean;
      f.g.rotation.z = -f.lean * 0.9;
      f.g.position.y = f.d.y + (reduce ? 0 : Math.sin(t * 0.6 + f.d.ph) * 0.05);
    });

    rig.rotation.y += (ty - rig.rotation.y) * 0.12;
    rig.rotation.x += (tx + scrollTilt - rig.rotation.x) * 0.12;
    renderer.render(scene, camera);
  }

  function size() {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.z = Math.max(6.8 / (2 * tanH * camera.aspect), 4.9 / (2 * tanH));
    camera.updateProjectionMatrix();
    if (reduce) frame(10, 0, performance.now());
  }

  const start = performance.now();
  let last = start, visible = true, raf = null, disposed = false;
  const loop = (now) => {
    raf = null;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    frame((now - start) / 1000, dt, now);
    raf = requestAnimationFrame(loop);
  };
  const run = () => { if (!raf && !reduce && !disposed) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const onVisibility = () => { if (!document.hidden) run(); };

  let ro = null, io = null;
  if ('ResizeObserver' in window) { ro = new ResizeObserver(size); ro.observe(host); } else window.addEventListener('resize', size);
  size();
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) run(); });
    io.observe(host);
  }
  document.addEventListener('visibilitychange', onVisibility);

  if (reduce) frame(10, 0, performance.now()); else run();
  const introTimer = setTimeout(onIntroDone, reduce ? 0 : 1000);

  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load('700 58px "Bricolage Grotesque"'),
      document.fonts.load('800 22px "Bricolage Grotesque"'),
      document.fonts.load('500 15px "Instrument Sans"'),
    ]).then(() => {
      if (disposed) return;
      const ctx = nCanvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, nCanvas.width, nCanvas.height);
      ctx.drawImage(noteCanvas(), 0, 0);
      noteTex.needsUpdate = true;
      faceTex.image = coinCanvas(); faceTex.needsUpdate = true;
      if (reduce) frame(10, 0, performance.now());
    }).catch(() => {});
  }

  return () => {
    disposed = true;
    clearTimeout(introTimer);
    if (raf) cancelAnimationFrame(raf);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', size);
    document.removeEventListener('visibilitychange', onVisibility);
    if (ro) ro.disconnect();
    if (io) io.disconnect();
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    host.classList.remove('gl');
  };
}
