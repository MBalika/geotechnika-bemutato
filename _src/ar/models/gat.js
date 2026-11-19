// Vízlépcső vízerőművel (Vízmérnöki): a Kiskörei vízlépcső a Tiszán (403,2 fkm, épült 1967–1973), az alvíz felől nézve.
// Elrendezés légifénykép szerint: balra (a jobb parton) a vízerőmű, középen az ötnyílású duzzasztómű, jobbra (a bal parton) a hajózsilip;
// az alvízi oldalon az üzemi híd. A modell bal széle az első gépegység tengelyében metszi el az erőművet: látszik a csőturbina a vízjáratban.
// Animáció (16 s): forog a turbina járókereke, a középső tábla billenőtáblája lebillen és a víz átbukik rajta, a hídon autók járnak.
// Adatok (KÖTIVIZIG, Wikipedia): 5 nyílás, egyenként 24 m, billenőtáblás acél szegmensgát; 4 vízszintes tengelyű csőturbina, 4 × 7 = 28 MW;
// hajózsilip 85 × 12 m. A vízszintkülönbség, a mélységek és az erőmű belső részletei szemléltetők.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackQuat, trackScale, spinTrack, person } from '../lib/common.js';
import { at, car2, van2, tree2, lamp, plaque } from '../lib/kit2.js';
export const FILE = 'gat-vizeromu';
const K = 1 / 350;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'vizlepcso';
  const B = new Batch('vizlepcso'), tracks = [], T = 16;
  const X0 = -95, X1 = 160, Z0 = -80, Z1 = 90, YB = -26, WU = 0, WD = -7, BU = -9, BD = -12, DECK = 5;
  const PH1 = -39, WX0 = -33, LX0 = 111, LX1 = 131, LC0 = 115, LC1 = 127;      // az erőmű vége; a duzzasztómű kezdete; a zsilip
  const conc = mat('#d4d0c6', { r: 0.9 }), concD = mat('#b7b2a8', { r: 0.9 }), concL = mat('#e4e1d8'), steel = mat('#5f7f96', { m: 0.4, r: 0.5 }), dark = mat('#23272b'), yel = mat('#e9b21f', { r: 0.5, m: 0.2 });
  const water = mat(C.water, { op: 0.8, r: 0.15 }), foam = mat('#f4f8fa', { op: 0.75, r: 0.6 }), grass = mat('#8fbf6a', { r: 1 }), glassM = mat('#2f4354', { r: 0.2, m: 0.5 });
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  // (z, y) szelvény kihúzva x irányban xa-tól xb-ig, lyukakkal
  const secX = (b, pts, holes, xa, xb, m) => { const sh = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1]))); for (const h of holes) sh.holes.push(new THREE.Path(h.map(p => new THREE.Vector2(p[0], p[1]))));
    const g = new THREE.ExtrudeGeometry(sh, { depth: xb - xa, bevelEnabled: false, curveSegments: 4 }); g.rotateY(-Math.PI / 2); g.translate(xb, 0, 0); b.add(g, m); };
  // ---- meder, alaptömb, bal parti (keleti) feltöltés ----
  { const dk = mat('#77706a'), gr = mat(C.gravel); box(B, dk, PH1, X1, YB, -17, Z0, Z1); box(B, gr, PH1, LX0, -17, BD, Z0, Z1); box(B, dk, X0, PH1, YB, -20, -14, 18);
    for (const [za, zb] of [[Z0, -14], [18, Z1]]) { box(B, dk, X0, PH1, YB, -17, za, zb); box(B, gr, X0, PH1, -17, BD, za, zb); } box(B, mat('#b9a47f'), X0, LX0, BD, BU, Z0, -14); box(B, conc, PH1, WX0, -20, 2, -14, 18); }
  box(B, mat(C.gravel), LX0, X1, -17, -10, Z0, Z1); box(B, mat('#a8947a'), LX1, X1, -10, DECK - 0.4, Z0, Z1); box(B, grass, LX1, X1, DECK - 0.4, DECK - 0.1, Z0, Z1);
  box(B, water, X0, LX0, BU, WU, Z0, -14); box(B, water, X0, LX0, BD, WD, 18, Z1);
  // ---- vízerőmű: az első gépegység tengelyében elmetszve (x = X0), a többi három tömör; gépház ablakokkal, tetőfelülvilágítók ----
  const WAY = [[-14, -17.5], [-14, -6.5], [-4, -8.6], [1, -9.8], [3.2, -9.8], [18, -8.4], [18, -16.6], [3.2, -14.2], [1, -14.2], [-4, -15.4]], HALL = [[-7, 3], [9, 3], [9, 13], [-7, 13]];
  const BODY = [[-14, -20], [18, -20], [18, 2], [10, 2], [10, 14.6], [-8, 14.6], [-8, 2], [-14, 2]];
  secX(B, BODY, [WAY, HALL], X0, X0 + 7, conc); secX(B, WAY, [], X0 + 0.05, X0 + 7, mat(C.water, { op: 0.55, r: 0.15 }));
  box(B, conc, X0 + 7, PH1, -20, 2, -14, 18); box(B, concL, X0 + 7, PH1, 2, 14.6, -8, 10); box(B, concD, X0, PH1 + 0.4, 14.6, 15.2, -8.5, 10.5); box(B, concD, X0, PH1, 2, 2.5, -14.3, 18.3);
  for (let i = 0; i < 4; i++) { const xc = X0 + i * 14.2; if (i) { box(B, dark, xc - 5, xc + 5, -17.5, -6.5, -14.1, -13.9); for (let x = xc - 4.6; x < xc + 5; x += 0.9) box(B, steel, x, x + 0.15, -17.5, -6.5, -14.25, -14.05); box(B, dark, xc - 5, xc + 5, -16.6, -8.4, 17.9, 18.1); }
    box(B, mat('#f1f1ee', { r: 0.5 }), Math.max(X0, xc - 4.5), xc + 4.5, 15.2, 15.6, -4, 6); box(B, foam, Math.max(X0, xc - 5), xc + 5, WD - 0.03, WD + 0.08, 18.2, 34 + (i % 2) * 5); }
  for (let x = X0 + 9; x < PH1 - 2; x += 4.6) for (const [z, s] of [[10.02, 1], [-8.02, -1]]) box(B, glassM, x, x + 2.4, 5, 12, Math.min(z, z + s * 0.12), Math.max(z, z + s * 0.12)); box(B, glassM, PH1 - 0.02, PH1 + 0.1, 5, 12, -5, 7);
  box(B, yel, X0 + 0.4, X0 + 1.4, 11.2, 12.2, -7, 9); box(B, yel, X0 + 0.5, X0 + 1.3, 9.6, 11.2, 0, 1.6);                                                     // a gépház daruja a metszetben
  // a csőturbina a vízjáratban: körte alakú ház a generátorral, vezetőlapátok, járókerék (forog)
  { const ax = -12; B.mesh(new THREE.CylinderGeometry(1.7, 1.7, 6.5, 16), mat('#2f4a6b', { r: 0.5, m: 0.3 }), [X0, ax, -5.2], [Math.PI / 2, 0, 0]); B.mesh(new THREE.SphereGeometry(1.7, 16, 10), mat('#2f4a6b', { r: 0.5, m: 0.3 }), [X0, ax, -8.4], [0, 0, 0], [1, 1, 1.5]);
    B.mesh(new THREE.ConeGeometry(1.7, 2.4, 16), mat('#2f4a6b', { r: 0.5, m: 0.3 }), [X0, ax, -0.8], [Math.PI / 2, 0, 0]); B.box(1.0, 5, 1.6, mat('#3a5f8a'), X0, ax + 3.2, -5.5); B.box(0.6, 3.4, 1.2, concD, X0, ax - 3.4, -6);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; B.box(0.2, 1.5, 0.9, steel, X0 + Math.sin(a) * 1.9, ax + Math.cos(a) * 1.9, 0.6, [0, 0, -a]); }
    const run = node(root, 'jarokerek', [X0, ax, 2.2]), rb = new Batch('kerek'); rb.mesh(new THREE.CylinderGeometry(0.75, 0.5, 1.8, 12), mat(SPEC.viz, { m: 0.3 }), [0, 0, 0], [Math.PI / 2, 0, 0]); for (let i = 0; i < 4; i++) rb.box(0.22, 2.15, 1.1, mat('#e9a03a', { m: 0.4, r: 0.4 }), 0, 0, 0, [0.5, 0, i * Math.PI / 2 + 0.01]).box(0.01, 0.01, 0.01, dark, 0, 0, 0);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; rb.mesh(new THREE.BoxGeometry(0.2, 1.5, 1.2), mat('#e9a03a', { m: 0.4, r: 0.4 }), [Math.sin(a) * 1.35, Math.cos(a) * 1.35, 0], [0, 0.6 * Math.cos(a), -a]); } rb.build(run); tracks.push(spinTrack(run, [0, 0, 1], 2, 6, T)); }
  // ---- duzzasztómű: hat pillér, öt 24 m-es nyílás, küszöb, szegmensgát billenőtáblával; fölötte daruhíd ----
  const gates = [];
  for (let i = 0; i < 6; i++) { const xa = WX0 + i * 28; box(B, conc, xa, xa + 4, -17, DECK, -14, 16); B.mesh(new THREE.CylinderGeometry(2, 2, DECK + 17, 12, 1, false, 0, Math.PI), conc, [xa + 2, (DECK - 17) / 2, -14], [0, Math.PI / 2, 0]); box(B, concD, xa - 0.3, xa + 4.3, DECK, DECK + 0.6, -14.5, 16.5);
    if (i < 5) { const x0 = xa + 4, x1 = xa + 28; box(B, concD, x0, x1, -17, BU + 0.5, -14, 16); box(B, conc, x0, x1, BU + 0.5, BU + 1.6, -4, 4); box(B, water, x0, x1, BU + 0.5, WU, -14, -1.6); box(B, water, x0, x1, BU + 0.5, WD, 3, 16);
      // szegmenstábla: hengerpalást-szelet a felvíz felé domborodva, karokkal a pillérek csapjaihoz
      B.mesh(new THREE.CylinderGeometry(11, 11, 24, 10, 1, true, Math.PI * 1.02, Math.PI * 0.26), mat('#5f7f96', { m: 0.4, r: 0.5, ds: true }), [(x0 + x1) / 2, -0.6, 9.2], [0, 0, Math.PI / 2]);
      for (const x of [x0 + 0.6, x1 - 0.6]) { B.rod([x, -0.6, 9.2], [x, -7.2, 0.3], 0.3, steel, 6); B.rod([x, -0.6, 9.2], [x, -1.6, -1.6], 0.3, steel, 6); B.cyl(0.6, 0.6, 0.8, dark, x, -0.6, 9.2, [0, 0, Math.PI / 2], 10); }
      const fl = node(root, 'billenotabla', [(x0 + x1) / 2, -1.5, -1.7]), fb = new Batch('tabla'); fb.box(23.6, 2.6, 0.3, mat('#4f8dff', { m: 0.3, r: 0.5 }), 0, 1.3, 0); fb.build(fl); gates.push(fl);
      box(B, foam, x0 + 1, x1 - 1, WD - 0.03, WD + 0.1, 3.2, 24 + (i % 2) * 6); } }
  { const g = gates[2], dn = [-1.25, 0, 0], up = [0.08, 0, 0]; for (const q of gates) q.rotation.set(...up); tracks.push(trackQuat(g, [0, 2, 5, 11, 14, T], [up, up, dn, dn, up, up]));
    const of = node(root, 'atbukas', [WX0 + 2 * 28 + 16, -1.6, 1.2]), ob = new Batch('atbukas'); ob.box(23, 0.25, 4.2, mat(C.water, { op: 0.7, r: 0.1 }), 0, 0.3, -1.6); ob.mesh(new THREE.CylinderGeometry(2.6, 2.6, 23, 8, 1, true, 0, Math.PI / 2), mat('#dfeef6', { op: 0.75, ds: true }), [0, -2.4, 0.6], [0, Math.PI / 2, Math.PI / 2]); ob.box(23, 5.5, 0.5, foam, 0, -3.2, 3.2, [0.25, 0, 0]); ob.build(of);
    tracks.push(trackScale(of, [0, 3.6, 5, 11, 12.4, T], [[1, 0.001, 0.001], [1, 0.001, 0.001], [1, 1, 1], [1, 1, 1], [1, 0.001, 0.001], [1, 0.001, 0.001]])); of.scale.set(1, 0.001, 0.001); }
  box(B, concD, WX0, LX0, DECK + 0.6, DECK + 1.3, -12, -4); for (const z of [-11.5, -4.5]) box(B, steel, WX0, LX0, DECK + 1.3, DECK + 1.5, z - 0.1, z + 0.1);                // daruhíd a pilléreken
  for (const xg of [WX0 + 100, X0 + 30]) { const zc = xg > 0 ? -8 : 1; for (const s of [-1, 1]) for (const dx of [-3, 3]) box(B, yel, xg + dx - 0.3, xg + dx + 0.3, xg > 0 ? DECK + 1.5 : 15.2, 24, zc + s * 3.6 - 0.3, zc + s * 3.6 + 0.3); box(B, yel, xg - 4, xg + 4, 24, 25.4, zc - 5.5, zc + 5.5); box(B, dark, xg - 1, xg + 1, 22.6, 24, zc - 1, zc + 1); }
  // ---- üzemi híd az alvízi oldalon: pályalemez a pillérek meghosszabbításán, korlát, autók ----
  for (let i = 0; i < 6; i++) box(B, conc, WX0 + i * 28 + 0.6, WX0 + i * 28 + 3.4, -17, DECK + 2.2, 16, 26); for (const x of [X0 + 20, X0 + 44]) box(B, conc, x, x + 2.5, -17, DECK + 2.2, 19, 26);
  box(B, concD, X0, LX1 + 6, DECK + 2.2, DECK + 3.1, 18, 26); box(B, mat('#4a4e55'), X0, LX1 + 6, DECK + 3.1, DECK + 3.2, 19, 25); for (const z of [18.3, 25.7]) { box(B, steel, X0, LX1 + 6, DECK + 4.1, DECK + 4.2, z - 0.05, z + 0.05); for (let x = X0 + 1; x < LX1 + 6; x += 3) box(B, steel, x - 0.05, x + 0.05, DECK + 3.1, DECK + 4.15, z - 0.05, z + 0.05); }
  B.mesh(new THREE.BoxGeometry(30, 0.9, 8), concD, [LX1 + 19, DECK + 1.25, 22], [0, 0, -0.105]);
  [['#b33a2e', 0.1, 1], ['#e9ecef', 0.6, 1], ['#2f6db5', 0.35, -1]].forEach(([c, ph, d]) => { const nd = node(root, 'auto'), cb = new Batch('auto'); car2(at(cb, 0, 0, 0, d > 0 ? 0 : Math.PI), c, { lite: true }); cb.build(nd); const xa = X0 + 4, xb = LX1 + 2, y = DECK + 3.2, z = 22 + d * 1.6, tw = (1 - ph) * T, xs = (t) => { const f = (t / T + ph) % 1; return d > 0 ? xa + (xb - xa) * f : xb - (xb - xa) * f; };
    const times = [0, tw - 0.001, tw, T], vals = times.map((t) => [t === tw ? (d > 0 ? xa : xb) : xs(Math.min(t, T - 1e-4)), y, z]); nd.position.set(...vals[0]); tracks.push(trackPos(nd, times, vals)); });
  // ---- hajózsilip a bal parton: kamra 85 × 12 m, támkapuk, terelőfalak; a kamrában hajó a felvíz szintjén ----
  box(B, conc, LX0, LC0, -10, DECK, -62, 52); box(B, conc, LC1, LX1, -10, DECK, -62, 52); box(B, concD, LC0, LC1, -10, BD + 0.5, Z0, Z1); box(B, conc, LX0, LX0 + 2.5, -10, DECK - 1, Z0, -62); box(B, conc, LX0, LX0 + 2.5, -10, DECK - 3, 52, Z1);
  box(B, water, LC0, LC1, BD + 0.5, WU, Z0, -44); box(B, water, LC0, LC1, BD + 0.5, WU - 0.5, -44, 41); box(B, water, LC0, LC1, BD + 0.5, WD, 41, Z1); box(B, water, LX0 + 2.5, LC0, -10, WU, Z0, -62); box(B, water, LX0 + 2.5, LC0, -10, WD, 52, Z1);
  box(B, mat(C.gravel), LC1, LX1, -10, BD, Z0, -62); box(B, mat('#a8947a'), LC1, LX1, BD, DECK - 0.4, Z0, -62); box(B, mat('#a8947a'), LC1, LX1, -10, DECK - 0.4, 52, Z1);
  for (const [z, s] of [[-44, 1], [41, 1]]) for (const sx of [-1, 1]) { const L = 6.4, a = 0.36; B.box(L, DECK - 1 - (BD + 0.5), 0.7, steel, (LC0 + LC1) / 2 + sx * (6 - L / 2 * Math.cos(a)), (DECK - 1 + BD + 0.5) / 2, z - L / 2 * Math.sin(a), [0, sx * a, 0]); }
  for (const z of [-48, 45]) { box(B, steel, LX0 + 0.5, LX1 - 0.5, DECK + 0.4, DECK + 0.6, z - 0.8, z + 0.8); for (const dz of [-0.8, 0.8]) box(B, steel, LX0 + 0.5, LX1 - 0.5, DECK + 1.5, DECK + 1.6, z + dz - 0.04, z + dz + 0.04); }
  { const S = at(B, (LC0 + LC1) / 2, WU - 0.5, -2, -Math.PI / 2); S.box(60, 3.6, 9.4, mat('#2f4a6b', { r: 0.6 }), 0, -0.6, 0); S.box(60.2, 0.25, 9.6, mat('#c9533f'), 0, 1.25, 0); for (let i = 0; i < 6; i++) S.box(6.4, 0.4, 7.6, mat(i % 2 ? '#8f979f' : '#a3abb3', { m: 0.3 }), -12 + i * 6.6, 1.6, 0); S.box(8.5, 2.6, 8.2, mat('#f2f3f1'), -24, 2.6, 0); S.box(5, 2.2, 6.4, mat('#f2f3f1'), -23.5, 5, 0); S.box(5.1, 1.0, 6.5, glassM, -23.5, 5.3, 0); }
  // ---- a bal part: kezelőépület, út, fák, emberek ----
  { const y = DECK - 0.1; box(B, concL, 138, 150, y, y + 9, -30, -14); box(B, concD, 137.6, 150.4, y + 9, y + 9.5, -30.4, -13.6); for (const f of [0, 1]) for (let z = -28.5; z < -15; z += 3.4) box(B, glassM, 137.9, 138.05, y + 1.4 + f * 4, y + 3.6 + f * 4, z, z + 1.8); box(B, mat('#4a4e55'), 134, 141, y, y + 0.1, Z0, Z1); box(B, mat('#4a4e55'), 134, X1, y, y + 0.1, 19, 26);
    for (const [x, z, h] of [[152, -66, 11], [146, -48, 10], [154, -4, 12], [147, 8, 10], [153, 40, 11], [146, 58, 12], [155, 74, 10], [146, 82, 9], [156, -40, 10], [150, 34, 9]]) tree2(B, x, z, h, y); for (const z of [-60, -20, 40, 70]) lamp(B, 133, z, y, 6.5);
    van2(at(B, 137.5, y + 0.1, 50, Math.PI / 2)); person(B, 132.5, -8, 1.6, { y: DECK, vest: '#ff7a1a' }); person(B, 132.4, 30, -1.4, { y: DECK, vest: '#c6f432' }); person(B, 20, 20, 0, { y: DECK + 3.2, vest: '#3a5f8a', helmet: '#5a4632', shirt: '#3a5f8a' }); person(B, -60, 12, 3, { y: 2.5, vest: '#ff7a1a' }); }
  B.build(root);
  plaque(root, hu ? 'Kiskörei vízlépcső · Tisza' : 'Kisköre Barrage · River Tisza', X0 + 30, YB + 1.2, Z1 + 0.05, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('vizlepcso', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu', zf = Z1 + 6;
    label(G, h ? 'Csőturbina a vízjáratban (metszet)' : 'Bulb turbine in its water passage (section)', [X0, -12, 2.2], [X0 - 18, -30, 40], SPEC.viz, K, { ry: 0 });
    label(G, h ? 'Vízerőmű: 4 csőturbina, 4 × 7 = 28 MW' : 'Power station: 4 bulb turbines, 4 × 7 = 28 MW', [X0 + 26, 15.6, 2], [X0 - 6, 36, 20], '#e4e1d8', K);
    label(G, h ? 'Duzzasztómű: 5 nyílás, egyenként 24 m' : 'Weir: 5 openings, 24 m each', [WX0 + 44, DECK + 0.6, 0], [WX0 + 20, 40, 10], '#d4d0c6', K);
    label(G, h ? 'Szegmensgát billenőtáblával' : 'Radial gate with tilting flap', [WX0 + 72, -1, -1.6], [WX0 + 70, 26, 34], '#5f7f96', K);
    label(G, h ? 'Hajózsilip: 85 × 12 m' : 'Ship lock: 85 × 12 m', [(LC0 + LC1) / 2, WU, 20], [132, 26, 60], C.waterDeep, K);
    label(G, h ? 'Felvíz: Tisza-tó' : 'Headwater: Lake Tisza', [20, WU, -60], [30, 22, -60], C.waterDeep, K);
    label(G, h ? 'Alvíz' : 'Tailwater', [50, WD, 70], [44, -22, zf], C.waterDeep, K);
    label(G, h ? 'Üzemi híd' : 'Service bridge', [96, DECK + 3.2, 25], [104, -20, zf], '#b7b2a8', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [-30, 24], posterT: 8, labelT: 8 };
}
