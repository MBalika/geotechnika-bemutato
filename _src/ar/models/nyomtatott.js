// 3D-nyomtatott beton (Építéstechnológia és építményinformációs menedzsment): portálos betonnyomtató rétegenként „nyomtatja” ki
// a BME CH épületének (Szent Gellért tér 4., Czigler Győző, 1902–1904) 1:8 méretarányú makettjét. A fej az épület körvonalát követi,
// a makett szintenként nő; a végén a portál félreáll. A makett szemléltető ötlet (ilyen nem készült), az épület formája légifénykép és
// fényképek alapján egyszerűsített; az emberek és a gép valós méretűek.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackScale, person } from '../lib/common.js';
import { at, tree2, plaque } from '../lib/kit2.js';
import { chBuilding, CH, CH_LEVELS } from '../lib/bme.js';
export const FILE = 'nyomtatott-haz';
const K = 1 / 45, SC = 0.125;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'nyomtatott';
  const B = new Batch('haz'), tracks = [], T = 24;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const X0 = -10.5, X1 = 10.5, Z0 = -9.5, Z1 = 9.5, FY = 0.25, OX = 0.3, OZ = 5.9;      // az udvar; a nyomtatási lemez teteje; a makett eltolása
  for (const [ya, yb, col] of [[-2.4, -1.1, C.clay], [-1.1, -0.25, C.sand], [-0.25, 0, C.fill]]) box(B, mat(col), X0, X1, ya, yb, Z0, Z1);
  box(B, mat('#c9c5bb', { r: 0.95 }), X0, X1, 0, 0.1, Z0, Z1); box(B, mat('#b9b5ad'), -6.1, 6.1, 0.1, FY, -6.6, 6.6);
  for (let x = X0 + 3; x < X1; x += 3) box(B, mat('#b3aea4'), x - 0.02, x + 0.02, 0.1, 0.105, Z0, Z1); for (let z = Z0 + 3; z < Z1; z += 3) box(B, mat('#b3aea4'), X0, X1, 0.1, 0.105, z - 0.02, z + 0.02);
  // ---- a makett szintenként (a csomópont a szint alján; nyomtatás közben függőlegesen nő) ----
  const MONO = { wall: '#cbc5b8', trim: '#dedad0', roof: '#bdb7ab', glass: '#a39c90', line: '#b3ad9f' };
  const LV = [['alap', 0.4, 2.6], ['f1', 2.6, 6.2], ['f2', 6.2, 10.4], ['teto', 10.4, 15.6]], topOf = { alap: CH_LEVELS.alap[1], f1: CH_LEVELS.f1[1], f2: CH_LEVELS.f2[1], teto: 23.8 };
  const hT = [[0, FY], [0.4, FY]];
  for (const [p, ta, tb] of LV) { const y0 = CH_LEVELS[p][0], n = node(root, 'szint_' + p, [0, FY + y0 * SC, 0]), b = new Batch('szint'); chBuilding(at(b, OX, 0, OZ, 0, SC), { parts: [p], dy: -y0, mono: MONO, lines: 0.62 }); b.build(n);
    tracks.push(trackScale(n, [0, ta, tb, T - 0.01, T], [[1, 0.001, 1], [1, 0.001, 1], S1, S1, [1, 0.001, 1]])); hT.push([tb, FY + topOf[p] * SC]); }
  const tP = LV[3][2];
  // ---- portálos nyomtató: sínek z irányban, a híd z-ben, a kocsi x-ben, a fej függőlegesen mozog ----
  const GX = 7.2, GH = 4.6, steel = mat('#2f6db5', { m: 0.3, r: 0.5 }), acc = mat(SPEC.eti), dk = mat('#3a3f45');
  for (const s of [-1, 1]) { box(B, mat(C.steelDark), s * GX - 0.2, s * GX + 0.2, 0.1, 0.3, Z0 + 0.8, Z1 - 0.8); for (let z = Z0 + 1.2; z < Z1 - 0.8; z += 1.4) box(B, mat('#8d857a'), s * GX - 0.45, s * GX + 0.45, 0.1, 0.17, z - 0.14, z + 0.14); for (const z of [Z0 + 0.8, Z1 - 0.8]) box(B, mat('#e9b21f'), s * GX - 0.3, s * GX + 0.3, 0.3, 0.75, z - 0.15, z + 0.15); }
  const bridge = node(root, 'portal', [0, 0, 0]), bb = new Batch('portal');
  for (const s of [-1, 1]) { box(bb, steel, s * GX - 0.2, s * GX + 0.2, 0.3, GH, -0.2, 0.2); box(bb, dk, s * GX - 0.38, s * GX + 0.38, 0.3, 0.75, -0.7, 0.7); box(bb, acc, s * GX - 0.28, s * GX + 0.28, GH - 0.8, GH - 0.2, -0.28, 0.28); bb.rod([s * GX, 0.75, 0.6], [s * GX, GH - 1.2, 0.05], 0.06, steel, 5); bb.rod([s * GX, 0.75, -0.6], [s * GX, GH - 1.2, -0.05], 0.06, steel, 5); }
  box(bb, steel, -GX - 0.3, GX + 0.3, GH, GH + 0.5, -0.28, 0.28); box(bb, acc, -GX - 0.3, GX + 0.3, GH + 0.5, GH + 0.58, -0.28, 0.28); box(bb, dk, -GX, GX, GH + 0.1, GH + 0.4, 0.28, 0.4); bb.build(bridge);
  const car = node(bridge, 'kocsi', [0, 0, 0]), cb = new Batch('kocsi'); box(cb, acc, -0.42, 0.42, GH - 0.25, GH + 0.85, -0.42, 0.42); box(cb, dk, -0.5, 0.5, GH + 0.3, GH + 0.5, 0.42, 0.6); cb.rod([0, GH + 0.85, 0], [0.8, GH + 1.5, 0], 0.07, dk, 6); cb.build(car);
  const head = node(car, 'fej', [0, FY, 0]), hb = new Batch('fej');
  box(hb, mat(C.steel, { m: 0.5, r: 0.35 }), -0.09, 0.09, 0.3, GH - 0.25, -0.09, 0.09); hb.mesh(new THREE.CylinderGeometry(0.2, 0.06, 0.3, 12), mat('#ff7a1a'), [0, 0.15, 0]); box(hb, dk, -0.16, 0.16, 0.3, 0.6, -0.16, 0.16); hb.build(head);
  // a fej útja: az épület körvonalán körbe (körönként egy sarokpont-sor), a magasság a nyomtatott szint tetejét követi
  const loopPts = [...CH.P, CH.P[0]].map(([x, z]) => [OX + x * SC, OZ + z * SC]), NL = 9, t0 = LV[0][1], dt = (tP - t0) / (NL * 4), tt = [], cx = [], bz = [];
  for (let k = 0; k <= NL * 4; k++) { const p = loopPts[k % 4]; tt.push(t0 + k * dt); cx.push([p[0], 0, 0]); bz.push([0, 0, p[1]]); }
  const park = [0, 0, Z0 + 1.6];
  tracks.push(trackPos(car, [0, ...tt, tP + 1.2, T - 0.01, T], [cx[0], ...cx, [0, 0, 0], [0, 0, 0], cx[0]]), trackPos(bridge, [0, ...tt, tP + 0.6, tP + 2.8, T - 0.01, T], [bz[0], ...bz, bz[bz.length - 1], park, park, bz[0]]));
  tracks.push(trackPos(head, [...hT.map(a => a[0]), tP + 0.8, T - 0.01, T], [...hT.map(a => [0, a[1], 0]), [0, 3.7, 0], [0, 3.7, 0], [0, FY, 0]]));
  car.position.set(0, 0, 0); bridge.position.set(...park); head.position.set(0, 3.7, 0);
  // ---- keverő, siló és szivattyú, tömlő a portálhoz; vezérlőpult; raklapok ----
  { const wh = mat('#e9ecef'); box(B, wh, -9.8, -7.6, 0.1, 1.9, -8.6, -6.2); B.cyl(0.95, 0.95, 3.6, wh, -8.7, 4.1, -7.4, [0, 0, 0], 16); B.cyl(0.95, 0.25, 1.0, wh, -8.7, 1.8, -7.4, [0, Math.PI, 0], 16); B.cyl(1.0, 1.0, 0.12, acc, -8.7, 5.95, -7.4, [0, 0, 0], 16);
    for (const [dx, dz] of [[-0.8, -0.8], [0.8, -0.8], [0.8, 0.8], [-0.8, 0.8]]) B.cyl(0.06, 0.06, 2.4, dk, -8.7 + dx, 1.3, -7.4 + dz, [0, 0, 0], 5); box(B, acc, -9.82, -7.58, 1.5, 1.9, -8.62, -6.18);
    B.rod([-7.6, 1.0, -7.0], [-GX, 0.5, -7.0], 0.09, dk); B.rod([-GX, 0.5, -7.0], [-GX - 0.5, 0.35, Z0 + 1.6], 0.09, dk);
    box(B, dk, 8.2, 9.4, 0.1, 1.1, 5.4, 6.0); B.box(1.0, 0.06, 0.7, mat('#20262e', { em: '#2a6fb0', ei: 0.5 }), 8.8, 1.3, 5.6, [0.5, 0, 0]);
    for (const [x, z] of [[8.4, -7.2], [9.3, -5.6]]) { box(B, mat('#b08455'), x - 0.6, x + 0.6, 0.1, 0.24, z - 0.5, z + 0.5); for (let k = 0; k < 3; k++) box(B, mat(k % 2 ? '#d9d2c2' : '#cfc7b5'), x - 0.55, x + 0.55, 0.24 + k * 0.22, 0.45 + k * 0.22, z - 0.45, z + 0.45); } }
  // ---- emberek (valós méret): kezelő tablettel, mérnök, látogatók ----
  person(B, 8.7, 6.6, Math.PI, { tablet: true, y: 0.1 }); person(B, -8.4, -4.6, 1.2, { y: 0.1, vest: '#c6f432' });
  for (const [x, z, r, c] of [[-2.4, 8.3, 3.3, '#3a5f8a'], [-1.2, 8.6, 3.0, '#b33a2e'], [0.6, 8.2, 3.2, '#5a6a3a'], [8.9, 1.2, -1.6, '#8a5a3a'], [-9.0, 3.2, 1.5, '#6a4a8a']]) person(B, x, z, r, { y: 0.1, vest: c, shirt: c, helmet: '#5a4632' });
  for (const [x, z] of [[-9.6, 8.4], [9.7, 8.6], [9.8, -8.6]]) tree2(B, x, z, 4.6, 0.1);
  B.build(root);
  plaque(root, hu ? 'A BME CH épülete · 1:8 nyomtatott makett' : 'BME “CH” building · 1:8 printed model', X0 + 0.3, -2.2, Z1 + 0.02, K, { h: 0.019 });
  const clips = [new THREE.AnimationClip('nyomtatas', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu';
    label(G, h ? 'Portálos betonnyomtató' : 'Gantry concrete printer', [GX, GH + 0.5, Z0 + 1.6], [GX - 1, GH + 3.0, Z0 + 3], SPEC.eti, K);
    label(G, h ? 'Rétegenként nyomtatott beton' : 'Concrete printed layer by layer', [OX - 3.4, 1.2, OZ - 3.2], [-10.5, 4.6, 6.5], '#cbc5b8', K);
    label(G, h ? 'Főbejárat a Szent Gellért tér felől' : 'Main entrance from Szent Gellért Square', [OX, 1.0, OZ + 0.25], [1.5, -1.4, Z1 + 1.2], '#dedad0', K);
    label(G, h ? 'Siló, keverő és szivattyú' : 'Silo, mixer and pump', [-8.7, 6.0, -7.4], [-10.6, 8.2, -5], C.white, K);
    label(G, h ? 'Kezelő' : 'Operator', [8.7, 1.9, 6.6], [7.6, 4.4, 8.6], '#ff7a1a', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 30], posterT: T - 2, labelT: T - 1 };
}
