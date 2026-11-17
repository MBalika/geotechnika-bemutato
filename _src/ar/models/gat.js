// Völgyzáró gát vízerőművel (Vízmérnöki) – metszet a gát tengelyére merőlegesen, a nyomócső síkjában: a tározó, a gravitációs gát
// háromszög-szelvénye, benne a nyomócső, lent az erőműházban forgó turbina és generátor. Az árapasztó zsilip kinyílik, a víz lezúdul;
// az áram fénypontokként fut a távvezetéken a város felé, a gátkoronán autó halad.
import { THREE, Batch, mat, C, SPEC, tree, carGeom, label, node, trackPos, trackScale, spinTrack } from '../lib/common.js';
export const FILE = 'gat-vizeromu';
const K = 1 / 600;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'gat';
  const B = new Batch('volgy'); const tracks = [], T = 18;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const X0 = -130, X1 = 130, ZB = -70, WL = 42, CR = 48;
  // kőzet és völgy: a völgyfenék y = 0; hátul (z < −45) a hegyoldal emelkedik
  const rock = mat('#8c857c'), rock2 = mat('#a39a8d');
  box(B, rock, X0, X1, -30, -6, ZB, 0); box(B, rock2, X0, X1, -6, 0, ZB, 0);
  const hill = new THREE.Shape(); hill.moveTo(0, 0); hill.lineTo(28, 0); hill.lineTo(28, 56); hill.lineTo(18, 52); hill.lineTo(8, 30); hill.lineTo(0, 5); hill.closePath();
  const HP = [[0, 5], [8, 30], [18, 52], [28, 56]], hillY = (z) => { const u = -42 - z; for (let i = 1; i < HP.length; i++) if (u <= HP[i][0]) return HP[i - 1][1] + (HP[i][1] - HP[i - 1][1]) * (u - HP[i - 1][0]) / (HP[i][0] - HP[i - 1][0]); return 56; }; // a hegyoldal szelvénye z mentén
  { const g = new THREE.ExtrudeGeometry(hill, { depth: X1 - X0, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(X0, 0, -42); B.add(g, mat('#7f9a5c')); }
  // gravitációs gát: függőleges vízoldali fal x = −10-ben, a lég oldali rézsű a lábig (x = 38)
  const dam = new THREE.Shape(); dam.moveTo(-10, 0); dam.lineTo(-10, CR); dam.lineTo(-1, CR); dam.lineTo(-1, WL - 1); dam.lineTo(38, 0); dam.closePath();
  { const g = new THREE.ExtrudeGeometry(dam, { depth: -ZB, bevelEnabled: false }); g.translate(0, 0, ZB); B.add(g, mat('#d9d6cf')); }
  box(B, mat(C.asphalt), -10, -1, CR, CR + 0.3, ZB, 0); for (let z = ZB + 2; z < 0; z += 3) { box(B, mat('#c9c4b8'), -10.2, -9.6, CR, CR + 1.2, z - 0.3, z + 0.3); box(B, mat('#c9c4b8'), -1.6, -1, CR, CR + 1.2, z - 0.3, z + 0.3); }
  // tározó és alvíz
  const water = mat(C.water, { op: 0.8, r: 0.2 }); box(B, water, X0, -10, 0, WL, ZB, 0); box(B, water, 38, X1, 0, 5, -42, 0);
  // árapasztó: a gát hátsó részén egy csatorna a rézsűn; fent zsilip
  const SZ0 = -40, SZ1 = -28; box(B, mat(C.concreteDark), -1, 40, -0.5, 0, SZ0 - 1.2, SZ1 + 1.2);
  const chute = new THREE.Shape(); chute.moveTo(-1, WL - 1); chute.lineTo(38, 0); chute.lineTo(38, 2.2); chute.lineTo(-1, WL + 1.2); chute.closePath();
  for (const z of [SZ0 - 1.2, SZ1]) { const g = new THREE.ExtrudeGeometry(chute, { depth: 1.2, bevelEnabled: false }); g.translate(0, 0, z); B.add(g, mat('#c9c4b8')); }
  box(B, mat(C.concreteDark), -10, -1, CR, CR + 4, SZ0 - 1.2, SZ0); box(B, mat(C.concreteDark), -10, -1, CR, CR + 4, SZ1, SZ1 + 1.2); box(B, mat(C.concreteDark), -10, -1, CR + 4, CR + 5, SZ0 - 1.2, SZ1 + 1.2); // zsiliptorony
  // erőműház a gát lábánál (metszetben nyitott): turbina-akna, generátorterem
  box(B, mat(C.concrete), 38, 66, -4, 0, -30, 0); box(B, mat('#e9e6df'), 38, 66, 0, 22, -30, -28.8); box(B, mat('#e9e6df'), 64.8, 66, 0, 22, -30, 0); box(B, mat(C.roof), 38, 66.5, 22, 23.2, -30.5, 0.4);
  box(B, mat(C.concrete), 38, 64.8, 7, 7.8, -28.8, 0); // gépházpadló
  for (let x = 41; x < 64; x += 5) box(B, mat(C.glass, { r: 0.3 }), x, x + 3, 11, 19, -29.2, -28.8);
  B.cyl(6, 6, 2.5, mat('#4f8dff', { m: 0.3, r: 0.5 }), 50, 2.6, -10, [0, 0, 0], 28); // csigaház (spirálház)
  B.cyl(4.2, 4.2, 6.5, mat('#c8553d', { m: 0.3, r: 0.45 }), 50, 11.1, -10, [0, 0, 0], 24); B.cyl(4.6, 4.6, 0.8, mat(C.steelDark), 50, 14.6, -10, [0, 0, 0], 24); // generátor
  box(B, mat(C.yellow), 39, 64.5, 19.5, 20.5, -29, -27.5); box(B, mat(C.yellow), 46, 54, 18.3, 19.5, -29, -26); // daru a gépteremben
  // nyomócső: a vízoldali beömlőtől (x = −10, y = 34) a gáton át a turbináig – a metszet síkjában félig látszik
  const yF = (x) => (WL - 1) * (38 - x) / 39; // a lég oldali rézsű
  const pen = [[-12, 30, -10], [-4, 30, -10], [16.9, yF(15) + 1.4, -10], [37.9, yF(36) + 1.4, -10], [44, 2.6, -10]]; // a gátban, majd a lég oldali rézsűn
  for (let i = 0; i < pen.length - 1; i++) B.rod(pen[i], pen[i + 1], 2.4, mat('#5d6670', { m: 0.4, r: 0.5, ds: true }), 16);
  box(B, mat(C.steelDark), -12, -10, 26, 34, -14, -6); // beömlő rács
  // távvezeték oszlopok a hegyre, a város felé
  const towers = [[70, 0, -36], [92, hillY(-52), -52], [112, hillY(-60), -60]]; const tw = mat(C.steelDark);
  for (const [x, y0, z] of towers) { for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) B.rod([x + sx * 2.2, y0, z + sz * 2.2], [x + sx * 0.6, y0 + 22, z + sz * 0.6], 0.25, tw, 4); B.box(9, 0.5, 0.5, tw, x, y0 + 20, z); B.box(6, 0.5, 0.5, tw, x, y0 + 16, z); }
  const line = [[64, 20, -24], [70, 20, -36], [92, hillY(-52) + 20, -52], [112, hillY(-60) + 20, -60], [122, hillY(-64) + 4, -64]];
  for (let i = 0; i < line.length - 1; i++) for (const dx of [-4, 4]) B.rod([line[i][0] + dx, line[i][1], line[i][2]], [line[i + 1][0] + dx, line[i + 1][1], line[i + 1][2]], 0.12, mat(C.dark), 4);
  for (const [x, z, c] of [[120, -66, C.white], [126, -61, '#f2d7b6'], [116, -63, '#cfe3ef'], [126, -68, '#f2e3a8']]) { B.boxB(5, 4, 4, mat(c), x, hillY(z), z); B.mesh(new THREE.ConeGeometry(3.6, 2.4, 4), mat('#b5533c'), [x, hillY(z) + 5.2, z], [0, Math.PI / 4, 0]); }
  for (let i = 0; i < 26; i++) { const x = X0 + 8 + ((i * 37) % (X1 - X0 - 16)), z = -46 - ((i * 13) % 22); if (x > 80 || (x < -9 && hillY(z) < WL + 1.5) || (x > -12 && x < 40)) continue; tree(B, x, z, 7 + (i % 3) * 2, hillY(z)); }
  B.build(root);
  // ---- animációk ----
  // árapasztó zsilip: felemelkedik, a víz lezúdul a csatornán
  const gate = node(root, 'zsilip', [-5.5, 0, (SZ0 + SZ1) / 2]); const gb = new Batch('zsilip'); box(gb, mat('#4f8dff', { m: 0.3 }), -0.6, 0.6, WL - 1, CR + 0.2, -(SZ1 - SZ0) / 2, (SZ1 - SZ0) / 2); gb.build(gate);
  const tO = 1.5, tC = 13.5; tracks.push(trackPos(gate, [0, tO, tO + 1.5, tC, tC + 1.5, T], [[-5.5, 0, (SZ0 + SZ1) / 2], [-5.5, 0, (SZ0 + SZ1) / 2], [-5.5, 6, (SZ0 + SZ1) / 2], [-5.5, 6, (SZ0 + SZ1) / 2], [-5.5, 0, (SZ0 + SZ1) / 2], [-5.5, 0, (SZ0 + SZ1) / 2]]));
  const chuteP = [[-6, WL + 0.6], [-1, WL + 0.2], [38, 1.0], [70, 0.8]]; const cl = []; for (let i = 1; i < chuteP.length; i++) cl.push(Math.hypot(chuteP[i][0] - chuteP[i - 1][0], chuteP[i][1] - chuteP[i - 1][1])); const CL = cl.reduce((a, b) => a + b, 0);
  const onChute = (s) => { let i = 0; while (i < cl.length - 1 && s > cl[i]) { s -= cl[i]; i++; } const f = Math.min(1, s / cl[i]); return [chuteP[i][0] + (chuteP[i + 1][0] - chuteP[i][0]) * f, chuteP[i][1] + (chuteP[i + 1][1] - chuteP[i][1]) * f]; };
  const foam = mat('#e8f4ff', { op: 0.85, em: '#bfe3ff', ei: 0.3 });
  for (let k = 0; k < 26; k++) { const z = SZ0 + 1 + ((k * 7) % 11), ph = k / 26, per = 1.8; const n = node(root, 'zuhatag'); const m = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 3), foam); m.name = 'hab'; n.add(m);
    const ts = [], ps = [], ss = []; for (let i = 0; i <= T * 10; i++) { const t = i / 10, f = ((t / per) + ph) % 1; const [x, y] = onChute(f * CL); ts.push(t); ps.push([x, y + 0.6, z]); const on = t > tO + 1.0 && t < tC + 0.8; ss.push(on ? S1 : S0); }
    tracks.push(trackPos(n, ts, ps), trackScale(n, ts, ss)); n.scale.set(...S0); }
  // víz a nyomócsőben (fénylő csíkok) és a forgó járókerék
  const pl = []; for (let i = 1; i < pen.length; i++) pl.push(Math.hypot(...pen[i].map((v, j) => v - pen[i - 1][j]))); const PL = pl.reduce((a, b) => a + b, 0);
  const onPen = (s) => { let i = 0; while (i < pl.length - 1 && s > pl[i]) { s -= pl[i]; i++; } const f = Math.min(1, s / pl[i]); return pen[i].map((v, j) => v + (pen[i + 1][j] - v) * f); };
  for (let k = 0; k < 8; k++) { const n = node(root, 'csovi'); const m = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8), mat('#7fd0ff', { em: '#4fb8ff', ei: 0.8 })); m.name = 'viz'; n.add(m); const per = 2.4, ph = k / 8;
    const ts = [], ps = []; for (let i = 0; i <= T * 10; i++) { const t = i / 10; ts.push(t); ps.push(onPen((((t / per) + ph) % 1) * PL)); } tracks.push(trackPos(n, ts, ps)); }
  const runner = node(root, 'jarokerek', [50, 3.9, -10]); const rb = new Batch('jarokerek'); for (let i = 0; i < 6; i++) rb.box(5, 0.6, 1.0, mat(C.yellow), 0, 0, 0, [0, i * Math.PI / 3, 0.35]); rb.cyl(1.2, 1.2, 1.2, mat(C.steelDark), 0, 0, 0, [0, 0, 0], 12); rb.build(runner); tracks.push(spinTrack(runner, [0, 1, 0], 1.2, 6, T));
  const gen = node(root, 'tengely', [50, 8, -10]); const gnb = new Batch('tengely'); gnb.cyl(0.6, 0.6, 7, mat(C.steel, { m: 0.6 }), 0, 0, 0, [0, 0, 0], 10); gnb.box(0.3, 7, 1.6, mat('#ffd23f'), 0.6, 0, 0); gnb.build(gen); tracks.push(spinTrack(gen, [0, 1, 0], 1.2, 6, T));
  // áram a vezetéken: fénypontok a város felé
  const ll = []; for (let i = 1; i < line.length; i++) ll.push(Math.hypot(...line[i].map((v, j) => v - line[i - 1][j]))); const LL = ll.reduce((a, b) => a + b, 0);
  const onLine = (s) => { let i = 0; while (i < ll.length - 1 && s > ll[i]) { s -= ll[i]; i++; } const f = Math.min(1, s / ll[i]); return line[i].map((v, j) => v + (line[i + 1][j] - v) * f); };
  for (let k = 0; k < 10; k++) for (const dx of [-4, 4]) { const n = node(root, 'aram'); const m = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), mat('#ffe066', { em: '#ffd23f', ei: 1.2 })); m.name = 'fenypont'; n.add(m); const per = 3, ph = k / 10 + (dx > 0 ? 0.05 : 0);
    const ts = [], ps = []; for (let i = 0; i <= T * 10; i++) { const t = i / 10; ts.push(t); const p = onLine((((t / per) + ph) % 1) * LL); ps.push([p[0] + dx, p[1] - 0.4, p[2]]); } tracks.push(trackPos(n, ts, ps)); }
  // csónak a tározón, autó a gátkoronán
  const boat = node(root, 'csonak'); const bb = new Batch('csonak'); bb.boxB(9, 1.6, 3.2, mat(C.white), 0, -0.6, 0); bb.boxB(3.5, 1.6, 2.6, mat('#2f6db5'), -1.2, 1, 0); bb.build(boat);
  tracks.push(trackPos(boat, [0, T / 2, T], [[-110, WL, -30], [-40, WL, -18], [-110, WL, -30]])); boat.position.set(-110, WL, -30);
  const car = node(root, 'auto'); const cg = carGeom('#e0523f'); cg.rotation.y = Math.PI / 2; car.add(cg); tracks.push(trackPos(car, [0, T - 0.01, T], [[-5.5, CR + 0.3, 2], [-5.5, CR + 0.3, ZB - 2], [-5.5, CR + 0.3, 2]])); car.position.set(-5.5, CR + 0.3, 2);
  const clips = [new THREE.AnimationClip('vizeromu', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Tározó: 42 m mély víz' : 'Reservoir: 42 m deep', [-60, 24, 0.2], [-80, 62, 10], C.water, K);
    label(G, hu ? 'Gravitációs gát' : 'Gravity dam', [6, 20, 0.2], [-8, 80, 10], '#d9d6cf', K);
    label(G, hu ? 'Nyomócső' : 'Penstock', [27, yF(27) + 2, -10], [46, 52, 10], '#5d6670', K);
    label(G, hu ? 'Turbina és generátor' : 'Turbine and generator', [50, 12, -6], [76, 26, 14], '#c8553d', K);
    label(G, hu ? 'Árapasztó' : 'Spillway', [20, yF(20) + 1, SZ1], [36, 76, -26], '#4f8dff', K);
    label(G, hu ? 'Áram a városnak' : 'Power for the town', [112, hillY(-60) + 20, -60], [118, hillY(-60) + 40, -50], '#ffd23f', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [26, 22], posterT: 6, labelT: 6 };
}
