// Hajózsilip (Vízmérnöki) – hosszmetszet a zsilip tengelyében (a közelebbi kamrafal nélkül): a hajó az alvízről a kamrába hajózik,
// az alsó busókapu bezárul, a kamra feltöltődik, a hajó 8 m-t emelkedik, a felső kapu kinyílik, a hajó kihajózik a felvízre; utána a kamra visszaürül.
import { THREE, Batch, mat, C, SPEC, tree, label, node, trackPos, trackQuat, trackScale } from '../lib/common.js';
export const FILE = 'hajozsilip';
const K = 1 / 300;

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'zsilip';
  const B = new Batch('zsilip');
  const X0 = -120, X1 = 100, Z0 = -40, TOP = 11, W = 7, ZF = W; // a metszet síkja z = W (a kamra közelebbi fala)
  const XL = -60, XG = 34, XU = 40; // alsó kapu, felső kapu, a felvízi csatorna kezdete
  const WD = 0, WU = 8, FB = -7;
  const grass = mat(C.grass), conc = mat(C.concrete), concD = mat(C.concreteDark), water = mat(C.water, { op: 0.82, r: 0.2 });
  const box = (m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) B.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  // rétegek: töltés/feltöltés a terepszint és −5 között, kavics −5…−11, agyag −11…−20
  const fill = mat('#b29a78'), grav = mat(C.gravel), clay = mat(C.clay);
  const soil = (xa, xb, ya, yb, za, zb) => { for (const [a, b, m] of [[-20, -11, clay], [-11, -5, grav], [-5, TOP, fill]]) box(m, xa, xb, Math.max(ya, a), Math.min(yb, b), za, zb); };
  soil(X0, X1, -20, FB, Z0, ZF);
  // alvízi medence (x < XL): meder −5, túlsó part z < −26
  soil(X0, XL, FB, -5, Z0, ZF); soil(X0, XL, -5, TOP, Z0, -26); box(grass, X0, XL, TOP, TOP + 0.4, Z0, -26);
  box(water, X0, XL, -5, WD, -26, ZF);
  // felvízi csatorna (x > XU): meder +2, víz +8, túlsó part z < −20
  soil(XU, X1, FB, 2, Z0, ZF); soil(XU, X1, 2, TOP, Z0, -20); box(grass, XU, X1, TOP, TOP + 0.4, Z0, -20);
  box(water, XU, X1, 2, WU, -20, ZF); box(water, XG, XU, 2, WU, -W, ZF);
  // a kamra: túloldalt töltés és vasbeton kamrafal, fenéklemez, a felső fő alatt küszöb; a közelebbi falnak csak a talpa látszik a metszetben
  soil(XL, XU, FB, TOP, Z0, -W - 3); box(grass, XL, XU, TOP, TOP + 0.4, Z0, -W - 3);
  box(conc, XL - 4, XU + 4, FB, TOP + 0.2, -W - 3, -W); box(concD, XL - 4, XU + 4, TOP + 0.2, TOP + 0.8, -W - 3.2, -W + 0.2);
  box(concD, XL - 4, XU, FB, -6, -W, ZF); box(conc, XG, XU + 4, -6, 2, -W, ZF);
  // szintjelek a hátsó falon: alvíz és felvíz
  box(mat(C.waterDeep), XL + 1, XG - 1, WD - 0.1, WD + 0.1, -W + 0.02, -W + 0.06); box(mat(C.waterDeep), XL + 1, XG - 1, WU - 0.1, WU + 0.1, -W + 0.02, -W + 0.06);
  // vezérlőtorony a túlsó parton, a felső fő mellett
  B.boxB(8, 14, 8, mat(C.white), XU + 4, TOP + 0.4, -W - 9); B.boxB(9, 3, 9, mat(C.glass, { r: 0.3 }), XU + 4, TOP + 14.4, -W - 9); B.boxB(10, 0.8, 10, mat(C.roof), XU + 4, TOP + 17.4, -W - 9);
  // fák, kikötőbakok
  for (let i = 0; i < 14; i++) { const x = X0 + 8 + (i * 31) % (X1 - X0 - 16); const z = -30 - (i * 7) % 8; if (x > XU - 2 && x < XU + 12) continue; tree(B, x, z, 8 + (i % 3) * 2, TOP + 0.4); }
  for (let x = XL + 6; x < XG - 2; x += 12) B.boxB(0.8, 1, 0.8, mat(C.yellow), x, TOP + 0.8, -W - 0.8);
  B.build(root);
  // kamravíz (animált magasság): az alja −6, alvíznél a teteje 0, felvíznél +8
  const cw = node(root, 'kamraviz', [(XL + XG) / 2, -6, (ZF - W) / 2]); const cwm = new THREE.Mesh(new THREE.BoxGeometry(XG - XL - 0.3, 1, ZF + W - 0.1), water); cwm.position.y = 0.5; cwm.name = 'kamraviz_m'; cw.add(cwm);
  const L0 = 6, L1 = 14; cw.scale.set(1, L0, 1);
  // busókapuk: a szárnyak csuklója a kamrafalnál; zárva a csúcs a felvíz felé (+x) mutat, nyitva a szárny a fal mellett fekszik
  const gateMat = mat('#5b6b7a', { m: 0.3, r: 0.5 });
  const leaf = (x, s, y0, y1) => { const n = node(root, 'kapu', [x, 0, s * W]); const L = W / Math.cos(0.32) + 0.2; const b = new Batch('szarny');
    b.box(0.9, y1 - y0, L, gateMat, 0.45, (y0 + y1) / 2, -s * L / 2); b.box(1.2, 0.5, L, mat(SPEC.viz), 0.45, y1 - 0.25, -s * L / 2);
    for (let yy = y0 + 2; yy < y1 - 1; yy += 3) b.box(1.1, 0.25, L, mat(C.steelDark), 0.45, yy, -s * L / 2); b.build(n);
    return { n, closed: [0, -s * 0.32, 0], open: [0, -s * (Math.PI / 2 - 0.04), 0] }; };
  const low = [leaf(XL, 1, -6, TOP - 0.3), leaf(XL, -1, -6, TOP - 0.3)];
  const up = [leaf(XG, 1, 2, TOP - 0.3), leaf(XG, -1, 2, TOP - 0.3)];
  // hajó (konténeres önjáró)
  const ship = node(root, 'hajo'); const sb = new Batch('hajo');
  sb.boxB(62, 3.4, 9.6, mat('#384858'), 0, -2.6, 0); sb.boxB(60, 0.4, 9.8, mat('#c9533f'), 0, 0.8, 0);
  sb.boxB(7, 5, 8.6, mat(C.white), -26, 1.2, 0); sb.boxB(5.5, 1.6, 9, mat(C.glassDark), -26, 6.2, 0); sb.boxB(6, 0.4, 9.2, mat(C.dark), -26, 7.8, 0);
  const cont = ['#f4c430', '#2f6db5', '#e0523f', '#e9ecef', '#5ccf7a']; let ci = 0;
  for (let i = 0; i < 4; i++) for (const z of [-2.2, 2.2]) for (let j = 0; j < ((i + (z > 0 ? 1 : 0)) % 3 ? 2 : 1); j++) sb.boxB(11.6, 2.5, 4.1, mat(cont[ci++ % 5]), -14 + i * 12.2, 1.2 + j * 2.55, z);
  sb.build(ship);
  // idővonal (26 s)
  const T = 26, xA = -88, xB = -12, xC = 66;
  const tracks = [
    trackPos(ship, [0, 6, 8, 15, 17, 22.4, 22.5, 26], [[xA, WD, 0], [xB, WD, 0], [xB, WD, 0], [xB, WU, 0], [xB, WU, 0], [xC, WU, 0], [xA, WD, 0], [xA, WD, 0]]),
    trackScale(ship, [0, 22.4, 22.5, 25.4, 26], [[1, 1, 1], [1, 1, 1], [0.001, 0.001, 0.001], [0.001, 0.001, 0.001], [1, 1, 1]]),
    trackScale(cw, [0, 8, 15, 23.5, 25, 26], [[1, L0, 1], [1, L0, 1], [1, L1, 1], [1, L1, 1], [1, L0, 1], [1, L0, 1]]),
  ];
  for (const g of low) tracks.push(trackQuat(g.n, [0, 6, 8, 25, 26], [g.open, g.open, g.closed, g.closed, g.open]));
  for (const g of up) tracks.push(trackQuat(g.n, [0, 15, 17, 22.4, 23.5, 26], [g.closed, g.closed, g.open, g.open, g.closed, g.closed]));
  ship.position.set(xA, WD, 0); for (const g of low) g.n.rotation.set(...g.open); for (const g of up) g.n.rotation.set(...g.closed);
  const clips = [new THREE.AnimationClip('zsilipeles', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Felvíz: +8 m' : 'Upper pool: +8 m', [80, WU, ZF], [84, 24, ZF + 8], C.waterDeep, K);
    label(G, hu ? 'Alvíz: ±0' : 'Lower pool: ±0', [-104, WD, ZF], [-108, 16, ZF + 8], C.waterDeep, K);
    label(G, hu ? 'Zsilipkamra: 8 m emelés' : 'Lock chamber: 8 m lift', [-40, -3, ZF], [-44, -16, ZF + 10], SPEC.viz, K);
    label(G, hu ? 'Busókapu' : 'Mitre gate', [XL + 1, TOP - 1, W - 1], [XL - 16, 26, ZF + 10], SPEC.viz, K);
    label(G, hu ? 'Vezérlőtorony' : 'Control tower', [XU + 4, TOP + 15, -W - 5], [XU + 18, 38, ZF + 4], C.glassDark, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [18, 22], posterT: 12 };
}
