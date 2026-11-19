// A pisai ferde torony (Geotechnika): harangtorony puha agyagon – az egyetlen nem hazai példa az AR Laborban.
// Metszet a dőlés síkjában: a torony dél felé (jobbra) dől; alatta a rétegek: felül iszapos-homokos rétegek, alatta vastag puha tengeri agyag,
// mélyebben tömör homok. A torony alatt az agyag teteje teknőszerűen besüllyedt. Az északi (bal) oldalon a ferde fúrások a talajkiemelést mutatják,
// amellyel 1999–2001-ben a dőlést mérsékelték. A modell statikus (nincs animáció).
// Közismert adatok: magasság kb. 56 m, 8 szint, építés 1173–1372; a dőlés a beavatkozás előtt kb. 5,5°, utána kb. 4°; az alap átmérője kb. 19,6 m;
// rétegek: kb. 10 m iszapos-homokos összlet, alatta kb. 40 m mélységig puha agyag, mélyebben homok. A részletek egyszerűsítettek.
import { THREE, Batch, mat, C, SPEC, label, person } from '../lib/common.js';
import { tree2, lamp, plaque } from '../lib/kit2.js';
import { triGeo } from '../lib/bme.js';
export const FILE = 'pisa-makett';
const K = 1 / 170;

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'pisa';
  const B = new Batch('talaj'), X0 = -34, X1 = 34, Z0 = -30, YB = -48, TILT = 3.97 * Math.PI / 180;
  const marble = mat('#eee9de', { r: 0.8 }), marbleD = mat('#d5cebf', { r: 0.85 }), shade = mat('#8f8878', { r: 0.9 }), grass = mat('#8fbf6a', { r: 1 });
  // ---- rétegek a metszetben: a torony alatt teknőszerűen besüllyedt határfelületekkel (x szerinti szelvény, hátrafelé kihúzva) ----
  const dip = (x, d) => -d * Math.exp(-Math.pow((x - 1.5) / 13, 2)), N = 34;
  const layer = (yTop, dTop, yBot, dBot, col) => { const T = []; for (let i = 0; i < N; i++) { const xa = X0 + (X1 - X0) * i / N, xb = X0 + (X1 - X0) * (i + 1) / N, ta = yTop + dip(xa, dTop), tb = yTop + dip(xb, dTop), ba = yBot + dip(xa, dBot), bb = yBot + dip(xb, dBot);
      T.push([[xa, ba, 0], [xb, bb, 0], [xb, tb, 0]], [[xa, ba, 0], [xb, tb, 0], [xa, ta, 0]], [[xa, ta, 0], [xb, tb, 0], [xb, tb, Z0]], [[xa, ta, 0], [xb, tb, Z0], [xa, ta, Z0]], [[xb, bb, Z0], [xa, ba, Z0], [xa, ta, Z0]], [[xb, bb, Z0], [xa, ta, Z0], [xb, tb, Z0]]); }
    for (const [x, s] of [[X0, 1], [X1, -1]]) { const t = yTop + dip(x, dTop), b = yBot + dip(x, dBot); T.push(s > 0 ? [[x, b, Z0], [x, b, 0], [x, t, 0]] : [[x, b, 0], [x, b, Z0], [x, t, Z0]], s > 0 ? [[x, b, Z0], [x, t, 0], [x, t, Z0]] : [[x, b, 0], [x, t, Z0], [x, t, 0]]); }
    B.add(triGeo(T), mat(col, { r: 1, ds: true })); };
  layer(0, 0, -3, 0.6, '#b9a47f'); layer(-3, 0.6, -10, 2.6, '#d9c48f'); layer(-10, 2.6, -21, 2.0, '#8a8f8a'); layer(-21, 2.0, -40, 0.4, '#7b837f'); layer(-40, 0.4, YB, 0, '#d2bd86');
  B.box(X1 - X0, 0.3, -Z0, mat('#6f6a60'), 0, YB - 0.15, Z0 / 2);
  // ---- a tér: gyep, burkolt sétány, a torony körüli süllyesztett körüljáró (catino) ----
  B.box(X1 - X0, 0.25, -Z0, grass, 0, 0.125, Z0 / 2); B.box(X1 - X0, 0.06, 5, mat('#d9d3c5'), 0, 0.28, -24); B.box(5, 0.06, -Z0, mat('#d9d3c5'), -26, 0.28, Z0 / 2);
  for (const [x, z, r, c] of [[-20, -8, 1, '#3a5f8a'], [-18.6, -8.6, 2.5, '#b33a2e'], [22, -6, 0.5, '#5a6a3a'], [24, -14, 4, '#8a5a3a'], [-27, -20, 1.5, '#6a4a8a'], [16, -24, 3, '#c98a2e'], [-12, -23.5, 0.2, '#2f6db5']]) person(B, x, z, r, { y: 0.28, vest: c, helmet: '#5a4632', shirt: c });
  for (const [x, z] of [[-31, -27], [30, -27], [31, -10]]) tree2(B, x, z, 7, 0.25, { c1: '#3f7a3a', c2: '#4f8a44' }); lamp(B, -22, -22, 0.28, 5);
  // ---- talajkiemelés az északi oldalon: ferde béléscsövek az alap északi széle alá ----
  for (let i = 0; i < 7; i++) { const z = -2.5 - i * 1.6; B.rod([-22, 0.3, z], [-7.5, -7.2, z], 0.16, mat('#3a3f45'), 6); B.rod([-22.9, 0.78, z], [-22, 0.3, z], 0.26, mat('#e9b21f'), 6); }
  B.box(3.2, 1.6, 12, mat('#e9b21f', { r: 0.5 }), -24.6, 1.1, -7.2); B.box(2.2, 0.9, 11, mat('#3a3f45'), -24.6, 2.3, -7.2);
  B.build(root);
  // ---- a torony (az alappal együtt megdöntve): alap, vakárkádos alsó szint, hat oszlopos körfolyosó, harangszint ----
  const G = new THREE.Group(); G.name = 'torony'; G.position.set(1.5, -2.6, 0); G.rotation.z = -TILT; root.add(G); const TB = new Batch('torony');
  TB.cyl(9.8, 9.8, 2.6, marbleD, 0, -1.2, 0, [0, 0, 0], 32); TB.cyl(7.9, 8.1, 0.6, marbleD, 0, 0.4, 0, [0, 0, 0], 32);
  const R0 = 7.7, H1 = 10.6; TB.cyl(R0, R0, H1, marble, 0, 0.7 + H1 / 2, 0, [0, 0, 0], 32); for (let i = 0; i < 15; i++) { const a = i / 15 * Math.PI * 2; TB.cyl(0.32, 0.36, H1 - 1.6, marbleD, Math.sin(a) * (R0 + 0.15), 0.7 + (H1 - 1.6) / 2, Math.cos(a) * (R0 + 0.15), [0, 0, 0], 8); if (i !== 4) TB.box(1.3, 3.2, 0.2, shade, Math.sin(a + 0.21) * (R0 + 0.02), 5.6, Math.cos(a + 0.21) * (R0 + 0.02), [0, a + 0.21, 0]); }
  TB.box(1.6, 3.6, 0.3, mat('#5b3f2c'), Math.sin(4.21 / 15 * Math.PI * 2) * (R0 + 0.05), 2.5, Math.cos(4.21 / 15 * Math.PI * 2) * (R0 + 0.05), [0, 4.21 / 15 * Math.PI * 2, 0]);
  let y = 0.7 + H1; const LH = 5.55; TB.cyl(R0 + 0.35, R0 + 0.35, 0.5, marbleD, 0, y + 0.25, 0, [0, 0, 0], 32); y += 0.5;
  for (let l = 0; l < 6; l++) { TB.cyl(6.35, 6.35, LH - 0.5, marbleD, 0, y + (LH - 0.5) / 2, 0, [0, 0, 0], 28); TB.cyl(7.75, 7.75, 0.5, marble, 0, y + LH - 0.25, 0, [0, 0, 0], 32); TB.cyl(7.5, 7.5, 0.9, marble, 0, y + LH - 0.95, 0, [0, 0, 0], 30, );
    for (let i = 0; i < 30; i++) { const a = (i + l * 0.5) / 30 * Math.PI * 2; TB.cyl(0.17, 0.2, LH - 1.4, marble, Math.sin(a) * 7.45, y + (LH - 1.4) / 2, Math.cos(a) * 7.45, [0, 0, 0], 6); if (i % 5 === 2) TB.box(0.8, 2.2, 0.15, shade, Math.sin(a + 0.1) * 6.37, y + 1.5, Math.cos(a + 0.1) * 6.37, [0, a + 0.1, 0]); } y += LH; }
  TB.cyl(5.5, 5.5, 6.6, marble, 0, y + 3.3, 0, [0, 0, 0], 24); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; TB.box(1.5, 3.6, 0.25, shade, Math.sin(a) * 5.45, y + 3.0, Math.cos(a) * 5.45, [0, a, 0]); TB.cyl(0.75, 0.75, 0.25, shade, Math.sin(a) * 5.45, y + 4.8, Math.cos(a) * 5.45, [Math.PI / 2, 0, -a], 10); }
  for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * Math.PI * 2; TB.cyl(0.14, 0.16, 5.4, marbleD, Math.sin(a) * 5.65, y + 2.7, Math.cos(a) * 5.65, [0, 0, 0], 6); }
  TB.cyl(5.9, 5.9, 0.5, marbleD, 0, y + 6.85, 0, [0, 0, 0], 24); TB.cyl(0.05, 0.05, 2.2, shade, 0, y + 8.2, 0, [0, 0, 0], 5); TB.box(1.2, 0.8, 0.04, mat('#e8e2d6'), 0.65, y + 8.8, 0);
  const top = y + 7.1; TB.build(G);
  // függőón a felső párkány déli szélétől: a kihajlás szemléltetése
  { const P = new Batch('fuggo'), tx = 1.5 + Math.sin(TILT) * top + 5.9 * Math.cos(TILT), ty = -2.6 + Math.cos(TILT) * top - 5.9 * Math.sin(TILT); for (let yy = ty; yy > 1.2; yy -= 1.6) P.box(0.1, 0.9, 0.1, mat('#3a3f45'), tx, yy - 0.45, 0); P.mesh(new THREE.ConeGeometry(0.4, 1.0, 8), mat('#3a3f45'), [tx, 0.9, 0], [Math.PI, 0, 0]); P.build(root); root.userData.tx = tx; root.userData.ty = ty; }
  plaque(root, hu ? 'Pisai ferde torony · Piazza dei Miracoli' : 'Leaning Tower of Pisa · Piazza dei Miracoli', X0 + 1, YB + 1.2, 0.08, K, { h: 0.019 });
  const labels = (lg) => { const Gl = new THREE.Group(); Gl.name = 'feliratok'; const h = lg === 'hu', tx = root.userData.tx;
    label(Gl, h ? 'Kb. 56 m magas harangtorony, 1173–1372' : 'Bell tower, about 56 m high, 1173–1372', [-4, 50, 2], [-33, 58, 4], '#eee9de', K);
    label(Gl, h ? 'Dőlés ma kb. 4°\n(a beavatkozás előtt kb. 5,5°)' : 'Tilt today about 4°\n(about 5.5° before the intervention)', [tx, 28, 0], [tx + 6, 34, 4], SPEC.geo, K);
    label(Gl, h ? 'Iszapos-homokos rétegek (kb. 10 m)' : 'Silty and sandy layers (about 10 m)', [20, -6, 0], [14, -6.5, 9], '#d9c48f', K);
    label(Gl, h ? 'Puha tengeri agyag kb. 40 m mélységig:\nennek összenyomódása okozza a dőlést' : 'Soft marine clay down to about 40 m:\nits compression causes the tilt', [8, -24, 0], [2, -27, 9], '#8a8f8a', K);
    label(Gl, h ? 'Tömör homok' : 'Dense sand', [22, -44, 0], [16, -46.5, 9], '#d2bd86', K);
    label(Gl, h ? 'Talajkiemelés az északi oldal alól\n(1999–2001)' : 'Soil extraction beneath the north side\n(1999–2001)', [-14, -3.6, -2.5], [-33, 14, 6], '#e9b21f', K);
    label(Gl, h ? 'Az alap alatt a rétegek teknőszerűen besüllyedtek' : 'The layers have sunk into a bowl beneath the foundation', [1.5, -6, 0], [-33, -17, 9], '#b9a47f', K);
    return Gl; };
  return { root, labels, clips: [], k: K, posterView: [24, 12], posterT: 0, labelT: 0 };
}
