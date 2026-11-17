// Mobilgát árvízben (Vízmérnöki) – metszet a folyópart és a rakpart mentén: a dolgozók felállítják az acéloszlopokat, és sorról sorra
// beengedik közéjük az alumínium gerendákat; a folyó megárad, a víz a gátig ér, a város mögötte szárazon marad; utána levonul.
import { THREE, Batch, mat, C, SPEC, tree, carGeom, label, node, trackScale, trackPos, person } from '../lib/common.js';
export const FILE = 'mobilgat';
const K = 1 / 200;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1], SY0 = [1, 0.001, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'mobilgat';
  const B = new Batch('part'); const tracks = [], T = 22;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const X0 = -52, X1 = 48, Z0 = -36, PY = 2, WX = 4, WH = 5.6, H0 = -1, H1 = 6.6;
  // talaj: a meder (y = −6), rézsűs part kőszórással, rakpart, utca; a metszet síkja z = 0
  for (const [ya, yb, col] of [[-16, -9, C.clay], [-9, -6, C.gravel]]) box(B, mat(col), X0, X1, ya, yb, Z0, 0);
  const bank = new THREE.Shape(); bank.moveTo(-10, -6); bank.lineTo(X1, -6); bank.lineTo(X1, PY); bank.lineTo(0, PY); bank.closePath();
  { const g = new THREE.ExtrudeGeometry(bank, { depth: -Z0, bevelEnabled: false }); g.translate(0, 0, Z0); B.add(g, mat(C.sand)); }
  const rip = new THREE.Shape(); rip.moveTo(-10.4, -6); rip.lineTo(-9.4, -6); rip.lineTo(0.4, PY); rip.lineTo(-0.6, PY); rip.closePath();
  { const g = new THREE.ExtrudeGeometry(rip, { depth: -Z0, bevelEnabled: false }); g.translate(0, 0, Z0); B.add(g, mat(C.rock)); }
  box(B, mat('#c9c4b8'), 0, 14, PY, PY + 0.25, Z0, 0); box(B, mat(C.asphalt), 14, 30, PY, PY + 0.25, Z0, 0); box(B, mat(C.grass), 30, X1, PY, PY + 0.3, Z0, 0);
  for (let z = Z0 + 3; z < 0; z += 7) box(B, mat(C.white), 21.6, 22.4, PY + 0.26, PY + 0.29, z, z + 3);
  // a mobilgát alaptestje a rakpartban (metszetben látszik), vízmérce
  box(B, mat(C.concreteDark), WX - 1.2, WX + 1.2, PY - 3, PY + 0.3, Z0, 0);
  for (let y = -5, k = 0; y < 8; y += 1, k++) box(B, mat(k % 2 ? C.white : '#e0523f'), -6.2, -5.9, y, y + 1, -6, -5.7);
  B.cyl(0.18, 0.18, 14, mat(C.steelDark), -6.05, 1, -5.85, [0, 0, 0], 8);
  // város: házak, fák, parkoló autók, emberek
  for (const [x, z, w, d, hh, c] of [[36, -26, 9, 8, 9, '#f2d7b6'], [37, -12, 8, 9, 12, '#f4f3ef'], [40, -2, 10, 3.5, 7, '#cfe3ef']]) { B.boxB(w, hh, d, mat(c), x, PY + 0.3, z); B.boxB(w + 0.6, 0.6, d + 0.6, mat(C.roof), x, PY + 0.3 + hh, z); for (let f = 1; f * 3 < hh - 1; f++) B.box(w + 0.05, 1.2, d + 0.05, mat(C.glass), x, PY + 0.3 + f * 3, z); }
  for (const z of [-33, -20, -7]) tree(B, 12, z, 6, PY + 0.25); for (const z of [-30, -18]) tree(B, 31.5, z, 7, PY + 0.3);
  for (const [z, c] of [[-30, '#e0523f'], [-24, '#2f6db5'], [-17, '#f4c430']]) { const g = carGeom(c); g.position.set(27.5, PY + 0.25, z); g.rotation.y = Math.PI / 2; const n = node(root, 'parkolo'); n.add(g); }
  person(B, 18, -9, -1.2, { y: PY + 0.25, vest: '#3a5f8a', helmet: '#e9d2b8' });
  B.build(root);
  // ---- víz: a meder fölött egy doboz, amelynek a teteje emelkedik (a part és a rakpart takarja, ahol alatta van) ----
  const wn = node(root, 'viz', [0, -6, 0]); const wm = new THREE.Mesh(new THREE.BoxGeometry(WX - 0.2 - X0, 1, -Z0 - 0.06), mat(C.water, { op: 0.82, r: 0.2 })); wm.position.set((X0 + WX - 0.2) / 2, 0.5, Z0 / 2 - 0.03); wm.name = 'folyo'; wn.add(wm);
  const lv = (h) => [1, h + 6, 1]; const tUp = 7.5, tTop = 14, tDn = 18, tLow = 20.4;
  tracks.push(trackScale(wn, [0, tUp, tTop, tDn, tLow, T], [lv(H0), lv(H0), lv(H1), lv(H1), lv(H0), lv(H0)])); wn.scale.set(...lv(H1));
  // ---- oszlopok és gerendák ----
  const posts = []; for (let z = Z0 + 1; z <= -0.5; z += 4) posts.push(z);
  posts.forEach((z, i) => { const n = node(root, 'oszlop', [WX, PY + 0.3, z]); const pb = new Batch('o'); box(pb, mat('#5b6b7a', { m: 0.4, r: 0.45 }), -0.22, 0.22, 0, WH, -0.22, 0.22); box(pb, mat(SPEC.viz), -0.26, 0.26, WH - 0.2, WH + 0.05, -0.26, 0.26); pb.build(n);
    const t0 = 1 + i * 0.12; tracks.push(trackScale(n, [0, t0, t0 + 0.4, tLow + 0.6, tLow + 1.0, T], [SY0, SY0, S1, S1, SY0, SY0])); });
  const NR = 13, BH = WH / NR; const beamM = [mat('#c0c7cf', { m: 0.55, r: 0.35 }), mat('#aeb6bf', { m: 0.55, r: 0.35 })];
  for (let r = 0; r < NR; r++) { const n = node(root, 'gerendasor', [WX, PY + 0.3 + r * BH, 0]); const bb = new Batch('g'); for (let i = 0; i < posts.length - 1; i++) box(bb, beamM[r % 2], -0.12, 0.12, 0.02, BH - 0.02, posts[i] + 0.22, posts[i + 1] - 0.22); box(bb, beamM[r % 2], -0.12, 0.12, 0.02, BH - 0.02, posts[posts.length - 1] + 0.22, 0); bb.build(n);
    const t0 = 2.6 + r * 0.38, t1 = tLow + 0.2 + (NR - 1 - r) * 0.03; tracks.push(trackScale(n, [0, t0, t0 + 0.3, t1, t1 + 0.2, T], [S0, S0, S1, S1, S0, S0])); }
  // dolgozók a gátnál, kisteherautó a gerendákkal
  const crew = new Batch('csapat'); person(crew, WX + 1.6, -8, -Math.PI / 2, { y: PY + 0.25 }); person(crew, WX + 1.5, -20, -Math.PI / 2 + 0.3, { y: PY + 0.25, vest: '#c6f432' }); person(crew, WX + 2.6, -29, -2.2, { y: PY + 0.25, tablet: true });
  crew.boxB(5.4, 2.2, 2.2, mat(C.white), 9, PY + 0.25, -14); crew.boxB(1.8, 2, 2.2, mat('#2f6db5'), 12.6, PY + 0.25, -14); for (let k = 0; k < 4; k++) crew.box(4.6, 0.3, 0.3, mat('#c0c7cf', { m: 0.5 }), 8.8, PY + 2.6 + k * 0.32, -14.6 + (k % 2) * 0.5);
  crew.build(root);
  // homokzsákok a gát lábánál (a víz felőli oldalon)
  const sand = new Batch('zsak'); for (let z = Z0 + 1; z < -0.6; z += 0.9) for (let k = 0; k < 2; k++) sand.mesh(new THREE.SphereGeometry(0.42, 8, 6), mat('#cdb88a'), [WX - 0.7 - k * 0.55, PY + 0.55 + k * 0.1, z + (k ? 0.4 : 0)], [0, 0, 0], [1.1, 0.6, 1]);
  sand.build(root);
  const clips = [new THREE.AnimationClip('arviz', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Mobilgát: alumínium gerendák\nacéloszlopok között' : 'Mobile flood wall: aluminium\nbeams between steel posts', [WX, PY + 4, -2], [WX + 6, PY + 22, 4], '#c0c7cf', K);
    label(G, hu ? 'Árvízszint' : 'Flood level', [-20, H1, 0], [-28, H1 + 9, 6], C.waterDeep, K);
    label(G, hu ? 'Szárazon marad a város' : 'The town stays dry', [36, PY + 10, -2], [36, PY + 32, 6], C.grass, K);
    label(G, hu ? 'Vízmérce' : 'Gauge', [-6.05, 0.5, -5.85], [-16, -2.5, 8], '#e0523f', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 20], posterT: 15, labelT: 15 };
}
