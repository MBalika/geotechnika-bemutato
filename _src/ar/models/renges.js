// Földrengésálló épület (Tartószerkezetek) – rázóasztal-kísérlet a laborban: két egyforma, hatszintes épületmodell.
// Bal: hagyományos, merev alapozás – a rengésben erősen kileng. Jobb: szeizmikus szigetelés gumi-acél sarukon – a saruk nyíródnak, a ház alig mozog.
// A mozgás egyszerű lengéstani modellből számolva (egy szabadságfokú rendszerek), szemléltetésre felnagyítva.
import { THREE, Batch, mat, C, SPEC, label, node, trackPos, trackQuat, person } from '../lib/common.js';
export const FILE = 'foldrenges-razoasztal';
const K = 1 / 25;

export function build({ lang }) {
  const root = new THREE.Group(); root.name = 'renges';
  const B = new Batch('labor'); const tracks = [], T = 20, FPS = 15;
  const box = (b, m, xa, xb, ya, yb, za, zb) => { if (xb > xa && yb > ya && zb > za) b.box(xb - xa, yb - ya, zb - za, m, (xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2); };
  // ---- a talajmozgás és a válaszok (numerikusan) ----
  const dt = 0.002, n = Math.round(T / dt) + 1, A = 0.16;
  const env = (t) => t < 2 ? 0 : t < 4.5 ? (t - 2) / 2.5 : t < 10 ? 1 : t < 14 ? 1 - (t - 10) / 4 : 0;
  const ug = new Float64Array(n); for (let i = 0; i < n; i++) { const t = i * dt; ug[i] = A * env(t) * (Math.sin(2 * Math.PI * 1.15 * t) + 0.45 * Math.sin(2 * Math.PI * 2.6 * t + 0.7)); }
  const acc = new Float64Array(n); for (let i = 1; i < n - 1; i++) acc[i] = (ug[i + 1] - 2 * ug[i] + ug[i - 1]) / (dt * dt);
  const sdof = (f, z) => { const w = 2 * Math.PI * f, u = new Float64Array(n); let v = 0; for (let i = 1; i < n; i++) { const a = -acc[i - 1] - 2 * z * w * v - w * w * u[i - 1]; v += a * dt; u[i] = u[i - 1] + v * dt; } return u; };
  const rF = sdof(1.0, 0.04), bI = sdof(0.32, 0.18);
  const mx = Math.max(...rF.map(Math.abs)); const rN = rF.map(v => v / mx * 0.5); // a merev ház tetejének kilengése (m, felnagyítva)
  const at = (arr, t) => arr[Math.min(n - 1, Math.round(t / dt))];
  const times = []; for (let i = 0; i <= T * FPS; i++) times.push(i / FPS);
  // ---- labor: padló, akna, rázóasztal, munkahengerek ----
  const LX = 7.6, LZ = 5.4, TX = 3.6, TZ = 2.2, TY = 0.4;
  box(B, mat('#c9c6bf'), -LX, LX, -0.6, 0, -LZ, LZ); box(B, mat('#8c8a86'), -LX, LX, -1.6, -0.6, -LZ, LZ);
  box(B, mat('#3a3f46'), -TX - 0.6, TX + 0.6, -0.02, 0.01, -TZ - 0.6, TZ + 0.6); // az akna széle
  for (const s of [-1, 1]) for (const z of [-1.2, 1.2]) { B.cyl(0.22, 0.22, 1.4, mat(C.steelDark), s * (TX + 1.4), 0.25, z, [0, 0, Math.PI / 2], 14); box(B, mat(C.concreteDark), s * (TX + 2.1) - 0.3, s * (TX + 2.1) + 0.3, 0, 0.8, z - 0.5, z + 0.5); }
  // vezérlőpult a kezelővel
  box(B, mat('#e9ecef'), -6.6, -4.6, 0, 1.0, 3.2, 4.0); for (const [x, c] of [[-6.0, '#2f6db5'], [-5.2, '#1f2a36']]) B.mesh(new THREE.BoxGeometry(0.7, 0.45, 0.05), mat(c, { em: c === '#2f6db5' ? '#2f6db5' : undefined, ei: 0.5 }), [x, 1.35, 3.65], [-0.25, 0, 0]);
  person(B, -5.6, 4.6, Math.PI, {}); person(B, 5.8, 3.9, -2.5, { tablet: true, vest: '#c6f432' });
  B.build(root);
  const table = node(root, 'asztal'); const tb = new Batch('asztal');
  box(tb, mat('#4a6f9c', { m: 0.3, r: 0.5 }), -TX, TX, 0, TY, -TZ, TZ); for (const s of [-1, 1]) box(tb, mat(C.yellow), -TX, TX, TY - 0.02, TY + 0.02, s * TZ - 0.12 * s - 0.1, s * TZ - 0.12 * s + 0.1);
  for (const s of [-1, 1]) for (const z of [-1.2, 1.2]) tb.rod([s * TX, 0.25, z], [s * (TX + 1.3), 0.25, z], 0.09, mat('#d8dde3', { m: 0.6, r: 0.3 }));
  tb.build(table);
  tracks.push(trackPos(table, times, times.map(t => [at(ug, t), 0, 0])));
  // ---- két épület: 6 szint × 0,6 m (labormakett), 1,6 × 1,6 m alaprajz ----
  const N = 6, H = 0.6, W = 1.6, colM = mat(SPEC.tart), slabM = mat('#e9e6df'), glass = mat(C.glass, { r: 0.25, op: 0.75 });
  const storeyGeo = (b) => { for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(b, colM, sx * W / 2 - 0.06 - (sx > 0 ? 0 : -0.0), sx * W / 2 + 0.06 - (sx > 0 ? 0 : 0), 0, H, sz * W / 2 - 0.06, sz * W / 2 + 0.06);
    box(b, glass, -W / 2 + 0.06, W / 2 - 0.06, 0.06, H - 0.06, W / 2 - 0.04, W / 2 - 0.02); box(b, glass, W / 2 - 0.04, W / 2 - 0.02, 0.06, H - 0.06, -W / 2 + 0.06, W / 2 - 0.06);
    box(b, mat('#c9c4b8'), -W / 2 + 0.3, W / 2 - 0.3, 0, H, -W / 2 + 0.3, -W / 2 + 0.5); };
  const slabGeo = (b, top) => { box(b, slabM, -W / 2 - 0.08, W / 2 + 0.08, -0.06, 0.06, -W / 2 - 0.08, W / 2 + 0.08); if (top) box(b, colM, -W / 2 - 0.08, W / 2 + 0.08, 0.06, 0.12, -W / 2 - 0.08, W / 2 + 0.08); };
  const phi = (i) => Math.sin(Math.PI / 2 * i / N);
  const building = (cx, iso) => {
    const BH = iso ? 0.5 : 0.12; // az alaplemez teteje a rázóasztal fölött (szigetelt háznál a saruk fölött)
    const baseX = (t) => at(ug, t) + (iso ? at(bI, t) : 0), drift = (t) => (iso ? 0.06 : 1) * at(rN, t);
    const xs = (t, i) => baseX(t) + drift(t) * phi(i);
    // alaplemez
    const base = node(root, iso ? 'alap_szig' : 'alap_merev', [cx, TY + BH, 0]); const bb = new Batch('alap'); box(bb, mat(C.concrete), -W / 2 - 0.2, W / 2 + 0.2, -0.12, 0, -W / 2 - 0.2, W / 2 + 0.2); bb.build(base);
    tracks.push(trackPos(base, times, times.map(t => [cx + baseX(t), TY + BH, 0])));
    if (iso) { // gumi-acél saruk: alul az asztallal, fölül az alaplemezzel mozognak (nyíródnak)
      const hb = BH - 0.12; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const px = cx + sx * (W / 2 - 0.1), pz = sz * (W / 2 - 0.1); const nd = node(root, 'saru', [px, TY, pz]); const sb = new Batch('saru');
        for (let k = 0; k < 4; k++) { sb.cyl(0.13, 0.13, hb / 4 * 0.6, mat('#22262b'), 0, hb / 4 * (k + 0.3), 0, [0, 0, 0], 14); sb.cyl(0.135, 0.135, hb / 4 * 0.4, mat('#9aa3ab', { m: 0.5 }), 0, hb / 4 * (k + 0.8), 0, [0, 0, 0], 14); } sb.build(nd);
        tracks.push(trackPos(nd, times, times.map(t => [px + at(ug, t), TY, pz])), trackQuat(nd, times, times.map(t => [0, 0, -Math.atan2(at(bI, t), hb)]))); } }
    else { const nd = node(root, 'talp', [cx, TY, 0]); const sb = new Batch('talp'); box(sb, mat(C.concreteDark), -W / 2 - 0.2, W / 2 + 0.2, 0, 0.0001 + BH - 0.12, -W / 2 - 0.2, W / 2 + 0.2); sb.build(nd); tracks.push(trackPos(nd, times, times.map(t => [cx + at(ug, t), TY, 0]))); }
    for (let i = 0; i < N; i++) { const y0 = TY + BH + i * H; const st = node(root, 'szint', [cx, y0, 0]); const sb = new Batch('szint'); storeyGeo(sb); sb.build(st);
      tracks.push(trackPos(st, times, times.map(t => [cx + xs(t, i), y0, 0])), trackQuat(st, times, times.map(t => [0, 0, -Math.asin(Math.max(-0.9, Math.min(0.9, (xs(t, i + 1) - xs(t, i)) / H)))])));
      const sl = node(root, 'fodem', [cx, y0 + H, 0]); const lb = new Batch('fodem'); slabGeo(lb, i === N - 1); lb.build(sl);
      tracks.push(trackPos(sl, times, times.map(t => [cx + xs(t, i + 1), y0 + H, 0]))); }
  };
  building(-1.7, false); building(1.7, true);
  const clips = [new THREE.AnimationClip('renges', T, tracks)];
  const labels = (lg) => { const G = new THREE.Group(); G.name = 'feliratok'; const hu = lg === 'hu';
    label(G, hu ? 'Merev alapozás:\nerősen kileng' : 'Fixed base:\nsways strongly', [-1.7, 3.6, 0.8], [-4.6, 4.6, 2.2], SPEC.tart, K);
    label(G, hu ? 'Szeizmikus szigetelés:\na ház alig mozog' : 'Base isolation:\nthe building barely moves', [1.7, 3.9, 0.8], [4.8, 4.9, 2.2], SPEC.tart, K);
    label(G, hu ? 'Gumi-acél saruk' : 'Rubber–steel bearings', [2.5, 0.65, 0.7], [5.4, 1.6, 2.6], '#22262b', K);
    label(G, hu ? 'Rázóasztal' : 'Shake table', [-TX + 0.6, TY, TZ], [-TX - 1.2, 1.4, TZ + 2.2], '#4a6f9c', K);
    label(G, hu ? 'Munkahengerek' : 'Actuators', [TX + 1.4, 0.45, 1.2], [TX + 2.4, 1.8, 3.4], C.steelDark, K);
    return G; };
  return { root, labels, clips, k: K, posterView: [16, 18], posterT: 8.3, labelT: 0 };
}
