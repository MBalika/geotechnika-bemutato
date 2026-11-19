// Hajózsilip (Vízmérnöki): a Kvassay-zsilip Budapesten, a Ráckevei (Soroksári)-Duna felső torkolatánál (épült 1910–1914).
// A modell a folyó (észak) felől mutatja a zsilipet: elöl a kamrát a mederrel elválasztó fal – középen kivágva, hogy a kamrába be lehessen látni –,
// mögötte a kamra a támkapukkal, a túlparton (Csepel) a kezelőépület; jobbra a Duna-főág felőli oldal, a kamra mellett az erőmű és szivattyútelep.
// Animáció (26 s): a hajó az ág felől behajózik, az alsó kapu bezárul, a kamra a falakban futó csatornákon át megtelik, a hajó a Duna szintjére
// emelkedik, a felső kapu kinyílik, a hajó kihajózik; utána a kamra visszaürül.
// Adatok (Közép-Duna-völgyi Vízügyi Igazgatóság): hasznos hossz 75 m, szélesség 10 m; támkapuk mindkét főben, szárnyanként 5,40 m szélesek,
// 8,78 m magasak, 24 t; töltőrendszer: körülfutó csatornák, oldaltöltéssel; legnagyobb hajó: 1000 tonnás uszály. A vízszintkülönbség szemléltető.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackQuat, trackScale, person } from '../lib/common.js';
import { at, sideExtrude, car2, tree2, lamp, plaque } from '../lib/kit2.js';
export const FILE = 'hajozsilip';
const K = 1 / 250;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'zsilip';
  const B = new Batch('zsilip'), T = 26;
  const X0 = -100, X1 = 100, Z0 = -46, Z1 = 27, YB = -12, W = 5, WT = 6, TOP = 5.6, FL = -3.7, BASE = -5.2, WD = 0, WU = 3;
  const XL = -43, XU = 43, NX0 = -28, NX1 = 28, GW0 = -76, GW1 = 74, PX0 = 46, PX1 = 66;      // kapuk; a kivágás; a terelőfal végei; az erőmű
  const stone = mat('#7f776b', { r: 1 }), stoneD = mat('#6a6258', { r: 1 }), cope = mat('#d2ccbf', { r: 0.9 }), conc = mat('#cfcbc2'), concD = mat('#b3aea5'), teal = mat('#2f8f9a', { r: 0.5, m: 0.3 }), dark = mat('#2b2f33');
  const water = mat(C.water, { op: 0.8, r: 0.15 }), grass = mat('#8fbf6a', { r: 1 });
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  // ---- alaptömb (kavics, agyag), a déli part feltöltése ----
  box(B, mat('#77706a'), X0, X1, YB, -8.5, Z0, Z1); box(B, mat(C.gravel), X0, X1, -8.5, BASE, Z0, Z1);
  box(B, mat('#a8947a'), X0, X1, BASE, TOP - 0.4, Z0, -W - WT); box(B, grass, X0, X1, TOP - 0.4, TOP - 0.1, Z0, -W - WT);
  // ---- kamrafalak (terméskő falazat, fedkő), fenéklemez ----
  const wall = (xa, xb, za, zb) => { box(B, stone, xa, xb, BASE, TOP - 0.45, za, zb); box(B, cope, xa - 0.15, xb + 0.15, TOP - 0.45, TOP, za - 0.2, zb + 0.2); };
  wall(X0, X1, -W - WT, -W); wall(GW0, NX0, W, W + WT); wall(NX1, GW1, W, W + WT);
  box(B, concD, X0, X1, BASE, FL, -W, W); box(B, conc, XL - 6, XL + 2, BASE, FL + 0.35, -W, W); box(B, conc, XU - 6, XU + 2, BASE, FL + 0.35, -W, W);
  for (let y = FL + 1.5; y < TOP - 1; y += 1.5) { box(B, stoneD, X0, X1, y, y + 0.07, -W - 0.01, -W + 0.03); }
  // a kivágott fal metszete: benne a töltő-ürítő csatorna; a túlsó fal tövében az oldaltöltés nyílásai
  for (const x of [NX0, NX1]) { box(B, mat('#8d857a'), x - 0.02, x + 0.02, BASE, TOP - 0.45, W, W + WT); box(B, dark, x - 0.05, x + 0.05, FL - 0.9, FL + 1.3, W + 2.0, W + 3.8); }
  for (const z of [-W - WT + 2.2]) box(B, dark, X0 + 0.0, X0 + 0.05, FL - 0.9, FL + 1.3, z, z + 1.8);
  for (let x = XL + 8; x < XU - 6; x += 6.5) box(B, dark, x - 0.7, x + 0.7, FL + 0.25, FL + 1.0, -W - 0.02, -W + 0.05);
  // vízszintjelek, létrák, kikötőbakok, korlát a túlsó falon
  for (const y of [WD, WU]) box(B, mat('#f2f3f1'), XL + 2, XU - 2, y - 0.06, y + 0.06, -W - 0.01, -W + 0.05);
  for (const x of [-22, 8, 30]) { for (const dz of [0, 0.5]) box(B, mat('#c9ced3', { m: 0.6, r: 0.4 }), x + dz - 0.04, x + dz + 0.04, FL + 0.4, TOP, -W + 0.05, -W + 0.12); for (let y = FL + 0.8; y < TOP; y += 0.6) box(B, mat('#c9ced3', { m: 0.6, r: 0.4 }), x, x + 0.5, y, y + 0.05, -W + 0.05, -W + 0.12); }
  for (let x = XL + 5; x < XU - 3; x += 11) { B.cyl(0.28, 0.34, 0.6, mat('#e9b21f'), x, TOP + 0.3, -W - 1.0, [0, 0, 0], 8); }
  for (const [xa, xb] of [[GW0 + 2, NX0 - 1], [NX1 + 1, GW1 - 2]]) for (let x = xa; x < xb; x += 11) B.cyl(0.28, 0.34, 0.6, mat('#e9b21f'), x, TOP + 0.3, W + 1.0, [0, 0, 0], 8);
  const rail = (xa, xb, z) => { box(B, teal, xa, xb, TOP + 1.05, TOP + 1.13, z - 0.04, z + 0.04); for (let x = xa; x <= xb + 0.01; x += 3) box(B, teal, x - 0.04, x + 0.04, TOP, TOP + 1.1, z - 0.04, z + 0.04); };
  rail(X0 + 2, X1 - 2, -W - WT + 0.5); rail(GW0 + 1, NX0 - 0.5, W + WT - 0.4); rail(NX1 + 0.5, PX0 - 1, W + WT - 0.4);
  // ---- a folyó a fal előtt: az ág felől alacsonyabb, a Duna felől magasabb víz; meder ----
  box(B, mat('#8f8676'), X0, NX0, BASE, FL - 0.6, W + WT, Z1); box(B, mat('#8f8676'), NX1, X1, BASE, FL - 0.6, W + WT, Z1);
  box(B, water, X0, NX0, FL - 0.6, WD, W + WT, Z1); box(B, water, X0, GW0, FL - 0.6, WD, W, W + WT); box(B, water, NX1, PX0, FL - 0.6, WD, W + WT, Z1);
  box(B, water, PX1, X1, FL - 0.6, WU, W + WT, Z1); box(B, water, GW1, X1, FL - 0.6, WU, W, W + WT);
  box(B, water, X0, XL, FL, WD, -W, W); box(B, water, XU, X1, FL, WU, -W, W);                                              // alsó és felső előcsatorna
  // ---- erőmű és szivattyútelep a kamra mellett (a modell széle elmetszi): pillérek, gépház, hengeres torony, napelemes tető ----
  { const pl = mat('#e7d9a8', { r: 0.9 }), gl = mat('#2f4354', { r: 0.2, m: 0.5 }), rf = mat('#9a9fa3', { r: 0.7 });
    box(B, conc, PX0, PX1, BASE, TOP, W + WT, Z1); for (let z = W + WT + 3.5; z < Z1 - 2; z += 5.5) { box(B, dark, PX0 - 0.04, PX0 + 0.1, FL - 0.2, WD - 0.6, z, z + 3.2); box(B, mat('#e9f2f7', { op: 0.8 }), PX0 - 5, PX0 - 0.05, WD - 0.05, WD + 0.12, z + 0.2, z + 3.0); box(B, dark, PX1 - 0.1, PX1 + 0.04, FL - 0.2, WU - 0.5, z, z + 3.2); }
    box(B, pl, PX0 + 1, PX1 - 1, TOP, TOP + 9, W + WT + 5, Z1); box(B, cope, PX0 + 0.6, PX1 - 0.6, TOP + 9, TOP + 9.6, W + WT + 4.6, Z1); box(B, rf, PX0 + 1.4, PX1 - 1.4, TOP + 9.6, TOP + 9.8, W + WT + 5.4, Z1);
    for (let z = W + WT + 7.5; z < Z1 - 2; z += 3.6) for (const x of [PX0 + 0.98, PX1 - 1.1]) box(B, gl, x, x + 0.12, TOP + 1.5, TOP + 7.5, z, z + 1.5); for (let x = PX0 + 3; x < PX1 - 3; x += 3.6) box(B, gl, x, x + 1.5, TOP + 1.5, TOP + 7.5, W + WT + 4.92, W + WT + 5.05);
    for (let x = PX0 + 2.6; x < PX1 - 3; x += 3.3) for (let z = W + WT + 6.6; z < Z1 - 2; z += 2.6) B.box(2.9, 0.08, 2.0, mat('#1d3557', { m: 0.4, r: 0.25 }), x + 1.2, TOP + 10.05, z + 1, [-0.12, 0, 0]);
    B.cyl(3.6, 3.6, 13, pl, PX0 + 4, TOP + 6.5, W + WT + 3.2, [0, 0, 0], 20); B.cyl(3.9, 3.9, 0.6, cope, PX0 + 4, TOP + 13.3, W + WT + 3.2, [0, 0, 0], 20); B.mesh(new THREE.ConeGeometry(3.7, 2.0, 20), rf, [PX0 + 4, TOP + 14.6, W + WT + 3.2]);
    for (let k = 0; k < 9; k++) { const a = -1.9 + k * 0.5; B.box(0.7, 7.5, 0.25, gl, PX0 + 4 + Math.sin(a) * 3.55, TOP + 7.2, W + WT + 3.2 + Math.cos(a) * 3.55, [0, a, 0]); }
    box(B, teal, PX0 + 3.4, PX0 + 4.6, TOP + 0.9, TOP + 1.05, W - 0.5, W + WT + 1); for (const s of [-0.6, 0.6]) box(B, teal, PX0 + 4 + s - 0.04, PX0 + 4 + s + 0.04, TOP + 1.05, TOP + 2.1, W - 0.5, W + WT + 1); }
  // ---- kapufők: acél gyaloghíd a kapuk fölött, jelzőlámpák ----
  for (const [x, col] of [[XL - 3.2, '#3fae49'], [XU + 6.2, '#d8452f']]) { box(B, teal, x - 0.9, x + 0.9, TOP + 0.5, TOP + 0.68, -W - 2, W + 2); for (const s of [-0.9, 0.9]) { box(B, teal, x + s - 0.05, x + s + 0.05, TOP + 0.68, TOP + 1.8, -W - 2, W + 2); for (let z = -W - 2; z <= W + 2; z += 2) box(B, teal, x + s - 0.05, x + s + 0.05, TOP + 0.68, TOP + 1.8, z - 0.05, z + 0.05); }
    for (const z of [-W - 1.2, W + 1.2]) box(B, teal, x - 0.9, x + 0.9, TOP, TOP + 0.5, z - 0.3, z + 0.3);
    B.cyl(0.1, 0.12, 4.2, dark, x - 2.2, TOP + 2.1, -W - 1.4, [0, 0, 0], 6); box(B, dark, x - 2.5, x - 1.9, TOP + 3.6, TOP + 5.0, -W - 1.6, -W - 1.2); B.mesh(new THREE.SphereGeometry(0.2, 8, 6), mat(col, { em: col, ei: 0.9 }), [x - 2.2, TOP + 4.6, -W - 1.15]); }
  // ---- a csepeli part: kezelőépület (art deco), út, fák, lámpák, autók ----
  { const pl = mat('#ead9a6', { r: 0.9 }), gl = mat('#2f4354', { r: 0.2, m: 0.5 }), y = TOP - 0.1;
    box(B, pl, 24, 34, y, y + 7.2, -27, -18); box(B, cope, 23.6, 34.4, y + 7.2, y + 7.7, -27.4, -17.6); B.cyl(3.0, 3.0, 9.4, pl, 34, y + 4.7, -18, [0, 0, 0], 18); B.cyl(3.3, 3.3, 0.5, cope, 34, y + 9.6, -18, [0, 0, 0], 18);
    for (let k = 0; k < 6; k++) { const a = -0.4 + k * 0.5; B.box(0.6, 5.5, 0.2, gl, 34 + Math.sin(a) * 2.98, y + 5.2, -18 + Math.cos(a) * 2.98, [0, a, 0]); }
    for (const x of [25.6, 28.4, 31.2]) for (const f of [0, 1]) box(B, gl, x - 0.7, x + 0.7, y + 1.2 + f * 3.3, y + 3.2 + f * 3.3, -18.05, -17.9); box(B, mat('#5b3f2c'), 26.6, 27.8, y, y + 2.3, -18.06, -17.9);
    box(B, mat('#4a4e55', { r: 0.95 }), X0, X1, y, y + 0.1, -40, -34); box(B, mat('#d3cdbf', { r: 0.95 }), X0, X1, y, y + 0.08, -W - WT - 2.6, -W - WT - 0.2); box(B, mat('#d3cdbf', { r: 0.95 }), 26, 29, y, y + 0.08, -34, -27); box(B, mat('#d3cdbf', { r: 0.95 }), 26, 29, y, y + 0.08, -18, -13.6);
    for (const [x, z, h] of [[-90, -22, 11], [-78, -30, 10], [-66, -20, 12], [-52, -28, 10], [-40, -19, 11], [-27, -29, 12], [-14, -21, 10], [-2, -28, 11], [10, -20, 12], [44, -24, 11], [56, -19, 10], [66, -29, 12], [78, -21, 11], [90, -27, 10], [-84, -44, 9], [-30, -44, 10], [18, -44, 9], [62, -44, 10], [-58, -44, 9], [92, -43, 9]]) tree2(B, x, z, h, y);
    for (const x of [-80, -50, -20, 10, 40, 70]) lamp(B, x, -33.4, y, 6.5); car2(at(B, -34, y + 0.1, -38.4), '#b33a2e', { lite: true }); car2(at(B, 52, y + 0.1, -35.6, Math.PI), '#e9ecef', { lite: true }); car2(at(B, 20, y + 0.08, -30, Math.PI / 2), '#2f6db5', { lite: true });
    person(B, 12, -W - 1.6, 0, { y: TOP, vest: '#ff7a1a' }); person(B, XL - 3.2, 1.5, 1.6, { y: TOP + 0.68, vest: '#c6f432' }); person(B, -8, -W - 1.4, 0.4, { y: TOP, vest: '#3a5f8a', helmet: '#5a4632', shirt: '#3a5f8a' }); person(B, -6.8, -W - 1.3, -0.3, { y: TOP, vest: '#b33a2e', helmet: '#3a3f46', shirt: '#b33a2e' }); }
  B.build(root);
  // ---- kamravíz (animált magasság) ----
  const cw = node(root, 'kamraviz', [(XL + XU) / 2, FL, 0]), cwm = new THREE.Mesh(new THREE.BoxGeometry(XU - XL - 0.2, 1, 2 * W - 0.06), water); cwm.position.y = 0.5; cwm.name = 'kamraviz_m'; cw.add(cwm);
  const L0 = WD - FL, L1 = WU - FL; cw.scale.set(1, L0, 1);
  // ---- támkapuk: a szárnyak csuklója a kamrafalnál; zárva a csúcs a magasabb víz (a Duna) felé mutat, nyitva a szárny a fal mellett fekszik ----
  const gM = mat('#8a939c', { m: 0.4, r: 0.5 }), gD = mat('#5d6670', { m: 0.4, r: 0.5 }), GA = Math.acos(W / 5.4), GH = 8.78;
  const leaf = (x, s) => { const n = node(root, 'kapu', [x, 0, s * W]), L = 5.4, b = new Batch('szarny');
    b.box(0.7, GH, L, gM, 0.35, FL + GH / 2, -s * L / 2); for (let yy = FL + 0.6; yy < FL + GH; yy += 1.55) b.box(0.95, 0.22, L, gD, 0.35, yy, -s * L / 2); for (const u of [0.08, 0.5, 0.92]) b.box(0.9, GH, 0.22, gD, 0.35, FL + GH / 2, -s * L * u);
    b.box(1.5, 0.12, L, teal, 0.35, FL + GH + 0.06, -s * L / 2); for (const dx of [-0.35, 1.05]) b.box(0.05, 1.0, L, teal, dx, FL + GH + 0.6, -s * L / 2); b.build(n);
    return { n, closed: [0, -s * GA, 0], open: [0, -s * (Math.PI / 2 - 0.03), 0] }; };
  const low = [leaf(XL, 1), leaf(XL, -1)], up = [leaf(XU, 1), leaf(XU, -1)];
  // ---- a hajó: önjáró áruszállító (57 m) ----
  const ship = node(root, 'hajo'), sb = new Batch('hajo');
  sb.mesh(sideExtrude([[-28.5, -1.9], [25, -1.9], [28.5, 1.1], [-28.5, 1.1]], 8.0), mat('#2f4a6b', { r: 0.6 })); sb.box(57.2, 0.25, 8.2, mat('#c9533f'), 0, 1.15, 0); sb.box(38, 0.9, 6.4, mat('#3a3f46'), 4, 1.7, 0);
  for (let i = 0; i < 6; i++) sb.box(6.0, 0.35, 6.6, mat(i % 2 ? '#8f979f' : '#a3abb3', { m: 0.3 }), -11.2 + i * 6.2, 2.3, 0);
  sb.box(8.5, 2.6, 7.0, mat('#f2f3f1'), -22.5, 2.5, 0); sb.box(5.0, 2.2, 5.6, mat('#f2f3f1'), -22, 4.9, 0); sb.box(5.1, 1.0, 5.7, mat('#2c3c4a', { r: 0.2, m: 0.5 }), -22, 5.2, 0); sb.box(5.6, 0.2, 6.2, mat('#3a3f46'), -22, 6.1, 0);
  sb.cyl(0.07, 0.07, 3, mat('#3a3f46'), -21, 7.7, 0, [0, 0, 0], 5); sb.cyl(0.25, 0.3, 0.5, mat('#e9b21f'), 24.5, 1.5, 2.6, [0, 0, 0], 8); sb.cyl(0.25, 0.3, 0.5, mat('#e9b21f'), 24.5, 1.5, -2.6, [0, 0, 0], 8); sb.build(ship);
  // ---- idővonal ----
  const xA = -70, xB = -2, xC = 70, S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];
  const tracks = [
    trackPos(ship, [0, 6, 8, 15, 17, 22.4, 22.5, T], [[xA, WD, 0], [xB, WD, 0], [xB, WD, 0], [xB, WU, 0], [xB, WU, 0], [xC, WU, 0], [xA, WD, 0], [xA, WD, 0]]),
    trackScale(ship, [0, 22.4, 22.5, T - 0.3, T], [S1, S1, S0, S0, S1]),
    trackScale(cw, [0, 8, 15, 23.5, 25, T], [[1, L0, 1], [1, L0, 1], [1, L1, 1], [1, L1, 1], [1, L0, 1], [1, L0, 1]]),
  ];
  for (const g of low) tracks.push(trackQuat(g.n, [0, 6, 8, 25, T], [g.open, g.open, g.closed, g.closed, g.open]));
  for (const g of up) tracks.push(trackQuat(g.n, [0, 15, 17, 22.4, 23.5, T], [g.closed, g.closed, g.open, g.open, g.closed, g.closed]));
  ship.position.set(xB, WD, 0); for (const g of [...low, ...up]) g.n.rotation.set(...g.closed);
  plaque(root, hu ? 'Kvassay-zsilip · Budapest' : 'Kvassay Lock · Budapest', X0 + 3, YB + 0.9, Z1 + 0.05, K, { h: 0.019 });
  const clips = [new THREE.AnimationClip('zsilipeles', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu', zf = Z1 + 4;
    label(G, h ? 'Zsilipkamra: hasznos hossz 75 m, szélesség 10 m' : 'Lock chamber: usable length 75 m, width 10 m', [-14, FL, 0], [-40, -17, zf], SPEC.viz, K);
    label(G, h ? 'Támkapu: szárnyanként 5,40 m széles,\n8,78 m magas, 24 tonna' : 'Mitre gate: each leaf 5.40 m wide,\n8.78 m high, 24 tonnes', [XL + 2, TOP - 1, 2], [-96, 22, 10], '#8a939c', K);
    label(G, h ? 'Töltés és ürítés a falakban\nfutó csatornákon' : 'Filling and emptying through\nculverts in the walls', [NX1, FL + 0.2, W + 2.9], [34, -17, zf], '#5d6670', K);
    label(G, h ? 'Duna-főág felőli oldal' : 'Main Danube side', [88, WU, 0], [78, 30, 6], C.waterDeep, K);
    label(G, h ? 'Ráckevei (Soroksári)-Duna:\nszabályozott vízszint' : 'Ráckeve (Soroksár) Danube:\nregulated water level', [-88, WD, 22], [-100, 16, zf], C.waterDeep, K);
    label(G, h ? 'Erőmű és szivattyútelep' : 'Power and pumping station', [PX0 + 10, TOP + 9.8, Z1 - 4], [PX0 + 6, 32, zf], '#e7d9a8', K);
    label(G, h ? 'Kezelőépület' : 'Control building', [30, TOP + 7.6, -20], [6, 32, -16], '#ead9a6', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [-22, 26], posterT: 12.5, labelT: 12.5 };
}
