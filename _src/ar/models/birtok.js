// Birtokrendezés (Földmérő- és földrendező mérnöki): Tihany, a Belső-tó és a tőle nyugatra fekvő dűlők.
// Alap: OpenStreetMap (a tó, a nádas, a földutak, az utcák, az épületek, az erdők) és a műholdkép (a mai táblák, csíkok, fák helye),
// lásd data/tihany_data.js és data/tihany_gen.js (a /home/claude/tihany/gen.py készíti). Észak hátul (−z), a néző délről nézi.
// A birtokrendezés a tótól nyugatra, három, földutakkal határolt blokkban történik: ma 12 keskeny csík (levendula, szőlő, gyep),
// öt tulajdonos között szétszórva; utána mindenki egy összefüggő táblát kap, ugyanakkora területtel. A tulajdonosok kitaláltak (szemléltető példa),
// a csíkok helye és művelési ága a műholdképről való.
// Animáció (20 s): ma → kié melyik csík (színek) → rendezés után (színek) → az új táblák, új határjelekkel → ma.
// Méretarány 1:1800, domborzat nélkül; a fák és a házak valós helyükön, jelzésszerű méretben.
import { THREE, Batch, mat, label, node, trackPos, trackScale, soilBlock } from '../lib/common.js';
import { planPrism, plaque } from '../lib/kit2.js';
import { ribbon, house } from '../lib/terep.js';
import { G } from '../data/tihany_gen.js';
export const FILE = 'birtokrendezes';
const K = 1 / 1800;
const OWN = { A: '#d6b04e', B: '#cf7a4e', C: '#5d8fc4', D: '#9579bd', E: '#4ea58c' };
const KIND = { szolo: '#7f9a55', lev: '#8f93a8', gyep: '#a9b97c', parlag: '#b7ad83' };

function inPoly(x, z, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
const prism = (B, polys, y0, y1, m) => { for (const p of polys) if (p.length > 2) B.add(planPrism(p, y0, y1), m); };
const rows = (B, segs, y, h, w, m) => { for (const [x0, z0, x1, z1] of segs) { const L = Math.hypot(x1 - x0, z1 - z0); B.box(L, h, w, m, (x0 + x1) / 2, y + h / 2, (z0 + z1) / 2, [0, -Math.atan2(z1 - z0, x1 - x0), 0]); } };

export function build({ lang }) {
  const hu = lang !== 'en', root = new THREE.Group(); root.name = 'tihany';
  const [X0, X1, Z0, Z1] = G.AREA, B = new Batch('taj'), tracks = [], T = 20, Y = 0.3, flat = () => 0;
  let sd = 9; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  // alap: talajtömb, a teteje gyep
  const BOT = -soilBlock(B, X0, X1, Z0, Z1, [[2.5, '#6b5640'], [16, '#cbb07a'], [22, '#b09a7c']], '#9fb06a', Y);
  // mezők, gyepek, erdők talaja (a műholdkép szerinti színekkel), sorok a szőlőkben
  for (const f of G.MEZO) prism(B, f.p, Y, f.k === 'erdo' ? 0.7 : 0.8, mat(f.c, { r: 1 }));
  rows(B, G.ROWS.szolo, 0.8, 0.9, 1.3, mat('#4b6f35', { r: 1 }));
  rows(B, G.ROWS.lev, 0.8, 0.8, 1.5, mat('#8d88b8', { r: 1 }));
  // a falu kertjei, a Külső-tó nádasa, a Belső-tó nádasa, vize és szigete
  prism(B, G.FALU, Y, 0.75, mat('#a7b487', { r: 1 }));
  const reedM = mat('#8f975a', { r: 1 }), tuftM = mat('#a3a866', { r: 1 }), tuftD = mat('#7d8749', { r: 1 });
  prism(B, G.KULSO, Y, 1.0, reedM); for (const [o, hs] of G.NADASH) B.add(planPrism(o, Y, 1.4, hs), reedM);
  const tufts = (polys, n, y, holes = []) => { for (const p of polys) { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const [x, z] of p) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
      let k = 0, tries = 0; const want = Math.round(n * Math.max(0, Math.abs(area(p)) - holes.reduce((a, h) => a + Math.abs(area(h)), 0)) / 10000); while (k < want && tries++ < want * 30) { const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0); if (!inPoly(x, z, p) || holes.some(h => inPoly(x, z, h))) continue; k++;
        B.mesh(new THREE.ConeGeometry(2.2 + rnd() * 1.5, 3.5 + rnd() * 2.5, 5), rnd() < 0.5 ? tuftM : tuftD, [x, y + 2.2, z], [0, rnd() * 6, 0]); } } };
  const area = (p) => { let a = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]); return a / 2; };
  for (const [o, hs] of G.NADASH) tufts([o], 28, 1.4, hs); tufts(G.KULSO, 10, 1.0);
  prism(B, [G.VIZ], 0, 0.9, mat('#5a9270', { r: 0.42 })); if (G.SZIGET) prism(B, [G.SZIGET], 0, 1.7, mat('#d9d2bd', { r: 1 }));
  // utak: földutak és a falu utcái
  for (const l of G.UTAK) ribbon(B, flat, l, 3.6, mat('#cdb98f', { r: 1 }), 0.92);
  for (const l of G.UTCAK) ribbon(B, flat, l, 6, mat('#8f8e89', { r: 0.9 }), 0.98);
  // házak az OSM-épületek helyén, az utcához igazítva
  const walls = ['#efe9dc', '#f3efe4', '#e8e0cf'], roofs = ['#b5563b', '#a24a33', '#8d4b3a', '#9b5a43'];
  G.HAZ.forEach(([x, z, a], i) => { if (x < X0 + 10 || x > X1 - 10 || z < Z0 + 10 || z > Z1 - 10) return; house(B, x, z, a, 11 + (i % 3) * 2, 8.5, 4.6, walls[i % 3], roofs[i % 4], 0.75); });
  // fák a műholdképen látható fakoronák helyén
  const crowns = [mat('#4d7d3a', { r: 1 }), mat('#5a8a43', { r: 1 }), mat('#43703a', { r: 1 })], ico = new THREE.IcosahedronGeometry(1, 0); { // sima normálisok, uv nélkül: így a csúcsok összevonhatók (kisebb USDZ)
    const ps = ico.attributes.position; ico.setAttribute('normal', ps.clone()); ico.attributes.normal.normalized = false; for (let i = 0; i < ps.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(ps, i).normalize(); ico.attributes.normal.setXYZ(i, v.x, v.y, v.z); } ico.deleteAttribute('uv'); }
  G.FAK.forEach(([x, z, h], i) => { const r = h * 0.4; B.mesh(ico, crowns[i % 3], [x, 0.8 + h * 0.62, z], [0, i, 0], [r, r * 0.85, r]); });
  B.build(root);

  // ---- a birtokrendezés: négy réteg, ki-be süllyesztve ----
  const layer = (name) => node(root, name);
  const mai = layer('ma'), tul = layer('tulajdon'), ujt = layer('uj_tulajdon'), uj = layer('utana');
  { const b = new Batch('ma'); for (const s of G.MAI) prism(b, s.p, Y, 0.95, mat(s.c, { r: 1 }));
    rows(b, G.MROWS.szolo, 0.95, 0.9, 1.3, mat('#4b6f35', { r: 1 })); rows(b, G.MROWS.lev, 0.95, 0.8, 1.6, mat('#8d88b8', { r: 1 })); b.build(mai); }
  const ownLayer = (nd, list, nm) => { const b = new Batch(nm); for (const s of list) prism(b, s.pi, Y, 2.3, mat(OWN[s.o], { r: 0.9 })); b.build(nd);
    list.forEach((s, i) => { let cx = 0, cz = 0, n = 0; for (const p of s.pi) for (const [x, z] of p) { cx += x; cz += z; n++; } if (!n) return; const off = list.length > 6 ? (i % 2 ? 45 : -45) : 0; // keskeny csíkoknál a címkék váltakozva, a csík mentén eltolva
      const t = label(nd, s.o, null, [cx / n + 0.563 * off, 2.4, cz / n + 0.826 * off], OWN[s.o], K, { h: 0.0095 }); t.name = nm + '_' + s.o + '_' + i; }); };
  ownLayer(tul, G.MAI, 'tul'); ownLayer(ujt, G.UJ, 'ujt');
  { const b = new Batch('utana'), kc = {}; for (const s of G.MAI) kc[s.k.replace('2', '')] ??= s.c; for (const s of G.UJ) prism(b, s.p, Y, 0.95, mat(kc[s.k] || KIND[s.k] || KIND.gyep, { r: 1 }));
    rows(b, G.UROWS.szolo, 0.95, 0.9, 1.3, mat('#4b6f35', { r: 1 })); rows(b, G.UROWS.lev, 0.95, 0.8, 1.6, mat('#8d88b8', { r: 1 }));
    // új határjelek a táblák sarkain (fehér cövek piros fejjel)
    for (const s of G.UJ) for (const p of s.p) for (const [x, z] of p) { b.box(2.6, 8, 2.6, mat('#f4f3ef'), x, 4.9, z); b.box(3.0, 2.6, 3.0, mat('#d8432f'), x, 10.2, z); }
    b.build(uj); }
  const ON = [0, 0, 0], OFF = [0, -4, 0], S1 = [1, 1, 1], S0 = [1, 0.001, 1];
  const vis = (nd, t, v) => { tracks.push(trackPos(nd, t, v.map(a => a ? ON : OFF)), trackScale(nd, t, v.map(a => a ? S1 : S0))); const a = v[0]; nd.position.set(...(a ? ON : OFF)); nd.scale.set(...(a ? S1 : S0)); };
  vis(mai, [0, 6.5, 7.5, 17.5, 18.5, T], [1, 1, 0, 0, 1, 1]);
  vis(tul, [0, 2.5, 3.5, 7, 8, T], [0, 0, 1, 1, 0, 0]);
  vis(ujt, [0, 7.5, 8.5, 12, 13, T], [0, 0, 1, 1, 0, 0]);
  vis(uj, [0, 12.5, 13.5, 17, 18, T], [0, 0, 1, 1, 0, 0]);
  plaque(root, hu ? 'Tihany · Belső-tó' : 'Tihany · Inner Lake', X0 + 24, BOT + 4, Z1 + 0.6, K, { h: 0.017 });
  const clips = [new THREE.AnimationClip('rendezes', T, tracks)];
  const labels = (lg) => { const Gr = new THREE.Group(); Gr.name = 'feliratok'; const q = lg === 'hu', L = (t, a, p, c) => label(Gr, t, a, p, c, K);
    L(q ? 'Birtokrendezés: a szétszórt keskeny csíkokból\ntulajdonosonként egy tábla (szemléltető példa)' : 'Land consolidation: scattered narrow strips become\none block per owner (illustrative example)', [20, 3, 140], [-120, 170, -90], '#c6f432');
    L(q ? 'Belső-tó' : 'Inner Lake', [720, 1, 120], [760, 90, 150], '#4f8f78');
    L(q ? 'Külső-tó, nádas' : 'Outer Lake, reed bed', [-175, 1, -470], [-120, 90, -470], '#8f975a');
    L(q ? 'Tihany' : 'Tihany village', [960, 6, -440], [960, 110, -440], '#e6dccb');
    L(q ? 'Levendula' : 'Lavender', [8, 2, 46], [-175, 70, 120], '#8d88b8');
    L(q ? 'Szőlő' : 'Vineyard', [-22, 2, 67], [-175, 40, 230], '#4b6f35');
    return Gr; };
  return { root, labels, clips, k: K, posterView: [-14, 40], posterT: 1, labelT: 1 };
}
