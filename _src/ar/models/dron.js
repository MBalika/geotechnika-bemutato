// Drónos lézerszkennelés → pontfelhő → digitális iker (Geoinformatika). Egy kisváros főtere dombos terepen: templom, házak, fák, út.
// A drón két sávban átrepül fölötte, a lézer letapogatja a felszínt, mögötte megjelenik a pontfelhő (a szín a magasság).
// Utána a „valódi” épületek eltűnnek: csak a digitális iker marad, majd visszajönnek. A pilóta távirányítóval, a földmérő GNSS-botallal.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackScale, spinTrack, person } from '../lib/common.js';
export const FILE = 'dron-pontfelho';
const K = 1 / 120;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1], SY0 = [1, 0.001, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'dron';
  const tracks = [], T = 22;
  const X0 = -32, X1 = 32, Z0 = -20, Z1 = 20, BOT = -5;
  const h = (x, z) => 1.4 * Math.sin(x / 11 + 0.6) * Math.cos(z / 9) + 0.5 * Math.sin(z / 6 + x / 15) + 1.2; // terepmagasság
  // ---- terep: magasságmezős felület + oldalfalak (talajtömb) ----
  const NX = 64, NZ = 40, pos = [], idx = [];
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const x = X0 + (X1 - X0) * i / NX, z = Z0 + (Z1 - Z0) * j / NZ; pos.push(x, h(x, z), z); }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); tg.setIndex(idx); tg.computeVertexNormals();
  const B = new Batch('terep'); B.add(tg, mat(C.grass));
  const side = (pts) => { const p = [], ix = []; pts.forEach(([x, z], k) => { p.push(x, h(x, z), z, x, BOT, z); if (k) { const a = 2 * (k - 1); ix.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(ix); g.computeVertexNormals(); B.add(g, mat(C.soilTop, { ds: true })); };
  const edge = (fx, n) => { const a = []; for (let i = 0; i <= n; i++) a.push(fx(i / n)); return a; };
  side(edge(t => [X0 + (X1 - X0) * t, Z1], NX)); side(edge(t => [X1 - (X1 - X0) * t, Z0], NX)); side(edge(t => [X1, Z1 - (Z1 - Z0) * t], NZ)); side(edge(t => [X0, Z0 + (Z1 - Z0) * t], NZ));
  B.box(X1 - X0, 0.3, Z1 - Z0, mat(C.soilTop), 0, BOT + 0.15, 0);
  // út a téren át (szalag a terepen)
  { const p = [], ix = []; for (let i = 0; i <= NX; i++) { const x = X0 + (X1 - X0) * i / NX, zc = 6 + 2 * Math.sin(x / 9); for (const dz of [-2.2, 2.2]) p.push(x, h(x, zc + dz) + 0.08, zc + dz); if (i) { const a = 2 * (i - 1); ix.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(ix); g.computeVertexNormals(); B.add(g, mat(C.asphalt, { ds: true })); }
  // ---- épületek és fák (külön csomópont: a digitális iker szakaszában eltűnnek) ----
  const real = node(root, 'valosag'); const RB = new Batch('epuletek');
  const houses = [[-20, -8, 9, 7, 6, '#f2d7b6', '#b5533c'], [-9, -10, 8, 7, 7, '#f4f3ef', '#a14b37'], [12, -9, 10, 7, 6, '#cfe3ef', '#7a3f30'], [22, -6, 7, 8, 8, '#f2e3a8', '#b5533c'], [-22, 12, 8, 6, 5, '#e9d2e4', '#8c4a3a'], [20, 13, 9, 6, 6, '#f4f3ef', '#a14b37']];
  const surf = []; // a pontfelhő mintavételi felületei: [p0, u, v, normál]
  for (const [x, z, w, d, hh, wc, rc] of houses) { const y0 = h(x, z) - 0.8; RB.boxB(w, hh + 0.8, d, mat(wc), x, y0, z); const rh = 3.2;
    const rg = new THREE.BufferGeometry(); const yt = y0 + hh + 0.8, ya = yt + rh, hw = w / 2 + 0.4, hd = d / 2 + 0.4;
    const rp = [-hw, yt, -hd, hw, yt, -hd, hw, ya, 0, -hw, ya, 0, -hw, yt, hd, hw, yt, hd]; const ri = [0, 2, 1, 0, 3, 2, 4, 5, 2, 4, 2, 3, 0, 4, 3, 1, 2, 5];
    rg.setAttribute('position', new THREE.Float32BufferAttribute(rp.map((v, k) => v + (k % 3 === 0 ? x : k % 3 === 2 ? z : 0)), 3)); rg.setIndex(ri);
    RB.add((() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(rp.map((v, k) => v + (k % 3 === 0 ? x : k % 3 === 2 ? z : 0)), 3)); g.setIndex(ri); const n = g.toNonIndexed(); n.computeVertexNormals(); return n; })(), mat(rc, { ds: true }));
    for (let f = 0; f < Math.floor(hh / 3); f++) for (let k = -1; k <= 1; k += 2) RB.box(1.2, 1.4, 0.1, mat(C.glassDark), x + k * w / 4, y0 + 0.8 + 1.4 + f * 3, z + d / 2 + 0.03);
    surf.push([[x - w / 2, y0 + 0.8, z + d / 2], [w, 0, 0], [0, hh, 0], [0, 0, 1]], [[x + w / 2, y0 + 0.8, z - d / 2], [0, 0, d], [0, hh, 0], [1, 0, 0]], [[x - w / 2, y0 + 0.8, z - d / 2], [w, 0, 0], [0, hh, 0], [0, 0, -1]], [[x - w / 2, y0 + 0.8, z - d / 2], [0, 0, d], [0, hh, 0], [-1, 0, 0]]);
    const nr = new THREE.Vector3(0, hw > 0 ? hd : 0, rh).normalize(); surf.push([[x - hw, yt, z + hd], [2 * hw, 0, 0], [0, rh, -hd], [0, nr.y, nr.z]], [[x - hw, yt, z - hd], [2 * hw, 0, 0], [0, rh, hd], [0, nr.y, -nr.z]]); }
  // templom toronnyal
  { const x = 2, z = -7, y0 = h(x, z) - 0.8; RB.boxB(9, 9.8, 16, mat('#f4f3ef'), x, y0, z); RB.boxB(5, 18.8, 5, mat('#f4f3ef'), x, y0, z + 9.5); RB.mesh(new THREE.ConeGeometry(3.6, 7, 4), mat('#5f7f6a'), [x, y0 + 18.8 + 3.5, z + 9.5], [0, Math.PI / 4, 0]);
    RB.mesh(new THREE.CylinderGeometry(0.06, 0.06, 2, 6), mat(C.yellow), [x, y0 + 26.5, z + 9.5]);
    const rg = new THREE.BufferGeometry(); const yt = y0 + 9.8, ya = yt + 4.5; const rp = [-5, yt, -8.4, 5, yt, -8.4, 0, ya, -8.4, -5, yt, 7, 5, yt, 7, 0, ya, 7].map((v, k) => v + (k % 3 === 0 ? x : k % 3 === 2 ? z : 0));
    rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); rg.setIndex([0, 1, 2, 3, 5, 4, 0, 2, 5, 0, 5, 3, 1, 4, 5, 1, 5, 2]); const rn = rg.toNonIndexed(); rn.computeVertexNormals(); RB.add(rn, mat('#8c4a3a', { ds: true }));
    for (let k = 0; k < 3; k++) RB.box(1.4, 3, 0.1, mat(C.glassDark), x - 4.55, y0 + 4.5, z - 4 + k * 4, [0, Math.PI / 2, 0]);
    surf.push([[x - 4.5, y0 + 0.8, z - 8], [0, 0, 16], [0, 9, 0], [-1, 0, 0]], [[x + 4.5, y0 + 0.8, z - 8], [0, 0, 16], [0, 9, 0], [1, 0, 0]], [[x - 2.5, y0 + 0.8, z + 12], [5, 0, 0], [0, 18, 0], [0, 0, 1]], [[x + 2.5, y0 + 9.8, z + 7], [0, 0, 5], [0, 9, 0], [1, 0, 0]], [[x - 2.5, y0 + 9.8, z + 7], [0, 0, 5], [0, 9, 0], [-1, 0, 0]]);
    surf.push([[x - 5, yt, z - 8.4], [0, 0, 15.4], [5, 4.5, 0], [-0.67, 0.74, 0]], [[x + 5, yt, z - 8.4], [0, 0, 15.4], [-5, 4.5, 0], [0.67, 0.74, 0]]); }
  const trees = [[-28, -15], [-14, -16], [-3, 3], [9, 2], [27, -15], [28, 3], [-27, 3], [-10, 15], [6, 16], [14, 1]];
  for (const [x, z] of trees) { const y0 = h(x, z); RB.cyl(0.3, 0.4, 3, mat(C.trunk), x, y0 + 1.5, z, [0, 0, 0], 6); RB.mesh(new THREE.IcosahedronGeometry(2.6, 0), mat(C.tree), [x, y0 + 4.6, z]); }
  RB.build(real);
  B.build(root);
  // ---- pontfelhő: splat-ok (kis négyzetek a felület normálisával), magasság szerinti színnel; sávonként jelennek meg ----
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pts = []; const add = (p, nrm) => pts.push([p, nrm]);
  for (let x = X0 + 0.5; x < X1; x += 1.1) for (let z = Z0 + 0.5; z < Z1; z += 1.1) { const xx = x + (rnd() - 0.5) * 0.5, zz = z + (rnd() - 0.5) * 0.5; add([xx, h(xx, zz) + 0.12, zz], [0, 1, 0]); }
  for (const [p0, u, v, n] of surf) { const lu = Math.hypot(...u), lv = Math.hypot(...v); const nu = Math.max(2, Math.round(lu / 0.95)), nv = Math.max(2, Math.round(lv / 0.95));
    for (let a = 0; a < nu; a++) for (let b = 0; b < nv; b++) { const s = (a + 0.5 + (rnd() - 0.5) * 0.4) / nu, t = (b + 0.5 + (rnd() - 0.5) * 0.4) / nv; add([p0[0] + u[0] * s + v[0] * t + n[0] * 0.12, p0[1] + u[1] * s + v[1] * t + n[1] * 0.12, p0[2] + u[2] * s + v[2] * t + n[2] * 0.12], n); } }
  for (const [x, z] of trees) { const c = [x, h(x, z) + 4.6, z]; for (let k = 0; k < 60; k++) { const th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1); const n = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)]; add([c[0] + n[0] * 2.5, c[1] + n[1] * 2.5, c[2] + n[2] * 2.5], n); } }
  const COLS = ['#3b5bdb', '#2f9be8', '#14c8c0', '#3fd06a', '#a8e03a', '#f5c518', '#f6891f', '#e8452c'];
  const cIdx = (y) => Math.max(0, Math.min(7, Math.floor((y + 0.5) / 26 * 8 * 1.15)));
  // repülési terv: 1. sáv z = −10 (x: −30 → 30), 2. sáv z = +10 (x: 30 → −30)
  const ALT = 30, P1 = [1.0, 6.5], P2 = [7.8, 13.3], XA = -30, XB = 30;
  const passT = (x, z) => z < 0 ? P1[0] + (x - XA) / (XB - XA) * (P1[1] - P1[0]) : P2[0] + (XB - x) / (XB - XA) * (P2[1] - P2[0]);
  const NB = 12, groups = new Map();
  for (const [p, n] of pts) { const bin = Math.max(0, Math.min(NB - 1, Math.floor((p[0] - X0) / (X1 - X0) * NB))), half = p[2] < 0 ? 0 : 1, key = half * NB + bin; if (!groups.has(key)) groups.set(key, []); groups.get(key).push([p, n]); }
  const splat = new THREE.PlaneGeometry(0.82, 0.82);
  for (const [key, arr] of groups) { const half = key >= NB ? 1 : 0, bin = key % NB; const xc = X0 + (bin + 0.5) * (X1 - X0) / NB; const t0 = Math.max(0.2, passT(xc, half ? 1 : -1));
    const g = node(root, 'pontok', [0, 0, 0]); const pb = new Batch('pf');
    for (const [p, n] of arr) { const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...n).normalize()); const e = new THREE.Euler().setFromQuaternion(q);
      pb.mesh(splat, mat(COLS[cIdx(p[1])], { em: COLS[cIdx(p[1])], ei: 0.45, ds: true, r: 0.6 }), p, [e.x, e.y, e.z]); }
    pb.build(g); tracks.push(trackScale(g, [0, t0, t0 + 0.35, T - 0.01, T], [S0, S0, S1, S1, S0])); }
  // a valóság eltűnik (digitális iker), majd visszajön
  tracks.push(trackScale(real, [0, 14.2, 15.2, 18.6, 19.6, T], [S1, S1, SY0, SY0, S1, S1]));
  // ---- drón: test, 4 forgó rotor, lézerkúp ----
  const drone = node(root, 'dron', [XA, ALT, -10]); const db = new Batch('dron');
  db.box(1.2, 0.4, 1.2, mat('#2a2f36'), 0, 0, 0); db.box(0.7, 0.25, 0.7, mat(SPEC.geoinf), 0, 0.3, 0); db.box(0.5, 0.45, 0.5, mat('#1b1f24'), 0, -0.4, 0);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { db.rod([0, 0, 0], [sx * 1.2, 0.1, sz * 1.2], 0.08, mat('#2a2f36')); db.cyl(0.12, 0.12, 0.3, mat('#2a2f36'), sx * 1.2, 0.15, sz * 1.2, [0, 0, 0], 8); }
  db.build(drone);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const r = node(drone, 'rotor', [sx * 1.2, 0.34, sz * 1.2]); const rb = new Batch('rotor'); rb.box(1.5, 0.03, 0.14, mat('#cfd6dd'), 0, 0, 0); rb.build(r); tracks.push(spinTrack(r, [0, 1, 0], 0.4, 3, T)); }
  const cone = node(drone, 'lezer', [0, -0.6, 0]); const DS = 2.2; drone.scale.setScalar(DS); const cm = new THREE.Mesh(new THREE.ConeGeometry(14 / DS, (ALT - 2) / DS, 4, 1, true), mat(SPEC.geoinf, { op: 0.16, em: SPEC.geoinf, ei: 0.6, ds: true })); cm.position.y = -(ALT - 2) / DS / 2; cm.rotation.y = Math.PI / 4; cm.name = 'lezerkup'; cone.add(cm);
  const dk = [[0, XA, -10], [P1[0], XA, -10], [P1[1], XB, -10], [P2[0], XB, 10], [P2[1], XA, 10], [16, -24, 14], [19.5, -24, 14], [T, XA, -10]];
  tracks.push(trackPos(drone, dk.map(a => a[0]), dk.map(a => [a[1], a[0] >= 16 && a[0] <= 19.5 ? ALT - 12 : ALT, a[2]])));
  tracks.push(trackScale(cone, [0, P1[0] - 0.2, P1[0], P1[1], P1[1] + 0.2, P2[0] - 0.2, P2[0], P2[1], P2[1] + 0.2, T], [S0, S0, S1, S1, S0, S0, S1, S1, S0, S0]));
  drone.position.set(XA, ALT, -10); cone.scale.set(...S0);
  // pilóta távirányítóval, földmérő GNSS-botokkal
  const PB = new Batch('emberek'); person(PB, -24, 17.5, Math.PI + 0.3, { tablet: true, y: h(-24, 17.5) }); person(PB, 16, 17, Math.PI - 0.4, { y: h(16, 17), vest: '#c6f432' });
  PB.rod([16.5, h(16, 17), 16.7], [16.5, h(16, 17) + 2.0, 16.7], 0.03, mat(C.yellow)); PB.cyl(0.14, 0.14, 0.12, mat('#20262e'), 16.5, h(16, 17) + 2.06, 16.7, [0, 0, 0], 12);
  PB.build(root);
  const clips = [new THREE.AnimationClip('szkenneles', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Drón lézerszkennerrel (LiDAR)' : 'Drone with laser scanner (LiDAR)', [XA, ALT, -10], [XA - 4, ALT + 7, 0], SPEC.geoinf, K);
    label(G, hu ? 'Pontfelhő: a szín a magasság' : 'Point cloud: colour = height', [2, 21, 2.5], [14, 30, 10], '#f6891f', K);
    label(G, hu ? 'Drónpilóta' : 'Drone pilot', [-24, h(-24, 17.5) + 1.9, 17.5], [-30, 10, 24], '#ff7a1a', K);
    label(G, hu ? 'GNSS-vevő:\ncentiméteres pontosság' : 'GNSS receiver:\ncentimetre accuracy', [16.5, h(16, 17) + 2.1, 16.7], [24, 12, 24], C.yellow, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 30], posterT: 16.5, labelT: T - 0.5 };
}
