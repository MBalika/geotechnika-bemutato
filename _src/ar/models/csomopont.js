// Autópálya-elágazás (Közlekedési létesítmények): az M1 és az M7 közös szakaszának szétválása Budaörs és Törökbálint között.
// Tájmodell az OpenStreetMap szerinti elrendezéssel (észak hátul): a közös szakasz keletről (jobbról) érkezik, nyugaton kettéágazik –
// az M1 Győr felé (balra hátra), az M7 a Balaton felé (balra előre). Északon Budaörs a Kő-heggyel (kápolna), az Odvas-heggyel és a Törökugratóval,
// az autópálya mentén áruházak (márkajelzés nélkül), keleten a budaörsi repülőtér, délen a vasút. Animáció (16 s): járművek haladnak a pályákon.
// Méretarány 1:8000; a magasság kb. 2,5-szeres túlemeléssel, a járművek és a kápolna a láthatóságért felnagyítva; a házak jelzésszerűek.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackQuat } from '../lib/common.js';
import { plaque } from '../lib/kit2.js';
import { terrain, ribbon } from '../lib/terep.js';
export const FILE = 'autopalya-csomopont';
const K = 1 / 8000;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'budaors';
  const B = new Batch('taj'), tracks = [], T = 16, X0 = -3400, X1 = 3000, Z0 = -1900, Z1 = 900, BOT = -160;
  const HILLS = [[688, -1290, 150, 250], [-172, -1677, 250, 430], [-1400, -640, 120, 210], [-1560, -1280, 210, 400], [258, -1118, 60, 150], [1500, -1950, 260, 620], [-2900, -1500, 200, 520], [-600, -1300, 110, 300], [2400, 1000, 120, 500], [-900, 950, 60, 500]];
  const h = (x, z) => { let y = 6 + 10 * Math.sin(x / 900) * Math.cos(z / 700) - z * 0.02; for (const [cx, cz, H, r] of HILLS) y += 1.7 * H * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (r * r)); return Math.max(0, y); };
  terrain(B, h, X0, X1, Z0, Z1, BOT, 128, 56, mat('#a9c97c', { r: 1 }), mat('#9a7b58', { r: 1, ds: true }));
  const R = (pts, w, col, dy) => ribbon(B, h, dense(pts), w, mat(col, { r: 0.95, ds: true }), dy);
  function dense(pts, step = 60) { const o = []; for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 0; k < n; k++) o.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } o.push(pts[pts.length - 1]); return o; }
  const off = (P, o) => P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [p[0] - (b[1] - a[1]) / L * o, p[1] + (b[0] - a[0]) / L * o]; });
  // ---- nyomvonalak (m): közös szakasz keletről a szétválásig, M1, M7, vasút, 1-es út, keresztutak ----
  const COM = [[2990, -850], [2193, -430], [1634, -189], [1032, -26], [0, 9], [-1247, 0], [-1961, -34]], M1 = [[-1961, -34], [-2365, -70], [-2924, -258], [-3390, -500]], M7 = [[-1961, -34], [-2365, 60], [-2709, 344], [-3010, 774], [-3090, 890]];
  const RAIL = [[-3390, 440], [-2064, 258], [0, 189], [1806, 430], [2990, 400]], UT1 = [[-3390, -960], [-2666, -731], [-1376, -860], [-172, -946], [1290, -1015], [2666, -1204], [2990, -1150]];
  for (const P of [COM, M1, M7]) for (const o of [-17, 17]) { R(off(dense(P), o), 27, '#4a4e55', 6); R(off(dense(P), o), 1.6, '#eeeeea', 6.6); } for (const P of [COM, M1, M7]) R(dense(P), 6, '#7fa860', 6.2);
  R(RAIL, 16, '#8a7f72', 5); R(RAIL, 3, '#3a3f45', 5.6); R(UT1, 18, '#5a5e65', 5); for (const P of [[[-30, -940], [0, -300], [-40, 189], [-60, 880]], [[1032, -1000], [1032, -26], [1100, 430]], [[2190, -1180], [2193, -430]], [[-1376, -860], [-1247, 0], [-1300, 250]]]) R(P, 14, '#5a5e65', 6.4);
  for (const [x, z] of [[0, 9], [1032, -26], [-1247, 0]]) B.box(110, 8, 40, mat('#d5d1c8'), x, h(x, z) + 14, z, [0, Math.PI / 2 - 0.05, 0]);                            // felüljárók a csomópontokban
  // ---- Budaörs és Törökbálint házai (jelzésszerűen), templomtorony; áruházak parkolókkal; repülőtér ----
  let sd = 9; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647, wallC = ['#f4f1e6', '#efe6cf', '#f2e7c9', '#e9dcc2'], roofC = ['#a65a40', '#9c4f38', '#b5533c'];
  const town = (xa, xb, za, zb, n, big = 0) => { for (let i = 0; i < n; i++) { const x = xa + rnd() * (xb - xa), z = za + rnd() * (zb - za), y = h(x, z); if (y > 95) continue; const w = 26 + rnd() * 20 + big * 30, d = 20 + rnd() * 14 + big * 20, hh = 9 + rnd() * 6 + big * 14, ry = rnd() * 0.6; B.box(w, hh, d, mat(wallC[i % 4], { r: 0.9 }), x, y + hh / 2, z, [0, ry, 0]); B.box(w + 3, 5, d + 3, mat(roofC[i % 3], { r: 0.9 }), x, y + hh + 2.5, z, [0, ry, 0]); } };
  town(-1250, 2500, -1250, -420, 250); town(-2600, -1500, -980, -240, 60); town(300, 2300, -400, -200, 30, 1); town(-3300, -1400, 420, 880, 90); town(1200, 2900, 520, 880, 50, 1); town(-1200, 800, 420, 880, 30, 1);
  { const x = 420, z = -900, y = h(x, z); B.box(40, 70, 40, mat('#f2e3b0'), x, y + 35, z); B.mesh(new THREE.ConeGeometry(30, 60, 8), mat('#6f9a86', { m: 0.3 }), [x, y + 100, z]); B.box(110, 36, 46, mat('#f2e3b0'), x - 70, y + 18, z); B.box(114, 14, 50, mat('#9c4f38'), x - 70, y + 43, z); }
  const store = (x, z, w, d, ry, band) => { const y = h(x, z) + 2; B.box(w, 34, d, mat('#e4e6e8', { r: 0.8 }), x, y + 17, z, [0, ry, 0]); B.box(w + 2, 7, d + 2, mat(band, { r: 0.6 }), x, y + 30, z, [0, ry, 0]); B.box(w * 1.1, 1.2, d * 0.9, mat('#3f434a'), x + Math.sin(ry) * d * 1.0, y, z + Math.cos(ry) * d * 1.0, [0, ry, 0]);
    for (let i = 0; i < 26; i++) B.box(11, 5, 6, mat(['#c8ccd0', '#b33a2e', '#2f6db5', '#e9ecef', '#3a3f46'][i % 5]), x + Math.sin(ry) * d * 1.0 + (rnd() - 0.5) * w, y + 3.4, z + Math.cos(ry) * d * 1.0 + (rnd() - 0.5) * d * 0.8, [0, ry, 0]); };
  store(-560, -250, 260, 150, 0.05, '#2f6db5'); store(-900, -260, 200, 130, 0.0, '#e9b21f'); store(-190, -270, 180, 120, 0.08, '#d8452f'); store(560, 300, 300, 170, Math.PI + 0.06, '#3fae49'); store(1290, 300, 260, 150, Math.PI, '#d8452f'); store(900, 620, 220, 140, 0.1, '#2f6db5'); store(1650, 640, 240, 150, 0, '#e9b21f');
  { const ax = 2420, az = 60, y = h(ax, az) + 1.5; B.box(900, 1.6, 460, mat('#b9d58a', { r: 1 }), ax, y, az, [0, 0.12, 0]); B.box(820, 1.8, 46, mat('#cfe0a0', { r: 1 }), ax, y + 0.3, az + 40, [0, 0.12, 0]); B.box(760, 1.8, 40, mat('#cfe0a0', { r: 1 }), ax - 20, y + 0.3, az - 90, [0, 0.4, 0]);
    B.cyl(46, 46, 26, mat('#f4f1e6'), ax - 330, y + 13, az - 250, [0, 0, 0], 20); B.cyl(30, 30, 14, mat('#f4f1e6'), ax - 330, y + 33, az - 250, [0, 0, 0], 20); B.box(150, 22, 50, mat('#f4f1e6'), ax - 330, y + 11, az - 250, [0, 0.12, 0]); B.box(170, 30, 110, mat('#c9ced3', { m: 0.3 }), ax - 120, y + 15, az - 270, [0, 0.12, 0]);
    for (const [dx, dz, r] of [[-200, -150, 0.6], [-150, -130, 0.9], [60, 30, 0.12]]) { B.box(46, 6, 7, mat('#f2f3f1'), ax + dx, y + 6, az + dz, [0, r, 0]); B.box(8, 2, 56, mat('#f2f3f1'), ax + dx + Math.cos(r) * 6, y + 7, az + dz - Math.sin(r) * 6, [0, r, 0]); B.box(4, 12, 3, mat('#d8452f'), ax + dx - Math.cos(r) * 21, y + 11, az + dz + Math.sin(r) * 21, [0, r, 0]); } }
  // ---- hegyek: erdő, a Kő-hegyen kápolna és kőkereszt (felnagyítva), a Törökugrató sziklája ----
  for (let i = 0; i < 420; i++) { const x = X0 + 60 + rnd() * (X1 - X0 - 120), z = Z0 + 60 + rnd() * (Z1 - Z0 - 120), y = h(x, z); if (y < 120 || (Math.hypot(x - 688, z + 1290) < 150) || Math.hypot(x + 1400, z + 640) < 120) continue; B.mesh(new THREE.IcosahedronGeometry(26 + rnd() * 16, 0), mat(rnd() < 0.5 ? '#4f8a40' : '#5f9a4a', { r: 1 }), [x, y + 20, z], [rnd(), rnd(), 0], [1, 0.8, 1]); }
  { const x = 688, z = -1290, y = h(x, z); B.box(60, 40, 44, mat('#f6f4ee'), x, y + 18, z); B.mesh(new THREE.ConeGeometry(36, 30, 4), mat('#a65a40'), [x, y + 53, z], [0, Math.PI / 4, 0]); B.box(18, 60, 18, mat('#f6f4ee'), x + 30, y + 30, z); B.mesh(new THREE.ConeGeometry(14, 30, 4), mat('#a65a40'), [x + 30, y + 75, z], [0, Math.PI / 4, 0]); B.box(4, 46, 4, mat('#e9e4d8'), x - 90, y + 20, z + 40); B.box(22, 4, 4, mat('#e9e4d8'), x - 90, y + 32, z + 40);
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; B.mesh(new THREE.DodecahedronGeometry(28 + (i % 3) * 10, 0), mat('#d9d3c5', { r: 1 }), [x + Math.cos(a) * 130, h(x + Math.cos(a) * 130, z + Math.sin(a) * 130) + 4, z + Math.sin(a) * 130]); } }
  { const x = -1400, z = -640, y = h(x, z); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = 40 + (i % 4) * 26; B.mesh(new THREE.DodecahedronGeometry(30 + (i % 3) * 12, 0), mat('#e2dccd', { r: 1 }), [x + Math.cos(a) * r, h(x + Math.cos(a) * r, z + Math.sin(a) * r) + 6, z + Math.sin(a) * r], [i, i * 2, 0]); } }
  B.build(root);
  // ---- járművek (felnagyítva): a közös szakaszról az M1-re és az M7-re, illetve vissza ----
  const cum = (P) => { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; };
  const run = (P, ph, col, truck) => { const L = cum(P), tot = L[L.length - 1], at2 = (u) => { const s = u * tot; let i = 1; while (i < L.length - 1 && L[i] < s) i++; const f = (s - L[i - 1]) / (L[i] - L[i - 1] || 1), a = P[i - 1], b = P[i]; return { p: [a[0] + (b[0] - a[0]) * f, h(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f) + 12, a[1] + (b[1] - a[1]) * f], r: [0, Math.atan2(-(b[1] - a[1]), b[0] - a[0]), 0] }; };
    const nd = node(root, 'jarmu'), b = new Batch('j'); b.box(truck ? 70 : 38, truck ? 22 : 13, truck ? 20 : 17, mat(col, { r: 0.5 }), 0, 0, 0); if (!truck) b.box(18, 8, 15, mat('#26323d'), -2, 9, 0); else b.box(14, 20, 20, mat('#2f6db5'), 30, 0, 0); b.build(nd);
    const tt = [], pp = [], rr = [], N = 32, tw = (1 - ph) * T; for (let k = 0; k <= N; k++) { const t = k / N * T; if (k && t > tw && (k - 1) / N * T < tw) { const e = at2(0.9999), s = at2(0); tt.push(tw - 0.001, tw); pp.push(e.p, s.p); rr.push(e.r, s.r); } const q = at2(Math.min(0.9999, (t / T + ph) % 1)); tt.push(t); pp.push(q.p); rr.push(q.r); }
    tracks.push(trackPos(nd, tt, pp), trackQuat(nd, tt, rr)); nd.position.set(...pp[0]); nd.rotation.set(...rr[0]); };
  const W1 = off(dense([...COM, ...M1.slice(1)]), 17), W7 = off(dense([...COM, ...M7.slice(1)]), 17), E1 = off(dense([...M1.slice().reverse(), ...COM.slice(0, -1).reverse()]), 17), E7 = off(dense([...M7.slice().reverse(), ...COM.slice(0, -1).reverse()]), 17);
  const cc = ['#b33a2e', '#e9ecef', '#2f6db5', '#f2c417', '#c8ccd0', '#3a3f46']; let ci = 0; for (const P of [W1, W7, E1, E7]) for (let k = 0; k < 5; k++) run(P, (k / 5 + ci * 0.07) % 1, cc[ci++ % 6], k === 3);
  plaque(root, hu ? 'M1–M7 elágazás · Budaörs–Törökbálint' : 'M1–M7 motorway split · Budaörs, near Budapest', X0 + 80, BOT + 30, Z1 + 6, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('forgalom', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const q = lg === 'hu', L = (t, a, p, c) => label(G, t, [a[0], h(a[0], a[1]) + (a[2] || 10), a[1]], p, c, K);
    L(q ? 'M1 – Győr, Bécs felé' : 'M1 – towards Győr and Vienna', [-3000, -300], [-3300, 420, -700], SPEC.kozl); L(q ? 'M7 – a Balaton felé' : 'M7 – towards Lake Balaton', [-2800, 470], [-3300, 300, 1000], SPEC.kozl);
    L(q ? 'Közös M1–M7 szakasz Budapest felől' : 'Shared M1–M7 section from Budapest', [1700, -200], [1500, 480, 500], '#4a4e55'); L(q ? 'Itt válik szét a két autópálya' : 'The two motorways split here', [-1961, -34], [-2100, 520, 200], '#f2c417');
    L(q ? 'Kő-hegy a kápolnával' : 'Kő-hegy hill with its chapel', [688, -1290, 90], [900, 620, -1200], '#f6f4ee'); L(q ? 'Törökugrató' : 'Törökugrató rock', [-1400, -640, 40], [-1700, 560, -700], '#e2dccd');
    L(q ? 'Budaörsi repülőtér' : 'Budaörs airfield', [2420, 60], [2500, 380, 500], '#b9d58a'); L(q ? 'Áruházak az autópálya mentén' : 'Retail stores along the motorway', [-560, -250, 40], [-700, 420, 600], '#e4e6e8'); L(q ? 'Vasútvonal' : 'Railway line', [300, 200], [500, 300, 1000], '#8a7f72');
    return G; };
  return { root, labels, clips, k: K, posterView: [14, 34], posterT: 4, labelT: 4 };
}
