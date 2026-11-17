// Metróépítés pajzsos alagútfúróval (Közlekedési létesítmények) – hosszmetszet az alagút tengelyében.
// Animáció (20 s): a pajzs 22 m-t halad előre, a vágókerék forog, a talaj eltűnik előle, mögötte sorra megjelennek a tübbinggyűrűk;
// a daru szegmenst enged az indítóaknába, az ellátó vonat ingázik; fent az utcán közben zavartalanul megy a forgalom.
import { THREE, Batch, mat, C, SPEC, tree, carGeom, label, node, trackPos, trackScale, spinTrack } from '../lib/common.js';
export const FILE = 'metro-pajzs';
const K = 1 / 130;

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'metro';
  const B = new Batch('metro');
  const X0 = -56, X1 = 56, Z0 = -32, R = 3.0, RC = R + 0.35, ZB = -(R + 0.5), YA = -21;
  const SX0 = X0 + 5, SX1 = X0 + 17; // indítóakna
  const TXa = 18, TXb = 40, TA = 18, T = 20; // a vágókerék homloka TXa-ról TXb-re ér TA másodperc alatt
  const TX = (t) => TXa + (TXb - TXa) * Math.min(1, t / TA), tAt = (x) => Math.max(0, Math.min(TA, (x - TXa) / (TXb - TXa) * TA));
  const LAY = [[3, C.fill], [7, C.sand], [6, C.gravel], [14, '#77706a']];
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const top = YA + RC, bot = YA - RC, NS = 16, steps = [];
  for (let i = 0; i < NS; i++) { const ya = bot + i * (2 * RC / NS), yb = ya + 2 * RC / NS; const dy = (ya - YA) * (yb - YA) < 0 ? 0 : Math.min(Math.abs(ya - YA), Math.abs(yb - YA)); steps.push([ya, yb, Math.sqrt(Math.max(0, RC * RC - dy * dy))]); }
  // talaj: hátul (z < ZB) teljes; elöl egy szelet, amelyből az akna és a kész alagút félcsöve ki van vágva
  let y = 0; const layAt = (yy) => { let a = 0; for (const [t, col] of LAY) { if (yy > a - t) return col; a -= t; } return LAY[LAY.length - 1][1]; };
  for (const [t, col] of LAY) { const y0 = y, y1 = y - t, m = mat(col);
    box(B, m, X0, X1, y1, y0, Z0, ZB);
    box(B, m, X0, SX0 - 0.8, y1, y0, ZB, 0); box(B, m, TXb, X1, y1, y0, ZB, 0);
    box(B, m, SX0 - 0.8, SX1 + 0.8, y1, Math.min(y0, YA - R - 1.8), ZB, 0); // az akna alatt
    box(B, m, SX1 + 0.8, TXb, Math.max(y1, top), y0, ZB, 0); box(B, m, SX1 + 0.8, TXb, y1, Math.min(y0, bot), ZB, 0);
    for (const [ya, yb, half] of steps) box(B, m, SX1 + 0.8, TXb, Math.max(y1, ya), Math.min(y0, yb), ZB, -half);
    y = y1; }
  // a pajzs előtti talaj „dugói”: a vágókerék homlokával együtt fogynak
  const NP = 15, wP = (TXb - TXa) / NP, tracks = [];
  for (let j = 0; j < NP; j++) { const xa = TXa + j * wP, xb = xa + wP; const n = node(root, 'talaj', [xb, 0, 0]); const pb = new Batch('dugo');
    for (const [ya, yb, half] of steps) box(pb, mat(layAt((ya + yb) / 2)), -wP, 0, ya, yb, -half, 0);
    pb.build(n); n.scale.set(0.001, 1, 1); tracks.push(trackScale(n, [0, tAt(xa), tAt(xb), T - 0.01, T], [[1, 1, 1], [1, 1, 1], [0.001, 1, 1], [0.001, 1, 1], [1, 1, 1]])); }
  box(B, mat(C.grass), X0, X1, 0, 0.4, Z0, ZB); box(B, mat(C.grass), X0, SX0 - 0.8, 0, 0.4, ZB, 0); box(B, mat(C.grass), SX1 + 0.8, X1, 0, 0.4, ZB, 0);
  // utca a felszínen: út, járda, házak, fák
  B.boxB(X1 - X0, 0.5, 12, mat(C.asphalt), 0, 0.3, -12); B.boxB(X1 - X0, 0.6, 3, mat(C.concrete), 0, 0.3, -19.5); B.boxB(X1 - X0, 0.6, 3, mat(C.concrete), 0, 0.3, -4.5);
  for (let x = X0 + 4; x < X1; x += 9) B.box(4, 0.05, 0.3, mat(C.white), x, 0.83, -12);
  const houses = [[-46, 14, 18], [-29, 12, 24], [-12, 14, 15], [16, 13, 21], [34, 15, 27], [50, 10, 18]];
  const hc = ['#f4f3ef', '#f2d7b6', '#cfe3ef', '#f4f3ef', '#e9d2e4', '#f2e3a8'];
  houses.forEach(([x, w, h], i) => { B.boxB(w, h, 9, mat(hc[i]), x, 0.4, -27); for (let f = 1; f * 3.3 < h - 1; f++) B.box(w + 0.1, 1.4, 0.2, mat(C.glass), x, f * 3.3 + 0.4, -22.45); B.boxB(w + 0.6, 1.2, 9.6, mat(C.roof), x, 0.4 + h, -27); });
  for (let x = SX1 + 5; x < X1 - 2; x += 11) tree(B, x, -2.6, 7, 0.4);
  // indítóakna: falak (a tübbingsor kezdeténél nyílással), fenéklemez
  const SB = YA - R - 1, cM = mat(C.concrete);
  B.box(0.8, -SB, -ZB, cM, SX0 - 0.4, SB / 2, ZB / 2);
  box(B, cM, SX1, SX1 + 0.8, top, 0, ZB, 0); box(B, cM, SX1, SX1 + 0.8, SB, bot, ZB, 0); for (const [ya, yb, half] of steps) box(B, cM, SX1, SX1 + 0.8, ya, yb, ZB, -half);
  box(B, mat(C.concreteDark), SX0, SX1, SB, YA - R + 1.05, ZB + 0.6, 0); for (const z of [-0.75, -2.2]) box(B, mat(C.rail, { m: 0.5, r: 0.4 }), SX0, SX1 + 0.8, YA - R + 1.05, YA - R + 1.23, z - 0.06, z + 0.06);
  box(B, cM, SX0, SX1, SB, 0, ZB, ZB + 0.6); box(B, cM, SX0, SX1, SB - 0.8, SB, ZB, 0);
  // kész alagút (statikus): tübbinggyűrűk, talpbeton, sínek
  const ringGeo = (b, x) => { for (let s = 0; s < 6; s++) { const a0 = Math.PI + s * Math.PI / 6 + 0.02, a1 = a0 + Math.PI / 6 - 0.04;
      const g = new THREE.CylinderGeometry(R, R, 1.42, 6, 1, true, a0 - Math.PI / 2, a1 - a0); b.mesh(g, mat(s % 2 ? '#c8c3b8' : '#bdb7ab', { ds: true }), [x + 0.75, YA, 0], [0, 0, Math.PI / 2]); }
    box(b, mat(C.concreteDark), x, x + 1.5, YA - R + 0.15, YA - R + 1.05, -R * 0.62, 0);
    for (const z of [-0.75, -2.2]) box(b, mat(C.rail, { m: 0.5, r: 0.4 }), x, x + 1.5, YA - R + 1.05, YA - R + 1.23, z - 0.06, z + 0.06); };
  const RS = TXa - 10; const ring = new Batch('gyuru'); for (let x = SX1 + 0.8; x < RS - 0.01; x += 1.5) ringGeo(ring, x); ring.build(root);
  // a pajzs mögött sorra megjelenő gyűrűk
  for (let x = RS - ((RS - SX1 - 0.8) % 1.5), k = 0; x < TXb - 10 - 0.01; x += 1.5, k++) { if (x < RS - 0.01) continue; const n = node(root, 'gyuru', [x + 0.75, YA, 0]); const rb = new Batch('gy'); ringGeo(rb, -0.75); rb.build(n); n.children.forEach(c => c.position.y -= YA);
    const ta = tAt(x + 1.5 + 10); tracks.push(trackScale(n, [0, Math.max(0, ta - 0.3), ta, T - 0.01, T], [[0.001, 0.001, 0.001], [0.001, 0.001, 0.001], [1, 1, 1], [1, 1, 1], [0.001, 0.001, 0.001]])); n.scale.set(1, 1, 1); }
  // a TBM: pajzs, válaszfal, utánfutó kocsik, szállítószalag; a vágókerék forog
  const tbm = node(root, 'tbm', [TXb, 0, 0]); const tb = new Batch('tbm');
  tb.mesh(new THREE.CylinderGeometry(R + 0.08, R + 0.08, 10, 32, 1, true, Math.PI / 2, Math.PI), mat(SPEC.kozl, { r: 0.45, m: 0.25, ds: true }), [-5, YA, 0], [0, 0, Math.PI / 2]);
  for (const dx of [-9.6, -6, -2.4]) tb.mesh(new THREE.TorusGeometry(R - 0.05, 0.12, 6, 28, Math.PI), mat('#e0a92e', { m: 0.3 }), [dx, YA, 0], [-Math.PI / 2, Math.PI / 2, 0]);
  tb.mesh(new THREE.CylinderGeometry(R - 0.3, R - 0.3, 0.6, 24, 1, false, Math.PI / 2, Math.PI), mat(C.steelDark), [-9.5, YA, 0], [0, 0, Math.PI / 2]);
  tb.mesh(new THREE.CylinderGeometry(0.5, 0.5, 6, 12), mat('#d64a2f'), [-6, YA - 0.8, -1.2], [0, 0, Math.PI / 2]); // erektor
  for (let i = 0; i < 3; i++) { const x = -14 - i * 8.3; tb.boxB(7.4, 2.4, 3.0, mat(i % 2 ? '#f0c64a' : '#e3b23c'), x, YA - R + 1.3, -1.6); tb.boxB(7.0, 0.15, 3.2, mat(C.steelDark), x, YA - R + 3.7, -1.6);
    tb.boxB(1.2, 1.0, 1.2, mat('#2f6db5'), x + 2, YA - R + 3.85, -1.6); }
  tb.box(34, 0.35, 0.9, mat('#3a3f46'), -24, YA + 1.6, -2.3); // szállítószalag
  tb.build(tbm);
  const head = node(tbm, 'vagokerek', [0.05, YA, 0]); const hb = new Batch('kerek');
  hb.cyl(R + 0.15, R + 0.15, 0.5, mat('#d64a2f', { m: 0.3, r: 0.5 }), 0, 0, 0, [0, 0, Math.PI / 2], 32);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; hb.box(0.5, R * 2, 0.5, mat(C.steelDark), 0.35, 0, 0, [a, 0, 0]); }
  for (let i = 0; i < 18; i++) { const a = i * Math.PI / 9, rr = 0.8 + (i % 3) * 0.8; hb.mesh(new THREE.ConeGeometry(0.18, 0.4, 6), mat('#e8e2d6', { m: 0.5 }), [0.7, Math.sin(a) * rr, Math.cos(a) * rr], [0, 0, -Math.PI / 2]); }
  hb.build(head);
  tracks.push(trackPos(tbm, [0, TA, T - 0.01, T], [[TXa, 0, 0], [TXb, 0, 0], [TXb, 0, 0], [TXa, 0, 0]]), spinTrack(head, [1, 0, 0], 4, 6, T));
  // ellátó vonat: az aknából viszi a szegmenseket az utánfutóig, majd vissza
  const train = node(root, 'vonat'); const vb = new Batch('vonat'); const ty = YA - R + 1.25;
  vb.boxB(4.6, 2.2, 2.2, mat('#e0523f'), 2.3, 0, 0); vb.boxB(2.2, 0.9, 2.3, mat(C.glassDark), 1.6, 2.2, 0);
  { const x = -3.2; vb.boxB(5.4, 0.6, 2.2, mat(C.steelDark), x, 0, 0); for (let s = 0; s < 2; s++) for (let l = 0; l < 2; l++) vb.mesh(new THREE.CylinderGeometry(R, R, 1.3, 10, 1, true, 4 * Math.PI / 3, Math.PI / 3), mat('#c8c3b8', { ds: true }), [x - 1.3 + s * 2.6, 0.6 + R + l * 0.45, 0], [0, 0, Math.PI / 2]); }
  vb.build(train);
  const trX = (t) => TX(t) - 39.6, P0 = -44.5; // a vonat eleje az utánfutó végénél áll meg
  tracks.push(trackPos(train, [0, 1, 7, 9, 14, 20], [[P0, ty, -1.45], [P0, ty, -1.45], [trX(7), ty, -1.45], [trX(9), ty, -1.45], [P0, ty, -1.45], [P0, ty, -1.45]]));
  train.position.set(P0, ty, -1.45);
  // toronydaru az akna mellett: a horog szegmenst enged le
  const MX = X0 + 2, JY = 30, HX = (SX0 + SX1) / 2 + 1, HZ = -1.6;
  B.boxB(1.2, JY, 1.2, mat(C.yellow), MX, 0.4, HZ); B.box(30, 1.1, 1.1, mat(C.yellow), MX + 11, JY + 0.4, HZ); B.boxB(3, 2.6, 2.6, mat(C.yellow), MX + 0.5, JY - 4, HZ + 2.2);
  B.boxB(5, 1.6, 2, mat(C.concreteDark), MX - 4, JY - 0.4, HZ); B.boxB(1.6, 0.8, 1.6, mat(C.dark), HX, JY - 0.6, HZ);
  const hook = node(root, 'horog', [HX, 10, HZ]); const kb = new Batch('horog'); kb.boxB(0.6, 0.8, 0.6, mat(C.dark), 0, -0.8, 0); kb.build(hook);
  const seg = node(hook, 'szegmens', [0, 0, 0]); const sgb = new Batch('szeg'); sgb.mesh(new THREE.CylinderGeometry(R, R, 1.3, 10, 1, true, 4 * Math.PI / 3, Math.PI / 3), mat('#c8c3b8', { ds: true }), [0, 1.7, 0], [0, 0, Math.PI / 2]); sgb.build(seg);
  tracks.push(trackScale(seg, [0, 5.9, 6, 19.4, 19.5, 20], [[0.001, 0.001, 0.001], [0.001, 0.001, 0.001], [1, 1, 1], [1, 1, 1], [0.001, 0.001, 0.001], [0.001, 0.001, 0.001]]));
  const rope = node(root, 'kotel', [HX, JY - 0.6, HZ]); const ropeM = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 5), mat(C.dark)); ropeM.position.y = -0.5; rope.add(ropeM);
  const hy = [[0, -18], [1, -18], [5, 24], [14, 24], [19, -18], [20, -18]];
  tracks.push(trackPos(hook, hy.map(a => a[0]), hy.map(a => [HX, a[1], HZ])), trackScale(rope, hy.map(a => a[0]), hy.map(a => [1, JY - 0.6 - a[1] - 0.2, 1])));
  hook.position.set(HX, 24, HZ); rope.scale.set(1, JY - 0.6 - 24 - 0.2, 1);
  // forgalom az utcán
  const lanes = [[-9.5, 1], [-14.5, -1]]; const cc = ['#e0523f', '#2f6db5', '#f4c430', '#f4f3ef', '#3a3f46', '#7bb662'];
  let n = 0; for (const [z, d] of lanes) for (let j = 0; j < 4; j++) { const g = carGeom(cc[n % cc.length]); const nd = node(root, 'auto'); nd.add(g); if (d < 0) g.rotation.y = Math.PI;
    const xa = X0 + 2.5, xb = X1 - 2.5, ph = (j / 4 + (n % 2) * 0.11) % 1, xs = (t) => { const f = (t / T + ph) % 1; return d > 0 ? xa + (xb - xa) * f : xb - (xb - xa) * f; };
    const tw = (1 - ph) * T; const times = [0, tw - 0.001, tw, T].filter((v, i, a) => v >= 0 && v <= T && (i === 0 || v > a[i - 1]));
    const vals = times.map((t) => [t === tw ? (d > 0 ? xa : xb) : xs(Math.min(t, T - 1e-4)), 0.82, z]); nd.position.set(...vals[0]); tracks.push(trackPos(nd, times, vals)); n++; }
  B.build(root);
  const clips = [new THREE.AnimationClip('furas', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Vágókerék' : 'Cutterhead', [TXb + 0.3, YA + 2, 0.3], [TXb + 6, YA + 13, 4], '#d64a2f', K);
    label(G, hu ? 'Pajzs' : 'Shield', [TXb - 5, YA + R, 0], [TXb - 4, YA + 19, 4], SPEC.kozl, K);
    label(G, hu ? 'Tübbinggyűrűk' : 'Segmental lining', [-20, YA + R - 0.5, -0.3], [-24, YA + 12, 4], '#c8c3b8', K);
    label(G, hu ? 'Utánfutó szerelvény' : 'Backup gantry', [TXb - 22, YA - 1, -1], [TXb - 26, YA - 11, 4], '#f0c64a', K);
    label(G, hu ? 'Indítóakna' : 'Launch shaft', [SX0 + 4, -12, -1], [SX0 + 1, -5, 4], C.concrete, K);
    label(G, hu ? 'Fent zavartalan a forgalom' : 'Traffic flows on above', [20, 1, -12], [24, 18, -6], C.asphalt, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [24, 16], posterT: 9, labelT: T - 1 };
}
