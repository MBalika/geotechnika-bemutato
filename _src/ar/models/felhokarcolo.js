// Magas építmény a szélben (Szerkezet-építőmérnöki): a pécsi tévétorony a Misina-tetőn (535 m), Magyarország legmagasabb épülete.
// A vasbeton torony a szélben kileng (a csúcsán viharban akár fél métert is); a modellen a kilengés erősen felnagyítva látszik.
// A toronyban nincs lengéscsillapító: a hangolt tömegcsillapító elvét külön, a parkolóban álló szemléltető eszköz mutatja (ellenfázisban lengő tömeg).
// Adatok: 197 m (1995 óta, eredetileg 191 m), átadás 1973; külső vasbeton henger 12 m átmérővel 92 m-ig, belső 5 m átmérővel 135 m-ig;
// presszó 75 m-en, nyitott kilátóterasz 80 m-en; 22 m átmérőjű, 4 m vastag alaplemez (Wikipedia, epiteszforum.hu, tvtoronypecs.hu).
// A torony részletei (a kosár szintjei, a talpépület, a hegytető elrendezése) fényképek emléke alapján egyszerűsítettek.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackQuat, person } from '../lib/common.js';
import { at, car2, bus2, tree2, lamp, plaque } from '../lib/kit2.js';
import { slope } from '../lib/bme.js';
export const FILE = 'felhokarcolo-tmd';
const K = 1 / 450;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'tevetorony';
  const B = new Batch('hegy'), tracks = [], T = 16, PER = 4;
  const conc = mat('#d9d5cb', { r: 0.9 }), concD = mat('#bdb8ad', { r: 0.9 }), glass = mat('#3c5f78', { r: 0.15, m: 0.5 }), dark = mat('#2b2f33'), red = mat('#d8452f', { r: 0.6 }), white = mat('#f2f3f1', { r: 0.6 });
  // ---- a Misina-tető: erdős hegykúp, a tetején burkolt tér, parkoló, út ----
  const ringP = (r, n = 28, sq = 1) => Array.from({ length: n }, (_, i) => { const a = -i / n * Math.PI * 2, w = 1 + 0.06 * Math.sin(3 * a + r); return [Math.cos(a) * r * w, Math.sin(a) * r * w * sq]; });
  const RR = [34, 46, 62, 80, 96], HY = [0, -5, -13, -23, -34], forest = mat('#528a44', { r: 1 }), soilM = mat('#8c7a62', { r: 1 });
  for (let i = 0; i < 4; i++) slope(B, i % 2 ? mat('#5a934a', { r: 1 }) : forest, ringP(RR[i + 1]), HY[i + 1], ringP(RR[i]), HY[i]);
  B.cyl(RR[4] * 1.0, RR[4] * 1.0, 6, soilM, 0, HY[4] - 3, 0, [0, 0, 0], 28); B.cyl(RR[0] + 0.5, RR[0] + 2, 0.4, mat('#cfc9bb', { r: 0.95 }), 0, -0.2, 0, [0, 0, 0], 28);
  B.cyl(15, 15, 0.12, mat('#4a4e55'), 16, 0.06, 14, [0, 0, 0], 20); B.box(60, 0.3, 7, mat('#4a4e55'), 52, -4.6, 22, [0, -0.18, -0.17]); B.box(40, 0.3, 7, mat('#4a4e55'), 82, -17, 34, [0, -0.5, -0.3]);
  let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 130; i++) { const a = rnd() * Math.PI * 2, t = rnd(), r = 38 + t * 54, y = HY[0] + (HY[4] - HY[0]) * Math.pow((r - 34) / 62, 1.25); const x = Math.cos(a) * r, z = Math.sin(a) * r; if (x > 30 && z > 8 && z < 44) continue; tree2(B, x, z, 8 + rnd() * 5, y - 0.6, { c1: rnd() < 0.5 ? '#4f8a40' : '#5a9647', c2: '#6aa653' }); }
  for (const [x, z] of [[-26, 14], [-22, -20], [6, -30], [-30, -4]]) tree2(B, x, z, 9, 0);
  // talpépület a torony körül, lépcső, autók, busz, emberek
  B.cyl(13, 13, 5.2, conc, 0, 2.6, 0, [0, 0, 0], 24); B.cyl(13.6, 13.6, 0.5, concD, 0, 5.45, 0, [0, 0, 0], 24); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; if (Math.abs(a - Math.PI / 4) < 0.2) continue; B.box(1.6, 2.2, 0.2, glass, Math.sin(a) * 13.02, 2.8, Math.cos(a) * 13.02, [0, a, 0]); }
  B.box(3, 2.8, 0.3, dark, Math.sin(Math.PI / 4) * 13.05, 1.4, Math.cos(Math.PI / 4) * 13.05, [0, Math.PI / 4, 0]);
  for (const [x, z, r, c] of [[10, 22, 0.3, '#b33a2e'], [15, 23.5, 0.3, '#e9ecef'], [20, 22.5, 0.3, '#2f6db5'], [25, 19, 1.2, '#3a3f46'], [27, 13, 1.5, '#c8ccd0']]) car2(at(B, x, 0.12, z, r), c, { lite: true }); bus2(at(B, 16, 0.12, 7.5, 0.1), '#e9ecef');
  for (const [x, z, r, v] of [[12, 14, 1, '#3a5f8a'], [13.2, 14.6, 2.5, '#b33a2e'], [8, 17, 0.5, '#5a6a3a'], [20, 15, 4, '#8a5a3a'], [-16, 8, 1.5, '#6a4a8a']]) person(B, x, z, r, { y: 0.1, vest: v, helmet: '#5a4632', shirt: v });
  for (const [x, z] of [[4, 20], [26, 26], [30, 6]]) lamp(B, x, z, 0, 6);
  // alaplemez a metszett hegy belsejében nem látszik: a torony tövénél jelzés
  B.build(root);
  // ---- a torony négy, egymásra épülő szakasza (a kilengéshez láncba fűzve) ----
  const SEG = [[0, 0.004], [72, 0.006], [92, 0.012], [135, 0.02]], nodes = []; let parent = root, y0 = 0;
  SEG.forEach(([y, amp], i) => { const n = node(parent, 'torony' + i, [0, y - y0, 0]); nodes.push(n); parent = n; y0 = y;
    const tt = [], ee = []; for (let t = 0; t <= T + 1e-6; t += 0.5) { tt.push(t); ee.push([0, 0, -amp * 2.2 * (0.35 + Math.sin(t / PER * Math.PI * 2)) * (0.75 + 0.25 * Math.sin(t / T * Math.PI * 2))]); } tracks.push(trackQuat(n, tt, ee)); });
  { const b = new Batch('torzs'); b.cyl(6, 6.6, 72, conc, 0, 36, 0, [0, 0, 0], 24); for (const a of [0, 2.1, 4.2]) b.box(0.5, 62, 0.12, dark, Math.sin(a) * 6.3, 36, Math.cos(a) * 6.3, [0, a, 0]); for (let y = 12; y < 70; y += 12) b.cyl(6.35, 6.35, 0.25, concD, 0, y, 0, [0, 0, 0], 24); b.build(nodes[0]); }
  { const b = new Batch('kosar');                                                                                                        // 72–92 m: presszó, kilátóterasz, műszaki szintek
    b.cyl(9.5, 6.2, 3, conc, 0, 0.5, 0, [0, 0, 0], 24); b.cyl(10.4, 10.4, 3.4, glass, 0, 3.7, 0, [0, 0, 0], 28); b.cyl(11.6, 11.2, 0.7, conc, 0, 5.75, 0, [0, 0, 0], 28); b.cyl(10.8, 10.8, 0.25, concD, 0, 1.95, 0, [0, 0, 0], 28);
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; b.box(0.12, 3.4, 0.2, concD, Math.sin(a) * 10.45, 3.7, Math.cos(a) * 10.45, [0, a, 0]); b.box(0.08, 1.2, 0.08, dark, Math.sin(a) * 11.3, 6.7, Math.cos(a) * 11.3); }
    b.mesh(new THREE.TorusGeometry(11.3, 0.06, 5, 28), dark, [0, 7.3, 0], [Math.PI / 2, 0, 0]);
    b.cyl(7.4, 7.4, 6.5, conc, 0, 9.3, 0, [0, 0, 0], 24); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; b.box(0.5, 6.5, 0.7, concD, Math.sin(a) * 7.6, 9.3, Math.cos(a) * 7.6, [0, a, 0]); }
    b.cyl(9.2, 8.8, 0.8, conc, 0, 12.9, 0, [0, 0, 0], 24); b.cyl(6.4, 6.4, 6.4, conc, 0, 16.5, 0, [0, 0, 0], 24); b.cyl(7.6, 7.2, 0.6, concD, 0, 19.9, 0, [0, 0, 0], 24);
    for (const [a, y] of [[0.4, 15], [2.2, 16.5], [3.9, 15.5], [5.3, 17]]) b.mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5, 14), white, [Math.sin(a) * 6.9, y, Math.cos(a) * 6.9], [Math.PI / 2, 0, -a]);
    for (const [x, z, r] of [[9, 4, 1], [-8, 6, 2], [3, -10, 4]]) person(b, x, z, r, { y: 6.1, vest: '#b33a2e', helmet: '#3a3f46', shirt: '#b33a2e' }); b.build(nodes[1]); }
  { const b = new Batch('felso'); b.cyl(2.5, 2.9, 43, conc, 0, 21.5, 0, [0, 0, 0], 16); for (const y of [13, 28, 42.6]) { b.cyl(4.2, 4.2, 0.4, concD, 0, y, 0, [0, 0, 0], 16); b.mesh(new THREE.TorusGeometry(4.1, 0.05, 5, 16), dark, [0, y + 1.2, 0], [Math.PI / 2, 0, 0]); }
    for (const [a, y] of [[1, 8], [4, 20], [2.5, 34]]) b.box(1.2, 2.4, 0.6, white, Math.sin(a) * 3.1, y, Math.cos(a) * 3.1, [0, a, 0]); b.build(nodes[2]); }
  { const b = new Batch('antenna'); for (let i = 0; i < 8; i++) b.cyl(1.0 - (i + 1) * 0.07, 1.0 - i * 0.07, 7.6, i % 2 ? white : red, 0, 3.8 + i * 7.6, 0, [0, 0, 0], 10); b.cyl(0.08, 0.08, 1.4, dark, 0, 61.5, 0, [0, 0, 0], 5); b.mesh(new THREE.SphereGeometry(0.4, 8, 6), mat('#e8452c', { em: '#e8452c', ei: 0.9 }), [0, 61, 0]); b.build(nodes[3]); }
  // ---- szél: sodródó felhők ----
  for (const [y, z, ph, s] of [[150, -40, 0, 1], [120, 46, 0.4, 0.8], [176, 20, 0.7, 0.7]]) { const n = node(root, 'felho'), b = new Batch('felho'), m = mat('#ffffff', { op: 0.85, r: 1 }); for (const [dx, dy, r] of [[0, 0, 9], [9, 1, 7], [-9, 0.5, 6.5], [3, 4, 6]]) b.mesh(new THREE.IcosahedronGeometry(r * s, 1), m, [dx * s, dy * s, 0], [0, 0, 0], [1.4, 0.7, 1]); b.build(n);
    const xa = -95, xb = 95, tw = (1 - ph) * T; tracks.push(trackPos(n, [0, tw - 0.001, tw, T], [[xa + (xb - xa) * ph, y, z], [xb, y, z], [xa, y, z], [xa + (xb - xa) * ph, y, z]])); n.position.set(xa + (xb - xa) * ph, y, z); }
  // ---- a hangolt tömegcsillapító elve: szemléltető eszköz a parkolóban (keret + inga, ellenfázisban leng) ----
  { const fx = 30, fz = 30, b = new Batch('demo'), st = mat('#3a3f45'); for (const s of [-1, 1]) { b.rod([fx + s * 3, 0.1, fz - 1.5], [fx, 9, fz], 0.14, st, 6); b.rod([fx + s * 3, 0.1, fz + 1.5], [fx, 9, fz], 0.14, st, 6); } b.box(7, 0.25, 4, concD, fx, 0.22, fz); b.build(root);
    const pn = node(root, 'inga', [fx, 9, fz]), pb = new Batch('inga'); pb.rod([0, 0, 0], [0, -5.6, 0], 0.07, st, 5); pb.mesh(new THREE.SphereGeometry(1.1, 14, 10), mat(SPEC.tart, { r: 0.4, m: 0.3 }), [0, -6.2, 0]); pb.build(pn);
    const tt = [], ee = []; for (let t = 0; t <= T + 1e-6; t += 0.5) { tt.push(t); ee.push([0, 0, 0.42 * Math.sin(t / PER * Math.PI * 2 + Math.PI / 2)]); } tracks.push(trackQuat(pn, tt, ee)); }
  plaque(root, hu ? 'Pécsi tévétorony · Misina-tető' : 'Pécs TV Tower · Misina Hill', -26, HY[4] - 5.6, RR[4] + 0.6, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('szel', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const h = lg === 'hu';
    label(G, h ? '197 m: Magyarország legmagasabb épülete (1973)' : '197 m: the tallest building in Hungary (1973)', [0, 196, 0], [14, 204, 10], '#d8452f', K);
    label(G, h ? 'A csúcs viharban akár fél métert is kileng\n(a modellen erősen felnagyítva)' : 'In a storm the tip sways by up to half a metre\n(greatly exaggerated in the model)', [1, 150, 0], [26, 158, 10], SPEC.tart, K);
    label(G, h ? 'Presszó 75 m-en, kilátóterasz 80 m-en' : 'Café at 75 m, open viewing deck at 80 m', [11, 78, 3], [30, 92, 12], '#3c5f78', K);
    label(G, h ? 'Vasbeton törzs: kívül 12 m,\nbelül 5 m átmérő' : 'Reinforced-concrete shaft: 12 m outer,\n5 m inner diameter', [-6, 40, 2], [-78, 62, 12], '#d9d5cb', K);
    label(G, h ? 'A hangolt lengéscsillapító elve\n(a toronyban nincs ilyen)' : 'Principle of a tuned mass damper\n(the tower has none)', [30, 3, 30], [44, 22, 40], SPEC.tart, K);
    label(G, h ? 'Misina-tető, 535 m' : 'Misina Hill, 535 m', [-30, 0, 14], [-84, 20, 30], '#5f9a4a', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 14], posterT: 1, labelT: 1 };
}
