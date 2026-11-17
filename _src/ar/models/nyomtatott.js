// 3D-nyomtatott betonház (Építéstechnológia és építményinformációs menedzsment) – portálos nyomtató rétegenként „nyomtatja” a falat;
// a fej a fal vonalát követi, a fal sávonként nő. A végén a portál félreáll, rákerül a födém, megjelennek a nyílászárók és a napelemek.
import { THREE, Batch, mat, C, SPEC, tree, label, node, trackPos, trackScale, person } from '../lib/common.js';
export const FILE = 'nyomtatott-haz';
const K = 1 / 50;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'nyomtatott';
  const B = new Batch('haz'); const tracks = [], T = 24;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const show = (n, t0, t1, from = S0) => { tracks.push(trackScale(n, [0, t0, t1, T - 0.01, T], [from, from, S1, S1, from])); };
  // terep: talajtömb, gyep, alaplemez
  const X0 = -11, X1 = 11, Z0 = -9, Z1 = 9, FY = 0.3; // a lemez teteje
  for (const [ya, yb, col] of [[-3, -1.2, C.clay], [-1.2, -0.3, C.sand], [-0.3, 0, C.fill]]) box(B, mat(col), X0, X1, ya, yb, Z0, Z1);
  box(B, mat(C.grass), X0, X1, 0, 0.12, Z0, Z1);
  box(B, mat(C.concreteDark), -5.6, 5.6, 0, FY, -4.1, 4.1);
  // a ház fala: 10 × 7 m, 30 cm vastag, 12 sáv × 25 cm = 3 m; sávonként négy oldal, az oldal a fej haladásával nő
  const HW = 5, HD = 3.5, TW = 0.3, NC = 12, CH = 0.25, TP = 1.05, tS = 0.5;
  const x0 = -HW + TW / 2, x1 = HW - TW / 2, z0 = -HD + TW / 2, z1 = HD - TW / 2;
  const L = [2 * HW - TW, 2 * HD - TW, 2 * HW - TW, 2 * HD - TW], Ls = L.reduce((a, b) => a + b, 0);
  const wallM = [mat('#cfc9bd'), mat('#bdb6a9')];
  const carX = [], brZ = [], headY = [];
  for (let c = 0; c < NC; c++) { const y0 = FY + c * CH, t0 = tS + c * TP; let tc = t0; const m = wallM[c % 2];
    // oldalak: 0: hátsó fal (+x irányba), 1: jobb fal (+z), 2: első fal (−x), 3: bal fal (−z)
    const sides = [
      { p: [-HW, y0, -HD], ax: 'x', g: [0, 2 * HW - TW, 0, CH, 0, TW] },
      { p: [HW, y0, -HD], ax: 'z', g: [-TW, 0, 0, CH, 0, 2 * HD - TW] },
      { p: [HW, y0, HD], ax: 'x', g: [-(2 * HW - TW), 0, 0, CH, -TW, 0] },
      { p: [-HW, y0, HD], ax: 'z', g: [0, TW, 0, CH, -(2 * HD - TW), 0] },
    ];
    const corner = [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]];
    carX.push([t0, corner[0][0]]); brZ.push([t0, corner[0][1]]); headY.push([t0, y0 + CH]);
    sides.forEach((sd, k) => { const n = node(root, 'reteg', sd.p); const b = new Batch('r'); const [xa, xb, ya, yb, za, zb] = sd.g; box(b, m, xa, xb, ya, yb, za, zb); b.build(n);
      const dt = TP * L[k] / Ls, from = sd.ax === 'x' ? [0.001, 1, 1] : [1, 1, 0.001];
      tracks.push(trackScale(n, [0, tc, tc + dt, T - 0.01, T], [S0, from, S1, S1, S0])); tc += dt;
      carX.push([tc, corner[k + 1][0]]); brZ.push([tc, corner[k + 1][1]]); headY.push([tc, y0 + CH]); }); }
  const tP = tS + NC * TP; // a nyomtatás vége
  // portálos nyomtató: sínek z irányban, a híd (két toronnyal) z-ben, a kocsi x-ben, a fej y-ban mozog
  const GX = HW + 2.2, GH = 4.6, steel = mat('#2f6db5', { m: 0.3, r: 0.5 }), acc = mat(SPEC.eti);
  for (const s of [-1, 1]) { box(B, mat(C.steelDark), s * GX - 0.25, s * GX + 0.25, 0.12, 0.32, Z0 + 1, Z1 - 1); for (let z = Z0 + 1.5; z < Z1 - 1; z += 1.5) box(B, mat(C.wood), s * GX - 0.45, s * GX + 0.45, 0.12, 0.2, z - 0.15, z + 0.15); }
  const bridge = node(root, 'portal', [0, 0, z1]); const bb = new Batch('portal');
  for (const s of [-1, 1]) { box(bb, steel, s * GX - 0.22, s * GX + 0.22, 0.3, GH, -0.22, 0.22); box(bb, mat(C.steelDark), s * GX - 0.4, s * GX + 0.4, 0.3, 0.7, -0.6, 0.6); box(bb, acc, s * GX - 0.3, s * GX + 0.3, GH - 0.8, GH - 0.2, -0.3, 0.3); }
  box(bb, steel, -GX - 0.3, GX + 0.3, GH, GH + 0.5, -0.3, 0.3); box(bb, acc, -GX - 0.3, GX + 0.3, GH + 0.5, GH + 0.6, -0.3, 0.3); bb.build(bridge);
  const car = node(bridge, 'kocsi', [x0, 0, 0]); const cb = new Batch('kocsi'); box(cb, acc, -0.45, 0.45, GH - 0.2, GH + 0.8, -0.45, 0.45); box(cb, mat(C.dark), -0.12, 0.12, GH + 0.8, GH + 1.6, -0.12, 0.12); cb.build(car); // a tömlő felfelé
  const head = node(car, 'fej', [0, FY + CH, 0]); const hb = new Batch('fej');
  box(hb, mat(C.steel, { m: 0.5, r: 0.35 }), -0.11, 0.11, 0.25, GH - 0.2 - (FY + CH), -0.11, 0.11); // a fej szára a kocsiig (a sáv tetején a fúvóka)
  hb.mesh(new THREE.CylinderGeometry(0.22, 0.08, 0.3, 12), mat('#ff7a1a'), [0, 0.13, 0]); hb.build(head);
  // a fej szára változó hosszú lenne: helyette a kocsi alatt teleszkópos cső, a fejjel együtt mozog (egyszerűsítés: hosszú szár a kocsiba csúszik)
  const tEnd = (a) => a[a.length - 1][0];
  carX.push([tP + 0.6, 0]); brZ.push([tP + 2.2, Z0 + 1.4]); headY.push([tP + 0.6, FY + NC * CH + 1.2]);
  tracks.push(trackPos(car, carX.map(a => a[0]).concat([T - 0.01, T]), carX.map(a => [a[1], 0, 0]).concat([[0, 0, 0], [x0, 0, 0]])));
  tracks.push(trackPos(bridge, brZ.map(a => a[0]).concat([T - 0.01, T]), brZ.map(a => [0, 0, a[1]]).concat([[0, 0, Z0 + 1.4], [0, 0, z0]])));
  tracks.push(trackPos(head, headY.map(a => a[0]).concat([T - 0.01, T]), headY.map(a => [0, a[1], 0]).concat([[0, FY + NC * CH + 1.2, 0], [0, FY + CH, 0]])));
  car.position.set(0, 0, 0); bridge.position.set(0, 0, Z0 + 1.4); head.position.set(0, FY + NC * CH + 1.2, 0);
  // födém (leereszkedik), nyílászárók és napelemek (megjelennek)
  const WT = FY + NC * CH; const roof = node(root, 'fodem', [0, WT, 0]); const rb = new Batch('fodem');
  box(rb, mat(C.concrete), -HW - 0.3, HW + 0.3, 0, 0.3, -HD - 0.3, HD + 0.3); box(rb, mat('#e9e6df'), -HW - 0.3, HW + 0.3, 0.3, 0.55, -HD - 0.3, -HD); box(rb, mat('#e9e6df'), -HW - 0.3, HW + 0.3, 0.3, 0.55, HD, HD + 0.3);
  rb.build(roof); const tR = tP + 2.4; tracks.push(trackPos(roof, [0, tR, tR + 1.6, T - 0.01, T], [[0, WT + 6, 0], [0, WT + 6, 0], [0, WT, 0], [0, WT, 0], [0, WT + 6, 0]])); show(roof, tR - 0.01, tR);
  const win = node(root, 'nyilaszaro'); const wb = new Batch('ablak'); const gl = mat(C.glassDark, { r: 0.2, m: 0.1 }), fr = mat('#3a3f46');
  box(wb, fr, -0.6, 0.6, FY, FY + 2.2, HD - 0.02, HD + 0.06); box(wb, mat('#8a5a3a'), -0.5, 0.5, FY, FY + 2.1, HD + 0.03, HD + 0.08); // ajtó
  for (const x of [-3, 3]) { box(wb, fr, x - 0.85, x + 0.85, FY + 0.9, FY + 2.3, HD - 0.02, HD + 0.06); box(wb, gl, x - 0.75, x + 0.75, FY + 1.0, FY + 2.2, HD + 0.03, HD + 0.08); }
  for (const z of [-1.4, 1.4]) { box(wb, fr, HW - 0.02, HW + 0.06, FY + 0.9, FY + 2.3, z - 0.7, z + 0.7); box(wb, gl, HW + 0.03, HW + 0.08, FY + 1.0, FY + 2.2, z - 0.6, z + 0.6); }
  wb.build(win); show(win, tR + 1.7, tR + 2.3);
  const pv = node(root, 'napelem', [0, WT + 0.3, 0]); const pb = new Batch('pv'); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) pb.mesh(new THREE.BoxGeometry(1.6, 0.06, 1.0), mat('#1d3557', { m: 0.4, r: 0.25 }), [-2.7 + i * 1.8, 0.45, -1.4 + j * 1.3], [-0.25, 0, 0]);
  pb.build(pv); show(pv, tR + 2.4, tR + 3.0);
  // keverő és szivattyú, tömlő; kezelő tablettel; fák
  box(B, mat('#e9ecef'), -9.6, -7.4, 0.12, 2.0, -6.2, -3.8); B.cyl(0.9, 0.9, 3.4, mat('#e9ecef'), -8.5, 3.7, -5, [0, 0, 0], 16); B.cyl(0.9, 0.2, 1.0, mat('#e9ecef'), -8.5, 1.5, -5, [0, Math.PI, 0], 16);
  box(B, acc, -9.62, -7.38, 1.6, 2.0, -6.22, -3.78);
  B.rod([-7.4, 1.2, -4.6], [-GX, 1.0, -4.6], 0.1, mat(C.dark)); B.rod([-GX, 1.0, -4.6], [-GX, 0.4, Z1 - 2], 0.1, mat(C.dark));
  person(B, -7.8, 3.8, 2.4, { tablet: true, y: 0.12 }); person(B, 8.6, -6.2, -0.6, { y: 0.12, vest: '#c6f432' });
  for (const [x, z] of [[-9.5, 7.5], [9.6, 7.2], [9.8, -1], [-10, 1.5]]) tree(B, x, z, 4.5, 0.12);
  B.build(root);
  const clips = [new THREE.AnimationClip('nyomtatas', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Portálos 3D-nyomtató' : 'Gantry 3D printer', [GX, GH + 0.5, Z0 + 1.4], [GX + 2, GH + 3.2, Z0 + 3], SPEC.eti, K);
    label(G, hu ? 'Rétegenként nyomtatott betonfal' : 'Concrete wall, printed layer by layer', [-HW, 1.6, HD], [-HW - 1.5, 0.4, HD + 6.5], '#bdb6a9', K);
    label(G, hu ? 'Betonkeverő és szivattyú' : 'Mixer and pump', [-8.5, 5.2, -5], [-10.5, 7.6, -3], C.white, K);
    label(G, hu ? 'Kezelő' : 'Operator', [-7.8, 1.9, 3.8], [-11, 5.8, 6], '#ff7a1a', K);
    label(G, hu ? 'Napelemek a födémen' : 'Solar panels on the roof', [1.0, WT + 0.9, 0], [2.5, WT + 3.2, 3.5], '#1d3557', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [30, 30], posterT: 9, labelT: T - 1 };
}
