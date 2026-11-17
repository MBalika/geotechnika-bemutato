// MOL Campus (Geotechnika) – a torony függőleges metszetben: négyszintes mélygarázs, körben résfal, 2,2 m-es lemezalap,
// 135 db Ø1,2 m-es, 5,5 m-es cölöp a dunai homokos kavicson át a kiscelli agyagba.
// Animáció (26 s): résfal → cölöpök → földkiemelés kotróval rétegenként → alaplemez → pinceszintek → a torony szintenként felnő a daruval → csúcs.
import { THREE, Batch, mat, C, SPEC, tree, label, node, trackPos, trackScale } from '../lib/common.js';
export const FILE = 'mol-campus';
const K = 1 / 400;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1], SY0 = [1, 0.001, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'mol';
  const B = new Batch('mol'); const tracks = [], T = 26;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  // megjelenés: a csomópont skálája t0-tól t1-ig 0-ról 1-re nő (a nyugalmi állapot a kész épület)
  const grow = (n, t0, t1) => tracks.push(trackScale(n, [0, t0 - 0.001, t0, t1, T - 0.01, T], [S0, S0, SY0, S1, S1, S0])); // előtte teljesen rejtett, utána alulról felnő
  const X0 = -95, X1 = 95, Z0 = -70;
  const LAY = [[2, '#a08d77'], [5.5, '#5d5852'], [0.8, '#8b7a63'], [10.2, C.gravel], [12, '#77706a']];
  const PX0 = -52, PX1 = 52, PZ0 = -35, RW = 0.85, EB = -18.2; const EX0 = PX0 - RW, EX1 = PX1 + RW, EZ0 = PZ0 - RW, F = 0.3;
  // talajtömb rétegenként, a munkagödör (résfal + pince + lemez) kivágva
  let y = 0; const pit = []; // a gödör talaja rétegenként (kiemeléshez)
  for (const [t, col] of LAY) { const y0 = y, y1 = y - t, m = mat(col);
    box(B, m, X0, X1, y1, y0, Z0, EZ0); box(B, m, X0, EX0, y1, y0, EZ0, 0); box(B, m, EX1, X1, y1, y0, EZ0, 0);
    box(B, m, EX0, EX1, y1, Math.min(y0, EB), EZ0, 0);
    if (y0 > EB) pit.push([Math.max(y1, EB), y0, m]);
    y = y1; }
  box(B, mat(C.grass), X0, X1, 0, 0.5, Z0, EZ0); box(B, mat(C.grass), X0, EX0, 0, 0.5, EZ0, 0); box(B, mat(C.grass), EX1, X1, 0, 0.5, EZ0, 0);
  for (const [xa, xb] of [[X0, EX0], [EX1, X1]]) box(B, mat(C.water, { em: '#2d7fd0', ei: 0.4 }), xa, xb, -8.06, -7.94, 0, 0.3); // talajvízszint
  // kiemelés: a gödör talaja rétegenként fogy, felülről lefelé
  let tk = 4.6; const exc = []; // [t, a kotró szintje]
  exc.push([4.4, 0.5]);
  for (const [ya, yb, m] of pit) { const n = node(root, 'kiemeles', [0, ya, 0]); const pb = new Batch('godor'); box(pb, m, EX0, EX1, 0, yb - ya, EZ0 + 0.02, 0); box(pb, mat(C.grass), EX0, EX1, yb - ya, yb - ya + (yb === 0 ? 0.5 : 0), EZ0 + 0.02, 0); pb.build(n);
    const dt = Math.max(0.5, (yb - ya) * 0.3); tracks.push(trackScale(n, [0, tk, tk + dt, tk + dt + 0.001, T - 0.01, T], [S1, S1, SY0, S0, S0, S1])); n.scale.set(...S0); tk += dt; exc.push([tk, ya]); }
  // a kotró a gödör aljára követi a kiemelést
  const ex = node(root, 'kotro', [0, 0, -8]); const eb = new Batch('kotro');
  eb.boxB(5, 1.2, 3.4, mat(C.dark), 0, 0, 0); eb.boxB(4.2, 2.2, 3, mat('#f4b400'), -0.4, 1.2, 0); eb.boxB(1.8, 1.8, 1.6, mat(C.glassDark), 0.6, 3.4, -0.6);
  eb.rod([1.4, 3, 0], [5.2, 6.4, 0], 0.35, mat('#f4b400')); eb.rod([5.2, 6.4, 0], [7.2, 2, 0], 0.28, mat('#f4b400')); eb.boxB(1.4, 1.2, 1.6, mat(C.steelDark), 7.4, 0.6, 0); eb.build(ex);
  tracks.push(trackPos(ex, exc.map(a => a[0]).concat([tk + 0.3, T]), exc.map(a => [0, a[1], -8]).concat([[0, EB, -8], [0, 0.5, -8]])));
  tracks.push(trackScale(ex, [0, 4.3, 4.4, tk + 0.2, tk + 0.3, T], [S0, S0, S1, S1, S0, S0])); ex.scale.set(...S0);
  // résfal körben (85 cm), 21 m mélyre: a felszínről lefelé „nő”
  const RB = -21; const rf = node(root, 'resfal'); const rb = new Batch('resfal'); const gm = mat(SPEC.geo);
  box(rb, gm, PX0 - RW, PX0, RB, 0, EZ0, F); box(rb, gm, PX1, PX1 + RW, RB, 0, EZ0, F); box(rb, gm, PX0 - RW, PX1 + RW, RB, 0, EZ0, PZ0); rb.build(rf); grow(rf, 0.3, 2.4);
  // cölöpök a torony alatt (a metszetbe eső sor)
  const TX0 = -24, TX1 = 24; const pl = node(root, 'colopok', [0, EB, 0]); const plb = new Batch('colop');
  for (let x = TX0 + 1.5; x < TX1; x += 3) plb.cyl(0.6, 0.6, 5.5, mat(SPEC.geo, { r: 0.6 }), x, -2.75, 0, [0, 0, 0], 12); plb.build(pl); grow(pl, 2.6, 4.2);
  // alaplemez
  const sl = node(root, 'alaplemez', [0, EB, 0]); const slb = new Batch('lemez'); box(slb, mat('#c9c4b8'), PX0, PX1, 0, 2.2, PZ0, F); slb.build(sl); grow(sl, tk + 0.3, tk + 1.1);
  // pinceszintek: oszlopok, födém, autók – szintenként jelennek meg
  const cc = ['#e0523f', '#2f6db5', '#f4c430', '#f4f3ef', '#3a3f46']; let tl = tk + 1.1;
  for (let i = 1; i <= 4; i++) { const y0 = -16 + (i - 1) * 4, n = node(root, 'pince', [0, y0, 0]); const lb = new Batch('pince');
    for (let x = PX0 + 8; x < PX1; x += 8) for (let z = -6; z > PZ0; z -= 8) lb.boxB(0.7, i === 1 ? 3.6 : 3.6, 0.7, mat(C.concreteDark), x, i === 1 ? 0.2 : 0.2, z);
    box(lb, mat(C.concrete), PX0, PX1, 3.6, 4, PZ0, 0);
    for (let k = 0; k < 9; k++) { if ((k + i) % 3 === 0) continue; const x = PX0 + 6 + k * 11, yl = i === 1 ? 0.6 : 0.2; lb.boxB(4.4, 1.3, 1.9, mat(cc[(i + k) % 5]), x, yl, -3); lb.boxB(2.4, 0.6, 1.7, mat(C.glassDark), x - 0.2, yl + 1.3, -3); }
    lb.build(n); grow(n, tl, tl + 0.5); tl += 0.5; }
  // a torony (metszet): 28 szint, vasbeton mag, homlokzati lamellák – hét blokkban nő fel
  const H = 120, TZ0 = -32, FL = 4.2, NB = 7; const tower = (b, ya, yb) => { const h = yb - ya; const g = mat(C.glass, { r: 0.3 });
    box(b, g, TX0 + 1, TX1 - 1, 0, h, TZ0, TZ0 + 1); for (const sx of [TX0, TX1]) box(b, g, sx < 0 ? sx : sx - 1, sx < 0 ? sx + 1 : sx, 0, h, TZ0, 0);
    for (let f = 0; f <= 28; f++) { const fy = f * FL; if (fy >= ya - 0.01 && fy < yb - 0.01) box(b, mat(C.white), TX0, TX1, fy - ya, fy - ya + 0.5, TZ0, 0); }
    box(b, mat(C.concrete), -7, 7, 0, h, -22, -10);
    for (let f = 0; f < 28; f++) { const fy = f * FL; if (fy >= ya - 0.01 && fy < yb - 0.01) for (let x = TX0 + 3; x < TX1 - 2; x += 6) if (Math.abs(x) > 8) b.boxB(0.5, FL - 0.5, 0.5, mat(C.concreteDark), x, fy - ya + 0.5, -2); }
    for (let x = TX0; x <= TX1; x += 2) b.boxB(0.35, h, 1.4, mat(C.white), x, 0, TZ0 - 0.2);
    for (let z = TZ0; z <= 0; z += 2) for (const sx of [TX0, TX1]) b.boxB(1.4, h, 0.35, mat(C.white), sx + (sx < 0 ? -0.2 : 0.2), 0, z); };
  const t0T = tl + 0.4, dB = 1.15; const hB = 4 * FL; const crane = [];
  for (let k = 0; k < NB; k++) { const ya = k * hB, yb = k === NB - 1 ? H : (k + 1) * hB; const n = node(root, 'torony', [0, ya, 0]); const tb = new Batch('torony'); tower(tb, ya, yb); tb.build(n);
    const t0 = t0T + k * dB; grow(n, t0, t0 + dB); crane.push([t0 + dB, yb]); }
  // pódium (6 szint) a toronytól jobbra és balra
  const pod = node(root, 'podium'); const pdb = new Batch('podium');
  for (const [x0, x1] of [[PX0 - 1, TX0], [TX1, PX1 + 1]]) { const w = x1 - x0; pdb.boxB(w, 24, 32, mat(C.white), (x0 + x1) / 2, 0, -18); for (let f = 1; f < 6; f++) pdb.box(w + 0.2, 0.5, 32.2, mat('#e7e4dd'), (x0 + x1) / 2, f * 4.2, -18);
    for (let f = 0; f < 6; f++) pdb.box(w - 1, 2.6, 0.3, mat(C.glass, { r: 0.3 }), (x0 + x1) / 2, f * 4.2 + 2, -1.9); }
  pdb.build(pod); grow(pod, t0T + 1.2, t0T + 3.2);
  // korona és csúcs (143 m)
  const tEnd = t0T + NB * dB; const cr = node(root, 'korona', [0, H, 0]); const crb = new Batch('korona');
  crb.boxB(TX1 - TX0 + 2, 3, -TZ0 + 1, mat(C.white), 0, 0, TZ0 / 2); crb.cyl(0.5, 0.9, 23.5, mat(C.steel, { m: 0.4, r: 0.4 }), 0, 3 + 11.75, -16, [0, 0, 0], 10); crb.build(cr); grow(cr, tEnd, tEnd + 0.8);
  // kúszódaru a magon: a torony tetejével együtt emelkedik, a végén lebontják
  const cn = node(root, 'daru', [0, 0, -16]); const cb = new Batch('daru'); const yel = mat(C.yellow);
  cb.boxB(1.6, 22, 1.6, yel, 0, 0, 0); cb.box(46, 1.2, 1.2, yel, 10, 22, 0); cb.boxB(5, 2.4, 3, mat(C.concreteDark), -11, 19.6, 0); cb.boxB(2.4, 2.2, 2.2, mat(C.glassDark), 1.8, 18.6, 1.2);
  cb.rod([26, 21.4, 0], [26, 8, 0], 0.1, mat(C.dark)); cb.boxB(5, 1.2, 1.2, mat(C.steelDark), 26, 6.8, 0); cb.build(cn);
  const ck = [[0, 0], [t0T, 0], ...crane]; tracks.push(trackPos(cn, ck.map(a => a[0]).concat([T]), ck.map(a => [0, a[1], -16]).concat([[0, 0, -16]])));
  tracks.push(trackScale(cn, [0, t0T - 0.3, t0T, tEnd + 0.8, tEnd + 1.2, T], [S0, S0, S1, S1, S0, S0])); cn.position.set(0, H, -16); cn.scale.set(...S0);
  // fák a felszínen
  for (let i = 0; i < 12; i++) { const x = X0 + 6 + (i * 29) % (X1 - X0 - 12); const z = -66 + (i * 17) % 22; tree(B, x, z, 9, 0.5); }
  for (let i = 0; i < 8; i++) tree(B, i < 4 ? X0 + 8 + i * 9 : X1 - 8 - (i - 4) * 9, -45 + (i % 2) * 6, 8, 0.5);
  B.build(root);
  const clips = [new THREE.AnimationClip('epites', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Torony: 120 m, a csúccsal 143 m' : 'Tower: 120 m, 143 m to the tip', [TX1, 100, -2], [TX1 + 14, 104, 6], C.white, K);
    label(G, hu ? 'Négyszintes mélygarázs' : 'Four-level basement', [PX1 - 10, -8, -3], [PX1 + 18, -1, 8], C.concreteDark, K);
    label(G, hu ? 'Résfal: 85 cm, 21 m mély' : 'Diaphragm wall: 85 cm, 21 m deep', [PX0 - 0.4, -19, 0], [PX0 - 40, -27, 8], SPEC.geo, K);
    label(G, hu ? '2,2 m-es alaplemez' : '2.2 m raft', [-12, -17, 0], [-38, -40, 8], '#c9c4b8', K);
    label(G, hu ? '135 cölöp: Ø1,2 m, 5,5 m' : '135 piles: Ø1.2 m, 5.5 m', [7.5, -21, 0.6], [16, -40, 8], SPEC.geo, K);
    label(G, hu ? 'Dunai homokos kavics' : 'Danube sandy gravel', [X0 + 10, -12, 0], [X0 + 4, -12 + 1, 8], C.gravel, K);
    label(G, hu ? 'Kiscelli agyag' : 'Kiscell clay', [X1 - 16, -26, 0], [X1 - 30, -33, 8], '#77706a', K);
    label(G, hu ? 'Talajvíz: −8 m' : 'Groundwater: −8 m', [X0 + 28, -8, 0.2], [X0 + 30, -4, 8], C.water, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [28, 16], posterLift: -0.05, posterT: T - 1, labelT: T - 1 };
}
