// Nagysebességű vasút (Közlekedési létesítmények) – kétvágányú pálya völgyhídon egy folyó fölött, két végén alagútkapu a dombban;
// a szerelvények 300 km/h-val suhannak át (előbb az egyik, majd a másik irányban), felsővezetékkel; a híd alatt út és folyó.
import { THREE, Batch, mat, C, SPEC, tree, carGeom, label, node, trackPos, trackScale } from '../lib/common.js';
export const FILE = 'nagysebessegu-vasut';
const K = 1 / 500;
const S0 = [0.001, 0.001, 0.001], S1 = [1, 1, 1];

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'vasut';
  const B = new Batch('taj'); const tracks = [], T = 14;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  const X0 = -110, X1 = 110, Z0 = -46, Z1 = 30, RL = 16; // a sínkorona szintje
  // völgy: a völgyfenék y = 0, a két szélén domb (|x| > 70), benne alagút
  for (const [ya, yb, col] of [[-14, -6, C.clay], [-6, 0, C.fill]]) box(B, mat(col), X0, X1, ya, yb, Z0, Z1);
  box(B, mat(C.grass), X0, X1, 0, 0.3, Z0, Z1);
  const hillS = new THREE.Shape(); hillS.moveTo(0, 0); hillS.lineTo(42, 0); hillS.lineTo(42, 34); hillS.lineTo(22, 33); hillS.lineTo(8, 22); hillS.lineTo(0, 4); hillS.closePath();
  for (const s of [-1, 1]) { const g = new THREE.ExtrudeGeometry(hillS, { depth: Z1 - Z0, bevelEnabled: false }); g.translate(0, 0, Z0); if (s < 0) { g.scale(-1, 1, 1); g.translate(-68, 0, 0); g.index && g.setIndex(Array.from(g.index.array).reverse()); } else g.translate(68, 0, 0); g.computeVertexNormals(); B.add(g, mat('#86a85f', { ds: true })); }
  box(B, mat(C.water, { r: 0.2 }), -14, 14, 0.05, 0.6, Z0, Z1); box(B, mat(C.sand), -18, -14, 0.05, 0.4, Z0, Z1); box(B, mat(C.sand), 14, 18, 0.05, 0.4, Z0, Z1);
  box(B, mat(C.asphalt), 30, 38, 0.3, 0.55, Z0, Z1); // út a híd alatt
  // völgyhíd: szekrénytartó, pillérek, két vágány aljakkal, felsővezeték
  const TZ = [-14, -7]; const DW = 14, DC = -10.5;
  box(B, mat(C.concrete), -76, 76, RL - 3.2, RL - 0.8, DC - DW / 2, DC + DW / 2);
  for (const s of [-1, 1]) box(B, mat('#c9c4b8'), -76, 76, RL - 0.8, RL + 0.6, DC + s * (DW / 2 - 0.3) - 0.3, DC + s * (DW / 2 - 0.3) + 0.3);
  for (let x = -52; x <= 52; x += 26) { B.boxB(4, RL - 3.2, 7, mat(C.concreteDark), x, 0.3, DC); B.boxB(7, 1.4, 9, mat(C.concreteDark), x, RL - 4.6, DC); }
  for (const z of TZ) { box(B, mat('#8f8a82'), -110, 110, RL - 0.8, RL - 0.3, z - 1.9, z + 1.9); // betonlemez
    for (let x = X0 + 1; x < X1; x += 1.6) box(B, mat('#b9b5ad'), x - 0.15, x + 0.15, RL - 0.3, RL - 0.1, z - 1.3, z + 1.3);
    for (const dz of [-0.72, 0.72]) box(B, mat(C.rail, { m: 0.6, r: 0.35 }), X0, X1, RL - 0.1, RL + 0.08, z + dz - 0.04, z + dz + 0.04); }
  for (let x = -66; x <= 66; x += 22) { B.boxB(0.5, 8.5, 0.5, mat(C.steelDark), x, RL - 0.8, DC + DW / 2 - 0.4); B.box(0.25, 0.25, 9.5, mat(C.steelDark), x, RL + 7.4, DC + DW / 2 - 4.8);
    for (const z of TZ) B.rod([x, RL + 7.4, z], [x, RL + 6.0, z], 0.06, mat(C.dark), 4); }
  for (const z of TZ) B.box(X1 - X0, 0.08, 0.08, mat(C.dark), 0, RL + 6.0, z);
  // alagútkapuk a két dombban
  for (const s of [-1, 1]) { const x = s * 72; B.boxB(3, 12, 20, mat('#cfcac0'), x, RL - 3, DC); B.boxB(3.4, 2, 21, mat('#b9b5ad'), x, RL + 9, DC);
    for (const z of TZ) B.boxB(3.2, 8, 4.6, mat('#1b1f24'), x + s * 0.1, RL - 0.8, z); }
  // fák, házak
  let seed = 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) { const x = -64 + rnd() * 128, z = Z0 + 3 + rnd() * (Z1 - Z0 - 6); if (Math.abs(x) < 20 || (z > -20 && z < -1) || Math.abs(x - 34) < 7) continue; tree(B, x, z, 6 + rnd() * 4, 0.3); }
  for (const [x, z, c] of [[48, 16, '#f2d7b6'], [56, 22, '#f4f3ef'], [-50, 18, '#cfe3ef'], [-44, 24, '#f2e3a8']]) { B.boxB(8, 6, 7, mat(c), x, 0.3, z); B.mesh(new THREE.ConeGeometry(6.2, 3.4, 4), mat('#b5533c'), [x, 8, z], [0, Math.PI / 4, 0]); }
  B.build(root);
  // ---- a szerelvény: 4 kocsi, áramvonalas orr mindkét végén; kocsinként külön csomópont (az alagútban tűnnek fel / el) ----
  const L = 25, NC = 4, W = 3.0, H = 3.9, GAP = 0.6, NOSE = 7;
  const carT = (i, col) => { const tb = new Batch('kocsi'); // x: −L … 0 (0 a kocsi eleje)
    tb.box(L, H - 0.6, W, mat('#f4f3ef', { r: 0.35, m: 0.1 }), -L / 2, 0.6 + (H - 0.6) / 2, 0); tb.box(L, 0.5, W + 0.02, mat(col), -L / 2, 1.4, 0); tb.box(L - 3, 0.8, W + 0.03, mat(C.glassDark, { r: 0.2 }), -L / 2, 2.6, 0);
    for (const dx of [3.5, L - 3.5]) tb.box(2.8, 0.7, W - 0.4, mat(C.dark), -dx, 0.45, 0);
    const nose = (x0, s) => { const g = new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2); g.rotateZ(-s * Math.PI / 2); tb.mesh(g, mat('#f4f3ef', { r: 0.35, m: 0.1 }), [x0, 2.0, 0], [0, 0, 0], [NOSE, 1.9, W / 2]);
      const g2 = new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2); g2.rotateZ(-s * Math.PI / 2); tb.mesh(g2, mat(col), [x0, 1.4, 0], [0, 0, 0], [NOSE - 1, 0.5, W / 2 + 0.01]); };
    if (i === 0) nose(0, 1); if (i === NC - 1) nose(-L, -1);
    if (i === 1) { tb.box(1.6, 0.25, 0.25, mat(C.dark), -L / 2, H + 0.6, 0); tb.rod([-L / 2 - 0.8, H + 0.6, 0], [-L / 2, 6.0, 0], 0.06, mat(C.dark), 4); tb.box(0.25, 0.08, 1.8, mat(C.dark), -L / 2, 6.0, 0); } // áramszedő
    const g = new THREE.Group(); tb.build(g); return g; };
  const v = 83; // m/s ≈ 300 km/h
  const run = (z, dir, t0, col) => { const xs = dir > 0 ? -72 : 72, xe = -xs;
    for (let i = 0; i < NC; i++) { const n = node(root, 'kocsi'); const g = carT(i, col); if (dir < 0) g.rotation.y = Math.PI; n.add(g);
      const off = i * (L + GAP), headExt = i === 0 ? NOSE : 0, tailExt = L + (i === NC - 1 ? NOSE : 0);
      const front = (t) => xs + dir * (v * (t - t0) - off); // a kocsi elejének helye
      const tin = t0 + (off - headExt) / v, tout = t0 + (144 + off + tailExt) / v; // amikor az orra kiér a kapuból / a farka beér a túlsó kapuba
      tracks.push(trackPos(n, [0, tin, tout, T], [[front(tin), RL - 0.05, z], [front(tin), RL - 0.05, z], [front(tout), RL - 0.05, z], [front(tout), RL - 0.05, z]]));
      tracks.push(trackScale(n, [0, tin - 0.01, tin, tout, tout + 0.01, T], [S0, S0, S1, S1, S0, S0])); n.scale.set(...S0); } };
  const tA = 1.2, tB = 7.6; run(TZ[1], 1, tA, '#e0523f'); run(TZ[0], -1, tB, '#2f6db5');
  // a pihenő állapot (USDZ): egy szerelvény a hídon – animáció közben rejtve
  const still = node(root, 'allo_vonat', [30, RL - 0.05, TZ[1]]); for (let i = 0; i < NC; i++) { const g = carT(i, '#e0523f'); g.position.x = -i * (L + GAP); still.add(g); }
  tracks.push(trackScale(still, [0, T], [S0, S0]));
  // autó az úton, csónak a folyón
  const car = node(root, 'auto'); const cg = carGeom('#f4c430'); cg.rotation.y = Math.PI / 2; car.add(cg); tracks.push(trackPos(car, [0, T], [[32, 0.55, Z1 - 2], [32, 0.55, Z0 + 2]]));
  const car2 = node(root, 'auto'); const cg2 = carGeom('#3a3f46'); cg2.rotation.y = -Math.PI / 2; car2.add(cg2); tracks.push(trackPos(car2, [0, T], [[36, 0.55, Z0 + 2], [36, 0.55, Z1 - 2]]));
  const boat = node(root, 'csonak'); const bb = new Batch('csonak'); bb.boxB(3, 1, 8, mat(C.white), 0, 0.3, 0); bb.boxB(2.4, 1.2, 2.6, mat('#2f6db5'), 0, 1.3, 1.5); bb.build(boat); tracks.push(trackPos(boat, [0, T], [[-4, 0.3, Z0 + 4], [-4, 0.3, Z1 - 4]]));
  const clips = [new THREE.AnimationClip('vonat', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, '300 km/h', [20, RL + 4.5, TZ[1]], [30, RL + 20, 10], '#e0523f', K);
    label(G, hu ? 'Völgyhíd' : 'Viaduct', [-26, RL - 2, DC + DW / 2], [-34, RL - 12, 18], C.concrete, K);
    label(G, hu ? 'Felsővezeték: 25 kV' : 'Overhead line: 25 kV', [-44, RL + 6.4, TZ[0]], [-60, RL + 22, 4], C.dark, K);
    label(G, hu ? 'Alagút a dombban' : 'Tunnel through the hill', [72, RL + 6, DC + 9], [86, RL + 24, 18], '#86a85f', K);
    return G; };
  return { root, labels, clips, k: K, posterView: [26, 18], posterT: 2.35, labelT: 2.35 };
}
