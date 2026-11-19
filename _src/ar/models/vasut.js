// Vasúti völgyhíd (Közlekedési létesítmények): a Nagyrákosi völgyhíd az Őrségben, a magyar–szlovén vasútvonalon – az ország leghosszabb vasúti hídja
// (kb. 1400 m, feszített vasbeton szekrénytartó, 2000–2001). A modell a híd egy kb. 450 m-es szakaszát mutatja a völgy fölött, őrségi tájjal:
// kaszálók, patak, erdőfoltok, szórványtelepülés házai. Animáció (12 s): személyvonat halad át a hídon, a völgyben autó megy az úton.
// Magyarországon ma nincs nagysebességű vasút: a felirat ezt ki is mondja. A pillérkiosztás, a magasság és a táj részletei szemléltetők.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, person } from '../lib/common.js';
import { car2, tree2, plaque } from '../lib/kit2.js';
import { terrain, ribbon, house } from '../lib/terep.js';
export const FILE = 'nagysebessegu-vasut';
const K = 1 / 600;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'volgyhid';
  const B = new Batch('taj'), tracks = [], T = 12, X0 = -230, X1 = 230, Z0 = -110, Z1 = 110, BOT = -14, DY = 17;
  const h = (x, z) => 8.5 * Math.pow(x / 230, 2) + 1.1 * Math.sin(z / 46 + x / 70) + 0.7 * Math.sin(x / 31 - z / 57) + 1.2;
  terrain(B, h, X0, X1, Z0, Z1, BOT, 92, 44, mat('#9cc56f', { r: 1 }), mat('#9a7b58', { r: 1, ds: true }));
  // kaszálók, szántók sávjai; patak; országút; földút
  const patch = (xa, xb, za, zb, col) => { for (let z = za; z < zb - 0.1; z += 11) ribbon(B, h, Array.from({ length: 9 }, (_, i) => [xa + (xb - xa) * i / 8, z + 5.5]), 10.4, mat(col, { r: 1, ds: true }), 0.06); };
  patch(-200, -120, -100, -30, '#c9cf7a'); patch(-110, -40, 30, 100, '#b5c96a'); patch(60, 150, -96, -40, '#d9c77a'); patch(120, 215, 30, 96, '#a9c46a'); patch(-205, -140, 40, 96, '#d2c06f');
  ribbon(B, h, Array.from({ length: 40 }, (_, i) => { const z = Z0 + (Z1 - Z0) * i / 39; return [6 + 16 * Math.sin(z / 34) + 7 * Math.sin(z / 13), z]; }), 5, mat(C.water, { r: 0.15, ds: true }), 0.12);
  const road = Array.from({ length: 30 }, (_, i) => { const z = Z0 + (Z1 - Z0) * i / 29; return [-62 + 10 * Math.sin(z / 60), z]; }); ribbon(B, h, road, 6.5, mat('#4a4e55', { r: 0.95, ds: true }), 0.14);
  ribbon(B, h, Array.from({ length: 16 }, (_, i) => [-62 + 180 * i / 15, 58 + 10 * Math.sin(i / 3)]), 3, mat('#cdbb92', { r: 1, ds: true }), 0.1);
  // erdőfoltok, fasor a patak mentén; házak (szórvány), szénaboglyák
  let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (const [cx, cz, rx, rz, n] of [[-185, -70, 38, 30, 34], [190, -72, 34, 30, 30], [185, 74, 36, 26, 26], [-150, 88, 60, 16, 22], [40, -98, 60, 10, 16]]) for (let i = 0; i < n; i++) { const a = rnd() * 6.283, r = Math.sqrt(rnd()), x = cx + Math.cos(a) * r * rx, z = cz + Math.sin(a) * r * rz; if (Math.abs(x) > 226 || Math.abs(z) > 106 || Math.abs(z) < 9) continue; tree2(B, x, z, 12 + rnd() * 7, h(x, z) - 0.4, { c1: rnd() < 0.4 ? '#3f7a3a' : '#4f8a40', c2: '#5f9a4a' }); }
  for (let z = Z0 + 8; z < Z1 - 4; z += 17) { const x = 6 + 16 * Math.sin(z / 34) + 7 * Math.sin(z / 13) + 6; if (Math.abs(z) > 10) tree2(B, x, z, 9 + rnd() * 4, h(x, z) - 0.3, { c1: '#6aa653', c2: '#7fb863' }); }
  for (const [x, z, ry, wc, rc] of [[-84, 40, 0.3, '#f4f1e6', '#a14b37'], [-96, 66, -0.2, '#f2e7c9', '#8c4a3a'], [-78, 84, 0.5, '#f4f1e6', '#7a3f30'], [-48, -52, 1.4, '#efe6cf', '#a14b37'], [-80, -74, 1.2, '#f4f1e6', '#8c4a3a'], [-44, -88, 0.2, '#f2e7c9', '#a14b37'], [96, 72, 0.4, '#f4f1e6', '#7a3f30']]) { house(B, x, z, ry, 14, 7, 3.4, wc, rc, h(x, z) - 0.3); house(B, x + 12 * Math.cos(ry + 1.2), z - 12 * Math.sin(ry + 1.2), ry + 1.57, 9, 6, 3, '#b08455', '#6f5a45', h(x, z) - 0.3); }
  for (const [x, z] of [[110, -70], [124, -58], [-150, -50], [-170, -36], [150, 50]]) { B.mesh(new THREE.ConeGeometry(2.4, 4.4, 8), mat('#d9c77a', { r: 1 }), [x, h(x, z) + 2.1, z]); }
  // ---- a völgyhíd: pillérek 45 m-enként, feszített vasbeton szekrénytartó, ágyazat, vágány, felsővezeték ----
  const conc = mat('#d9d6cf', { r: 0.9 }), concD = mat('#bdb9b0', { r: 0.9 }), dark = mat('#3a3f45'), DT = DY - 3.4;
  for (let x = -202.5; x < 226; x += 45) { const y0 = h(x, 0) - 1.2; B.box(3.0, DT - y0, 5.6, conc, x, (DT + y0) / 2, 0); for (const s of [-1, 1]) B.cyl(2.8, 2.8, DT - y0, conc, x, (DT + y0) / 2, s * 0, [0, 0, 0], 4); B.box(4.4, 1.0, 7.6, concD, x, DT - 0.5, 0); B.box(7, 1.4, 10, concD, x, y0 + 0.7, 0); }
  const sec = new THREE.Shape([[-2.6, 0], [2.6, 0], [3.3, 2.7], [5.6, 3.05], [5.6, 3.4], [-5.6, 3.4], [-5.6, 3.05], [-3.3, 2.7]].map(p => new THREE.Vector2(p[0], p[1]))), dg = new THREE.ExtrudeGeometry(sec, { depth: X1 - X0, bevelEnabled: false }); dg.rotateY(Math.PI / 2); dg.translate(X0, DT, 0); B.add(dg, conc);
  B.box(X1 - X0, 0.45, 5.0, mat('#8f8a80', { r: 1 }), 0, DY + 0.22, 0); for (const z of [-0.72, 0.72]) B.box(X1 - X0, 0.16, 0.1, mat('#9aa3ab', { m: 0.6, r: 0.4 }), 0, DY + 0.55, z); for (let x = X0 + 1; x < X1; x += 1.8) B.box(0.26, 0.14, 2.6, mat('#6f6a60'), x, DY + 0.44, 0);
  for (const s of [-1, 1]) { B.box(X1 - X0, 0.08, 0.08, dark, 0, DY + 1.3, s * 5.4); for (let x = X0 + 1; x < X1; x += 4.5) B.box(0.08, 1.3, 0.08, dark, x, DY + 0.65, s * 5.4); }
  for (let x = -225; x < 228; x += 45) { B.cyl(0.16, 0.2, 7.6, dark, x, DY + 3.8, -4.6, [0, 0, 0], 6); B.rod([x, DY + 7.0, -4.6], [x, DY + 6.4, 0.2], 0.07, dark, 4); B.rod([x, DY + 7.5, -4.6], [x, DY + 7.5, 0.2], 0.05, dark, 4); }
  B.box(X1 - X0, 0.05, 0.05, dark, 0, DY + 6.2, 0); B.box(X1 - X0, 0.04, 0.04, dark, 0, DY + 7.4, 0);
  for (const [x, z, r] of [[-60, 30, 1], [-58.6, 31, 2.5], [10, 60, 0.4]]) person(B, x, z, r, { y: h(x, z), vest: '#3a5f8a', helmet: '#5a4632', shirt: '#3a5f8a' });
  B.build(root);
  // ---- személyvonat (négyrészes motorvonat) és autó ----
  const train = node(root, 'vonat'), vb = new Batch('vonat');
  for (let i = 0; i < 4; i++) { const x = -39 + i * 26; vb.box(25.2, 3.0, 2.9, mat('#e9ecef', { r: 0.5, m: 0.2 }), x, 2.3, 0); vb.box(24.6, 1.0, 2.94, mat('#26323d', { r: 0.2, m: 0.5 }), x, 2.8, 0); vb.box(25.2, 0.5, 2.95, mat('#d8452f'), x, 1.15, 0); vb.box(24, 0.3, 2.4, mat('#b9bec4'), x, 3.95, 0); for (const d of [-9, 9]) vb.box(3.4, 0.7, 2.2, dark, x + d, 0.45, 0); }
  vb.mesh(new THREE.CylinderGeometry(1.45, 1.45, 3.0, 12, 1, false, -Math.PI / 2, Math.PI), mat('#d8452f', { r: 0.5 }), [51.6, 2.3, 0], [0, 0, 0], [1.6, 1, 1]); vb.rod([-20, 4.1, 0], [-18.6, 5.45, 0], 0.06, dark, 4); vb.rod([-17.2, 4.1, 0], [-18.6, 5.45, 0], 0.06, dark, 4); vb.build(train);
  const xa = X0 + 54, xb = X1 - 56; tracks.push(trackPos(train, [0, 10, 10.05, T], [[xa, DY + 0.6, 0], [xb, DY + 0.6, 0], [xa, DY + 0.6, 0], [xa, DY + 0.6, 0]])); train.position.set(-20, DY + 0.6, 0);
  { const nd = node(root, 'auto'), cb = new Batch('auto'); car2(cb, '#b33a2e', { lite: true }); cb.build(nd); nd.rotation.y = -Math.PI / 2; const P = road.filter((_, i) => i % 3 === 0 && i > 1 && i < 28), tt = P.map((_, i) => i / (P.length - 1) * (T - 0.2)); tracks.push(trackPos(nd, [...tt, T], [...P.map(([x, z]) => [x + 1.5, h(x, z) + 0.2, z]), [P[0][0] + 1.5, h(...P[0]) + 0.2, P[0][1]]])); nd.position.set(P[4][0] + 1.5, h(...P[4]) + 0.2, P[4][1]); }
  plaque(root, hu ? 'Nagyrákosi völgyhíd · Őrség' : 'Nagyrákos Viaduct · Őrség, Hungary', X0 + 6, BOT + 1.5, Z1 + 0.3, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('vonat', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const q = lg === 'hu';
    label(G, q ? 'Kb. 1400 m: Magyarország leghosszabb vasúti hídja' : 'About 1,400 m: the longest railway bridge in Hungary', [60, DY + 0.4, 5.6], [40, 46, 30], SPEC.kozl, K);
    label(G, q ? 'Feszített vasbeton szekrénytartó' : 'Prestressed concrete box girder', [-120, DY - 1.6, 5.6], [-200, 40, 40], '#d9d6cf', K);
    label(G, q ? 'Magyarországon ma nincs nagysebességű vasút;\nitt hagyományos vonatok járnak' : 'Hungary has no high-speed railway yet;\nconventional trains run here', [-20, DY + 4.5, 0], [-60, 62, 0], '#d8452f', K);
    label(G, q ? 'Őrségi táj: kaszálók, patak, szórványtelepülés' : 'Őrség landscape: meadows, a stream, scattered farmsteads', [-84, h(-84, 40) + 5, 40], [-150, 22, Z1 + 14], '#9cc56f', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [22, 18], posterT: 5, labelT: 5 };
}
