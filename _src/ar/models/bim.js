// BIM-mel épülő középület (Építéstechnológia és építményinformációs menedzsment): a Néprajzi Múzeum a Városligetben (Napur Architect, megnyílt 2022-ben).
// Két ívesen emelkedő szárny, a tetejükön bejárható tetőkert; az épület nagy része a föld alatt van; az üveghomlokzat előtt néprajzi motívumokból
// szerkesztett fém raszter. A modell elöl a talajt és a pinceszinteket metszi. Animáció (22 s): a BIM-modell ütemei szerint épül fel – résfalas
// munkagödör és alaplemez, pinceszintek, a két szárny vasbeton szerkezete, homlokzat, tetőkert –, közben két toronydaru dolgozik.
// A méretek (hossz kb. 240 m, a szárnyvégek magassága kb. 22 m) és a belső szerkezet arányos becslések, nem tervadatok.
import { THREE, Batch, mat, C, SPEC, label, node, trackScale, person } from '../lib/common.js';
import { at, sideExtrude, towerCrane, tree2, lamp, plaque } from '../lib/kit2.js';
export const FILE = 'bim-epitkezes';
const K = 1 / 480;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'neprajzi';
  const B = new Batch('liget'), tracks = [], T = 22, X0 = -150, X1 = 150, Z0 = -70, ZF = 30, YB = -16, L = 120, W = 54, HT = 22, XC = 18, BD = -10.5;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const S1 = [1, 1, 1], SY = [1, 0.001, 1], S0 = [0.001, 0.001, 0.001], stage = (n, t0, t1, from = SY) => { tracks.push(trackScale(n, [0, t0, t1, T], [from, from, S1, S1])); };
  const roofY = (x) => HT * Math.pow(Math.max(0, (Math.abs(x) - XC) / (L - XC)), 1.7);
  const wedge = (s, dTop, dBot, w, xa = XC, xb = L) => { const pts = [], N = 14; for (let i = 0; i <= N; i++) { const x = xa + (xb - xa) * i / N; pts.push([s * x, Math.max(0, roofY(x) + dTop)]); } for (let i = N; i >= 0; i--) { const x = xa + (xb - xa) * i / N; pts.push([s * x, Math.max(0, roofY(x) + dBot)]); } if (s < 0) pts.reverse(); return sideExtrude(pts, w); };
  // ---- talaj (elöl metszve), a Liget gyepe, sétányok, fák ----
  for (const [ya, yb, col] of [[YB, -9, '#77706a'], [-9, -3, C.gravel], [-3, 0, '#a08d77']]) { box(B, mat(col), X0, X1, ya, yb, Z0, -W / 2 - 1); box(B, mat(col), X0, -L - 5, ya, yb, -W / 2 - 1, ZF); box(B, mat(col), L + 5, X1, ya, yb, -W / 2 - 1, ZF); if (ya < BD - 1.2) box(B, mat(col), -L - 5, L + 5, ya, Math.min(yb, BD - 1.2), -W / 2 - 1, ZF); }
  box(B, mat('#8fbf6a', { r: 1 }), X0, X1, 0, 0.15, Z0, -W / 2 - 1); box(B, mat('#8fbf6a', { r: 1 }), X0, -L - 5, 0, 0.15, -W / 2 - 1, ZF); box(B, mat('#8fbf6a', { r: 1 }), L + 5, X1, 0, 0.15, -W / 2 - 1, ZF); box(B, mat('#d3cdbf', { r: 0.95 }), X0, X1, 0.15, 0.2, -W / 2 - 9, -W / 2 - 3);
  let sd = 3; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 46; i++) { const x = X0 + 6 + rnd() * (X1 - X0 - 12), z = Z0 + 4 + rnd() * (-W / 2 - 14 - Z0); tree2(B, x, z, 11 + rnd() * 6, 0.15, { c1: rnd() < 0.5 ? '#4f8a40' : '#5a9647' }); }
  for (const x of [-136, 138]) for (const z of [-10, 12]) tree2(B, x, z, 12, 0.15); for (let x = -140; x <= 140; x += 28) lamp(B, x, -W / 2 - 2.4, 0.2, 6);
  B.build(root);
  // ---- 1. ütem: résfalas munkagödör, alaplemez ----
  const conc = mat('#d5d1c8', { r: 0.9 }), concD = mat('#b9b5ad', { r: 0.9 }), glass = mat('#7fb0c8', { r: 0.12, m: 0.4, op: 0.82 }), lace = mat('#cfc3a4', { r: 0.5, m: 0.5 });
  { const n = node(root, 'utem1_godor', [0, BD - 1.2, 0]), b = new Batch('godor'); box(b, concD, -L - 5, L + 5, 0, 1.2, -W / 2 - 1, ZF); box(b, concD, -L - 5, L + 5, 1.2, -BD + 1.2, -W / 2 - 1, -W / 2); for (const s of [-1, 1]) box(b, concD, s > 0 ? L + 4 : -L - 5, s > 0 ? L + 5 : -L - 4, 1.2, -BD + 1.2, -W / 2, ZF); b.build(n); stage(n, 0.4, 2.6); }
  // ---- 2. ütem: pinceszintek (födémek, pillérek, kiállítóterek a metszetben) ----
  { const n = node(root, 'utem2_pince', [0, BD, 0]), b = new Batch('pince'); for (const y of [5.0, -BD - 0.5]) box(b, conc, -L - 4, L + 4, y, y + 0.5, -W / 2, ZF); for (let x = -L; x <= L; x += 12) for (const z of [ZF - 1, 12, -6]) for (const y0 of [0, 5.5]) box(b, conc, x - 0.4, x + 0.4, y0, y0 + 4.9, z - 0.4, z + 0.4);
    for (let x = -L + 6; x < L; x += 24) { box(b, mat(['#c98a2e', '#b33a2e', '#2f6db5', '#5a6a3a'][Math.abs(Math.round(x / 24)) % 4], { r: 0.8 }), x - 3, x + 3, 0, 2.6, 16, 22); box(b, mat('#f2f3f1'), x + 5, x + 6.5, 5.5, 8.2, 14, 20); } box(b, mat('#e9e4d8'), -L - 4, L + 4, 0, -BD, -W / 2 + 0.02, -W / 2 + 0.3);
    for (const [x, z, r] of [[-70, 24, 1], [-40, 18, 2.5], [10, 25, 0.4], [60, 20, 4]]) person(b, x, z, r, { y: 0, vest: '#3a5f8a', helmet: '#5a4632', shirt: '#3a5f8a' }); b.build(n); stage(n, 2.8, 5.6); }
  // ---- 3. ütem: a két szárny vasbeton szerkezete (födémek az ív alatt, pillérek), a középső tér burkolata ----
  for (const s of [-1, 1]) { const n = node(root, 'utem3_szerkezet'), b = new Batch('szerk'); b.mesh(wedge(s, -0.9, -1.5, W - 2), conc, [0, 0, ZF - W / 2]);
    for (let f = 1; f * 4.4 < HT - 2; f++) { const y = f * 4.4, xs = XC + (L - XC) * Math.pow((y + 2.2) / HT, 1 / 1.7); box(b, conc, s > 0 ? xs : -L + 1, s > 0 ? L - 1 : -xs, y - 0.25, y + 0.25, ZF - W + 1.5, ZF - 1.5); }
    for (let x = XC + 14; x < L; x += 12) for (const z of [ZF - 2.5, ZF - W / 2, ZF - W + 2.5]) box(b, conc, s * x - 0.45, s * x + 0.45, 0, Math.max(0.2, roofY(x) - 1.2), z - 0.45, z + 0.45); box(b, concD, s > 0 ? L - 1.2 : -L, s > 0 ? L : -L + 1.2, 0, HT - 1, ZF - W + 1, ZF - 1); b.build(n); stage(n, 5.8, 10); }
  { const n = node(root, 'utem3_ter'), b = new Batch('ter'); box(b, mat('#cfc9bb', { r: 0.95 }), -L - 4, L + 4, 0, 0.25, -W / 2, ZF); b.build(n); stage(n, 5.6, 6.2); }
  // ---- 4. ütem: üveghomlokzat és a fém raszter (a szárnyak oldalán és végén) ----
  for (const s of [-1, 1]) { const n = node(root, 'utem4_homlokzat'), b = new Batch('homl'); b.mesh(wedge(s, -1.5, -200, W - 0.6), glass, [0, 0, ZF - W / 2]); b.mesh(wedge(s, -0.7, -4.6, W + 0.3), lace, [0, 0, ZF - W / 2]);
    for (let x = XC + 8; x < L; x += 4) { const hh = roofY(x) - 4.6; if (hh > 1) for (const z of [ZF + 0.12, ZF - W - 0.12]) box(b, lace, s * x - 0.12, s * x + 0.12, 0.25, hh, z - 0.06, z + 0.06); }
    box(b, glass, s > 0 ? L - 0.3 : -L, s > 0 ? L : -L + 0.3, 0.25, HT - 1.5, ZF - W + 0.3, ZF - 0.3); for (let z = ZF - W + 3; z < ZF - 1; z += 4) box(b, lace, s * L - 0.1, s * L + 0.1, 0.25, HT - 1, z - 0.1, z + 0.1); b.build(n); stage(n, 10.2, 13.4); }
  // ---- 5. ütem: tetőkert (gyep, lépcsős sétány, korlát), fák a téren, látogatók ----
  for (const s of [-1, 1]) { const n = node(root, 'utem5_tetokert'), b = new Batch('teto'); b.mesh(wedge(s, 0.25, -0.9, W), mat('#86b862', { r: 1 }), [0, 0, ZF - W / 2]); b.mesh(wedge(s, 0.32, 0.2, 5), mat('#d9d3c5', { r: 0.95 }), [0, 0, ZF - W / 2]);
    for (const z of [ZF - 0.3, ZF - W + 0.3]) b.mesh(wedge(s, 1.3, 1.2, 0.1), mat('#3a3f45'), [0, 0, z]); for (const [x, z, r] of [[50, 6, 1], [72, 10, 2], [95, 2, 3], [104, 14, 0.5], [60, -8, 4]]) person(b, s * x, z, r, { y: roofY(x) + 0.3, vest: s > 0 ? '#b33a2e' : '#2f6db5', helmet: '#5a4632', shirt: '#8a5a3a' }); b.build(n); stage(n, 13.6, 16.4); }
  { const n = node(root, 'utem5_ter'), b = new Batch('terfak'); for (const [x, z] of [[-8, -14], [8, -14], [0, 6], [-12, 16], [12, 18]]) tree2(b, x, z, 7, 0.25); for (const [x, z, r, c] of [[-4, 10, 1, '#3a5f8a'], [5, 12, 2.5, '#b33a2e'], [2, -6, 0.5, '#5a6a3a'], [-10, 2, 4, '#6a4a8a']]) person(b, x, z, r, { y: 0.25, vest: c, shirt: c, helmet: '#5a4632' }); b.build(n); stage(n, 16.6, 17.6, S0); }
  // ---- toronydaruk (csak építés közben) ----
  for (const [x, z, ry] of [[-70, -W / 2 - 12, 0.5], [78, -W / 2 - 12, 2.4]]) { const n = node(root, 'daru'), b = new Batch('daru'); towerCrane(at(b, x, 0.15, z, ry), { H: 44, J: 46, T: 28, HY: 26 }); b.build(n); tracks.push(trackScale(n, [0, 0.2, 0.8, 17.4, 18.2, T], [S0, S0, S1, S1, S0, S0])); n.scale.set(...S0); }
  plaque(root, hu ? 'Néprajzi Múzeum · Városliget, Budapest' : 'Museum of Ethnography · City Park, Budapest', X0 + 3, YB + 1.4, ZF + 0.1, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('epites', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu';
    label(G, h ? 'Két ívesen emelkedő szárny,\na tetejükön bejárható tetőkert' : 'Two wings rising in an arc,\nwith a walkable roof garden on top', [84, roofY(84) + 0.4, 6], [96, 44, 14], '#86b862', K);
    label(G, h ? 'Az épület nagy része a föld alatt van' : 'Most of the building is below ground', [-30, -5, ZF], [-70, -26, ZF + 10], '#d5d1c8', K);
    label(G, h ? 'Üveghomlokzat fém raszterrel:\nnéprajzi motívumok pixelekből' : 'Glass façade behind a metal lattice:\nethnographic motifs made of pixels', [-96, 8, ZF], [-148, 34, ZF + 8], '#cfc3a4', K);
    label(G, h ? 'BIM: az épület digitális modellje\nütemenként követi az építést' : 'BIM: the digital model of the building\nfollows construction stage by stage', [0, 0.3, 4], [-20, 40, 10], SPEC.eti, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 22], posterT: T - 1, labelT: T - 1 };
}
