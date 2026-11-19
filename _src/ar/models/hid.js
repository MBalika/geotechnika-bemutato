// Megyeri híd (Tartószerkezetek) – az M0 északi Duna-hídjának ferdekábeles főhídja a Nagy-Duna-ág fölött.
// Adatok (CÉH Zrt.; Kisbán S.: Vasbetonépítés 2009/2; Hídász Napok 2007): háromnyílású ferdekábeles híd, 145 + 300 + 145 m;
// két „A” alakú vasbeton pilon, 100 m magasan az alépítmény fölött, a szárak külső befoglaló mérete lent 51 m, szekrény keresztmetszetük 5,0 × 4,0 → 3,5 × 4,0 m;
// a szárakat 55 m magasan szekrényes vasbeton gerenda köti össze, fölötte a kábellehorgonyzások és az üvegfallal burkolt pilonfej;
// az alépítmény (felmenőfal) 10,2 m magas, kb. 64 m széles, 7–8 m vastag; a pálya a két pilonszár között kb. 10 m magasan fut;
// acél merevítőtartó ortotrop pályalemezzel, két szélén szekrényes, 36,83 m széles, 3,63 m magas; 88 kábel (4 × 11), legyezőszerűen, két síkban, 12 m-enként.
// Animáció (24 s): forgalom mindkét irányban, a hajózó nyílásban tolóhajó és kirándulóhajó.
import { THREE, Batch, mat, C, SPEC, soilBlock, label, trackPos, node } from '../lib/common.js';
import { at, sideExtrude, planPrism, car2, van2, truck2, bus2, tree2, plaque } from '../lib/kit2.js';
export const FILE = 'ferdekabeles-hid';
const K = 1 / 600;

// csonka gúla jellegű hasáb: alul (x, z) méret b, felül t; az alsó és a felső lap közepe megadva
function taper(c0, b, c1, t) { const g = new THREE.BoxGeometry(1, 1, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getY(i) + 0.5, sx = lerp(b[0], t[0], u), sz = lerp(b[1], t[1], u); p.setXYZ(i, lerp(c0[0], c1[0], u) + p.getX(i) * sx, lerp(c0[1], c1[1], u), lerp(c0[2], c1[2], u) + p.getZ(i) * sz); }
  g.computeVertexNormals(); return g; }
const lerp = (a, b, u) => a + (b - a) * u;

export function build({ lang }) {
  const hu = lang !== 'en';
  const root = new THREE.Group(); root.name = 'hid';
  const B = new Batch('hid');
  const X = 345, Z = 62, RIV = 236, WL = -6, BED = -14, PX = 150, EP = 295;                 // a modell fél hossza és fél szélessége, a meder fél szélessége, vízszint, mederfenék, pilonok, közös pillérek
  const PB = 4.2, PH = 100, DB = PB + 10, DH = 3.63, DT = DB + DH, DW = 36.83;              // a pilon befogása (az alépítmény teteje), pilonmagasság, a pálya alsó és felső síkja, szélessége
  const LZ0 = 23.5, LZ1 = 2.0, legZ = (h) => lerp(LZ0, LZ1, h / PH), legX = (h) => lerp(5.0, 3.5, h / PH), CBH = 55;   // a szár tengelye (keresztirányban) és hosszirányú mérete a magasság szerint; összekötő gerenda
  const conc = mat('#ecebe6', { r: 0.7 }), concD = mat('#cfccc4', { r: 0.8 }), steel = mat('#e6e9ec', { r: 0.5, m: 0.3 }), steelD = mat('#b7bdc4', { r: 0.6, m: 0.3 });

  // ---- terep: a pesti (bal) part és a Szentendrei-sziget (jobb), köztük a Nagy-Duna; elöl metszet ----
  const lay = [[3, C.fill], [8, C.gravel], [21, C.clay]];
  for (const s of [-1, 1]) { const x0 = s < 0 ? -X : RIV, x1 = s < 0 ? -RIV : X; soilBlock(B, x0, x1, -Z, Z, lay); B.boxB(x1 - x0, 0.5, Z * 2, mat('#86b565', { r: 1 }), (x0 + x1) / 2, 0, 0); }
  B.box(RIV * 2, 5, Z * 2, mat(C.gravel), 0, BED - 2.5, 0); B.box(RIV * 2, 32 - 5 + BED, Z * 2, mat(C.clay), 0, (-32 + BED - 5) / 2, 0);
  B.box(RIV * 2, WL - BED, Z * 2, mat('#4f95cf', { op: 0.8, r: 0.2, m: 0.1 }), 0, (WL + BED) / 2, 0);
  for (const s of [-1, 1]) { B.mesh(sideExtrude([[0, 0.5], [9, BED], [0, BED]].map(([x, y]) => [s * (RIV - x), y]), Z * 2), mat('#9a968d', { r: 1 })); }       // kőszórásos partrézsű
  // ártéri erdő és gyalogút a két parton
  for (let i = 0; i < 46; i++) { const s = i % 2 ? 1 : -1, x = s * (RIV + 12 + ((i * 37) % 92)), z = -Z + 5 + ((i * 53) % (2 * Z - 10)); if (Math.abs(z) < 30) continue; tree2(B, x, z, 9 + (i % 4) * 2, 0.5, i % 3 ? {} : { c1: '#4f8a43', c2: '#699f4e' }); }
  for (const s of [-1, 1]) B.box(4, 0.08, Z * 2, mat('#d8cfb8', { r: 1 }), s * (RIV + 6), 0.54, 0);

  // ---- alépítmény: mederpillér (felmenőfal) a pilonok alatt, közös pillérek a főhíd végén ----
  for (const s of [-1, 1]) { const x = s * PX, W = 64, TH = 7.5;
    B.boxB(TH + 6, 3.5, W + 8, concD, x, BED - 0.5, 0);                                                                                                // alaptest a mederben
    B.box(TH, PB - (BED + 3), W - TH, conc, x, (PB + BED + 3) / 2, 0); for (const sz of [-1, 1]) B.cyl(TH / 2, TH / 2, PB - (BED + 3), conc, x, (PB + BED + 3) / 2, sz * (W - TH) / 2, [0, 0, 0], 20);   // felmenőfal lekerekített végekkel
    B.box(TH + 0.6, 0.8, W - TH, concD, x, PB - 0.4, 0); }
  for (const s of [-1, 1]) { const x = s * EP; B.boxB(4.5, DB + 0.2, 34, conc, x, 0.3, 0); B.boxB(6, 1.4, 40, concD, x, 0.3, 0); }

  // ---- pilonok: „A” alak, két befelé dőlő szekrényes szár, 55 m-en összekötő gerenda, fölötte üvegfalas pilonfej ----
  const glass = mat('#9cc7e2', { r: 0.08, m: 0.5, op: 0.72, ds: true, dw: true });
  for (const s of [-1, 1]) { const x = s * PX;
    for (const sz of [-1, 1]) { B.add(taper([x, PB, sz * LZ0], [5.0, 4.0], [x, PB + PH, sz * LZ1], [3.5, 4.0]), conc);
      B.add(taper([x, DB - 2.6, sz * (legZ(DB - PB - 1.3) - 2.6)], [3.6, 2.2], [x, DB - 0.25, sz * (legZ(DB - PB) - 3.4)], [3.6, 3.8]), conc); }                   // konzol a pálya alatt
    const zi = (h) => legZ(h) - 2.0; B.box(3.4, 3.6, 2 * zi(CBH) + 0.4, conc, x, PB + CBH, 0); B.box(3.6, 0.5, 2 * zi(CBH + 1.8) + 0.3, concD, x, PB + CBH + 2.05, 0);       // összekötő gerenda
    const h0 = CBH + 2.3, h1 = PH - 1.2, shp = [[-zi(h0), PB + h0], [zi(h0), PB + h0], [zi(h1), PB + h1], [-zi(h1), PB + h1]];
    for (const dx of [-1.25, 1.25]) { const g = sideExtrude(shp, 0.12); g.rotateY(Math.PI / 2); B.mesh(g, glass, [x + dx, 0, 0]); }                                // üvegfal a pilonfejen, elöl és hátul
    for (let h = h0 + 3.2; h < h1; h += 3.2) for (const dx of [-1.33, 1.33]) B.box(0.08, 0.14, 2 * zi(h), mat('#f4f5f3'), x + dx, PB + h, 0);
    for (const dx of [-1.33, 1.33]) B.box(0.08, h1 - h0, 0.14, mat('#f4f5f3'), x + dx, PB + (h0 + h1) / 2, 0);
    B.box(4.2, 1.2, 2 * LZ1 + 4.4, conc, x, PB + PH + 0.3, 0); B.cyl(0.08, 0.08, 4, mat('#8a9299', { m: 0.6 }), x, PB + PH + 2.9, 0, [0, 0, 0], 6); }

  // ---- merevítőtartó: ortotrop pályalemez, a két szélén szekrénytartó, kereszttartók; burkolat, korlátok ----
  const L = 2 * EP;
  B.box(L, 0.3, DW, steel, 0, DT - 0.15, 0);
  for (const sz of [-1, 1]) { B.mesh(sideExtrude([[0, 0], [3.4, 0], [2.6, -DH + 0.3], [0.5, -DH + 0.3]].map(([z, y]) => [sz * (DW / 2 - z), DT - 0.3 + y]), L).rotateY(Math.PI / 2), steel);          // szélső szekrénytartó
    B.box(L, 0.25, 2.2, steelD, 0, DB + 0.12, sz * (DW / 2 - 1.55)); }
  for (let x = -EP + 2; x < EP; x += 4) B.box(0.16, DH - 1.0, DW - 6.4, steelD, x, DT - 0.3 - (DH - 1.0) / 2, 0);                                            // kereszttartók
  for (const sz of [-1, 1]) { B.box(L, 0.1, 11.6, mat('#3f434a', { r: 0.95 }), 0, DT + 0.05, sz * 7.4);                                                     // útpálya: 2 sáv + leállósáv irányonként
    B.box(L, 0.02, 0.2, mat(C.white), 0, DT + 0.11, sz * 1.9); B.box(L, 0.02, 0.2, mat(C.white), 0, DT + 0.11, sz * 9.6); for (let x = -EP + 4; x < EP - 6; x += 12) B.box(6, 0.02, 0.18, mat(C.white), x + 3, DT + 0.11, sz * 5.7);
    B.box(L, 0.8, 0.35, mat('#aeb4ba', { m: 0.5, r: 0.5 }), 0, DT + 0.4, sz * 13.5);                                                                          // szalagkorlát
    B.box(L, 0.06, 2.3, mat('#b9a58c', { r: 0.9 }), 0, DT + 0.03, sz * 17.05);                                                                                 // gyalog- és kerékpárút a kábelsíkon kívül
    B.box(L, 0.08, 0.08, steelD, 0, DT + 1.25, sz * (DW / 2 - 0.15)); for (let x = -EP + 1; x < EP; x += 3) B.box(0.07, 1.25, 0.07, steelD, x, DT + 0.62, sz * (DW / 2 - 0.15)); }  // korlát
  B.box(L, 0.9, 0.7, mat('#c9ccc8', { r: 0.8 }), 0, DT + 0.45, 0);                                                                                             // középső elválasztó
  for (let x = -EP + 18; x < EP; x += 36) { B.cyl(0.12, 0.16, 10, steelD, x, DT + 5.9, 0, [0, 0, 0], 6); for (const sz of [-1, 1]) { B.box(0.12, 0.12, 4.4, steelD, x, DT + 10.8, sz * 2.2); B.box(0.5, 0.1, 1.0, mat('#fff6d8', { em: '#fff2c0', ei: 0.8 }), x, DT + 10.7, sz * 4.2); } }   // kandeláberek

  // ---- csatlakozó ártéri hidak (vasbeton gerendahidak, két különálló pályával) ----
  for (const s of [-1, 1]) { const xa = s * (EP + 0.2), xb = s * X, xm = (xa + xb) / 2, Ls = Math.abs(xb - xa);
    for (const sz of [-1, 1]) { B.box(Ls, 0.5, 17.6, conc, xm, DT - 0.25, sz * 9.3); B.box(Ls, 2.4, 8.5, concD, xm, DT - 1.7, sz * 9.3); B.box(Ls, 0.1, 11.6, mat('#3f434a', { r: 0.95 }), xm, DT + 0.05, sz * 7.4);
      B.box(Ls, 0.8, 0.35, mat('#aeb4ba', { m: 0.5, r: 0.5 }), xm, DT + 0.4, sz * 13.5); B.box(Ls, 1.2, 0.2, steelD, xm, DT + 0.6, sz * 17.9);
      B.cyl(1.6, 1.6, DT - 3.2, conc, s * (EP + 28), (DT - 3.2) / 2 + 0.3, sz * 9.3, [0, 0, 0], 14); B.box(3.4, 1.2, 10, conc, s * (EP + 28), DT - 3.5, sz * 9.3); } }

  // ---- ferdekábelek: pilononként és száranként 11 + 11, legyezőszerűen, a pályán 12 m-enként lehorgonyozva (összesen 88) ----
  const cab = new Batch('kabel'); const cm = mat('#f6f7f5', { r: 0.4 }); const AZ = DW / 2 - 3.4;
  for (const s of [-1, 1]) for (const dir of [-1, 1]) for (let i = 0; i < 11; i++) { const xd = s * PX + dir * (13 + i * 12), h = 58.5 + i * 3.5;
    for (const sz of [-1, 1]) { cab.rod([s * PX + dir * 1.2, PB + h, sz * (legZ(h) - 0.4)], [xd, DT + 0.5, sz * AZ], 0.36, cm, 6); cab.box(1.4, 1.0, 0.9, steelD, xd, DT + 0.45, sz * AZ); } }
  cab.build(root);
  B.build(root);

  // ---- forgalom (animált csomópontok) és hajók ----
  const T = 24, tracks = [];
  const lanes = [[-3.8, 1], [-7.6, 1], [3.8, -1], [7.6, -1]], cc = ['#c23a2e', '#2f6db5', '#e9b21f', '#f2f3f1', '#3a3f46', '#8a9299', '#7bb662'];
  let n = 0;
  for (const [z, d] of lanes) for (let j = 0; j < 4; j++) { const kind = (n % 7 === 3) ? 'kamion' : (n % 7 === 5) ? 'busz' : (n % 7 === 1) ? 'furgon' : 'auto'; const nd = node(root, kind); const vb = new Batch(kind), T2 = at(vb, 0, 0, 0, d < 0 ? Math.PI : 0);
    if (kind === 'kamion') truck2(T2, cc[n % 2 ? 1 : 0]); else if (kind === 'busz') bus2(T2); else if (kind === 'furgon') van2(T2); else car2(T2, cc[n % cc.length]); vb.build(nd);
    const x0 = -(X - 4), x1 = X - 4, ph = (j / 4 + (n % 3) * 0.07) % 1, xs = (t) => { const f = (t / T + ph) % 1; return d > 0 ? x0 + (x1 - x0) * f : x1 - (x1 - x0) * f; };
    const tw = (1 - ph) * T, times = [0, tw - 0.001, tw, T].filter((v, i, a) => v >= 0 && v <= T && (i === 0 || v > a[i - 1]));
    const vals = times.map((t) => [t === tw ? (d > 0 ? x0 : x1) : xs(Math.min(t, T - 1e-4)), DT + 0.1, z]); nd.position.set(...vals[0]); tracks.push(trackPos(nd, times, vals)); n++; }
  { const ship = node(root, 'tolohajo'); const sb = new Batch('hajo'), S = at(sb, 0, 0, 0, -Math.PI / 2);                                                      // tolóhajó két uszállyal (a folyás irányában, a −z felé halad)
    for (const dx of [16]) { S.mesh(sideExtrude([[-28, -1.4], [28, -1.4], [30, 1.2], [-29, 1.2]], 10.5), mat('#31404f', { r: 0.7 }), [dx, 0, 0]); S.box(52, 1.6, 8.6, mat(dx > 40 ? '#8a6a48' : '#55606b', { r: 1 }), dx, 1.5, 0); }
    S.mesh(sideExtrude([[-30, -1.4], [-14, -1.4], [-13, 1.4], [-30, 1.4]], 9.5), mat('#2a3644', { r: 0.7 })); S.box(9, 5.2, 7, mat('#f1f2f0'), -23, 4.0, 0); S.box(9.4, 1.2, 7.3, mat('#2c3c4a', { r: 0.15, m: 0.5 }), -23, 5.3, 0); S.box(5, 2.4, 5, mat('#f1f2f0'), -24, 7.8, 0); S.cyl(0.5, 0.5, 2.6, mat('#c23a2e'), -27, 8.2, 0, [0, 0, 0], 8);
    sb.build(ship); ship.position.set(-52, WL, -8); tracks.push(trackPos(ship, [0, T], [[-52, WL, -30], [-52, WL, 14]])); }
  { const ship = node(root, 'setahajo'); const sb = new Batch('hajo2'), S = at(sb, 0, 0, 0, Math.PI / 2);                                                      // kirándulóhajó (felfelé, a +z felé halad)
    S.mesh(sideExtrude([[-20, -1.2], [17, -1.2], [22, 1.6], [-20, 1.6]], 7.5), mat('#f4f5f3', { r: 0.6 })); S.box(30, 2.4, 6.6, mat('#2c3c4a', { r: 0.15, m: 0.5 }), -2, 2.8, 0); S.box(31, 0.3, 7.2, mat('#f4f5f3'), -2, 4.15, 0); S.box(12, 2.0, 5, mat('#f4f5f3'), -6, 5.3, 0); S.box(40.2, 0.5, 7.6, mat('#2f6db5'), 0.5, 0.4, 0);
    sb.build(ship); ship.position.set(70, WL, 0); tracks.push(trackPos(ship, [0, T], [[70, WL, Z - 26], [70, WL, -Z + 26]])); }
  const clips = [new THREE.AnimationClip('forgalom', T, tracks)];
  plaque(root, hu ? 'Megyeri híd · Budapest, M0' : 'Megyeri Bridge · Budapest, M0', -X + 6, -30, Z + 0.4, K, { h: 0.026 });
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu';
    label(G, h ? '„A” alakú vasbeton pilon: 100 m' : 'A-shaped concrete pylon: 100 m', [PX, PB + PH, 2], [PX + 30, PB + PH + 26, 20], C.white, K);
    label(G, h ? 'Üvegfalas pilonfej' : 'Glass-clad pylon head', [-PX + 1.3, PB + 78, 4], [-PX - 70, PB + 88, 24], '#9cc7e2', K);
    label(G, h ? '88 ferdekábel, két síkban' : '88 stay cables in two planes', [-PX + 70, 46, AZ - 6], [-PX + 84, 68, 42], SPEC.tart, K);
    label(G, h ? 'Acél merevítőtartó: 36,8 m széles' : 'Steel stiffening girder: 36.8 m wide', [20, DT, DW / 2], [34, DT + 16, 50], SPEC.tart, K);
    label(G, h ? 'Nyílások: 145 + 300 + 145 m' : 'Spans: 145 + 300 + 145 m', [-60, DB, DW / 2], [-78, -2, 58], '#b7bdc4', K);
    label(G, h ? 'Mederpillér' : 'River pier', [PX, 0, 30], [PX + 44, 12, 60], C.concreteDark, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 20], posterT: 6 };
}
