// Birtokrendezés (Földmérő- és földrendező mérnöki): a Tihanyi-félsziget a Balatonban, OpenStreetMap szerinti partvonallal (észak hátul):
// a Belső-tó és a Külső-tó, keleten Tihany az apátsággal, a déli csúcson a rév. A félsziget belsejében egy mezőgazdasági terület mutatja a
// birtokrendezés elvét. Animáció (20 s): a szétaprózott, keskeny, öt tulajdonos között elszórt parcellákból tulajdonosonként egy-egy összefüggő
// tábla lesz, új dűlőutakkal; közben a komp átkel Szántód felé.
// SZEMLÉLTETŐ PÉLDA: a parcellák kitaláltak, nem a valós tihanyi birtokviszonyokat mutatják (a félsziget nagy része védett terület).
// Méretarány 1:14 000; a dombok kb. háromszoros túlemeléssel, az apátság, a házak és a komp felnagyítva.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackScale } from '../lib/common.js';
import { planPrism, plaque } from '../lib/kit2.js';
export const FILE = 'birtokrendezes';
const K = 1 / 14000;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'tihany';
  const B = new Batch('taj'), tracks = [], T = 20, S = 18.7, P = (px, py) => [(px - 300) * S, (py - 235) * S], X0 = -3180, X1 = 3180, Z0 = -4020, Z1 = 4020, BOT = -260, LY = 22;
  const land = mat('#b4cf86', { r: 1 }), forest = mat('#5f9a4a', { r: 1 }), forestD = mat('#4f8a40', { r: 1 });
  B.box(X1 - X0, -BOT - 60, Z1 - Z0, mat('#9a8a6a', { r: 1 }), 0, (BOT - 60) / 2, 0); B.box(X1 - X0, 60, Z1 - Z0, mat(C.water, { op: 0.86, r: 0.12 }), 0, -30, 0);
  const PEN = [[240, 185], [275, 172], [310, 200], [350, 212], [400, 240], [425, 280], [428, 330], [440, 372], [415, 430], [380, 432], [330, 420], [290, 395], [255, 360], [240, 320], [236, 270], [245, 225], [232, 200]].map(([a, b]) => P(a, b));
  const MAIN = [[130, 270], [170, 235], [232, 200], [240, 185], [275, 172], [300, 150], [350, 100], [400, 60], [470, 40], [470, 20], [130, 20]].map(([a, b]) => P(a, b)).map(([x, z]) => [Math.max(X0, Math.min(X1, x)), Math.max(Z0, Math.min(Z1, z))]);
  for (const poly of [PEN, MAIN]) { B.add(planPrism(poly, -58, LY), land); B.add(planPrism(poly, -59, 1), mat('#d9cfa8', { r: 1 })); }
  // dombok (túlemelve) és erdők; a két tó
  const dome = (px, py, r, hh, m) => { const [x, z] = P(px, py); B.mesh(new THREE.SphereGeometry(r, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), m, [x, LY - 2, z], [0, px, 0], [1, hh / r, 0.85]); };
  for (const [px, py, r, hh, f] of [[247, 338, 520, 300, 1], [280, 365, 430, 230, 1], [320, 385, 420, 220, 1], [362, 388, 400, 260, 1], [345, 297, 330, 230, 0], [398, 262, 250, 190, 0], [410, 320, 300, 180, 1], [262, 290, 300, 160, 1], [415, 392, 260, 150, 1], [200, 120, 700, 260, 1], [330, 60, 800, 300, 1], [160, 190, 420, 180, 1]]) dome(px, py, r, hh, f ? (px % 2 ? forest : forestD) : land);
  { const [x, z] = P(300, 281); B.mesh(new THREE.CylinderGeometry(1, 1, 3, 24), mat(C.water, { r: 0.1 }), [x, LY + 1, z], [0, 0.3, 0], [430, 1, 300]); const [x2, z2] = P(262, 232); B.mesh(new THREE.CylinderGeometry(1, 1, 3, 24), mat('#7fb39a', { r: 0.6 }), [x2, LY + 1, z2], [0, -0.4, 0], [520, 1, 330]); B.mesh(new THREE.CylinderGeometry(1, 1, 3.4, 20), mat(C.water, { r: 0.1 }), [x2 + 40, LY + 1, z2 + 20], [0, -0.4, 0], [250, 1, 130]); }
  // Tihany házai a keleti parton, az apátság a dombon (felnagyítva), rév a déli csúcson, Balatonfüred jelzésszerűen
  let sd = 4; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647; const houses = (px, py, rx, ry, n) => { for (let i = 0; i < n; i++) { const [x, z] = P(px + (rnd() - 0.5) * rx, py + (rnd() - 0.5) * ry), a = rnd() * 3; B.box(70, 34, 46, mat('#f4f1e6', { r: 0.9 }), x, LY + 60 + 17, z, [0, a, 0]); B.box(76, 16, 52, mat(i % 2 ? '#a65a40' : '#9c4f38'), x, LY + 60 + 42, z, [0, a, 0]); } };
  dome(392, 285, 330, 60, land); houses(392, 288, 28, 44, 34); houses(408, 420, 16, 14, 8); houses(232, 250, 10, 20, 8); { for (let i = 0; i < 40; i++) { const [x, z] = P(330 + rnd() * 120, 40 + rnd() * 70); if (z > P(0, 150 - (x / S + 300 - 300) * 0)[1]) continue; B.box(80, 40, 56, mat('#f4f1e6'), x, LY + 20, z, [0, rnd() * 3, 0]); B.box(86, 16, 62, mat('#9c4f38'), x, LY + 48, z, [0, rnd(), 0]); } }
  { const [x, z] = P(401, 264), y = LY + 185, w = mat('#f6f1de', { r: 0.9 }), rf = mat('#a65a40'); B.box(260, 130, 110, w, x - 40, y + 65, z, [0, 0.2, 0]); B.box(270, 50, 120, rf, x - 40, y + 150, z, [0, 0.2, 0]); for (const s of [-1, 1]) { B.box(56, 250, 56, w, x + 100, y + 125, z + s * 42 - 22, [0, 0.2, 0]); B.mesh(new THREE.SphereGeometry(34, 10, 8), mat('#6f9a86', { m: 0.3 }), [x + 100, y + 262, z + s * 42 - 22], [0, 0, 0], [1, 1.3, 1]); B.mesh(new THREE.ConeGeometry(16, 70, 8), mat('#6f9a86', { m: 0.3 }), [x + 100, y + 330, z + s * 42 - 22]); }
    B.box(330, 90, 260, mat('#efe6cf'), x - 60, y + 45, z + 190, [0, 0.2, 0]); B.box(340, 30, 270, rf, x - 60, y + 100, z + 190, [0, 0.2, 0]); }
  { const [x, z] = P(408, 431); B.box(160, 14, 50, mat('#cfc6b4'), x + 30, LY - 16, z + 60, [0, 1.2, 0]); }
  B.build(root);
  // ---- a birtokrendezés területe: előtte (szétaprózott sávok) és utána (tulajdonosonként egy tábla) ----
  const OWN = ['#f2c417', '#e0703a', '#7fb3e6', '#c9a0dc', '#f4f1c9'], [ax, az] = P(302, 208), [bx, bz] = P(386, 258), W = bx - ax, D = bz - az, YF = LY + 2, cnt = [0, 0, 0, 0, 0];
  const before = node(root, 'elotte'), bb = new Batch('savok'); for (let cx = 0; cx < 3; cx++) for (let cz = 0; cz < 2; cz++) { const n = 9, horiz = (cx + cz) % 2, x0 = ax + cx * W / 3, z0 = az + cz * D / 2, w = W / 3 - 30, d = D / 2 - 30; for (let i = 0; i < n; i++) { const o = Math.floor(rnd() * 5); cnt[o]++; const m = mat(OWN[o], { r: 1 });
        if (horiz) bb.box(w, 14, d / n - 5, m, x0 + 15 + w / 2, YF + 7, z0 + 15 + (i + 0.5) * d / n); else bb.box(w / n - 5, 14, d, m, x0 + 15 + (i + 0.5) * w / n, YF + 7, z0 + 15 + d / 2); } }
  bb.box(W, 4, D, mat('#8a7f5a', { r: 1 }), ax + W / 2, YF + 2, az + D / 2); bb.build(before);
  const after = node(root, 'utana'), ab = new Batch('tablak'), tot = cnt.reduce((a, b) => a + b, 0); { let x = ax; const order = [0, 1, 2, 3, 4], halfs = [[0, 1], [2, 3, 4]]; let zc = az; for (const grp of halfs) { const gs = grp.reduce((a, o) => a + cnt[o], 0), dd = D * gs / tot; let xx = ax; for (const o of grp) { const ww = W * cnt[o] / gs; ab.box(ww - 34, 14, dd - 34, mat(OWN[o], { r: 1 }), xx + ww / 2, YF + 7, zc + dd / 2); for (let k = 1; k < 6; k++) ab.box(ww - 60, 15, 4, mat('#00000022'.slice(0, 7) === '#000000' ? '#b9a85a' : '#b9a85a', { r: 1 }), xx + ww / 2, YF + 7.4, zc + 17 + k * (dd - 34) / 6); xx += ww; } zc += dd; }
    ab.box(W, 5, D, mat('#cdbb92', { r: 1 }), ax + W / 2, YF + 2.5, az + D / 2); for (let i = 0; i < 16; i++) ab.mesh(new THREE.IcosahedronGeometry(26, 0), mat('#4f8a40'), [ax + 20 + i * (W - 40) / 15, YF + 34, az - 8]); ab.build(after); }
  const S1 = [1, 1, 1], SY = [1, 0.001, 1]; tracks.push(trackScale(before, [0, 6, 8, 17, 19, T], [S1, S1, SY, SY, S1, S1]), trackScale(after, [0, 7.5, 9.5, 16.5, 18, T], [SY, SY, S1, S1, SY, SY])); before.scale.set(...SY);
  // ---- komp a rév és Szántód között ----
  { const nd = node(root, 'komp'), b = new Batch('komp'); b.box(190, 26, 70, mat('#f2f3f1'), 0, 8, 0); b.box(70, 30, 50, mat('#2f6db5'), -30, 36, 0); b.box(200, 6, 76, mat('#3a3f45'), 0, -4, 0); b.build(nd); const [x0, z0] = P(410, 436), [x1, z1] = P(430, 449); nd.rotation.y = -Math.atan2(z1 - z0, x1 - x0); tracks.push(trackPos(nd, [0, 8, 10, 18, T], [[x0, 4, z0 + 60], [x1, 4, z1], [x1, 4, z1], [x0, 4, z0 + 60], [x0, 4, z0 + 60]])); nd.position.set((x0 + x1) / 2, 4, (z0 + z1) / 2 + 30); }
  plaque(root, hu ? 'Tihanyi-félsziget · Balaton' : 'Tihany Peninsula · Lake Balaton', X0 + 120, BOT + 40, Z1 + 10, K, { h: 0.021 });
  const clips = [new THREE.AnimationClip('rendezes', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const q = lg === 'hu', L = (t, px, py, y, p, c) => { const [x, z] = P(px, py); label(G, t, [x, y, z], p, c, K); };
    L(q ? 'Birtokrendezés után: tulajdonosonként\negy tábla, új dűlőutakkal (szemléltető példa)' : 'After land consolidation: one block per owner,\nwith new farm tracks (illustrative example)', 344, 233, LY + 20, [-2900, 900, -1700], SPEC.foldr);
    L(q ? 'Tihanyi apátság (alapítva 1055-ben)' : 'Tihany Abbey (founded in 1055)', 401, 264, LY + 500, [1500, 1100, -200], '#f6f1de'); L(q ? 'Belső-tó' : 'Inner Lake', 300, 281, LY + 4, [-2900, 500, 600], C.waterDeep); L(q ? 'Külső-tó' : 'Outer Lake', 262, 232, LY + 4, [-3000, 620, -700], '#7fb39a');
    L(q ? 'Balaton' : 'Lake Balaton', 180, 380, 2, [-2900, 300, 3000], C.waterDeep); L(q ? 'Komp Szántód felé' : 'Ferry to Szántód', 420, 442, 30, [900, 420, 3700], '#2f6db5'); L(q ? 'Balatonfüred' : 'Balatonfüred', 400, 70, LY + 40, [1700, 700, -3500], '#f4f1e6');
    return G; };
  return { root, labels, clips, k: K, posterView: [16, 36], posterT: 12, labelT: 12 };
}
