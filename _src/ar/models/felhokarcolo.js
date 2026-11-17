// Felhőkarcoló szélben, hangolt tömegcsillapítóval (Tartószerkezetek) – a szél lengésbe hozza a 300 m-es tornyot; a csúcsban
// függő óriás inga (TMD) előbb rögzítve van, majd „bekapcsolják”: az inga ellenfázisban leng, a torony kilengése a töredékére csökken.
// A kilengés szemléltetésre erősen felnagyítva.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackQuat } from '../lib/common.js';
export const FILE = 'felhokarcolo-tmd';
const K = 1 / 1000;

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'felhokarcolo';
  const B = new Batch('varos'); const tracks = [], T = 20, FPS = 15;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  // ---- város alap ----
  const L = 100; for (const [ya, yb, col] of [[-30, -12, C.clay], [-12, -4, C.gravel], [-4, 0, C.fill]]) box(B, mat(col), -L, L, ya, yb, -L, L);
  box(B, mat('#5a5f66'), -L, L, 0, 0.5, -L, L); // utcák
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const bc = ['#f4f3ef', '#dfe6ee', '#e8dccb', '#cfd8e3', '#f2e3c4', '#d9e6d2'];
  for (let i = -4; i < 4; i++) for (let j = -4; j < 4; j++) { const x0 = i * 25 + 3, z0 = j * 25 + 3; if (Math.abs(x0 + 9.5) < 30 && Math.abs(z0 + 9.5) < 30) continue;
    if ((i * 7 + j * 3) % 9 === 0) { box(B, mat(C.grass), x0, x0 + 19, 0.5, 1.0, z0, z0 + 19); for (let k = 0; k < 3; k++) { const tx = x0 + 4 + rnd() * 11, tz = z0 + 4 + rnd() * 11; B.cyl(0.6, 0.8, 4, mat(C.trunk), tx, 3, tz, [0, 0, 0], 6); B.mesh(new THREE.IcosahedronGeometry(4, 0), mat(C.tree), [tx, 8, tz]); } continue; }
    for (const [dx, dz] of [[0, 0], [10, 0], [0, 10], [10, 10]]) { const hh = 8 + rnd() * (Math.hypot(i, j) < 3 ? 55 : 30); B.boxB(8.5, hh, 8.5, mat(bc[Math.floor(rnd() * bc.length)]), x0 + dx + 4.5, 0.5, z0 + dz + 4.5); } }
  box(B, mat('#d9d6cf'), -26, 26, 0.5, 1.2, -26, 26); // tér a torony körül
  for (const [x, z] of [[-20, 20], [20, 20], [-20, -20], [20, -20], [0, 22], [22, 0]]) { B.cyl(0.6, 0.8, 4, mat(C.trunk), x, 3, z, [0, 0, 0], 6); B.mesh(new THREE.IcosahedronGeometry(3.4, 0), mat(C.tree), [x, 7.5, z]); }
  B.build(root);
  // ---- a lengés (egyszerű modell): kilengés a csúcson, rögzített, majd bekapcsolt TMD ----
  const w = 2 * Math.PI / 4.2, tOn = 9.5, A0 = 22, A1 = 4, R0 = 7.5;
  const Au = (t) => t < 1 ? A0 * t : t < tOn ? A0 : A1 + (A0 - A1) * Math.exp(-(t - tOn) / 1.3);
  const u = (t) => Au(t) * Math.sin(w * t); // a csúcs kilengése (m)
  const r = (t) => t < tOn ? 0 : R0 * Math.min(1, (t - tOn) / 1.4) * Math.sin(w * t - Math.PI / 2 - Math.PI / 2); // az inga a toronyhoz képest, ellenfázisban
  const times = []; for (let i = 0; i <= T * FPS; i++) times.push(i / FPS);
  // ---- a torony: 10 szegmens, mindegyik dől és eltolódik (konzol alakú lengés) ----
  const H = 300, N = 10, SH = H / N, Y0 = 1.2; const phi = (y) => Math.pow(y / H, 2);
  const glass = mat('#7fa6c8', { r: 0.18, m: 0.25 }), fin = mat('#e9edf1'), acc = mat(SPEC.tart);
  const width = (y) => 44 - 16 * (y / H); // enyhén karcsúsodik
  for (let i = 0; i < N; i++) { const ya = i * SH, yb = ya + SH, wa = width(ya), wb = width(yb), wm = (wa + wb) / 2;
    const n = node(root, 'torony', [0, Y0 + ya, 0]); const b = new Batch('t');
    b.mesh(new THREE.CylinderGeometry(wb / Math.SQRT2, wa / Math.SQRT2, SH, 4, 1, i === N - 1), i === N - 1 ? mat('#9cc2e0', { op: 0.32, r: 0.1, ds: true }) : glass, [0, SH / 2, 0], [0, Math.PI / 4, 0]);
    for (let f = 0; f < SH; f += 6) b.mesh(new THREE.CylinderGeometry(width(ya + f) / Math.SQRT2 + 0.6, width(ya + f) / Math.SQRT2 + 0.6, 0.8, 4, 1), fin, [0, f + 0.4, 0], [0, Math.PI / 4, 0]);
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) b.rod([sx * wa / 2, 0, sz * wa / 2], [sx * wb / 2, SH, sz * wb / 2], 1.4, acc, 6);
    if (i === N - 1) { // a csúcsszint: elöl nyitott „kirakat”, benne az inga
      b.mesh(new THREE.CylinderGeometry(wb / Math.SQRT2 + 1, wb / Math.SQRT2 + 1, 2, 4, 1), fin, [0, SH + 1, 0], [0, Math.PI / 4, 0]);
      b.mesh(new THREE.CylinderGeometry(0.8, 1.6, 40, 8), mat(C.steel, { m: 0.5, r: 0.4 }), [0, SH + 22, 0]); }
    b.build(n);
    tracks.push(trackPos(n, times, times.map(t => [u(t) * phi(ya), Y0 + ya, 0])), trackQuat(n, times, times.map(t => [0, 0, -Math.atan2(u(t) * (phi(yb) - phi(ya)), SH)]))); }
  // ---- az inga: arany gömb kötélen; a csúcs belsejében függ, kívülről a „kirakaton” át látszik ----
  const yP = Y0 + H - 2, LP = 16; // felfüggesztési pont és kötélhossz
  const pend = node(root, 'inga', [0, yP, 0]); const pb = new Batch('inga');
  pb.mesh(new THREE.SphereGeometry(6.2, 20, 14), mat('#e2b53b', { m: 0.7, r: 0.25 }), [0, -LP, 0]);
  for (const a of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) pb.rod([Math.cos(a) * 1.2, 0, Math.sin(a) * 1.2], [Math.cos(a) * 2.5, -LP + 3.5, Math.sin(a) * 2.5], 0.35, mat(C.dark));
  pb.build(pend);
  tracks.push(trackPos(pend, times, times.map(t => [u(t) * phi(H - 2), yP, 0])), trackQuat(pend, times, times.map(t => [0, 0, Math.asin(Math.max(-0.6, Math.min(0.6, r(t) / LP)))])));
  // ---- szél: fehér csíkok fújnak át balról jobbra ----
  for (let k = 0; k < 22; k++) { const y = 40 + rnd() * 290, z = -60 + rnd() * 120, len = 16 + rnd() * 18, ph = rnd();
    const nd = node(root, 'szel'); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, len, 5), mat('#ffffff', { op: 0.55, em: '#ffffff', ei: 0.3 })); m.rotation.z = Math.PI / 2; m.name = 'szelcsik'; nd.add(m);
    const xa = -110, xb = 110, per = T / (6 + Math.floor(rnd() * 4)); const xs = (t) => xa + (xb - xa) * (((t / per) + ph) % 1);
    const tt = [0], vv = [xs(0)]; for (let c = (1 - ph) * per; c < T - 0.01; c += per) { tt.push(c - 0.001, c); vv.push(xb, xa); } tt.push(T); vv.push(xs(0));
    tracks.push(trackPos(nd, tt, vv.map(x => [x, y, z])));
    nd.position.set(xs(0), y, z); }
  const clips = [new THREE.AnimationClip('szel', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Hangolt tömegcsillapító:\nóriás inga a csúcsban' : 'Tuned mass damper:\na giant pendulum at the top', [0, yP - LP, 0], [70, yP - 10, 40], '#e2b53b', K);
    label(G, hu ? 'A szél lengésbe hozza\na 300 m-es tornyot' : 'Wind makes the\n300 m tower sway', [-60, 230, 0], [-95, 260, 30], '#9fb7cc', K);
    label(G, hu ? 'Vasbeton mag, acél\nsarokoszlopok' : 'Concrete core,\nsteel corner columns', [16, 120, 16], [70, 140, 50], SPEC.tart, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 14], posterT: 5.25, labelT: 16 };
}
