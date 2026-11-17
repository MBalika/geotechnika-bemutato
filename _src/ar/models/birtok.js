// Birtokrendezés (Földrendező) – előtte: szétaprózott, keskeny „nadrágszíj”-parcellák, kanyargó földút; a földmérő GNSS-szel kitűzi a határokat.
// Utána: a keskeny sávok eltűnnek, összevont, nagy táblák jönnek létre egyenes dűlőutakkal és fasorokkal; a traktor már egy menetben szánt.
import { THREE, Batch, mat, C, SPEC, tree, label, node, trackPos, trackScale, trackQuat, person } from '../lib/common.js';
export const FILE = 'birtokrendezes';
const K = 1 / 130;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1], SY0 = [1, 0.001, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'birtok';
  const B = new Batch('taj'); const tracks = [], T = 22;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const X0 = -36, X1 = 36, Z0 = -22, Z1 = 22, FX0 = -31, FX1 = 20, FZ0 = -17, FZ1 = 17;
  for (const [ya, yb, col] of [[-6, -3, C.clay], [-3, -0.8, '#8a6f52'], [-0.8, 0, '#5d4a37']]) box(B, mat(col), X0, X1, ya, yb, Z0, Z1);
  box(B, mat(C.grass), X0, X1, 0, 0.15, Z0, Z1);
  box(B, mat(C.water, { r: 0.2 }), X0, X1, 0.02, 0.18, Z0 + 0.6, Z0 + 3.2); // patak hátul
  // falu jobbra
  for (const [x, z, w, d, hh, wc] of [[27, -8, 6, 5, 4, '#f2d7b6'], [31, -1, 5, 6, 4, '#f4f3ef'], [27, 6, 6, 5, 5, '#cfe3ef'], [31, 13, 5, 5, 4, '#f2e3a8']]) {
    B.boxB(w, hh, d, mat(wc), x, 0.15, z); const rg = new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.3, 2.6, 4); rg.rotateY(Math.PI / 4); B.mesh(rg, mat('#b5533c'), [x, 0.15 + hh + 1.3, z], [0, 0, 0], [w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414]); }
  for (const [x, z] of [[24, -14], [34, -13], [34, 6], [24, 16], [25, 1]]) tree(B, x, z, 6, 0.15);
  B.build(root);
  const crops = ['#e6c95a', '#9cc95a', '#7a5a3c', '#c9a24a', '#5f9e4a', '#f2d544', '#b9d97a', '#a8743f'];
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // ---- előtte: keskeny sávok két dűlőben (z < 0 és z > 0), közöttük kanyargó földút ----
  const strips = [];
  for (const [za, zb] of [[FZ0, -1.4], [1.4, FZ1]]) { let x = FX0; while (x < FX1 - 0.5) { const w = Math.min(FX1 - x, 0.9 + rnd() * 2.4); strips.push([x, x + w, za, zb, crops[Math.floor(rnd() * crops.length)]]); x += w + 0.12; } }
  const tA = 7.0, tB = 9.0; // a sávok eltűnése balról jobbra
  for (const [xa, xb, za, zb, col] of strips) { const n = node(root, 'sav', [(xa + xb) / 2, 0.15, 0]); const sb = new Batch('sav'); box(sb, mat(col), xa - (xa + xb) / 2, xb - (xa + xb) / 2, 0, 0.32, za, zb);
    if (xb - xa > 1.6) box(sb, mat('#' + new THREE.Color(col).multiplyScalar(0.78).getHexString()), -0.05, 0.05, 0.32, 0.36, za + 0.3, zb - 0.3);
    sb.build(n); const t0 = tA + (xa - FX0) / (FX1 - FX0) * (tB - tA); tracks.push(trackScale(n, [0, t0, t0 + 0.5, t0 + 0.51, T - 0.6, T - 0.1, T], [S1, S1, SY0, S0, S0, S1, S1])); n.scale.set(...S0); }
  const oldRoad = node(root, 'regi_ut'); const ob = new Batch('regiut'); for (let x = FX0; x < FX1; x += 1.5) { const z = Math.sin(x / 5) * 0.6; box(ob, mat('#a08562'), x, x + 1.6, 0.15, 0.24, z - 1.2, z + 1.2); }
  ob.build(oldRoad); tracks.push(trackScale(oldRoad, [0, tB, tB + 0.5, tB + 0.51, T - 0.6, T - 0.1, T], [S1, S1, SY0, S0, S0, S1, S1])); oldRoad.scale.set(...S0);
  // ---- utána: hat nagy tábla, egyenes dűlőutak, fasorok, vízelvezető árok ----
  const RX = [FX0, -14, 3, FX1], RZ = [FZ0, -1.4, 1.4, FZ1]; const newCols = ['#e6c95a', '#5f9e4a', '#f2d544', '#9cc95a', '#c9a24a', '#7a5a3c']; let k = 0; const tC = 9.4;
  for (const [za, zb] of [[RZ[0], RZ[1]], [RZ[2], RZ[3]]]) for (let i = 0; i < 3; i++) { const xa = RX[i] + (i ? 2.4 : 0), xb = RX[i + 1] - (i < 2 ? 2.4 : 0), col = newCols[k];
    const n = node(root, 'tabla', [0, 0.15, 0]); const pb = new Batch('tabla'); box(pb, mat(col), xa, xb, 0, 0.32, za, zb);
    const dark = '#' + new THREE.Color(col).multiplyScalar(0.8).getHexString(); for (let z = za + 0.9; z < zb - 0.5; z += 1.3) box(pb, mat(dark), xa + 0.4, xb - 0.4, 0.32, 0.37, z - 0.12, z + 0.12);
    pb.build(n); const t0 = tC + k * 0.25; tracks.push(trackScale(n, [0, t0 - 0.01, t0, t0 + 0.7, T - 0.7, T - 0.2, T], [S0, S0, SY0, S1, S1, S0, S0])); k++; }
  const roads = node(root, 'uj_utak'); const rb = new Batch('utak');
  box(rb, mat('#bfae8c'), FX0, FX1 + 3, 0.15, 0.27, -1.3, 1.3); for (const x of [-14, 3]) box(rb, mat('#bfae8c'), x - 1.4, x + 1.4, 0.15, 0.27, FZ0, FZ1);
  box(rb, mat(C.water, { r: 0.2 }), FX0, FX1, 0.15, 0.22, FZ1 + 0.6, FZ1 + 1.4); // vízelvezető árok elöl
  rb.build(roads); tracks.push(trackScale(roads, [0, tC - 0.3, tC, T - 0.7, T - 0.2, T], [S0, S0, S1, S1, S0, S0]));
  const rows = node(root, 'fasor'); const fb = new Batch('fasor'); for (const x of [-14, 3]) for (let z = FZ0 + 1.5; z < FZ1; z += 3.2) if (Math.abs(z) > 2.2) tree(fb, x + 1.9, z, 4.2, 0.15);
  for (let x = FX0 + 1; x < FX1; x += 3.4) if (Math.abs(x + 14) > 2.6 && Math.abs(x - 3) > 2.6) tree(fb, x, -1.95, 4, 0.15);
  fb.build(rows); tracks.push(trackScale(rows, [0, tC + 1.2, tC + 2.4, T - 0.7, T - 0.2, T], [SY0, SY0, S1, S1, SY0, SY0]));
  // ---- földmérő GNSS-szel: végigmegy a régi határon, mögötte kitűzőkarók ----
  const sv = node(root, 'foldmero', [FX0 - 1, 0.15, 3.0]); const svb = new Batch('fm'); person(svb, 0, 0, Math.PI / 2, { vest: '#c6f432' }); svb.rod([0.35, 0, 0.25], [0.35, 2.0, 0.25], 0.03, mat(C.yellow)); svb.cyl(0.14, 0.14, 0.12, mat('#20262e'), 0.35, 2.06, 0.25, [0, 0, 0], 12); svb.build(sv);
  tracks.push(trackPos(sv, [0, 0.5, 6.2, 6.8, T - 0.5, T], [[FX0 - 1, 0.15, 3.0], [FX0 - 1, 0.15, 3.0], [FX1 - 3, 0.15, 3.0], [FX1 - 3, 0.15, 3.0], [FX1 - 3, 0.15, 3.0], [FX0 - 1, 0.15, 3.0]]));
  tracks.push(trackScale(sv, [0, T - 0.6, T - 0.5, T - 0.05, T], [S1, S1, S0, S0, S1]));
  for (let x = FX0 + 2; x < FX1 - 3; x += 4.5) { const st = node(root, 'karo', [x, 0.15, 1.9]); const kb = new Batch('karo'); for (let s = 0; s < 4; s++) kb.cyl(0.07, 0.07, 0.4, mat(s % 2 ? C.white : C.red), 0, 0.2 + s * 0.4, 0, [0, 0, 0], 6); kb.build(st);
    const t0 = 0.5 + (x - FX0 + 1) / (FX1 - 3 - FX0 + 1) * 5.7; tracks.push(trackScale(st, [0, t0, t0 + 0.2, T - 0.7, T - 0.2, T], [S0, S0, S1, S1, S0, S0])); }
  // ---- traktor ekével: az új nagy táblán egy menetben szánt ----
  const tr = node(root, 'traktor', [FX0 + 2, 0.47, -9]); const tb = new Batch('traktor');
  tb.boxB(2.6, 1.2, 1.6, mat('#2f9e44'), 0.2, 0.5, 0); tb.boxB(1.2, 1.3, 1.5, mat(C.glassDark), -0.5, 1.7, 0); tb.boxB(1.4, 0.12, 1.7, mat('#2f9e44'), -0.5, 3.0, 0);
  for (const [x, r] of [[-0.6, 0.75], [1.0, 0.45]]) for (const s of [-1, 1]) tb.cyl(r, r, 0.4, mat(C.dark), x, r, s * 0.95, [Math.PI / 2, 0, 0], 12);
  tb.box(2.2, 0.3, 2.4, mat(C.steelDark), -2.6, 0.4, 0); for (let i = -1; i <= 1; i++) tb.box(0.25, 0.6, 0.12, mat(C.steel), -2.6, 0.2, i * 0.8);
  person(tb, -0.5, 0, Math.PI / 2, { y: 0.9, vest: '#3a5f8a' }); tb.build(tr);
  const tT0 = tC + 2.6, tT1 = T - 1.6; tracks.push(trackPos(tr, [0, tT0, tT1, T - 0.9, T], [[FX0 + 2, 0.47, -9], [FX0 + 2, 0.47, -9], [-17, 0.47, -9], [-17, 0.47, -9], [FX0 + 2, 0.47, -9]]));
  tracks.push(trackScale(tr, [0, tT0 - 0.3, tT0, T - 0.9, T - 0.6, T], [S0, S0, S1, S1, S0, S0]));
  // a felszántott csík a traktor mögött
  const furrow = node(root, 'szantas', [FX0 + 1, 0.15, -9]); const fu = new Batch('fu'); box(fu, mat('#6a4c32'), 0, 1, 0.33, 0.4, -1.2, 1.2); fu.build(furrow);
  tracks.push(trackScale(furrow, [0, tT0, tT1, T - 0.9, T - 0.6, T], [[0.001, 1, 1], [0.001, 1, 1], [-17 - 2.6 - FX0 - 1 + 1.3, 1, 1], [-17 - 2.6 - FX0 - 1 + 1.3, 1, 1], S0, S0])); furrow.scale.set(-17 - 2.6 - FX0 - 1 + 1.3, 1, 1);
  const clips = [new THREE.AnimationClip('birtokrendezes', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Összevont, nagy táblák' : 'Consolidated large fields', [-22, 0.6, 9], [-26, 8, 16], '#5f9e4a', K);
    label(G, hu ? 'Új dűlőutak és fasorok' : 'New farm roads and tree rows', [3, 0.4, 10], [8, 9, 18], '#bfae8c', K);
    label(G, hu ? 'Vízelvezető árok' : 'Drainage ditch', [12, 0.3, FZ1 + 1], [16, 4, FZ1 + 4.5], C.water, K);
    label(G, hu ? 'Egy menetben szánt' : 'Ploughs in one pass', [-17, 2.5, -9], [-12, 9, -6], '#2f9e44', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [22, 34], posterT: 4.2, labelT: T - 3 };
}
