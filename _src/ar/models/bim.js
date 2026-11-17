// Épülő ház BIM-modellel (Építéstechnológia és építményinformációs menedzsment) – a kész épület digitális ikre „hologramként” áll a telken,
// a valóság szintről szintre utoléri: födémek és pillérek, a daru emeli az elemeket, aztán jön a gépészet (csövek, légcsatornák), végül a homlokzat.
import { THREE, Batch, mat, C, SPEC, tree, label, node, trackPos, trackQuat, trackScale, person } from '../lib/common.js';
export const FILE = 'bim-epitkezes';
const K = 1 / 150;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1], SY0 = [1, 0.001, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'bim';
  const B = new Batch('telek'); const tracks = [], T = 24;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const X0 = -34, X1 = 34, Z0 = -26, Z1 = 26;
  for (const [ya, yb, col] of [[-8, -3, C.clay], [-3, -0.8, C.sand], [-0.8, 0, C.fill]]) box(B, mat(col), X0, X1, ya, yb, Z0, Z1);
  box(B, mat('#b8a98c'), X0, X1, 0, 0.2, Z0, Z1); box(B, mat(C.grass), X0, X1, 0, 0.25, Z1 - 5, Z1); box(B, mat(C.asphalt), X0, X1, 0, 0.3, Z1 - 4.2, Z1 - 0.4);
  for (let x = X0 + 1; x < X1; x += 2.6) box(B, mat('#e9e6df'), x, x + 2.3, 0.2, 2.2, Z1 - 5.4, Z1 - 5.3); // kerítés
  // konténerirodák, anyagdepó
  for (let k = 0; k < 3; k++) { B.boxB(6, 2.6, 2.4, mat(k === 1 ? '#2f6db5' : C.white), -26, 0.2 + (k === 2 ? 2.6 : 0), -18 + (k === 1 ? 2.6 : 0) + (k === 2 ? 1.3 : 0)); }
  for (let k = 0; k < 4; k++) B.boxB(7, 0.3, 3, mat(C.concrete), 22, 0.2 + k * 0.32, -16);
  const FX0 = -12, FX1 = 12, FZ0 = -9, FZ1 = 9, FH = 3.4, NF = 6; // az épület: 24 × 18 m, 6 szint
  box(B, mat(C.concreteDark), FX0 - 0.5, FX1 + 0.5, 0, 0.5, FZ0 - 0.5, FZ1 + 0.5); // alaplemez
  // ---- a BIM-modell: áttetsző lila „hologram” + élek ----
  const holo = node(root, 'bim_modell'); const hb = new Batch('holo'); const hm = mat(SPEC.eti, { op: 0.07, em: SPEC.eti, ei: 0.5, ds: true });
  box(hb, hm, FX0, FX1, 0.5, 0.5 + NF * FH, FZ0, FZ1); const em = mat(SPEC.eti, { em: SPEC.eti, ei: 0.9 });
  for (let f = 0; f <= NF; f++) { const y = 0.5 + f * FH; for (const [a, b] of [[[FX0, y, FZ0], [FX1, y, FZ0]], [[FX1, y, FZ0], [FX1, y, FZ1]], [[FX1, y, FZ1], [FX0, y, FZ1]], [[FX0, y, FZ1], [FX0, y, FZ0]]]) hb.rod(a, b, 0.07, em, 4); }
  for (const x of [FX0, FX1]) for (const z of [FZ0, FZ1]) hb.rod([x, 0.5, z], [x, 0.5 + NF * FH, z], 0.07, em, 4);
  hb.build(holo); const tH = 1.4 + NF * 2.0 + 0.4 + 2.4 + 2.4; // a homlokzat után a modell „feloldódik”: a valóság utolérte
  tracks.push(trackScale(holo, [0, 0.4, 1.2, tH, tH + 0.8, T], [SY0, SY0, S1, S1, SY0, SY0])); holo.scale.set(...SY0);
  // ---- a valós épület szintenként ----
  const tF = (f) => 1.4 + f * 2.0;
  for (let f = 0; f < NF; f++) { const y0 = 0.5 + f * FH; const n = node(root, 'szint', [0, y0, 0]); const fb = new Batch('szint');
    for (let x = FX0 + 0.4; x <= FX1; x += 6) for (let z = FZ0 + 0.4; z <= FZ1; z += 6) box(fb, mat('#9e9a93'), x - 0.3, x + 0.3, 0, FH - 0.3, z - 0.3, z + 0.3);
    box(fb, mat('#b3aea5'), FX0, FX1, FH - 0.3, FH, FZ0, FZ1); box(fb, mat(C.concreteDark), -2.5, 2.5, 0, FH, -1.5, 3); // födém, lépcsőház-mag
    fb.build(n); tracks.push(trackScale(n, [0, tF(f) - 0.01, tF(f), tF(f) + 1.2, T - 0.4, T], [S0, S0, SY0, S1, S1, S0])); }
  const tM = tF(NF) + 0.4; // gépészet
  const mep = node(root, 'gepeszet'); const mb = new Batch('mep');
  for (let f = 0; f < NF; f++) { const y = 0.5 + f * FH + FH - 0.75; mb.rod([FX0 + 1, y, -6], [FX1 - 1, y, -6], 0.32, mat('#4f8dff'), 8); mb.rod([FX0 + 1, y - 0.1, 6], [FX1 - 1, y - 0.1, 6], 0.25, mat('#e0523f'), 8);
    box(mb, mat('#c0c7cf', { m: 0.4 }), FX0 + 1, FX1 - 1, y - 0.3, y + 0.3, -0.9, 0.1); box(mb, mat('#f4c430'), FX0 + 1, FX1 - 1, y + 0.25, y + 0.38, 7.5, 7.8); }
  for (const [x, z, c] of [[8, -6, '#4f8dff'], [8, 6, '#e0523f'], [9.5, -0.4, '#c0c7cf']]) mb.rod([x, 0.5, z], [x, 0.5 + NF * FH, z], 0.3, mat(c), 8);
  mb.build(mep); tracks.push(trackScale(mep, [0, tM - 0.01, tM, tM + 1.6, T - 0.4, T], [S0, S0, SY0, S1, S1, S0]));
  const tG = tM + 2.4; // homlokzat
  const fac = node(root, 'homlokzat'); const gb = new Batch('fac'); const gl = mat('#7fa6c8', { op: 0.55, r: 0.15, m: 0.2 }), fr = mat('#3a3f46');
  for (let f = 0; f < NF; f++) { const y0 = 0.5 + f * FH; box(gb, gl, FX0, FX1, y0 + 0.1, y0 + FH - 0.35, FZ1 - 0.05, FZ1 + 0.05); box(gb, gl, FX1 - 0.05, FX1 + 0.05, y0 + 0.1, y0 + FH - 0.35, FZ0, FZ1); box(gb, gl, FX0 - 0.05, FX0 + 0.05, y0 + 0.1, y0 + FH - 0.35, FZ0, FZ1); box(gb, gl, FX0, FX1, y0 + 0.1, y0 + FH - 0.35, FZ0 - 0.05, FZ0 + 0.05); }
  for (let x = FX0; x <= FX1; x += 3) box(gb, fr, x - 0.08, x + 0.08, 0.5, 0.5 + NF * FH, FZ1 - 0.1, FZ1 + 0.12);
  { const yT = 0.5 + NF * FH; box(gb, mat('#cfcac0'), FX0, FX1, yT, yT + 0.2, FZ0, FZ1); for (const [xa, xb, za, zb] of [[FX0 - 0.3, FX1 + 0.3, FZ0 - 0.3, FZ0 + 0.2], [FX0 - 0.3, FX1 + 0.3, FZ1 - 0.2, FZ1 + 0.3], [FX0 - 0.3, FX0 + 0.2, FZ0, FZ1], [FX1 - 0.2, FX1 + 0.3, FZ0, FZ1]]) box(gb, mat(SPEC.eti), xa, xb, yT, yT + 0.8, za, zb); }
  gb.build(fac); tracks.push(trackScale(fac, [0, tG - 0.01, tG, tG + 2.0, T - 0.4, T], [S0, S0, SY0, S1, S1, S0]));
  // ---- toronydaru: a gém elfordul a depó és az épület között, a horog emeli az elemet ----
  const CX = 18, CZ = 6, CH = 30; B.boxB(1.6, CH, 1.6, mat(C.yellow), CX, 0.2, CZ); B.boxB(4, 0.8, 4, mat(C.concreteDark), CX, 0.2, CZ);
  const slew = node(root, 'gem', [CX, CH + 0.2, CZ]); const sb = new Batch('gem'); sb.box(40, 1.1, 1.1, mat(C.yellow), 8, 0.6, 0); sb.boxB(6, 2.4, 2.6, mat(C.concreteDark), -9, 0, 0); sb.boxB(2.2, 2.2, 2.2, mat(C.glassDark), 0.8, -2.4, 1.5); sb.boxB(1.4, 4, 1.4, mat(C.yellow), 0, 1.1, 0); sb.build(slew);
  const trolley = node(slew, 'futomacska', [16, 0, 0]); const tb2 = new Batch('fm'); tb2.box(1.6, 0.6, 1.6, mat(C.dark), 0, -0.1, 0); tb2.build(trolley);
  const hookN = node(trolley, 'horog', [0, -10, 0]); const kb = new Batch('horog'); kb.box(0.5, 0.6, 0.5, mat(C.dark), 0, 0, 0); kb.box(6, 0.35, 2.6, mat(C.concrete), 0, -0.8, 0); kb.build(hookN);
  const rope = node(trolley, 'kotel'); const rm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 4), mat(C.dark)); rm.position.y = -0.5; rope.add(rm);
  // a gém szöge: a depó (22, −16) és az épület (0, 0) iránya; körönként 2 s
  const ang = (x, z) => Math.atan2(-(z - CZ), x - CX); const aD = ang(22, -16), aB = ang(0, 0); const rD = Math.hypot(22 - CX, -16 - CZ), rB = Math.hypot(CX, CZ);
  const ts = [], qs = [], tp = [], hp = [], rp = [];
  for (let f = 0; f <= NF; f++) { const t0 = tF(f) - 2.0 + 0.2; if (t0 < 0) { ts.push(0); qs.push([0, aB, 0]); tp.push([rB, 0, 0]); hp.push([0, -6, 0]); rp.push([1, 6, 1]); continue; }
    const yTop = 0.5 + f * FH - (CH + 0.2) + 2.5; // az épület aktuális teteje a gémhez képest
    ts.push(t0, t0 + 0.5, t0 + 0.8, t0 + 1.4, t0 + 1.7); qs.push([0, aB, 0], [0, aD, 0], [0, aD, 0], [0, aB, 0], [0, aB, 0]); tp.push([rB, 0, 0], [rD, 0, 0], [rD, 0, 0], [rB, 0, 0], [rB, 0, 0]);
    hp.push([0, -8, 0], [0, -8, 0], [0, -(CH - 1.4), 0], [0, -8, 0], [0, yTop, 0]); rp.push([1, 8, 1], [1, 8, 1], [1, CH - 1.4, 1], [1, 8, 1], [1, -yTop, 1]); }
  ts.push(T); qs.push([0, aB, 0]); tp.push([rB, 0, 0]); hp.push([0, -6, 0]); rp.push([1, 6, 1]);
  tracks.push(trackQuat(slew, ts, qs), trackPos(trolley, ts, tp), trackPos(hookN, ts, hp), trackScale(rope, ts, rp));
  slew.rotation.y = aB; trolley.position.set(rB, 0, 0); hookN.position.set(0, -6, 0); rope.scale.set(1, 6, 1);
  // emberek: egy építésvezető tablettel (rajta a BIM-modell), két munkás
  person(B, 6, 14, Math.PI + 0.4, { tablet: true, y: 0.2, vest: '#c6f432' }); person(B, -15, 11, 0.5, { y: 0.2 }); person(B, 20, -12, -2, { y: 0.2 });
  for (const [x, z] of [[-30, 22], [-22, 22.5], [26, 22], [31, 21.5]]) tree(B, x, z, 5, 0.25);
  B.build(root);
  const clips = [new THREE.AnimationClip('bim', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'BIM-modell: az épület\ndigitális ikre' : 'BIM model: the digital\ntwin of the building', [FX0, 0.5 + NF * FH, FZ1], [FX0 - 8, 0.5 + NF * FH + 8, FZ1 + 6], SPEC.eti, K);
    label(G, hu ? 'Gépészet: csövek, légcsatornák' : 'Building services: pipes and ducts', [FX1, 8, 6], [FX1 + 9, 12, 14], '#4f8dff', K);
    label(G, hu ? 'Toronydaru' : 'Tower crane', [CX, CH, CZ], [CX + 8, CH + 6, CZ + 8], C.yellow, K);
    label(G, hu ? 'Tablettel a helyszínen' : 'Tablet on site', [6, 1.9, 14], [12, 6, 20], '#c6f432', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [30, 24], posterT: 8.5, labelT: 21 };
}
