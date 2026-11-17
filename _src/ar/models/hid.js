// Ferdekábeles Duna-híd (Tartószerkezetek) – H alakú pilonok, félig legyezős kábelek, szekrénytartós pálya, forgalom és hajó
import { THREE, Batch, mat, C, SPEC, soilBlock, tree, carGeom, label, trackPos, node } from '../lib/common.js';
export const FILE = 'ferdekabeles-hid';
const K = 1 / 600;

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'hid';
  const B = new Batch('hid');
  const X = 330, Z = 55, RIV = 140, WL = -5, BED = -13, DECK = 16, PX = 115, PH = 104;
  // talaj: a két part és a meder (elöl metszet)
  const lay = [[3, C.fill], [9, C.gravel], [18, C.clay]];
  for (const s of [-1, 1]) { const x0 = s < 0 ? -X : RIV, x1 = s < 0 ? -RIV : X; soilBlock(B, x0, x1, -Z, Z, lay); B.boxB(x1 - x0, 0.6, Z * 2, mat(C.grass), (x0 + x1) / 2, 0, 0); }
  // meder: a meder alatt kavics és agyag, rézsűs partfal
  B.box(RIV * 2, 4, Z * 2, mat(C.gravel), 0, BED - 2, 0);
  B.box(RIV * 2, 30 - 4 + BED, Z * 2, mat(C.clay), 0, (-30 + BED - 4) / 2, 0);
  // víz (kicsit átlátszó), partfal-kőszórás
  B.box(RIV * 2, WL - BED, Z * 2, mat(C.water, { op: 0.78, r: 0.25 }), 0, (WL + BED) / 2, 0);
  for (const s of [-1, 1]) B.box(4, -BED + 0.6, Z * 2, mat(C.rock), s * (RIV - 2), (BED + 0.6) / 2, 0);
  // hídfők és rámpa-töltés a part felett
  for (const s of [-1, 1]) { B.boxB(10, DECK - 3, 34, mat(C.concreteDark), s * (X - 22), 0.6, 0); B.boxB(16, DECK - 3, 30, mat(C.sand), s * (X - 8), 0.6, 0); }
  // pálya: szekrénytartó + aszfalt + korlát + sávjelek
  const L = 2 * X - 24; B.box(L, 3, 30, mat(C.concrete), 0, DECK - 1.5, 0); B.box(L, 0.4, 26, mat(C.asphalt), 0, DECK + 0.2, 0);
  for (const z of [-14.2, 14.2]) B.box(L, 1.2, 0.8, mat(C.white), 0, DECK + 0.6, z);
  B.box(L, 1.0, 1.2, mat(C.concreteDark), 0, DECK + 0.5, 0); // középső elválasztó
  for (let x = -X + 20; x < X - 20; x += 14) for (const z of [-6.5, 6.5]) B.box(6, 0.05, 0.4, mat(C.white), x, DECK + 0.43, z);
  // pilonok: két láb a kábelsíkokban, alsó és felső kereszttartó, alap a mederben
  for (const s of [-1, 1]) { const x = s * PX;
    B.boxB(24, 6, 46, mat(C.concreteDark), x, BED, 0); // cölöpfej / alaptest
    for (const z of [-17, 17]) { B.boxB(5.5, PH - BED, 5.5, mat(C.concrete), x, BED + 6, z); }
    B.box(6, 4, 36, mat(C.concrete), x, DECK - 4, 0); B.box(5, 4, 36, mat(C.concrete), x, PH - 2, 0);
    for (const z of [-17, 17]) B.boxB(6.2, 3, 6.2, mat(SPEC.tart), x, PH, z); // nyeregkupak
  }
  // kábelek: legyezős elrendezés, a kábelerő szerinti színnel (hosszabb kábel = nagyobb erő)
  const cab = new Batch('kabel'); const cols = ['#ffd27a', '#ffb45c', '#ff9a45', '#ff7f33', '#f2602a', '#d9441f'];
  for (const s of [-1, 1]) for (const dir of [-1, 1]) for (let i = 0; i < 11; i++) {
    const xd = s * PX + dir * (14 + i * 9.5); if (Math.abs(xd) > X - 26) continue;
    const ya = PH - 3 - i * 2.6; const ci = Math.min(cols.length - 1, Math.floor(i / 2));
    for (const z of [-15, 15]) cab.rod([s * PX, ya, z * 17 / 15], [xd, DECK + 0.3, z], 0.55, mat(cols[ci], { r: 0.45 }), 6);
  }
  cab.build(root);
  // part: fák, kis házak
  for (let i = 0; i < 22; i++) { const s = i % 2 ? 1 : -1; const x = s * (RIV + 20 + ((i * 37) % 150)); const z = -Z + 6 + ((i * 53) % (2 * Z - 12)); if (Math.abs(z) < 22 && Math.abs(x) > X - 40) continue; if (Math.abs(z) < 20) continue; tree(B, x, z, 9 + (i % 3) * 2, 0.6); }
  for (const [x, z, w, h] of [[-250, -38, 16, 12], [-200, 34, 12, 9], [230, -36, 18, 15], [270, 32, 12, 10]]) { B.boxB(w, h, 12, mat(C.white), x, 0.6, z); B.boxB(w + 1, 1, 13, mat(C.roof), x, 0.6 + h, z); }
  B.build(root);
  // forgalom: autók és kamionok mindkét irányban (animált csomópontok), hajó a folyón
  const T = 24, clips = [], tracks = [];
  const lanes = [[-9.5, 1], [-3.5, 1], [3.5, -1], [9.5, -1]]; const cc = ['#e0523f', '#2f6db5', '#f4c430', '#f4f3ef', '#3a3f46', '#7bb662'];
  let n = 0;
  for (const [z, d] of lanes) for (let j = 0; j < 3; j++) {
    const truck = (n % 5 === 2); const g = truck ? truckGeom() : carGeom(cc[n % cc.length]); const nd = node(root, truck ? 'kamion' : 'auto'); nd.add(g);
    if (d < 0) g.rotation.y = Math.PI; const x0 = -(X - 24), x1 = X - 24, ph = (j / 3 + (n % 2) * 0.13) % 1;
    const xs = (t) => { const f = (t / T + ph) % 1; return d > 0 ? x0 + (x1 - x0) * f : x1 - (x1 - x0) * f; };
    // egyenletes mozgás: a ciklus elején és a „visszaugrásnál” kulcs
    const tw = ((1 - ph) * T); const times = [0, tw - 0.001, tw, T].filter((v, i, a) => v >= 0 && v <= T && (i === 0 || v > a[i - 1]));
    const vals = times.map((t) => [t === tw ? (d > 0 ? x0 : x1) : xs(Math.min(t, T - 1e-4)), DECK + 0.4, z]);
    nd.position.set(...vals[0]); tracks.push(trackPos(nd, times, vals)); n++;
  }
  const ship = node(root, 'hajo'); ship.add(shipGeom()); ship.position.set(-35, WL, Z - 10);
  tracks.push(trackPos(ship, [0, T], [[-35, WL, Z - 8], [-35, WL, -Z + 8]]));
  clips.push(new THREE.AnimationClip('forgalom', T, tracks));
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Pilon' : 'Pylon', [PX, PH, 17], [PX + 8, PH + 22, 26], SPEC.tart, K);
    label(G, hu ? 'Ferde kábelek\n(a szín a kábelerő)' : 'Stay cables\n(colour = cable force)', [-PX + 40, 60, 15], [-PX + 60, 66, 40], '#ff7f33', K);
    label(G, hu ? 'Merevítőtartó (pálya)' : 'Deck (stiffening girder)', [40, DECK, 15], [60, DECK + 10, 48], SPEC.tart, K);
    label(G, hu ? 'Mederpillér' : 'River pier', [-PX, BED + 8, 23], [-PX - 30, -2, 60], C.concreteDark, K);
    label(G, hu ? 'Hídfő' : 'Abutment', [X - 22, 8, 17], [X - 40, 30, 45], C.concreteDark, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [22, 24], posterT: 6,
    meta: { name: 'Ferdekábeles híd' } };
}
function truckGeom() { const B = new Batch('kamion'); B.boxB(12, 3.6, 2.5, mat('#e9ecef'), -1.5, 0.9, 0); B.boxB(2.6, 2.8, 2.5, mat('#2f6db5'), 5.8, 0.9, 0);
  for (const x of [-6, -3.5, 5.5]) for (const z of [-1.1, 1.1]) B.cyl(0.5, 0.5, 0.35, mat(C.dark), x, 0.5, z, [Math.PI / 2, 0, 0], 10);
  const g = new THREE.Group(); B.build(g); return g; }
function shipGeom() { const B = new Batch('hajo'); B.boxB(9, 2.2, 60, mat('#3a4a5c'), 0, -1.2, 0); B.boxB(8, 1.2, 50, mat('#c9533f'), 0, 0.9, 2); B.boxB(7, 4, 7, mat(C.white), 0, 2.1, -22);
  const g = new THREE.Group(); B.build(g); return g; }
