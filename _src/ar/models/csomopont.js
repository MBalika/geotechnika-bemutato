// Autópálya-csomópont – lóhere (Közlekedési létesítmények): a 2 × 3 sávos autópálya alatt, a főút hídon fölötte;
// négy hurokág köti össze őket. Forgalom mindenhol: az autópályán, a hídon, és a hurokágakon kanyarodó autók.
import { THREE, Batch, mat, C, SPEC, tree, carGeom, label, node, trackPos, trackQuat, trackScale } from '../lib/common.js';
export const FILE = 'autopalya-csomopont';
const K = 1 / 600;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'csomopont';
  const B = new Batch('taj'); const tracks = [], T = 24, FPS = 8;
  const X = 136, Z = 108, RY = 8.5, RW = 9; // a főút a hídon RY magasan, félszélessége RW
  for (const [ya, yb, col] of [[-14, -6, C.clay], [-6, -1.5, C.gravel], [-1.5, 0, C.fill]]) B.box(2 * X, yb - ya, 2 * Z, mat(col), 0, (ya + yb) / 2, 0);
  B.box(2 * X, 0.3, 2 * Z, mat(C.grass), 0, 0.15, 0);
  // szalag egy útvonal mentén: pts = [[x, y, z], …], szélesség w; oldalt rézsű a terepig
  const ribbon = (pts, w, m, skirt = true) => { const p = [], ix = [], sp = [], si = []; let k = 0;
    for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1; const nx = -dz / L, nz = dx / L; const [x, y, z] = pts[i];
      p.push(x + nx * w / 2, y, z + nz * w / 2, x - nx * w / 2, y, z - nz * w / 2); if (i) { const q = 2 * (i - 1); ix.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
      if (skirt && y > 0.6) { const e = Math.min(2.2 * y, 22); for (const s of [1, -1]) { sp.push(x + s * nx * w / 2, y - 0.05, z + s * nz * w / 2, x + s * nx * (w / 2 + e), 0.3, z + s * nz * (w / 2 + e)); } } else for (let r = 0; r < 4; r++) sp.push(x, -1, z);
      if (i) { const q = 4 * (i - 1); si.push(q, q + 4, q + 1, q + 1, q + 4, q + 5, q + 2, q + 3, q + 6, q + 3, q + 7, q + 6); } k++; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(ix); g.computeVertexNormals(); B.add(g, m);
    if (skirt) { const s = new THREE.BufferGeometry(); s.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); s.setIndex(si); s.computeVertexNormals(); B.add(s, mat('#9fbf6e', { ds: true })); } };
  const asph = mat(C.asphalt, { ds: true }), white = mat(C.white);
  // autópálya: két pálya, középen elválasztó
  for (const s of [-1, 1]) B.box(2 * X, 0.3, 12, asph, 0, 0.45, s * 7.5);
  B.box(2 * X, 0.9, 1.2, mat(C.concrete), 0, 0.75, 0);
  for (const s of [-1, 1]) for (const dz of [-2, 2]) for (let x = -X + 4; x < X; x += 12) B.box(5, 0.05, 0.3, white, x, 0.62, s * 7.5 + dz);
  // főút: rámpa-töltés, híd, rámpa-töltés
  const yR = (z) => { const a = Math.abs(z); return a < 26 ? RY : a > 95 ? 0.6 : 0.6 + (RY - 0.6) * (1 - (a - 26) / 69); };
  const road = []; for (let z = -Z; z <= Z; z += 3) road.push([0, yR(z) + 0.3, z]); ribbon(road.filter(p => Math.abs(p[2]) >= 24), 2 * RW, asph);
  B.box(2 * RW, 1.4, 52, mat(C.concrete), 0, RY - 0.4, 0); B.box(2 * RW, 0.3, 52, asph, 0, RY + 0.45, 0);
  for (const s of [-1, 1]) { B.box(0.5, 1.1, 52, mat(C.concrete), s * (RW - 0.25), RY + 1.1, 0); B.boxB(2 * RW - 2, RY - 1.1, 2.2, mat(C.concreteDark), 0, 0.3, s * 15.5); B.boxB(2 * RW + 2, RY - 0.4, 4, mat(C.concreteDark), 0, 0.3, s * 25); }
  for (const s of [-1, 1]) for (let z = -Z + 4; z < Z; z += 10) B.box(0.3, 0.05, 4.5, white, 0, yR(z) + 0.48, z);
  // négy hurokág (270°-os ív), 4-szeres szimmetriával; az autópálya felől emelkednek a főút szintjére
  const R = 30, rot = (k, [x, y, z]) => { const a = -k * Math.PI / 2, c = Math.cos(a), s = Math.sin(a); return [x * c - z * s, y, x * s + z * c]; };
  const YL = yR(12 + R); // a hurok főúti vége ilyen magasan van
  const loopPts = (k, n = 60) => { const cx = 12 + R, cz = 12 + R, pts = []; for (let i = 0; i <= n; i++) { const f = i / n, th = -Math.PI / 2 + f * 1.5 * Math.PI; // (cx, 12)-ből indul, +x irányban
      const g = k % 2 ? 1 - f : f; pts.push(rot(k, [cx + R * Math.cos(th), 0.9 + (YL - 0.6) * Math.pow(g, 1.4), cz + R * Math.sin(th)])); } return pts; };
  for (let k = 0; k < 4; k++) { ribbon(loopPts(k), 7, asph); if (k % 2 === 0) ribbon([[12 + R - 55, 0.6, 15], [12 + R - 20, 0.6, 14.2], [12 + R, 0.6, 12.6]].map(p => rot(k, p)), 6, asph, false); }
  // fák, zajvédő fal, benzinkút
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) { const x = (rnd() * 2 - 1) * (X - 6), z = (rnd() * 2 - 1) * (Z - 6); if (Math.abs(z) < 26 || Math.abs(x) < 26) continue; const inLoop = [[1, 1], [1, -1], [-1, 1], [-1, -1]].some(([sx, sz]) => Math.hypot(x - sx * (12 + R), z - sz * (12 + R)) < R + 12); if (inLoop && rnd() < 0.7) continue; tree(B, x, z, 7 + rnd() * 4, 0.3); }
  for (const s of [-1, 1]) B.boxB(110, 3.2, 0.4, mat('#7aa66b'), s * 95, 0.3, s * 18.5);
  B.build(root);
  // ---- forgalom ----
  const cols = ['#e0523f', '#2f6db5', '#f4c430', '#f4f3ef', '#3a3f46', '#7bb662', '#ff8a3d', '#b48cff'];
  let ci = 0; const times = []; for (let i = 0; i <= T * FPS; i++) times.push(i / FPS);
  const yaw = (dx, dz) => Math.atan2(-dz, dx);
  const along = (pts) => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2])); return { cum, L: cum[cum.length - 1], at: (s) => { s = Math.max(0, Math.min(cum[cum.length - 1], s)); let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const f = (s - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); const a = pts[i - 1], b = pts[i]; return { p: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f], h: yaw(b[0] - a[0], b[2] - a[2]) }; } }; };
  const car = (truck) => { const n = node(root, truck ? 'kamion' : 'auto'); if (truck) { const tb = new Batch('kamion'); tb.boxB(12, 3.4, 2.5, mat('#e9ecef'), -1.5, 0.9, 0); tb.boxB(2.6, 2.8, 2.5, mat(cols[ci % cols.length]), 5.8, 0.9, 0); for (const x of [-6, -3.5, 5.5]) for (const z of [-1.1, 1.1]) tb.cyl(0.5, 0.5, 0.35, mat(C.dark), x, 0.5, z, [Math.PI / 2, 0, 0], 10); tb.build(n); } else n.add(carGeom(cols[ci % cols.length])); ci++; return n; };
  // folyamatos körforgás egy útvonalon (ugrással a végén): v sebesség, ph fázis
  const loopRun = (path, v, ph, truck) => { const P = along(path), per = P.L / v; const n = car(truck); const pos = [], q = [], sc = [];
    for (const t of times) { const f = ((t / per) + ph) % 1, r = P.at(f * P.L); pos.push(r.p); q.push([0, r.h, 0]); const edge = Math.min(f, 1 - f) * P.L; sc.push(edge < 4 ? [Math.max(0.001, edge / 4), Math.max(0.001, edge / 4), Math.max(0.001, edge / 4)] : S1); }
    tracks.push(trackPos(n, times, pos), trackQuat(n, times, q), trackScale(n, times, sc)); n.position.set(...pos[0]); };
  // a periódusokat a klip hosszához igazítjuk (hurok nélküli ismétlés)
  const vFit = (L, v) => L / (T / Math.max(1, Math.round(T / (L / v))));
  for (const s of [1, -1]) for (const [lz, v] of [[3.5, 30], [7.5, 26], [11.5, 22]]) { const path = s > 0 ? [[-X + 2, 0.6, s * lz], [X - 2, 0.6, s * lz]] : [[X - 2, 0.6, s * lz], [-X + 2, 0.6, s * lz]]; const L = 2 * X - 4;
    for (let j = 0; j < 3; j++) loopRun(path, vFit(L, v), j / 3 + lz * 0.07, lz === 11.5 && j === 1); }
  for (const s of [1, -1]) for (const lx of [3, 6.5]) { const path = []; for (let z = -Z + 2; z <= Z - 2; z += 3) path.push([s * lx, yR(z) + 0.6, z]); if (s > 0) path.reverse(); /* jobbkéz-szabály: x > 0 oldalon észak felé (−z) */ const L = along(path).L; for (let j = 0; j < 2; j++) loopRun(path, vFit(L, 18), j / 2 + lx * 0.1, false); }
  const hy = (p) => Math.abs(p[0]) < RW + 0.5 ? yR(p[2]) + 0.6 : 0.6; // a felület magassága egy pontban (főút vagy autópálya)
  for (let k = 0; k < 4; k++) { const pre = rot(k, [12 + R - 50, 0, 12.5]), pre2 = rot(k, [12 + R - 8, 0, 12.5]), post = rot(k, [12, 0, 12 + R - 22]);
    const path = [[pre[0], hy(pre), pre[2]], [pre2[0], hy(pre2), pre2[2]], ...loopPts(k).map(p => [p[0], p[1] + 0.3, p[2]]), [post[0], hy(post), post[2]]];
    const L = along(path).L; loopRun(path, vFit(L, 14), k * 0.27, false); }
  const clips = [new THREE.AnimationClip('forgalom', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Autópálya: 2 × 3 sáv' : 'Motorway: 2 × 3 lanes', [-110, 1, 7.5], [-130, 16, 40], C.asphalt, K);
    label(G, hu ? 'Híd: a főút az autópálya fölött' : 'Bridge: the main road crosses over', [0, RY + 1, 20], [30, RY + 22, 60], C.concrete, K);
    label(G, hu ? 'Hurokág: balra kanyarodás\nkeresztezés nélkül' : 'Loop ramp: left turns\nwithout crossing traffic', [12 + R, 4, 12 + 2 * R], [70, 26, 95], SPEC.kozl, K);
    label(G, hu ? 'Zajvédő fal' : 'Noise barrier', [95, 3.5, 18.5], [120, 14, 50], '#7aa66b', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [30, 34], posterT: 5, labelT: 5 };
}
