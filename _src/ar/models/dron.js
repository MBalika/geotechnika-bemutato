// Drónos lézerszkennelés → pontfelhő → digitális iker (Geoinformatika): a Műegyetem K épületének Duna-parti főhomlokzata a rakparttal.
// Az épület bal fele a valódi épület, a jobb fele pontfelhő (a szín a magasság). Animáció (22 s): a drón végigrepül a homlokzat előtt,
// a lézer letapogatja az épület jobb felét, mögötte megjelenik a pontfelhő; utána a valódi épületfél eltűnik (digitális iker), majd visszajön.
// Elrendezés légifénykép szerint: homlokzat – előkert fákkal – parkoló – Műegyetem rakpart – alsó rakpart – Duna. Az épület hátsó része
// (udvarok, hátsó szárny) a modell szélén le van vágva. K épület: Hauszmann Alajos, 1906–1909 (budapest100.hu).
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackScale, spinTrack, person } from '../lib/common.js';
import { at, sideExtrude, car2, tree2, lamp, plaque } from '../lib/kit2.js';
import { kBuilding, clipBatch } from '../lib/bme.js';
export const FILE = 'dron-pontfelho';
const K = 1 / 300;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1], SY0 = [1, 0.001, 1];

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'dron';
  const tracks = [], T = 22, B = new Batch('terep');
  const X0 = -125, X1 = 125, Z0 = -60, Z1 = 96, YB = -16, G0 = 0.15, UQ = 53, LQ1 = 61, LQY = -3.5, WL = -6.5, BED = -12;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  // ---- talajtömb, Duna, rakpart ----
  for (const [la, lb, col] of [[0, -4, '#a08d77'], [-4, -12, C.gravel], [-12, YB, '#77706a']]) { box(B, mat(col), X0, X1, lb, la, Z0, UQ); box(B, mat(col), X0, X1, lb, Math.min(la, LQY), UQ, LQ1); box(B, mat(col), X0, X1, lb, Math.min(la, BED), LQ1, Z1); }
  box(B, mat(C.water, { op: 0.8, r: 0.15 }), X0, X1, BED, WL, LQ1, Z1); B.mesh(sideExtrude([[0, LQY], [11, BED], [0, BED]], X1 - X0 - 0.1).rotateY(-Math.PI / 2), mat('#a39e93', { r: 1 }), [0, 0, LQ1]);
  const pav = mat('#d3cdbf', { r: 0.95 }), asp = mat('#4a4e55', { r: 0.95 }), white = mat('#eeeeea'), grs = mat('#8fbf6a', { r: 1 });
  box(B, pav, X0, X1, 0, G0, Z0, UQ); box(B, grs, X0, X1, G0, G0 + 0.12, 3, 25); for (const x of [-60, 0, 60]) box(B, pav, x - 3, x + 3, G0, G0 + 0.14, 3, 25); box(B, pav, -16, 16, G0, G0 + 0.14, 10, 25);
  box(B, asp, X0, X1, G0, G0 + 0.1, 28, 39); for (let x = X0 + 3; x < X1 - 2; x += 2.7) { box(B, white, x - 0.06, x + 0.06, G0 + 0.1, G0 + 0.12, 28.3, 32.8); box(B, white, x - 0.06, x + 0.06, G0 + 0.1, G0 + 0.12, 34.2, 38.7); }
  box(B, asp, X0, X1, G0, G0 + 0.12, 41, 50); for (let x = X0 + 4; x < X1 - 3; x += 8) box(B, white, x, x + 3, G0 + 0.12, G0 + 0.14, 45.4, 45.6);
  box(B, mat('#cfc6b4', { r: 0.95 }), X0, X1, LQY, 1.2, UQ, UQ + 0.6); box(B, asp, X0, X1, LQY, LQY + 0.12, UQ + 0.6, LQ1 - 0.8); box(B, mat('#cfc6b4'), X0, X1, LQY, LQY + 0.35, LQ1 - 0.8, LQ1);
  for (let x = X0 + 8; x < X1; x += 14) { tree2(B, x, 7 + (x * 7 % 5), 9 + (x * 3 % 3), G0); if (Math.abs(x) > 20) tree2(B, x + 6, 19 + (x * 5 % 4), 10, G0); lamp(B, x + 3, 51.6, G0, 7); }
  const cc = ['#c8ccd0', '#b33a2e', '#2f6db5', '#3a3f46', '#e9ecef', '#7b8894']; let ci = 0;
  for (let x = X0 + 4.4; x < X1 - 3; x += 2.7) { if ((ci * 7) % 5 < 2) car2(at(B, x, G0 + 0.1, 30.6, Math.PI / 2), cc[ci % 6], { lite: true }); if ((ci * 3) % 7 < 2) car2(at(B, x, G0 + 0.1, 36.4, -Math.PI / 2), cc[(ci + 2) % 6], { lite: true }); ci++; }
  for (const [x, z, r, c] of [[-70, 43, 0, '#b33a2e'], [-20, 43, 0, '#e9ecef'], [48, 47.6, Math.PI, '#2f6db5'], [96, 47.6, Math.PI, '#3a3f46'], [-40, UQ + 4, 0, '#7b8894']]) car2(at(B, x, (z > UQ ? LQY : G0) + 0.12, z, r), c, { lite: true });
  for (const [x, z, r, v] of [[-8, 18, 1, '#3a5f8a'], [4, 20, 2.5, '#b33a2e'], [-30, 26.5, 0.5, '#5a6a3a'], [40, 26.3, 4, '#8a5a3a'], [70, 52, 1.5, '#6a4a8a'], [-90, 26.4, 2, '#c98a2e']]) person(B, x, z, r, { y: G0, vest: v, helmet: '#5a4632', shirt: v });
  B.build(root);
  // ---- a K épület: bal fele valódi (marad), jobb fele valódi (az iker szakaszában eltűnik) + pontfelhő ----
  const KL = new Batch('k_bal'), KR = new Batch('k_jobb'); kBuilding(at(KL, 0, G0, 0), { back: -Z0 }); kBuilding(at(KR, 0, G0, 0), { back: -Z0 }); clipBatch(KL, 0, 0, true); clipBatch(KR, 0, 0, false);
  // a pontfelhő mintavétele a jobb fél háromszögeiről (felületarányosan), a lefelé néző lapok nélkül
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, pts = [];
  for (const [, gs] of KR.parts) for (const g of gs) { const p = g.attributes.position.array; for (let i = 0; i < p.length; i += 9) { const a = new THREE.Vector3(p[i], p[i + 1], p[i + 2]), b = new THREE.Vector3(p[i + 3], p[i + 4], p[i + 5]), c = new THREE.Vector3(p[i + 6], p[i + 7], p[i + 8]);
        const n = b.clone().sub(a).cross(c.clone().sub(a)), ar = n.length() / 2; if (ar < 1e-4) continue; n.normalize(); if (n.y < -0.3) continue; let k = ar / 4.2; k = Math.floor(k) + (rnd() < k % 1 ? 1 : 0);
        for (let j = 0; j < k; j++) { let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; } const q = a.clone().addScaledVector(b.clone().sub(a), u).addScaledVector(c.clone().sub(a), v).addScaledVector(n, 0.25); pts.push([[q.x, q.y, q.z], [n.x, n.y, n.z]]); } } }
  const real = node(root, 'valosag'); KR.build(real); const gl = new THREE.Group(); gl.name = 'k_bal'; root.add(gl); KL.build(gl);
  const COLS = ['#3b5bdb', '#2f9be8', '#14c8c0', '#3fd06a', '#a8e03a', '#f5c518', '#f6891f', '#e8452c'], cIdx = (y) => Math.max(0, Math.min(7, Math.floor(y / 30 * 8)));
  // repülés: a homlokzat előtt, a jobb fél fölött oda-vissza (két sáv)
  const ALT = 46, P1 = [1.5, 7], P2 = [8, 13.5], XA = 2, XB = 112, ZD1 = 24, ZD2 = -14;
  const NB = 12, groups = new Map(), splat = new THREE.PlaneGeometry(1.9, 1.9);
  for (const [p, n] of pts) { const bin = Math.max(0, Math.min(NB - 1, Math.floor((p[0] - XA) / (XB - XA) * NB))), half = (p[2] > -8 && n[1] < 0.6) ? 0 : 1, key = half * NB + bin; if (!groups.has(key)) groups.set(key, []); groups.get(key).push([p, n]); }
  for (const [key, arr] of groups) { const half = key >= NB ? 1 : 0, bin = key % NB, f = (bin + 0.5) / NB, t0 = half ? P2[0] + (1 - f) * (P2[1] - P2[0]) : P1[0] + f * (P1[1] - P1[0]);
    const g = node(root, 'pontok', [0, 0, 0]), pb = new Batch('pf');
    for (const [p, n] of arr) { const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...n)), e = new THREE.Euler().setFromQuaternion(q); const col = COLS[cIdx(p[1])]; pb.mesh(splat, mat(col, { em: col, ei: 0.45, ds: true, r: 0.6 }), p, [e.x, e.y, e.z]); }
    pb.build(g); tracks.push(trackScale(g, [0, t0, t0 + 0.35, T - 0.01, T], [S0, S0, S1, S1, S0])); }
  tracks.push(trackScale(real, [0, 14.2, 15.2, 19.2, 20.2, T], [S1, S1, SY0, SY0, S1, S1])); real.scale.set(...SY0);
  // ---- drón: test, 4 forgó rotor, lézerkúp ----
  const drone = node(root, 'dron', [XA, ALT, ZD1]), db = new Batch('dron');
  db.box(1.2, 0.4, 1.2, mat('#2a2f36'), 0, 0, 0); db.box(0.7, 0.25, 0.7, mat(SPEC.geoinf), 0, 0.3, 0); db.box(0.5, 0.45, 0.5, mat('#1b1f24'), 0, -0.4, 0);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { db.rod([0, 0, 0], [sx * 1.2, 0.1, sz * 1.2], 0.08, mat('#2a2f36')); db.cyl(0.12, 0.12, 0.3, mat('#2a2f36'), sx * 1.2, 0.15, sz * 1.2, [0, 0, 0], 8); }
  db.build(drone);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const r = node(drone, 'rotor', [sx * 1.2, 0.34, sz * 1.2]), rb = new Batch('rotor'); rb.box(1.5, 0.03, 0.14, mat('#cfd6dd'), 0, 0, 0); rb.build(r); tracks.push(spinTrack(r, [0, 1, 0], 0.4, 3, T)); }
  const cone = node(drone, 'lezer', [0, -0.6, 0]), DS = 4.5; drone.scale.setScalar(DS); const cm = new THREE.Mesh(new THREE.ConeGeometry(22 / DS, (ALT - 2) / DS, 4, 1, true), mat(SPEC.geoinf, { op: 0.16, em: SPEC.geoinf, ei: 0.6, ds: true })); cm.position.y = -(ALT - 2) / DS / 2; cm.rotation.y = Math.PI / 4; cm.name = 'lezerkup'; cone.add(cm);
  const dk = [[0, XA, ZD1], [P1[0], XA, ZD1], [P1[1], XB, ZD1], [P2[0], XB, ZD2], [P2[1], XA, ZD2], [15.5, 40, 34], [19.5, 40, 34], [T, XA, ZD1]];
  tracks.push(trackPos(drone, dk.map(a => a[0]), dk.map(a => [a[1], a[0] >= 15.5 && a[0] <= 19.5 ? ALT - 14 : ALT, a[2]])));
  tracks.push(trackScale(cone, [0, P1[0] - 0.2, P1[0], P1[1], P1[1] + 0.2, P2[0] - 0.2, P2[0], P2[1], P2[1] + 0.2, T], [S0, S0, S1, S1, S0, S0, S1, S1, S0, S0]));
  drone.position.set(40, ALT - 14, 34); cone.scale.set(...S0);
  // pilóta távirányítóval, földmérő GNSS-bottal az előkertben
  const PB = new Batch('emberek'); person(PB, 30, 22, Math.PI + 0.3, { tablet: true, y: G0 + 0.12 }); person(PB, 62, 21, Math.PI - 0.4, { y: G0 + 0.14, vest: '#c6f432' });
  PB.rod([62.6, G0, 20.7], [62.6, G0 + 2.0, 20.7], 0.04, mat(C.yellow)); PB.cyl(0.16, 0.16, 0.14, mat('#20262e'), 62.6, G0 + 2.07, 20.7, [0, 0, 0], 12); PB.build(root);
  plaque(root, hu ? 'BME K épület · Műegyetem rakpart, Budapest' : 'BME “K” building · Műegyetem rakpart, Budapest', X0 + 3, YB + 1.5, Z1 + 0.05, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('szkenneles', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu';
    label(G, h ? 'Drón lézerszkennerrel (LiDAR)' : 'Drone with laser scanner (LiDAR)', [40, ALT - 14, 34], [70, ALT + 8, 44], SPEC.geoinf, K);
    label(G, h ? 'Pontfelhő: a szín a magasság' : 'Point cloud: colour = height', [70, 22, 0.5], [96, 44, 20], '#f6891f', K);
    label(G, h ? 'A Műegyetem K épülete\n(Hauszmann Alajos, 1909)' : 'The “K” building of BME\n(Alajos Hauszmann, 1909)', [-60, 25, -2], [-118, 46, 10], '#a9553c', K);
    label(G, h ? 'Drónpilóta' : 'Drone pilot', [30, G0 + 2, 22], [10, -8, Z1 + 6], '#ff7a1a', K);
    label(G, h ? 'GNSS-vevő:\ncentiméteres pontosság' : 'GNSS receiver:\ncentimetre accuracy', [62.6, G0 + 2.1, 20.7], [70, -10, Z1 + 6], C.yellow, K);
    label(G, h ? 'Duna' : 'Danube', [-100, WL, 86], [-104, 12, 92], C.waterDeep, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [18, 26], posterT: 17, labelT: 17 };
}
