// RATITA ROW (Ratita Super Expansion DLC): the Ratita Industries Pup Town branch, east of Paw Park through the Ratita Gate.
// Main street + plaza, five enterable buildings (Branch Office with lobby + lab, Gadget Store, Gouda Byte Cafe, R&D Workshop,
// Museum of Inventions) and the Test Yard (Turbo Test Track + Squeak Zapper Range). All real 3D, densely propped.
// Culling: the district's outdoors live in region 'row' (drawn only once you're east of the park), a light far-only LOD
// ('rowFar') stands in from town, and every interior is its own region like the rest of Pup Town.
import * as THREE from 'three';
import * as K from './kit.js?v=20261011r38g';
import { building, gable, REGIONS, DOORS, AREAS } from './town.js?v=20261011r38g';
import { buildFloor2, F2_REGIONS } from './floor2geo.js?v=20261011r38g';
const { sign3d, rbox, rcyl, lathe, sph, cyl, cone, torus, capsule, tube, star, heart, blobGeo, pick, wedge, gear, tree, bush, lampPost, bench, flowerBed, fenceRun, D, G } = K;
const R = K.R, PI = Math.PI, F = 0.05;
const PINK = 0xff4fa0, CHEESE = 0xffc93c, TEAL = 0x22d3ee, NAVY = 0x1e293b, BR = [0xff5d73, 0x4f9dff, 0x3ddc84, 0xffc93c, 0xa66bff, 0x2dd4bf, 0xff8a3d, 0xff6fcf];
export const ROW_REGIONS = [
  { id: 'r_office', x0: 53, x1: 73, z0: 20, z1: 40, y0: -1, y1: 6.3, ceil: 6.0, name: '🐀 Ratita Branch Office' },
  { id: 'r_store', x0: 77, x1: 93, z0: 24, z1: 40, y0: -1, y1: 6, ceil: 5.0, name: '🛍️ Ratita Gadget Store' },
  { id: 'r_cafe', x0: 53, x1: 66, z0: 53, z1: 67, y0: -1, y1: 6, ceil: 4.8, name: '🧀 Gouda Byte Cafe' },
  { id: 'r_work', x0: 69, x1: 82, z0: 53, z1: 67, y0: -1, y1: 7, ceil: 5.6, name: '🔧 R&D Workshop' },
  { id: 'r_museum', x0: 85, x1: 98, z0: 53, z1: 67, y0: -1, y1: 7, ceil: 5.6, name: '🏛️ Museum of Inventions' },
];
export const ROW_DOORS = { r_office: [63, 40], r_store: [85, 40], r_cafe: [59.5, 53], r_work: [75.5, 53], r_museum: [91.5, 53] };
export const ROW_BOUNDS = { x0: 49, x1: 102, z0: -3.5, z1: 73 };
export const inRow = (x, z) => x > 49.4 && x < 102 && z > -3.5 && z < 73;
// Turbo Test Track: oval centre line (straights z = 3 / 13, bends centred x = 62 / 90, radius 5)
export const TRACK = { xa: 62, xb: 90, za: 3, zb: 13, r: 5, cz: 8, w: 3.6 };
export function trackPt(s) { // s in [0,1): from the start line (x 76, north straight) heading -x, anticlockwise seen from above. returns [x, z, yaw]
  const { xa, xb, r, cz } = TRACK, Ls = xb - xa, Lc = PI * r, L = 2 * Ls + 2 * Lc; let d = ((s % 1) + 1) % 1 * L; const half = 76 - xa;
  if (d < half) return [76 - d, cz + r, -PI / 2]; d -= half;
  if (d < Lc) { const a = PI / 2 + d / r; return [xa + Math.cos(a) * r, cz + Math.sin(a) * r, -a]; } d -= Lc;
  if (d < Ls) return [xa + d, cz - r, PI / 2]; d -= Ls;
  if (d < Lc) { const a = -PI / 2 + d / r; return [xb + Math.cos(a) * r, cz + Math.sin(a) * r, -a]; } d -= Lc;
  return [xb - d, cz + r, -PI / 2]; }
export const TRACK_LEN = 2 * (TRACK.xb - TRACK.xa) + 2 * PI * TRACK.r;
// ------------------------------------------------------------------------------------------------ build
export function buildRow(w) {
  if (!REGIONS.some((r) => r.id === 'r_office')) { REGIONS.push(...ROW_REGIONS, ...F2_REGIONS); Object.assign(DOORS, ROW_DOORS); AREAS.unshift({ x0: 53, x1: 99, z0: -3.5, z1: 19, name: '🏁 Ratita Test Yard' }, { x0: 49, x1: 102, z0: -3.5, z1: 73, name: '🐀 Ratita Row' }); }
  w.rowGears = []; w.rowSpots = {}; const I = w.I;
  w.region = 'shell'; land(w); gate(w);
  w.region = 'rowFar'; farLOD(w);
  w.region = 'row'; street(w); plaza(w); yard(w); shells(w);
  office(w); store(w); cafe(w); workshop(w); museum(w);
  buildFloor2(w);
  w.region = 'shell'; }
const gearAt = (w, x, y, z) => w.rowGears.push([x, y, z]);
// ------------------------------------------------------------------------------------------------ ground, boundary hedges, decor beyond
function land(w) {
  const gg = new THREE.PlaneGeometry(75, 120, 30, 48).rotateX(-PI / 2);
  w.addFn('m', gg, (c, x, y, z) => { const n = Math.sin(x * 0.21) * Math.cos(z * 0.17) + Math.sin(x * 0.07 + z * 0.11) * 0.8; c.setHex(0x5cbf4a).lerp(new THREE.Color(n > 0.4 ? 0x7dd35a : n < -0.6 ? 0x49a83e : 0x63c44e), 0.7); }, 112.5, -0.05, 25);
  w.solid(75, -3, -35, 150, -0.05, 85, { floor: true });
  const hedge = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 1.6); for (let i = 0; i <= n; i++) { const t = i / n; w.add('g', blobGeo(i & 31, 0.18, 2), i % 5 ? 0x2f9e4a : 0x3fae5a, x0 + (x1 - x0) * t, 1.0, z0 + (z1 - z0) * t, 0, i, 0, 1.1, 1.2, 1.1); }
    w.solid(Math.min(x0, x1) - 0.9, 0, Math.min(z0, z1) - 0.9, Math.max(x0, x1) + 0.9, 8, Math.max(z0, z1) + 0.9, { wall: true, cam: false }); };
  hedge(49, -4.4, 103, -4.4); hedge(103, -4.4, 103, 73.9); hedge(49, 73.9, 103, 73.9);
  // rolling hills, cottages and trees beyond the district so it never ends in a void
  for (let i = 0; i < 9; i++) { const z = -20 + i * 13, x = 128 + (i % 3) * 9; w.add('m', blobGeo(i + 30, 0.12, 2), [0x6cc24a, 0x5cb83e, 0x7fcf55][i % 3], x, -2, z, 0, i, 0, 22 + (i % 4) * 4, 8 + (i % 3) * 3, 16); }
  for (let i = 0; i < 16; i++) { const z = -6 + i * 5.2; tree(w, 106 + (i % 3) * 2.2, z, 1.3 + (i % 3) * 0.2, i % 5 === 0 ? 1 : 0); }
  for (let i = 0; i < 9; i++) { tree(w, 54 + i * 6, -7.5 - (i % 2) * 2, 1.25, i % 4 === 0 ? 1 : 0); tree(w, 54 + i * 6, 77 + (i % 2) * 2, 1.25, i % 3 === 0 ? 1 : 0); }
  const cottage = (x, z, ry, c, rf) => { const T = w.tf(x, 0, z, ry); T.box('m', c, 0, 0, 0, 5, 3.4, 4.4, 0.1); T.box('m', 0xffffff, 0, 0, 2.21, 1.2, 2.2, 0.06, 0.05); T.box('e', 0xbfe9ff, -1.6, 1.4, 2.22, 1.0, 0.9, 0.04, 0.03); T.box('e', 0xbfe9ff, 1.6, 1.4, 2.22, 1.0, 0.9, 0.04, 0.03); T.box(rf === 1 ? 'g' : 'g', rf, 0, 3.4, 0, 5.4, 0.5, 4.8, 0.2); };
  cottage(116, 10, -PI / 2, 0xffd6a5, 0xe76f51); cottage(118, 40, -PI / 2, 0xcaffbf, 0x2a9d8f); cottage(115, 64, -PI / 2, 0xbde0fe, 0x6d597a);
  // the path from Paw Park's east gap to the gate
  K.floor(w, 20, 45, 47.2, 48, 'tile', 0.0, 0xe7d8bf, 0xd8c6a6, 1.3);
  for (let x = 26; x < 46; x += 6) { lampPost(w, x, 44.2); w.lights.push({ x, y: 3.6, z: 44.2, c: 0xffd9a0, i: 6, d: 10, out: true }); }
  [[30, 50.5], [38, 41.5], [42, 51]].forEach(([x, z], i) => bush(w, x, z, 1.0 + i * 0.1));
  sign3d(w, 'RATITA ROW  >', 34, 1.15, 48.7, PI, 0.18, 0xffffff, PINK); w.add('x', cyl(8), 0x334155, 33, 0, 48.75, 0, 0, 0, 0.05, 1.1, 0.05); w.add('x', cyl(8), 0x334155, 35, 0, 48.75, 0, 0, 0, 0.05, 1.1, 0.05);
}
// ------------------------------------------------------------------------------------------------ the Ratita Gate (always drawn; the force field is the game's)
function gate(w) { const x = 49, z = 46.5;
  K.floor(w, 47.2, 43, 52, 50, 'tile', 0.0, 0xfde68a, 0xfbcfe8, 1.0);
  [-1, 1].forEach((s) => { const pz = z + s * 3.8; w.add('g', rbox(1.3, 5.6, 1.3, 0.3), 0xf8fafc, x, 2.8, pz); w.add('g', rbox(1.6, 0.4, 1.6, 0.15), PINK, x, 0.2, pz); w.add('g', rbox(1.5, 0.35, 1.5, 0.14), PINK, x, 5.6, pz);
    w.add('g', sph(20), CHEESE, x, 6.25, pz, 0, 0, 0, 0.62); w.add('l', rbox(0.08, 3.6, 0.5, 0.04), TEAL, x - 0.66, 2.8, pz, 0, 0, 0, 1, 1, 1, 0.6); w.add('l', rbox(0.08, 3.6, 0.5, 0.04), TEAL, x + 0.66, 2.8, pz, 0, 0, 0, 1, 1, 1, 0.6);
    w.solid(x - 0.65, 0, pz - 0.65, x + 0.65, 6, pz + 0.65); });
  const pts = []; for (let i = 0; i <= 18; i++) { const a = i / 18 * PI; pts.push([x, 5.6 + Math.sin(a) * 1.5, z - 3.8 * Math.cos(a)]); } w.add('g', tube(pts, 0.28, 36, 12), PINK, 0, 0, 0);
  // rat-ear medallion on top
  w.add('g', sph(24), 0xa9afbd, x, 7.55, z, 0, 0, 0, 0.75, 0.7, 0.55); [-1, 1].forEach((s) => { w.add('g', sph(18), 0xa9afbd, x, 8.15, z + s * 0.62, 0, 0, 0, 0.18, 0.42, 0.42); w.add('g', sph(18), 0xffb3c8, x + 0.05 * 1, 8.15, z + s * 0.62, 0, 0, 0, 0.16, 0.32, 0.32); });
  [-1, 1].forEach((s) => w.add('g', sph(10), 0x1b1b24, x + s * 0.48, 7.7, z, 0, 0, 0, 0.09)); w.add('g', sph(10), 0xff8fb1, x, 7.45, z, 0, 0, 0, 0.1); w.add('g', sph(10), 0x1b1b24, x - 0.5, 7.7, z - 0.2, 0, 0, 0, 0.08); w.add('g', sph(10), 0x1b1b24, x + 0.5, 7.7, z + 0.2, 0, 0, 0, 0.0001);
  sign3d(w, 'RATITA ROW', x - 0.25, 6.0, z, -PI / 2, 0.44, 0xffffff, NAVY); sign3d(w, 'RATITA ROW', x + 0.25, 6.0, z, PI / 2, 0.44, 0xffffff, NAVY);
  sign3d(w, 'NOW OPEN', x - 0.3, 4.9, z, -PI / 2, 0.22, CHEESE, null);
  gearAt(w, x - 1.6, 1.5, 41.8);
  // planters with flowers either side
  [[-1, 41.8], [1, 51.2]].forEach(([s, pz]) => { w.add('g', rcyl(0.9, 0.6, 0.12, 28), 0xffffff, x - 1.6, 0, pz); w.add('m', rcyl(0.8, 0.05, 0.02, 24), 0x5a3b1e, x - 1.6, 0.58, pz); for (let i = 0; i < 9; i++) { const a = i / 9 * PI * 2; w.add('g', sph(8), pick([PINK, CHEESE, TEAL, 0xffffff]), x - 1.6 + Math.cos(a) * 0.5, 0.75, pz + Math.sin(a) * 0.5, 0, 0, 0, 0.16); } w.add('g', sph(12), 0x3fae5a, x - 1.6, 0.85, pz, 0, 0, 0, 0.45, 0.35, 0.45); w.solid(x - 2.5, 0, pz - 0.9, x - 0.7, 0.6, pz + 0.9, { cam: false }); });
  w.rowSpots.gate = [x, z]; w.I({ kind: 'rgate', x: x - 1.6, y: 0, z, r: 2.6, label: '🔒 Ratita Row (DLC)' });
  // town-square Zip-Pad (Ratita tech: zaps you to the plaza)
  zipPad(w, -8.8, 11.0, 'town'); }
function zipPad(w, x, z, id) { w.add('x', rcyl(1.15, 0.18, 0.06, 40), 0x475569, x, 0, z); w.add('l', rcyl(0.95, 0.06, 0.02, 40), TEAL, x, 0.18, z, 0, 0, 0, 1, 1, 1, 0.5); w.add('g', torus(0.08, 40), PINK, x, 0.22, z, PI / 2, 0, 0, 1.05, 1.05, 1.05);
  for (let i = 0; i < 3; i++) { const a = i / 3 * PI * 2; w.add('x', cyl(10), 0x94a3b8, x + Math.cos(a) * 1.0, 0, z + Math.sin(a) * 1.0, 0, 0, 0, 0.05, 1.3, 0.05); w.add('l', sph(10), CHEESE, x + Math.cos(a) * 1.0, 1.36, z + Math.sin(a) * 1.0, 0, 0, 0, 0.1, 0.1, 0.1, 0.6); }
  w.solid(x - 1.1, 0, z - 1.1, x + 1.1, 0.18, z + 1.1, { cam: false }); (w.rowSpots.zips || (w.rowSpots.zips = {}))[id] = [x, z];
  w.I({ kind: 'rzip', id, x, y: 0.18, z, r: 1.6, label: id === 'town' ? '🌀 Zip-Pad to Ratita Row' : '🌀 Zip-Pad to the Town Square' }); }
// ------------------------------------------------------------------------------------------------ far-only LOD (from town; never shown once you're near)
function farLOD(w) { const B = (x0, z0, x1, z1, h, c, roof) => { w.add('m', rbox(x1 - x0, h, z1 - z0, 0.3, 1), c, (x0 + x1) / 2, h / 2, (z0 + z1) / 2); w.add('m', rbox(x1 - x0 + 0.6, 0.6, z1 - z0 + 0.6, 0.2, 1), roof, (x0 + x1) / 2, h + 0.3, (z0 + z1) / 2); };
  B(53, 20, 73, 40, 8.6, 0xf5f7ff, PINK); B(77, 24, 93, 40, 5.4, CHEESE, 0xffffff); B(53, 53, 66, 67, 5.2, 0xfff1c1, 0xff8a3d); B(69, 53, 82, 67, 6.0, 0x64748b, 0xff8a3d); B(85, 53, 98, 67, 6.0, 0xede9fe, TEAL);
  w.add('x', rcyl(1.6, 6.5, 0.2, 16), 0xffc83d, 75, 0, 46.5); }
// ------------------------------------------------------------------------------------------------ main street
function street(w) {
  const asph = 0x3a4252; w.add('m', rbox(48, 0.1, 6, 0.03, 1), asph, 76, -0.05, 46.5); w.solid(52, -1, 43.5, 100, 0, 49.5, { floor: true });
  for (let x = 54; x < 99; x += 2.4) { if (Math.abs(x - 75) < 6) continue; w.add('l', rbox(1.1, 0.02, 0.16, 0.01), CHEESE, x, 0.01, 46.5, 0, 0, 0, 1, 1, 1, 0.05); }
  [[59.5, 0], [91.5, 0], [63, 0], [85, 0]].forEach(([x]) => { for (let i = -2; i <= 2; i++) w.add('m', rbox(0.42, 0.03, 5.2, 0.02), 0xf1f5f9, x + i * 0.95, 0.015, 46.5); });
  K.floor(w, 50, 40.6, 100, 43.5, 'tile', 0.0, 0xf6c6a0, 0xe9a77c, 1.2); K.floor(w, 50, 49.5, 100, 52.6, 'tile', 0.0, 0xf6c6a0, 0xe9a77c, 1.2);
  [43.5, 49.5].forEach((z) => w.add('g', rbox(48, 0.14, 0.22, 0.05), 0xff8fc2, 76, 0.02, z));
  // front walks to every door
  K.floor(w, 61, 39.6, 65, 40.6, 'tile', 0.0, 0xfbcfe8, 0xf9a8d4, 1.0); K.floor(w, 83, 39.6, 87, 40.6, 'tile', 0.0, 0xfde68a, 0xfcd34d, 1.0);
  // lamp posts with Ratita banners, planter trees, benches, bins, bike rack
  for (let x = 54; x <= 98; x += 7.3) { [41.2, 51.9].forEach((z, k) => { if (Math.abs(x - 75) < 3) return; lampPost(w, x, z); w.add('f', rbox(0.04, 1.1, 0.6, 0.03), k ? TEAL : PINK, x + 0.06, 2.6, z + (k ? -0.38 : 0.38)); w.add('g', sph(10), 0xffffff, x + 0.1, 2.75, z + (k ? -0.38 : 0.38), 0, 0, 0, 0.12, 0.12, 0.05); }); w.lights.push({ x, y: 3.6, z: 46.5, c: 0xffe2b0, i: 7, d: 12, out: true }); }
  [[57.6, 41.6], [69.3, 41.6], [81.8, 41.6], [95.4, 41.6], [56.6, 51.6], [67.6, 51.6], [83.6, 51.6], [99, 51.6]].forEach(([x, z], i) => { w.add('g', rcyl(0.75, 0.55, 0.1, 24), 0xe0c9a6, x, 0, z); w.add('m', rcyl(0.66, 0.05, 0.02, 24), 0x5a3b1e, x, 0.52, z); tree(w, x, z, 0.75, i % 3 === 0 ? 1 : 0); w.solid(x - 0.8, 0, z - 0.8, x + 0.8, 0.55, z + 0.8, { cam: false }); });
  bench(w, 66, 41.4, 0, PINK); bench(w, 88.6, 41.4, 0, TEAL); bench(w, 71.4, 51.8, PI, CHEESE); bench(w, 87.6, 51.8, PI, PINK);
  const bin = (x, z, c) => { w.add('g', rcyl(0.32, 0.9, 0.06, 18), c, x, 0, z); w.add('g', rcyl(0.36, 0.1, 0.04, 18), 0x334155, x, 0.9, z); w.solid(x - 0.32, 0, z - 0.32, x + 0.32, 1.0, z + 0.32, { cam: false }); };
  bin(60, 41.3, 0x22c55e); bin(90.2, 41.3, 0x3b82f6); bin(63.4, 51.9, 0x22c55e); bin(96, 51.9, 0xf59e0b);
  { const T = w.tf(79.5, 0, 51.9, 0); for (let i = 0; i < 4; i++) T.add('x', torus(0.06, 24, PI), 0x94a3b8, -0.9 + i * 0.6, 0, 0, 0, PI / 2, 0, 0.45, 0.6, 0.45); T.box('x', 0x94a3b8, 0, 0, 0, 2.4, 0.05, 0.1, 0.02); K.hh('bike', w, 79.2, 52.3, 0.16, 0.0); }
  // parked hover-cars + a Ratita delivery van
  K.toyCar(w, 93, 44.6, PI / 2, PINK); K.toyCar(w, 57, 48.4, -PI / 2, TEAL);
  { const T = w.tf(66, 0, 44.7, PI / 2); T.slab('g', 0xffffff, 0, 0.3, 0, 2.0, 1.9, 4.2, 0.3); T.box('g', 0xffffff, 0, 0.3, 2.3, 1.9, 1.2, 0.8, 0.3); T.box('e', 0xbfe9ff, 0, 1.0, 2.5, 1.7, 0.6, 0.5, 0.15); T.box('g', PINK, 0, 0.45, 0, 2.04, 0.3, 4.24, 0.12); T.box('g', CHEESE, 0, 2.2, -0.2, 2.04, 0.08, 3.6, 0.04);
    [-1, 1].forEach((s) => [-1.3, 1.6].forEach((t) => { T.add('m', torus(0.45, 20), 0x111827, s * 0.98, 0.34, t, 0, PI / 2, 0, 0.3, 0.3, 0.3); T.add('x', cyl(14), 0xd1d5db, s * 1.0, 0.34, t, 0, 0, PI / 2, 0.16, 0.1, 0.16); }));
    [-1, 1].forEach((s) => sign3d(w, 'RATITA EXPRESS', ...[T.P(s * 1.03, 0, -0.3)[0]], 1.3, T.P(s * 1.03, 0, -0.3)[2], s > 0 ? PI : 0, 0.16, PINK, null)); }
  // bunting across the street + a GRAND OPENING billboard
  const bunt = (x) => { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([x, 4.4 - Math.sin(t * PI) * 0.8, 41.2 + 10.7 * t]); } w.add('m', tube(pts, 0.025, 20, 5), 0xffffff, 0, 0, 0);
    for (let i = 1; i < 14; i++) { const t = i / 14, y = 4.4 - Math.sin(t * PI) * 0.8; w.add('g', cone(3), [PINK, CHEESE, TEAL, 0xffffff][i % 4], x, y - 0.32, 41.2 + 10.7 * t, PI, PI / 2, 0, 0.22, 0.32, 0.03); } };
  bunt(61.2); bunt(68.5); bunt(83.1); bunt(90.4);
  { const x = 99.4, z = 46.5; [-1, 1].forEach((s) => { w.add('x', cyl(10), 0x334155, x, 0, z + s * 2.2, 0, 0, 0, 0.12, 4.2, 0.12); w.solid(x - 0.15, 0, z + s * 2.2 - 0.15, x + 0.15, 4.2, z + s * 2.2 + 0.15); }); w.add('g', rbox(0.4, 2.4, 5.6, 0.12), PINK, x, 4.6, z); w.add('g', rbox(0.1, 2.0, 5.2, 0.06), 0xffffff, x - 0.22, 4.6, z);
    sign3d(w, 'GRAND OPENING', x - 0.3, 5.0, z, -PI / 2, 0.36, PINK, null); sign3d(w, 'TODAY ONLY: CHEESE CAKE', x - 0.3, 4.2, z, -PI / 2, 0.17, NAVY, null); for (let i = 0; i < 10; i++) w.add('l', sph(8), [CHEESE, TEAL, 0xffffff][i % 3], x - 0.25, 3.45, z - 2.5 + i * 0.55, 0, 0, 0, 0.09, 0.09, 0.09, 0.6);
    gearAt(w, x - 0.8, 1.3, z + 2.2); }
  // fire hydrant + mailbox + flower beds by the doors
  { const x = 74.2, z = 41.6; w.add('g', rcyl(0.22, 0.75, 0.06, 18), 0xef4444, x, 0, z); w.add('g', sph(14), 0xef4444, x, 0.75, z, 0, 0, 0, 0.24, 0.2, 0.24); w.solid(x - 0.25, 0, z - 0.25, x + 0.25, 0.9, z + 0.25, { cam: false }); }
  flowerBed(w, 55, 40.7, 59.6, 41.5); flowerBed(w, 66.4, 40.7, 71.6, 41.5); flowerBed(w, 78, 40.7, 82, 41.5); flowerBed(w, 88.6, 40.7, 92.6, 41.5);
  flowerBed(w, 54, 52.5, 57.4, 53.0 - 0.02 + 0.0 + 0.01); flowerBed(w, 87, 52.5, 89.2, 53.0);
  // behind the B-side buildings: a little picnic lawn + Ratita water tower
  { const x = 76, z = 70.4; for (let i = 0; i < 4; i++) w.add('x', cyl(10), 0x64748b, x + (i % 2 ? 1.3 : -1.3), 0, z + (i < 2 ? 1.0 : -1.0), 0, 0, 0, 0.1, 5.2, 0.1); w.add('g', rcyl(2.0, 2.4, 0.4, 32), 0xf8fafc, x, 5.2, z); w.add('g', cone(32), PINK, x, 7.6, z, 0, 0, 0, 2.3, 1.2, 2.3); w.add('g', rbox(4.2, 0.12, 0.12, 0.04), CHEESE, x, 6.4, z - 2.0);
    sign3d(w, 'RATITA', x, 6.0, z - 2.02, PI, 0.42, PINK, null); w.solid(x - 1.5, 0, z - 1.2, x + 1.5, 5.2, z + 1.2); gearAt(w, x + 2.4, 1.4, z - 1.6); }
  [[58, 70.5], [62, 71], [90, 70.6], [95, 71]].forEach(([x, z], i) => i % 2 ? bush(w, x, z, 1.1) : tree(w, x, z, 1.1, i === 2 ? 1 : 0));
  { const T = w.tf(66.5, 0, 70.6, 0.2); T.slab('m', 0xc58b52, 0, 0.75, 0, 2.2, 0.1, 1.1, 0.04); [-1, 1].forEach((s) => { T.box('m', 0xa86f3c, 0, 0.42, s * 0.85, 2.2, 0.08, 0.4, 0.03); T.box('m', 0x8b5a2b, s * 0.9, 0, 0, 0.12, 0.75, 1.9, 0.03); }); T.add('g', wedge(), CHEESE, 0.2, 0.85, 0, 0, 0.5, 0, 0.25); }
}
// ------------------------------------------------------------------------------------------------ plaza: Luna's golden statue (the game adds the gold rat), fountain ring, Zip-Pad
function plaza(w) { const x = 75, z = 46.5;
  w.add('m', rcyl(5.4, 0.05, 0.02, 64), 0x2dd4bf, x, 0.0, z); for (let i = 0; i < 36; i++) { const a = i / 36 * PI * 2; w.add('m', rbox(1.0, 0.03, 0.7, 0.04), i % 2 ? 0xff5fa8 : 0xffc93c, x + Math.cos(a) * 4.6, 0.055, z + Math.sin(a) * 4.6, 0, -a, 0); }
  w.add('g', lathe([[0, 0], [3.2, 0], [3.35, 0.12], [3.35, 0.7], [3.0, 0.78], [2.9, 0.25], [0, 0.25]], 56, 'rpf'), 0xffe3f0, x, 0, z); w.add('e', rcyl(2.95, 0.55, 0.05, 56), 0x38bdf8, x, 0.1, z);
  w.add('g', lathe([[0, 0], [1.25, 0], [1.25, 0.3], [1.0, 0.45], [0.95, 2.1], [1.2, 2.25], [1.2, 2.5], [0, 2.5]], 32, 'rped'), 0xffffff, x, 0.2, z); w.add('g', rcyl(1.02, 0.35, 0.05, 32), PINK, x, 0.9, z); w.add('x', rcyl(1.22, 0.12, 0.03, 32), 0xd4a017, x, 2.55, z);
  for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; w.add('g', sph(12), [PINK, CHEESE][i % 2], x + Math.cos(a) * 3.3, 0.8, z + Math.sin(a) * 3.3, 0, 0, 0, 0.22, 0.18, 0.22); }
  w.solid(x - 2.9, 0, z - 2.9, x + 2.9, 0.78, z + 2.9); w.solid(x - 1.1, 0, z - 1.1, x + 1.1, 2.6, z + 1.1);
  [-1, 1].forEach((s) => sign3d(w, 'LUNA  FOUNDER', x + s * 1.02, 1.3, z, s > 0 ? PI / 2 : -PI / 2, 0.13, 0xd4a017, null));
  w.rowSpots.statue = [x, 2.67, z]; gearAt(w, x, 1.6, z + 2.6);
  zipPad(w, 80.4, 51.0, 'row');
  w.secretsRow = [{ id: 'plaza', x, y: 0, z, r: 0.1 }];
}
// ------------------------------------------------------------------------------------------------ the Test Yard: Turbo Test Track, Squeak Zapper Range, bleachers, pit garage
function yard(w) { const { xa, xb, za, zb, r, cz, w: tw } = TRACK;
  K.floor(w, 73, 17.2, 77, 20.6, 'tile', 0.0, 0xe7e1d6, 0xd6cfc2, 1.0);
  fenceRun(w, 'x', 18.6, 53.4, 72.6, 1.2, 0xffffff); fenceRun(w, 'x', 18.6, 77.4, 99.6, 1.2, 0xffffff); fenceRun(w, 'z', 53.4, -2.6, 18.6, 1.2, 0xffffff); fenceRun(w, 'z', 99.6, -2.6, 18.6, 1.2, 0xffffff);
  // track surface: red rubber with white lane edges, a chequered start line
  const red = 0xd9543d, edge = 0xffffff; const y = -0.035;
  [za, zb].forEach((zz) => { w.add('m', rbox(xb - xa, 0.03, tw, 0.01, 1), red, (xa + xb) / 2, y, zz); [-1, 1].forEach((s) => w.add('g', rbox(xb - xa, 0.035, 0.12, 0.01, 1), edge, (xa + xb) / 2, y + 0.005, zz + s * (tw / 2 - 0.1))); w.add('g', rbox(xb - xa, 0.034, 0.06, 0.01, 1), 0xfff2ea, (xa + xb) / 2, y + 0.004, zz); });
  [[xa, PI / 2], [xb, -PI / 2]].forEach(([cx, a0]) => { const ring = (r0, r1, c, dy) => { const g = new THREE.RingGeometry(r0, r1, 48, 1, a0, PI).rotateX(-PI / 2); w.add('m', g, c, cx, y + 0.016 + dy, cz); }; ring(r - tw / 2, r + tw / 2, red, 0); ring(r - tw / 2 + 0.04, r - tw / 2 + 0.16, edge, 0.004); ring(r + tw / 2 - 0.16, r + tw / 2 - 0.04, edge, 0.004); ring(r - 0.03, r + 0.03, 0xfff2ea, 0.003); });
  for (let i = 0; i < 6; i++) for (let k = 0; k < 2; k++) w.add('g', rbox(0.3, 0.036, 0.6, 0.01, 1), (i + k) % 2 ? 0x111827 : 0xffffff, 76 - 0.15 + k * 0.3, y + 0.006, zb - tw / 2 + 0.3 + i * 0.6);
  // start gantry over the north straight
  { const x = 76; [-1, 1].forEach((s) => { w.add('x', rcyl(0.18, 4.4, 0.05, 16), 0xe5e7eb, x, 0, zb + s * 2.3); w.solid(x - 0.2, 0, zb + s * 2.3 - 0.2, x + 0.2, 4.4, zb + s * 2.3 + 0.2); }); w.add('g', rbox(0.7, 0.9, 5.2, 0.15), NAVY, x, 4.6, zb);
    sign3d(w, 'TURBO TEST TRACK', x - 0.36, 4.42, zb, -PI / 2, 0.2, CHEESE, null); sign3d(w, 'TURBO TEST TRACK', x + 0.36, 4.42, zb, PI / 2, 0.2, CHEESE, null);
    for (let i = 0; i < 5; i++) w.add('l', sph(10), [0xef4444, 0xef4444, 0xfacc15, 0xfacc15, 0x22c55e][i], x - 0.37, 4.95, zb - 1.0 + i * 0.5, 0, 0, 0, 0.13, 0.13, 0.06, 0.7); gearAt(w, x, 2.3, zb + 2.9); }
  // start pad (green) + marshal booth with timing screens
  w.add('l', rcyl(0.9, 0.04, 0.02, 32), 0x22c55e, 77.6, -0.01, zb, 0, 0, 0, 1, 1, 1, 0.25); w.rowSpots.trackStart = [77.6, zb];
  w.I({ kind: 'rmg', id: 'track', x: 77.6, y: 0, z: zb, r: 1.6, label: '🏁 Run the TURBO TEST TRACK' });
  { const T = w.tf(70, 0, 16.9, PI); T.slab('g', 0xffffff, 0, 0, 0, 3.2, 2.4, 1.6, 0.12); T.box('g', PINK, 0, 2.4, 0, 3.6, 0.3, 2.0, 0.1); T.box('e', 0xcfefff, 0, 1.1, 0.81, 2.6, 0.9, 0.04, 0.03); T.box('l', 0x22d3ee, -0.6, 1.2, 0.84, 0.8, 0.5, 0.02, 0.02, 0.4); T.box('l', 0x4ade80, 0.6, 1.2, 0.84, 0.8, 0.5, 0.02, 0.02, 0.4); sign3d(w, 'MARSHAL', ...[T.P(0, 0, 0.9)[0]], 2.48, T.P(0, 0, 1.0)[2], T.ry, 0.12, 0xffffff, null); }
  // tyre stacks + cones on the bends, flags
  [[56.4, 8], [95.6, 8], [56.6, 5], [95.4, 11]].forEach(([x, z]) => { for (let k = 0; k < 3; k++) w.add('m', torus(0.4, 20), k % 2 ? 0xffffff : 0x111827, x, 0.18 + k * 0.32, z, PI / 2, 0, 0, 0.55, 0.55, 0.65); w.solid(x - 0.6, 0, z - 0.6, x + 0.6, 1.0, z + 0.6, { cam: false }); });
  for (let i = 0; i < 6; i++) K.cone3(w, 63 + i * 5, cz + 0.0 + (i % 2 ? 2.6 : -2.6));
  [[60, 17.6], [92, 17.6], [60, -1.8], [92, -1.8]].forEach(([x, z], i) => { w.add('x', cyl(8), 0xe5e7eb, x, 0, z, 0, 0, 0, 0.05, 3.0, 0.05); for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) w.add('g', rbox(0.3, 0.3, 0.03, 0.01), (k + j) % 2 ? 0x111827 : 0xffffff, x + 0.2 + k * 0.3, 2.65 - j * 0.3, z); });
  // bleachers (south)
  for (let i = 0; i < 3; i++) { const yy = 0.45 * (i + 1); w.slab('m', [0x60a5fa, PINK, CHEESE][i], 76, 0, -0.4 - i * 0.75, 18, yy, 0.75, 0.06, { cam: false }); for (let k = 0; k < 9; k++) w.add('g', rcyl(0.2, 0.06, 0.02, 14), 0xffffff, 68.2 + k * 2, yy, -0.4 - i * 0.75); }
  w.add('x', cyl(10), 0x94a3b8, 67, 0, -2.2, 0, 0, 0, 0.08, 3.6, 0.08); w.add('x', cyl(10), 0x94a3b8, 85, 0, -2.2, 0, 0, 0, 0.08, 3.6, 0.08); w.add('g', rbox(18.6, 0.14, 2.8, 0.06), TEAL, 76, 3.6, -1.2, -0.12, 0, 0); gearAt(w, 84, 2.1, -1.9);
  // pit garage (west end): open-front shed with tools, a hover kart and fuel cans
  { const T = w.tf(56.6, 0, 15.6, PI); T.slab('g', 0xe2e8f0, 0, 0, 1.3, 5.2, 3.0, 0.2, 0.06); [-1, 1].forEach((s) => T.slab('g', 0xe2e8f0, s * 2.5, 0, 0, 0.2, 3.0, 2.8, 0.06)); T.box('g', PINK, 0, 3.0, 0, 5.6, 0.25, 3.2, 0.08);
    sign3d(w, 'PIT GARAGE', ...[T.P(0, 0, -1.5)[0]], 3.15, T.P(0, 0, -1.6)[2], T.ry, 0.16, 0xffffff, null);
    T.box('g', 0xef4444, -1.6, 0, 0.9, 0.9, 0.9, 0.5, 0.06); T.box('g', 0xdc2626, -1.6, 0.9, 0.9, 0.9, 0.4, 0.5, 0.06); for (let k = 0; k < 3; k++) T.box('x', 0xd1d5db, -1.6, 0.2 + k * 0.28, 1.16, 0.8, 0.04, 0.02, 0.01);
    T.box('g', CHEESE, 1.6, 0, 0.9, 0.35, 0.55, 0.3, 0.06); T.box('g', 0x22c55e, 2.0, 0, 0.9, 0.35, 0.55, 0.3, 0.06);
    T.box('g', TEAL, 0, 0.25, 0, 1.4, 0.35, 2.0, 0.15); T.box('g', 0x111827, 0, 0.6, -0.2, 0.7, 0.35, 0.6, 0.1); T.add('l', rcyl(0.16, 0.05, 0.02, 14), PINK, 0, 0.2, 1.05, PI / 2, 0, 0, 1, 1, 1, 0.5); }
  // the Squeak Zapper Range in the infield (targets are the game's)
  { const rx = 70; w.add('g', rbox(13, 0.04, 0.2, 0.02), 0xfacc15, rx, 0.0, 9.6); w.rowSpots.rangeLine = [rx, 10.0]; w.rowSpots.targets = [[rx - 5.4, 6.4], [rx - 2.7, 5.9], [rx, 6.4], [rx + 2.7, 5.9], [rx + 5.4, 6.4]];
    w.add('g', rbox(14, 0.6, 0.5, 0.15), 0x16a34a, rx, 0, 5.0); for (let i = 0; i < 11; i++) w.add('g', sph(10), 0x22c55e, rx - 6 + i * 1.2, 0.65, 5.0, 0, 0, 0, 0.4, 0.32, 0.3); w.solid(rx - 7, 0, 4.75, rx + 7, 0.6, 5.25, { cam: false });
    const T = w.tf(rx + 8.6, 0, 8.0, -PI / 2); T.slab('g', 0x16a34a, 0, 0, 0, 1.8, 1.0, 1.0, 0.1); T.box('g', 0xffffff, 0, 1.0, 0, 1.9, 0.08, 1.1, 0.03); for (let k = 0; k < 6; k++) T.add('g', sph(10), 0xc6f432, -0.6 + k * 0.24, 1.18, 0.1, 0, 0, 0, 0.12); T.box('g', 0x166534, 0, 1.08, 0, 2.2, 1.6, 0.08, 0.06);
    sign3d(w, 'SQUEAK ZAPPER RANGE', rx, 2.2, 4.75, 0, 0.2, 0xffffff, 0x166534); [-1, 1].forEach((s) => { w.add('x', cyl(8), 0x334155, rx + s * 3.3, 0, 4.8, 0, 0, 0, 0.05, 2.3, 0.05); });
    w.I({ kind: 'rmg', id: 'range', x: rx, y: 0, z: 10.1, r: 1.5, label: '🎯 Play the SQUEAK ZAPPER RANGE' }); }
  // Sweepy's charging dock (empty!) by the pit garage
  { const x = 59.4, z = 16.8; w.add('g', rbox(1.4, 0.12, 1.0, 0.05), 0x334155, x, 0, z); w.add('g', rbox(1.2, 0.9, 0.2, 0.08), 0xe5e7eb, x, 0, z + 0.45); w.add('l', rbox(0.6, 0.15, 0.04, 0.02), 0xef4444, x, 0.65, z + 0.34, 0, 0, 0, 1, 1, 1, 0.5); sign3d(w, 'SWEEPY', x, 0.95, z + 0.34, PI, 0.09, NAVY, null); }
}
// ------------------------------------------------------------------------------------------------ building exteriors
function shells(w) { const sh = 'row';
  // BRANCH OFFICE: white + pink glass tower look, two-storey facade, rooftop logo
  building(w, { id: 'r_office', shell: sh, x0: 53, z0: 20, x1: 73, z1: 40, ceil: 6.0, ext: 0xffd3e8, int: 0xfdf2f8, trim: PINK, frame: 0xffffff, base: 0x334155, floor: ['marble', 0xfff7fb, 0xfce7f3, 2.5], door: { side: 's', a: 61, b: 65, h: 4.2 }, winTop: 4.8, winBot: 0.9, winW: 3.0, winStep: 4.2, noBoxes: true, li: 30, mat: PINK, awning: [PINK, 0xffffff] });
  // GADGET STORE: cheese-yellow, big shop windows, giant spinning-gear sign
  building(w, { id: 'r_store', shell: sh, x0: 77, z0: 24, x1: 93, z1: 40, ceil: 5.0, ext: CHEESE, int: 0xfff7e0, trim: 0xffffff, frame: 0xffffff, base: 0xb45309, floor: ['tile', 0xf8fafc, 0xdbeafe, 1.2], door: { side: 's', a: 83, b: 87, h: 3.4 }, winTop: 3.8, winBot: 0.7, winW: 3.2, sign: ['GADGET STORE', 0.4, 0xffffff, PINK], awning: [PINK, 0xffffff], noBoxes: true, li: 26 });
  w.region = sh; { w.add('g', rbox(16.6, 0.5, 16.6, 0.12), 0xf59e0b, 85, 5.65, 32); w.solid(76.7, 5.4, 23.7, 93.3, 5.9, 40.3, { cam: true, roof: true }); w.add('x', gear(12), PINK, 85, 8.0, 39.0, 0, 0, 0, 2.0, 2.0, 0.6); w.add('g', rcyl(0.9, 0.7, 0.1, 28), 0xffffff, 85, 8.0, 39.15, PI / 2, 0, 0); w.add('x', cyl(10), 0x334155, 85, 5.9, 39.0, 0, 0, 0, 0.12, 1.0, 0.12);
    // giant sneaker on the roof
    const T = w.tf(80.6, 5.9, 30, 0.4); T.add('g', capsule(20), 0xffffff, 0, 0.55, 0, PI / 2, 0, 0, 0.9, 1.4, 0.9); T.add('g', rbox(1.9, 0.35, 3.4, 0.15), PINK, 0, 0.1, 0.1); T.add('g', sph(18), TEAL, 0, 1.05, -0.6, 0, 0, 0, 0.75, 0.75, 0.75); for (let k = 0; k < 4; k++) T.add('x', torus(0.15, 16), 0xffffff, 0, 1.0, 0.2 + k * 0.35, 0, 0, PI / 2, 0.22, 0.22, 0.3); T.add('l', rbox(1.92, 0.08, 3.42, 0.03), TEAL, 0, 0.3, 0.1, 0, 0, 0, 1, 1, 1, 0.5);
    T.add('g', star(), CHEESE, 0.95, 0.75, 0.6, 0, PI / 2, 0, 0.35, 0.35, 0.2); }
  // GOUDA BYTE CAFE: cream + orange gable, giant cheese wedge on top
  building(w, { id: 'r_cafe', shell: sh, x0: 53, z0: 53, x1: 66, z1: 67, ceil: 4.8, ext: 0xffd970, int: 0xfffbeb, trim: 0xffffff, frame: 0xffffff, base: 0xd97706, floor: ['wood', 0xd9a066], door: { side: 'n', a: 58, b: 61 }, sign: ['GOUDA BYTE CAFE', 0.32, 0xffffff, 0xf59e0b], awning: [CHEESE, 0xffffff], curtain: 0xffc93c, shutters: 0xf59e0b, boxCol: 0xb45309, li: 22 });
  w.region = sh; gable(w, 53, 53, 66, 67, 5.2, 0xff8a3d, 0xfff1c1, { alongX: true, chimney: [56, 64] }); { const T = w.tf(62.5, 7.4, 58, 0.3); T.add('g', wedge(), CHEESE, 0, 0, 0, 0, 0, 0, 1.6, 1.6, 1.6); [[0.3, 0.2, 0.75], [-0.4, 0.5, 0.75], [0.1, 0.9, 0.75]].forEach(([a, b, c]) => T.add('m', sph(12), 0xf59e0b, a, b, c, 0, 0, 0, 0.18, 0.18, 0.08)); }
  // R&D WORKSHOP: slate + orange, garage door, sawtooth roof with skylights
  building(w, { id: 'r_work', shell: sh, x0: 69, z0: 53, x1: 82, z1: 67, ceil: 5.6, ext: 0x64748b, int: 0xf1f5f9, trim: 0xff8a3d, frame: 0xff8a3d, base: 0x334155, floor: ['tile', 0xd1d5db, 0xbfc5cc, 2.0], door: { side: 'n', a: 73.5, b: 77.5, h: 4.2 }, sign: ['R&D WORKSHOP', 0.34, 0xffffff, 0xff8a3d], noBoxes: true, li: 28, lightCol: 0xf0f9ff });
  w.region = sh; { const y = 6.0; for (let i = 0; i < 4; i++) { const z0 = 53 + i * 3.5; const T = w.tf(75.5, y, z0 + 1.75, PI / 2); T.add('g', new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-1.75, 0); s.lineTo(1.75, 0); s.lineTo(1.75, 1.6); s.lineTo(-1.75, 0); return s; })(), { depth: 13.6, bevelEnabled: false }).translate(0, 0, -6.8), 0xff8a3d, 0, 0, 0); T.add('e', rbox(0.06, 1.5, 13.2, 0.02), 0xbfe9ff, 1.72, 0.8, 0); }
    w.add('g', rbox(13.6, 0.3, 14.6, 0.1), 0x475569, 75.5, y - 0.15, 60); w.solid(68.7, y - 0.3, 52.7, 82.3, y + 1.6, 67.3, { cam: true, roof: true }); w.add('x', cyl(12), 0x94a3b8, 80.5, y, 64.5, 0, 0, 0, 0.35, 2.4, 0.35); w.add('x', cone(12), 0x94a3b8, 80.5, y + 2.6, 64.5, 0, 0, 0, 0.5, 0.4, 0.5); }
  // MUSEUM OF INVENTIONS: lavender, columns, teal dome
  building(w, { id: 'r_museum', shell: sh, x0: 85, z0: 53, x1: 98, z1: 67, ceil: 5.6, ext: 0xc9b8ff, int: 0xfaf5ff, trim: 0xffffff, frame: 0xffffff, base: 0x7c3aed, floor: ['marble', 0xfaf5ff, 0xe9d5ff, 2.0], door: { side: 'n', a: 89.5, b: 93.5, h: 4.2 }, winTop: 4.6, winBot: 1.4, winW: 1.8, curtain: 0x7c3aed, noBoxes: true, li: 28, mat: 0x7c3aed });
  w.region = sh; { const y = 6.0; w.add('g', rbox(13.8, 0.5, 14.8, 0.12), 0xffffff, 91.5, y + 0.25, 60); w.add('x', lathe([[0, 0], [4.2, 0], [4.0, 1.2], [3.2, 2.6], [1.8, 3.6], [0, 3.9]], 40, 'rmDome'), TEAL, 91.5, y + 0.5, 60); w.add('x', cyl(10), 0xd4a017, 91.5, y + 4.4, 60, 0, 0, 0, 0.08, 1.4, 0.08); w.add('x', gear(8), 0xd4a017, 91.5, y + 6.0, 60, PI / 2, 0, 0, 0.5, 0.5, 0.25);
    w.solid(84.7, y, 52.7, 98.3, y + 0.5, 67.3, { cam: true, roof: true });
    for (let i = 0; i < 4; i++) { const x = 87.2 + i * (i < 2 ? 2.3 : 2.3) + (i >= 2 ? 3.4 : 0); w.add('g', lathe([[0, 0], [0.45, 0], [0.45, 0.25], [0.34, 0.4], [0.3, 4.6], [0.42, 4.8], [0.5, 5.2], [0, 5.2]], 22, 'rcol'), 0xffffff, x, 0, 51.8); w.solid(x - 0.4, 0, 51.4, x + 0.4, 5.2, 52.2); }
    w.add('g', rbox(12.6, 0.5, 2.6, 0.1), 0xffffff, 91.5, 5.2 + 0.25, 52.0); w.add('m', new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-6.3, 0); s.lineTo(6.3, 0); s.lineTo(0, 1.6); s.lineTo(-6.3, 0); return s; })(), { depth: 2.4, bevelEnabled: false }).translate(0, 0, -1.2), 0xede9fe, 91.5, 5.7, 52.0);
    sign3d(w, 'MUSEUM OF INVENTIONS', 91.5, 4.55, 50.7, PI, 0.3, 0x7c3aed, null); for (let i = 0; i < 3; i++) w.slab('m', 0xf5f0ea, 91.5, 0, 51.8 - 0.4 - i * 0.5, 12 - i * 0.6, 0.12, 0.6, 0.04, { cam: false }); }
}
// ------------------------------------------------------------------------------------------------ interiors
// wall dressing: framed 3D posters + little wall shelves in every free stretch between windows/doors (same slot maths as building())
const slots = (from, to, door, width = 2.0, step = 4) => { const out = []; const n = Math.max(1, Math.floor((to - from - 2) / step)); for (let i = 0; i < n; i++) { const c = from + (to - from) * (i + 0.5) / n; if (door && c + width / 2 > door[0] - 0.9 && c - width / 2 < door[1] + 0.9) continue; out.push([c - width / 2, c + width / 2]); } return out; };
const ICONS = [() => star(), () => heart(), () => gear(8), () => wedge(), () => sph(12)];
function dress(w, B, sides, o = {}) { const y = o.y || 2.5, cols = o.cols || [PINK, CHEESE, TEAL, 0xa66bff, 0x4ade80]; let k = o.seed || 0;
  for (const sd in sides) { const skip = sides[sd] || []; const ax = sd === 'n' || sd === 's' ? 'x' : 'z'; const a = ax === 'x' ? B.x0 : B.z0, b = ax === 'x' ? B.x1 : B.z1;
    const door = B.door.side === sd ? [B.door.a, B.door.b] : null; const bl = [[a, a + 0.8], [b - 0.8, b]]; if (door) bl.push([door[0] - 0.7, door[1] + 0.7]);
    if (!(B.noWin || '').includes(sd)) slots(a, b, door, B.winW || 2.0, B.winStep || 4).forEach(([p, q]) => bl.push([p - 0.45, q + 0.45])); skip.forEach((r) => bl.push(r)); bl.sort((m, n) => m[0] - n[0]);
    const free = []; let c = a; for (const [p, q] of bl) { if (p > c) free.push([c, p]); c = Math.max(c, q); } if (c < b) free.push([c, b]);
    for (const [p, q] of free) { const L = q - p; if (L < 1.4) continue; const n = L > 4.4 ? 2 : 1;
      for (let i = 0; i < n; i++) { const m = p + L * (i + 0.5) / n, wd = Math.min(1.5, L / n - 0.5), ht = Math.min(1.2, wd * 0.8);
        const [x, z, ry] = sd === 'n' ? [m, B.z0 + 0.3, 0] : sd === 's' ? [m, B.z1 - 0.3, PI] : sd === 'w' ? [B.x0 + 0.3, m, PI / 2] : [B.x1 - 0.3, m, -PI / 2];
        const T = w.tf(x, y, z, ry), col = cols[k % cols.length]; k++;
        T.add('g', rbox(wd + 0.18, ht + 0.18, 0.08, 0.04), o.frame || 0xffffff, 0, 0, 0.0); T.add('m', rbox(wd, ht, 0.04, 0.02), col, 0, 0, 0.04); T.add('m', rbox(wd * 0.86, ht * 0.3, 0.02, 0.01), 0xffffff, 0, -ht * 0.28, 0.065);
        T.add('g', ICONS[k % ICONS.length](), [CHEESE, PINK, 0xffffff, TEAL][k % 4], 0, ht * 0.12, 0.09, 0, 0, 0, ht * 0.22, ht * 0.22, 0.07);
        for (let j = 0; j < 3; j++) T.add('m', rbox(wd * (0.6 - j * 0.12), 0.03, 0.01, 0.005), NAVY, 0, -ht * 0.22 - j * 0.07, 0.08);
        if (o.shelf !== false && wd > 0.9) { T.add('m', rbox(wd + 0.2, 0.06, 0.32, 0.02), o.shelfCol || 0xd6b88a, 0, -ht / 2 - 0.65, 0.16); for (let j = 0; j < 4; j++) { const g = [sph(10), rcyl(0.09, 0.22, 0.03, 14), rbox(0.2, 0.26, 0.16, 0.04), capsule(10)][(j + k) % 4]; T.add('g', g, BR[(j * 3 + k) & 7], -wd / 2 + 0.15 + j * (wd - 0.3) / 3, -ht / 2 - 0.62 + 0.13, 0.16, 0, 0, 0, ...((j + k) % 4 === 0 ? [0.12, 0.12, 0.12] : (j + k) % 4 === 3 ? [0.07, 0.12, 0.07] : [1, 1, 1])); } } } } } }
const pendant = (w, x, y, z, c = PINK) => { w.add('x', cyl(6), 0x334155, x, y - 0.9, z, 0, 0, 0, 0.015, 0.9, 0.015); w.add('g', cone(20), c, x, y - 1.25, z, 0, 0, 0, 0.32, 0.38, 0.32); w.add('l', sph(10), 0xfff4d6, x, y - 1.25, z, 0, 0, 0, 0.13, 0.1, 0.13, 0.6); };
const plaque = (w, x, z, ry, txt) => { const T = w.tf(x, F, z, ry); T.box('x', 0xd4a017, 0, 0, 0, 0.06, 0.9, 0.06, 0.02); T.add('g', rbox(0.9, 0.5, 0.06, 0.03), NAVY, 0, 1.0, 0.0, -0.5, 0, 0); sign3d(w, txt, ...[T.P(0, 0, 0.06)[0]], F + 0.95, T.P(0, 0, 0.06)[2], ry, 0.06, 0xffffff, null); };
const ratHead = (w, x, y, z, ry, s = 1, fur = 0xa9afbd) => { const T = w.tf(x, y, z, ry, s); T.add('g', sph(20), fur, 0, 0, 0, 0, 0, 0, 0.5, 0.46, 0.42); [-1, 1].forEach((k) => { T.add('g', sph(14), fur, k * 0.4, 0.38, 0, 0, 0, 0, 0.26, 0.26, 0.1); T.add('g', sph(14), 0xffb3c8, k * 0.4, 0.38, 0.05, 0, 0, 0, 0.2, 0.2, 0.08); T.add('g', sph(10), 0x1b1b24, k * 0.17, 0.08, 0.36, 0, 0, 0, 0.06); }); T.add('g', sph(10), 0xff8fb1, 0, -0.04, 0.46, 0, 0, 0, 0.08, 0.07, 0.07); };
function cake(w, x, y, z) { for (let i = 0; i < 3; i++) w.add('g', rcyl(0.55 - i * 0.14, 0.28, 0.06, 28), [0xfff7ed, CHEESE, 0xffffff][i], x, y + i * 0.28, z); for (let i = 0; i < 10; i++) { const a = i / 10 * PI * 2; w.add('g', sph(8), [PINK, TEAL][i % 2], x + Math.cos(a) * 0.55, y + 0.27, z + Math.sin(a) * 0.55, 0, 0, 0, 0.06); } w.add('g', wedge(), CHEESE, x, y + 0.86, z, 0, 0.4, 0, 0.18); for (let i = 0; i < 3; i++) { const a = i / 3 * PI * 2; w.add('g', rcyl(0.025, 0.2, 0.005, 8), 0xffffff, x + Math.cos(a) * 0.15, y + 0.84, z + Math.sin(a) * 0.15); w.add('l', sph(8), 0xffb020, x + Math.cos(a) * 0.15, y + 1.08, z + Math.sin(a) * 0.15, 0, 0, 0, 0.035, 0.06, 0.035, 1.0); } }
// a model hung from the ceiling on two thin cables
const hangCable = (w, x, y, z, top, dx = 0.4) => [-1, 1].forEach((k) => w.add('x', cyl(4), 0x94a3b8, x + k * dx, y, z, 0, 0, 0, 0.008, top - y, 0.008));
const drone = (w, x, y, z, c, top) => { hangCable(w, x, y + 0.1, z, top, 0.25); w.add('g', sph(16), c, x, y, z, 0, 0, 0, 0.32, 0.14, 0.32); w.add('l', sph(8), TEAL, x, y - 0.02, z + 0.3, 0, 0, 0, 0.06, 0.05, 0.03, 0.8); [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => { w.add('x', rbox(0.5, 0.04, 0.06, 0.02), 0x475569, x + a * 0.2, y + 0.05, z + b * 0.2, 0, a * b * PI / 4, 0); w.add('g', rcyl(0.18, 0.02, 0.01, 18), 0xffffff, x + a * 0.4, y + 0.1, z + b * 0.4); }); };
const blimp = (w, x, y, z, c, top, ry = 0) => { hangCable(w, x, y + 0.45, z, top, 0.6); const T = w.tf(x, y, z, ry); T.add('g', capsule(20), c, 0, 0, 0, 0, 0, PI / 2, 0.45, 1.0, 0.45); T.add('g', rbox(0.5, 0.2, 0.3, 0.08), 0xffffff, 0, -0.5, 0); [-1, 1].forEach((k) => T.add('g', rbox(0.04, 0.4, 0.36, 0.02), CHEESE, -1.05, k * 0.0 + 0.0, 0, k * PI / 2, 0, 0)); T.add('g', sph(10), 0xffffff, 0.75, 0.15, 0.38, 0, 0, 0, 0.12, 0.12, 0.05); };
// ---------------- BRANCH OFFICE: lobby (front) + lab (back) behind a glass partition
function office(w) { w.region = 'r_office'; const I = w.I;
  K.wall(w, 'x', 30.6, 53.3, 72.7, 6.0, 0xfce7f3, [D(61.5, 64.5, 3.4), G(54.6, 59.4, 3.0, 1.0), G(66.6, 71.4, 3.0, 1.0)], { th: 0.25, frame: PINK, trim: 0xffffff, base: 0xffffff });
  K.floor(w, 53.3, 20.3, 72.7, 30.48, 'tile', 0.03, 0xf1f5f9, 0xe2e8f0, 1.0);
  // --- lobby
  K.rug(w, 63, 35.4, 0, 3.0, 8.4, PINK, 0xffd1e8);
  // reception desk (rounded, logo front) + Tilly's monitor, bell, flowers, sign-in book
  { const T = w.tf(58.8, F, 35.6, PI / 2); T.slab('g', 0xffffff, 0, 0, 0, 3.6, 1.05, 0.8, 0.2); T.box('g', PINK, 0, 1.05, 0, 3.8, 0.08, 1.0, 0.04); T.box('l', TEAL, 0, 0.12, 0.41, 3.4, 0.06, 0.02, 0.02, 0.4); [-1, 1].forEach((s) => T.add('g', rcyl(0.4, 1.05, 0.15, 24), 0xffffff, s * 1.8, 0, 0)); K.monitor(w, T, -0.8, 1.13, -0.15, PI, 0xfda4af); T.add('x', sph(12), 0xd4a017, 0.6, 1.16, 0.1, 0, 0, 0, 0.1, 0.07, 0.1); T.box('m', 0xffffff, 1.2, 1.13, 0.1, 0.45, 0.04, 0.32, 0.01); T.add('g', rcyl(0.08, 0.2, 0.02, 14), TEAL, 0.0, 1.13, 0.2); for (let k = 0; k < 4; k++) T.add('g', sph(8), pick([PINK, CHEESE, 0xffffff]), (k - 1.5) * 0.06, 1.42, 0.2, 0, 0, 0, 0.06); }
  ratHead(w, 58.0, 0.16 + F + 1.05 / 2 - 0.1, 35.6, PI / 2 + 0.0001, 0.0001);
  { const T = w.tf(59.2, F, 35.6, PI / 2); sign3d(w, 'RECEPTION', ...[T.P(0, 0, 0.43)[0]], F + 0.5, T.P(0, 0, 0.43)[2], PI / 2, 0.11, PINK, null); }
  // logo wall on the partition (lobby side)
  sign3d(w, 'RATITA INDUSTRIES', 63, 4.5, 30.82, 0, 0.42, PINK, null); sign3d(w, 'PUP TOWN BRANCH', 63, 3.85, 30.82, 0, 0.22, NAVY, null);
  { w.add('x', torus(0.08, 48), 0xd4a017, 63, 5.5 - 0.2, 30.9, 0, 0, 0, 0.45, 0.45, 0.45); ratHead(w, 63, 5.3, 30.95, 0, 0.55); }
  // waiting area: 2 sofas, coffee table with magazines, rug, plants, water cooler, vending machine
  K.sofa(w, 70.8, 35.6, -PI / 2, PINK, 0xffb3d9); K.sofa(w, 66.8, 35.6, PI / 2, TEAL, 0x99f6e4);
  { K.tableR(w, 68.8, 35.6, 0.6, 0.45, 0xffffff, 0x94a3b8); for (let k = 0; k < 3; k++) w.add('m', rbox(0.34, 0.02, 0.46, 0.01), pick([PINK, CHEESE, TEAL, 0x86efac]), 68.6 + k * 0.18, 0.46 + k * 0.02, 35.5 + k * 0.08, 0, 0.3 * k, 0); w.add('g', rcyl(0.07, 0.12, 0.02, 14), 0xffffff, 69.1, 0.46, 35.9); }
  K.plant(w, 54.2, 39.0, 1.3); K.plant(w, 71.8, 39.0, 1.3); K.plant(w, 54.2, 31.4, 1.1); K.plant(w, 71.8, 31.4, 1.1); K.cooler(w, 72.2, 33.2); K.vending(w, 72.0, 37.2 - 4.8, -PI / 2, PINK);
  // Officer Gouda's security desk with camera screens
  { const T = w.tf(70.4, F, 38.4, -PI / 2); T.slab('g', 0x334155, 0, 0, 0, 1.8, 0.95, 0.7, 0.08); T.box('g', 0x1e293b, 0, 0.95, 0, 1.9, 0.06, 0.8, 0.03); for (let k = 0; k < 3; k++) K.monitor(w, T, -0.6 + k * 0.6, 1.01, -0.15, PI, [0x86efac, 0x7dd3fc, 0xfda4af][k], 0.7); T.add('g', rcyl(0.07, 0.12, 0.02, 14), 0xffffff, 0.75, 1.01, 0.2); }
  // grand opening: ribbon posts (the ribbon is the game's), the cheese cake, balloons, banner
  [61.2, 64.8].forEach((x) => { w.add('x', rcyl(0.2, 0.08, 0.02, 16), 0xd4a017, x, F, 32.2); w.add('x', cyl(10), 0xd4a017, x, F, 32.2, 0, 0, 0, 0.05, 1.05, 0.05); w.add('x', sph(10), 0xd4a017, x, F + 1.08, 32.2, 0, 0, 0, 0.09); w.solid(x - 0.1, 0, 32.1, x + 0.1, 1.1, 32.3, { cam: false }); });
  w.rowSpots.ribbon = [63, F + 0.95, 32.2];
  K.tableR(w, 66.6, 32.2, 0.75, 0.8, 0xffffff, 0xd4a017); cake(w, 66.6, 0.8, 32.2);
  for (let i = 0; i < 10; i++) { const bx = 55 + (i % 5) * 0.4, bz = 31.4 + (i < 5 ? 0 : 0.4), by = 2.8 + (i % 3) * 0.4; w.add('m', cyl(4), 0xffffff, bx, F + 1.0, bz, 0, 0, 0, 0.006, by - 1.0, 0.006); w.add('g', sph(14), pick([PINK, CHEESE, TEAL, 0xffffff]), bx, by + F, bz, 0, 0, 0, 0.26, 0.32, 0.26); } w.add('m', rbox(0.5, 0.4, 0.5, 0.06), CHEESE, 55.8, F, 31.6);
  sign3d(w, 'GRAND OPENING', 63, 5.3, 39.5, PI, 0.3, PINK, 0xffffff, { glow: 0.3 });
  // ceiling banners
  for (let i = 0; i < 4; i++) { const x = 55.5 + i * 5; w.add('f', rbox(1.0, 1.6, 0.04, 0.03), [PINK, CHEESE, TEAL, PINK][i], x, 4.6, 38.2); w.add('x', cyl(6), 0xd4a017, x, 5.45, 38.2, 0, 0, PI / 2, 0.02, 1.2, 0.02); w.add('g', sph(10), 0xffffff, x, 4.7, 38.17, 0, 0, 0, 0.22, 0.22, 0.05); }
  gearAt(w, 55.8, 1.1, 31.6);
  // --- lab
  { const x = 63, z = 25.2; w.add('m', lathe([[0, 0], [0.7, 0], [0.7, 0.15], [0.45, 0.3], [0.4, 0.95], [0.6, 1.05], [0.6, 1.2], [0, 1.2]], 28, 'rped2'), 0xf8fafc, x, F, z); w.add('f', rcyl(0.48, 0.05, 0.02, 24), PINK, x, F + 1.2, z);
    w.add('e', lathe([[0.52, 0], [0.53, 0.35], [0.42, 0.7], [0.22, 0.86], [0, 0.9]], 28, 'rdome'), 0xe0f7ff, x + 0.7, F + 0.05, z + 0.5, 0, 0, 1.2); w.solid(x - 0.65, F, z - 0.65, x + 0.65, F + 1.3, z + 0.65);
    K.hazard(w, x, z, 3.2, 3.2, 0); sign3d(w, 'PUP-TRANSLATOR', x, F + 0.5, z + 0.72, 0, 0.08, PINK, 0xffffff); w.rowSpots.labStand = [x, F + 1.25, z];
    for (let i = 0; i < 14; i++) { const t = i / 13; w.add('m', sph(6), 0x475569, x + 0.6 + Math.sin(t * 5) * 0.4, F + 0.01, z + 0.8 + t * 4.4, 0, 0, 0, 0.06, 0.012, 0.06); w.add('m', sph(6), 0x475569, x + 0.95 + Math.sin(t * 5) * 0.4, F + 0.01, z + 0.8 + t * 4.4, 0, 0, 0, 0.06, 0.012, 0.06); }
    w.add('g', rbox(0.5, 0.012, 0.08, 0.005), 0xe5e7eb, x + 1.2, F + 0.02, z + 1.4, 0, 0.6, 0);
    I({ kind: 'rclue', id: 'lab', x, y: F, z: z + 1.6, r: 1.9, label: '🔍 Inspect the empty Pup-Translator stand' }); }
  K.labBench(w, 57.0, 21.6, 0, 4.4); K.labBench(w, 69.0, 21.6, 0, 4.4); K.stool(w, 56.4, 22.9, PINK); K.stool(w, 58.0, 22.9, TEAL); K.stool(w, 69.6, 22.9, CHEESE);
  K.vat(w, 55.2, 28.6, 0x4ade80, 0.8, 2.2); K.vat(w, 70.8, 28.6, 0xf472b6, 0.8, 2.2);
  for (let i = 0; i < 3; i++) K.serverRack(w, 53.95, 23.4 + i * 1.0 + (i ? 0.0 : 0), PI / 2); gearAt(w, 53.95, 2.95, 24.4);
  K.whiteboard(w, 'z', 72.65, 25.4, 1.2, 3.2, -1); K.pipes(w, 'x', 20.7, 53.6, 72.4, 5.4);
  K.conveyor(w, 63, 21.3, 0, 5.4); for (let i = 0; i < 4; i++) K.parcel(w, 61.2 + i * 1.2, 0.78, 21.3, 0.8);
  { const T = w.tf(66.2, F, 28.9, PI); T.slab('g', 0xe2e8f0, 0, 0, 0, 2.0, 0.95, 0.9, 0.06); T.box('g', NAVY, 0, 0.95, 0, 2.1, 0.06, 1.0, 0.03); K.monitor(w, T, -0.5, 1.01, -0.2, 0, 0x4ade80); K.monitor(w, T, 0.5, 1.01, -0.2, 0, 0xa78bfa); }
  // half-built Wag-O-Meter prototype + test dog bowl on the bench
  { const T = w.tf(59.6, F, 28.6, 0.3); T.slab('x', 0x94a3b8, 0, 0, 0, 1.2, 0.8, 1.2, 0.08); T.add('g', rcyl(0.4, 0.25, 0.08, 24), TEAL, 0, 0.8, 0); T.add('x', cyl(10), 0xd1d5db, 0, 1.05, 0, 0, 0, 0, 0.04, 0.6, 0.04); T.add('g', capsule(12), CHEESE, 0.2, 1.7, 0, 0, 0, 0.9, 0.08, 0.35, 0.08); T.add('l', sph(10), 0x4ade80, 0, 1.05, 0.42, 0, 0, 0, 0.07, 0.07, 0.04, 0.6); sign3d(w, 'WAG-O-METER', ...[T.P(0, 0, 0.62)[0]], F + 0.45, T.P(0, 0, 0.62)[2], 0.3, 0.07, NAVY, null); }
  K.hh('dogBowl', w, 61.4, 28.8, 0.18, CHEESE, TEAL);
  dress(w, { x0: 53, z0: 30.8, x1: 73, z1: 40, door: { side: 's', a: 61, b: 65 }, winW: 3.0, winStep: 4.2, noWin: 'n' }, { s: [] }, { seed: 0 });
  w.lights.push({ x: 63, y: 4, z: 25, c: 0xe0f2fe, i: 14, d: 14 });
}
// ---------------- GADGET STORE
function store(w) { w.region = 'r_store'; const I = w.I;
  // checkout counter + register + Sprocket's corner; shelves of boxed gadgets behind
  { const T = w.tf(85, F, 27.0, 0); T.slab('g', 0xffffff, 0, 0, 0, 5.4, 1.0, 0.8, 0.12); T.box('g', PINK, 0, 1.0, 0, 5.6, 0.08, 1.0, 0.04); T.box('l', CHEESE, 0, 0.1, 0.41, 5.2, 0.06, 0.02, 0.02, 0.4); T.box('g', NAVY, -1.4, 1.08, 0, 0.7, 0.35, 0.5, 0.06); T.box('l', 0x4ade80, -1.4, 1.3, 0.26, 0.5, 0.15, 0.02, 0.01, 0.4); T.add('x', sph(12), 0xd4a017, 1.2, 1.12, 0.1, 0, 0, 0, 0.1, 0.07, 0.1); for (let k = 0; k < 5; k++) T.box('g', pick(BR), 0.2 + k * 0.22, 1.08, 0.15, 0.18, 0.12 + (k % 2) * 0.08, 0.14, 0.03); }
  I({ kind: 'rshop', x: 85, y: F, z: 28.4, r: 1.8, label: '🛍️ Browse the Gadget Store' });
  for (let s = 0; s < 3; s++) { const T = w.tf(81.6 + s * 3.4, F, 24.7, 0); T.slab('m', 0xffffff, 0, 0, 0, 3.0, 3.0, 0.5, 0.05); for (let k = 0; k < 4; k++) { T.box('m', 0xe5e7eb, 0, 0.5 + k * 0.7, 0.1, 3.0, 0.05, 0.5, 0.01); for (let i = 0; i < 6; i++) T.box('g', BR[(i + k + s) & 7], -1.2 + i * 0.48, 0.55 + k * 0.7, 0.18, 0.36, 0.4 + ((i + k) % 3) * 0.08, 0.3, 0.04); } }
  gearAt(w, 88.4, 3.6, 24.8);
  // security camera (clue)
  { const x = 88.2, z = 27.6; w.add('x', cyl(8), 0x334155, x, 4.6, z - 0.3, 0, 0, 0, 0.04, 0.4, 0.04); w.add('g', rbox(0.5, 0.3, 0.3, 0.08), 0xffffff, x, 4.4, z - 0.1, -0.3, 0, 0); w.add('l', sph(8), 0xef4444, x, 4.45, z + 0.06, 0, 0, 0, 0.05, 0.05, 0.03, 0.8);
    I({ kind: 'rclue', id: 'shop', x: 88.6, y: F, z: 28.4, r: 1.4, label: '📹 Check the security camera footage' }); }
  // display cases with real 3D gadgets inside
  const caseAt = (x, z, ry, put) => { const T = w.tf(x, F, z, ry); T.slab('g', 0xffffff, 0, 0, 0, 1.4, 0.95, 1.0, 0.08); T.box('l', TEAL, 0, 0.95, 0, 1.3, 0.03, 0.9, 0.01, 0.4); T.box('e', 0xe0f7ff, 0, 0.98, 0, 1.36, 0.9, 0.96, 0.05); put(T, 0.98); T.solid(-0.7, 0, -0.5, 0.7, 1.9, 0.5); };
  caseAt(78.4, 30.4, PI / 2, (T, y) => { [-1, 1].forEach((s) => { T.add('g', rcyl(0.14, 0.45, 0.05, 18), 0xe5e7eb, s * 0.18, y + 0.15, 0); T.add('l', cone(12), 0xff8a3d, s * 0.18, y + 0.15, 0, PI, 0, 0, 0.1, 0.18, 0.1, 0.6); }); T.box('g', PINK, 0, y + 0.2, -0.1, 0.5, 0.4, 0.15, 0.05); });
  caseAt(78.4, 33.6, PI / 2, (T, y) => { [-1, 1].forEach((s) => T.add('g', sph(16), TEAL, s * 0.32, y + 0.45, 0, 0, 0, s * 0.3, 0.38, 0.05, 0.2)); T.add('x', cyl(8), 0x94a3b8, 0, y + 0.45, 0, 0, 0, PI / 2, 0.03, 0.7, 0.03); });
  caseAt(78.4, 36.8, PI / 2, (T, y) => { [-1, 1].forEach((s) => { T.add('g', capsule(14), 0xffffff, s * 0.2, y + 0.12, 0, PI / 2, 0, 0, 0.12, 0.28, 0.12); T.add('g', rbox(0.26, 0.06, 0.52, 0.03), PINK, s * 0.2, y + 0.02, 0.03); }); });
  caseAt(91.6, 30.4, -PI / 2, (T, y) => { T.add('e', sph(20), 0x9ff3ff, 0, y + 0.4, 0, 0, 0, 0.35); T.add('l', sph(10), 0xffffff, 0.1, y + 0.5, 0.15, 0, 0, 0, 0.06, 0.06, 0.06, 0.6); });
  caseAt(91.6, 33.6, -PI / 2, (T, y) => { T.add('g', sph(14), 0x2563eb, 0, y + 0.18, 0, 0, 0, 0, 0.25, 0.16, 0.25); T.add('x', cyl(8), 0x94a3b8, 0, y + 0.36, 0, 0, 0, 0, 0.02, 0.12, 0.02); [-1, 1].forEach((s) => T.add('g', sph(10), CHEESE, s * 0.18, y + 0.46, 0, 0, 0, 0, 0.18, 0.02, 0.06)); });
  caseAt(91.6, 36.8, -PI / 2, (T, y) => { T.add('x', rcyl(0.22, 0.14, 0.03, 20), 0xffc83d, 0, y + 0.05, 0); for (let k = 0; k < 5; k++) { const a = k / 5 * PI * 2; T.add('x', cone(8), 0xffc83d, Math.cos(a) * 0.18, y + 0.24, Math.sin(a) * 0.18, 0, 0, 0, 0.05, 0.12, 0.05); T.add('g', wedge(), CHEESE, Math.cos(a) * 0.2, y + 0.12, Math.sin(a) * 0.2, 0, a, 0, 0.05); } });
  // central island: mannequin heads wearing the hats, a giant sneaker model
  { const x = 85, z = 33.2; w.slab('g', 0xffffff, x, F, z, 3.4, 0.8, 1.6, 0.2); w.add('g', rbox(3.6, 0.08, 1.8, 0.04), TEAL, x, F + 0.8, z);
    [[-1.2, 0xffd23f, 'hard'], [-0.4, PINK, 'prop'], [0.4, 0xa9afbd, 'ears'], [1.2, 0xffc83d, 'crown']].forEach(([dx, c, k]) => { w.add('x', cyl(8), 0x94a3b8, x + dx, F + 0.88, z, 0, 0, 0, 0.03, 0.3, 0.03); w.add('m', sph(16), 0xf3e8d8, x + dx, F + 1.38, z, 0, 0, 0, 0.2, 0.24, 0.2);
      if (k === 'hard') { w.add('g', sph(14), 0xffd23f, x + dx, F + 1.52, z, 0, 0, 0, 0.23, 0.15, 0.23); w.add('l', sph(8), 0xffffff, x + dx, F + 1.55, z + 0.2, 0, 0, 0, 0.04, 0.04, 0.02, 0.8); }
      else if (k === 'prop') { w.add('g', sph(14), PINK, x + dx, F + 1.52, z, 0, 0, 0, 0.21, 0.13, 0.21); w.add('g', rbox(0.5, 0.02, 0.08, 0.01), CHEESE, x + dx, F + 1.7, z); w.add('g', rbox(0.08, 0.02, 0.5, 0.01), TEAL, x + dx, F + 1.71, z); }
      else if (k === 'ears') { [-1, 1].forEach((s) => { w.add('g', sph(12), 0xa9afbd, x + dx + s * 0.17, F + 1.62, z, 0, 0, 0, 0.11, 0.11, 0.04); w.add('g', sph(12), 0xffb3c8, x + dx + s * 0.17, F + 1.62, z + 0.02, 0, 0, 0, 0.08, 0.08, 0.03); }); }
      else { w.add('x', rcyl(0.17, 0.1, 0.02, 18), c, x + dx, F + 1.52, z); for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2; w.add('x', cone(8), c, x + dx + Math.cos(a) * 0.14, F + 1.66, z + Math.sin(a) * 0.14, 0, 0, 0, 0.04, 0.1, 0.04); } } }); }
  // neon sign + hanging jetpack model + price tags
  sign3d(w, 'GADGETS', 85, 3.6, 39.62, PI, 0.4, PINK, null, { glow: 0.8 }); sign3d(w, 'COOL GEAR FOR GOOD DOGS', 85, 4.3, 24.6 + 0.3, 0, 0.18, NAVY, null);
  { const x = 85, y = 3.6, z = 31; w.add('x', cyl(6), 0x334155, x, y + 0.5, z, 0, 0, 0, 0.015, 0.9, 0.015); [-1, 1].forEach((s) => { w.add('g', rcyl(0.22, 0.8, 0.08, 20), 0xe5e7eb, x + s * 0.3, y - 0.6, z); w.add('l', cone(14), 0xff8a3d, x + s * 0.3, y - 0.95, z, PI, 0, 0, 0.16, 0.4, 0.16, 0.7); }); w.add('g', rbox(0.6, 0.7, 0.3, 0.1), PINK, x, y - 0.5, z - 0.1); }
  K.plant(w, 77.9, 39.0, 1.1); K.plant(w, 92.1, 39.0, 1.1); for (let i = 0; i < 3; i++) K.parcel(w, 92.0, F + i * 0.5, 25.6, 0.8);
  // try-me demo pads: a hovering Jet-Pup Pack and a sneaker on a mini treadmill; plush bin; hanging drones + pennants
  { const x = 81.0, z = 37.4; w.add('x', rcyl(0.7, 0.18, 0.05, 28), 0x475569, x, F, z); w.add('l', torus(0.04, 32), TEAL, x, F + 0.2, z, PI / 2, 0, 0, 0.62, 0.62, 0.62, 0.6); w.add('g', rbox(0.55, 0.65, 0.3, 0.1), PINK, x, F + 1.2, z); [-1, 1].forEach((k) => { w.add('g', rcyl(0.14, 0.5, 0.05, 16), 0xe5e7eb, x + k * 0.22, F + 1.1, z - 0.18); w.add('l', cone(12), 0xff8a3d, x + k * 0.22, F + 0.72, z - 0.18, PI, 0, 0, 0.1, 0.22, 0.1, 0.8); }); sign3d(w, 'TRY ME!', x, F + 0.35, z + 0.72, 0, 0.09, PINK, 0xffffff); w.solid(x - 0.7, 0, z - 0.7, x + 0.7, 0.25, z + 0.7, { cam: false }); }
  { const x = 89.0, z = 37.4; w.slab('x', 0x334155, x, F, z, 1.4, 0.2, 0.7, 0.06); w.add('m', rbox(1.2, 0.04, 0.5, 0.02), 0x111827, x, F + 0.22, z); w.add('g', capsule(14), 0xffffff, x, F + 0.42, z, PI / 2, 0, 0, 0.16, 0.36, 0.16); w.add('g', rbox(0.36, 0.08, 0.7, 0.04), PINK, x, F + 0.3, z + 0.03); w.add('l', cone(10), 0xffd23f, x, F + 0.42, z - 0.48, -PI / 2, 0, 0, 0.08, 0.2, 0.08, 0.7); sign3d(w, 'TURBO TEST', x, F + 0.25, z + 0.38, 0, 0.07, CHEESE, null); }
  { const x = 81.6, z = 28.4; w.add('m', lathe([[0, 0], [0.55, 0], [0.62, 0.6], [0.66, 0.62], [0, 0.62]], 24, 'rbin'), 0xffffff, x, F, z); w.add('l', torus(0.05, 28), CHEESE, x, F + 0.62, z, PI / 2, 0, 0, 0.64, 0.64, 0.64, 0.3); for (let i = 0; i < 6; i++) ratHead(w, x + Math.cos(i) * 0.3, F + 0.66 + (i % 2) * 0.1, z + Math.sin(i) * 0.3, i, 0.32, [0xa9afbd, 0xffffff, 0xf3d9a4][i % 3]); sign3d(w, 'PLUSHIES', x, F + 0.35, z + 0.67, 0, 0.07, PINK, null); w.solid(x - 0.6, 0, z - 0.6, x + 0.6, 0.9, z + 0.6, { cam: false }); }
  drone(w, 81.5, 3.9, 31, PINK, 5.0); drone(w, 88.5, 3.9, 31, TEAL, 5.0); drone(w, 85, 4.0, 36.5, CHEESE, 5.0);
  for (let i = 0; i < 9; i++) { const x = 78.5 + i * 1.6; w.add('f', cone(3), BR[i & 7], x, 4.55, 29.0, PI, 0, 0, 0.22, 0.4, 0.02); } w.add('x', cyl(4), 0xffffff, 85, 4.75, 29.0, 0, 0, PI / 2, 0.01, 7.4, 0.01);
  dress(w, { x0: 77, z0: 24, x1: 93, z1: 40, door: { side: 's', a: 83, b: 87 }, winW: 3.2 }, { s: [], e: [], w: [] }, { seed: 1, y: 2.6 });
  w.lights.push({ x: 85, y: 3.6, z: 33, c: 0xfff1f8, i: 12, d: 13 });
}
// a rounded bistro chair: cushioned seat, hoop back, four slim splayed legs
function bistro(w, x, z, ry, c) { const T = w.tf(x, 0, z, ry); T.add('g', rcyl(0.24, 0.08, 0.035, 24), c, 0, 0.46, 0); T.add('x', torus(0.09, 24), 0x334155, 0, 0.46, 0, PI / 2, 0, 0, 0.24, 0.24, 0.3);
  for (let i = 0; i < 4; i++) { const a = i / 4 * PI * 2 + PI / 4; T.add('x', cyl(8), 0x334155, Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17, Math.sin(a) * 0.08, 0, -Math.cos(a) * 0.08, 0.018, 0.47, 0.018); }
  T.add('x', torus(0.06, 24, PI), 0x334155, 0, 0.62, -0.2, 0, 0, 0, 0.22, 0.32, 0.22); T.add('g', rbox(0.38, 0.2, 0.05, 0.025), c, 0, 0.82, -0.21); T.solid(-0.25, 0, -0.27, 0.25, 0.55, 0.25, { cam: false }); }
// ---------------- GOUDA BYTE CAFE
function cafe(w) { w.region = 'r_cafe'; const I = w.I;
  // counter + cheese-a-ccino machine + pastry case + register; menu board on the back wall
  { const T = w.tf(59, F, 64.0, PI); T.slab('m', 0xb45309, 0, 0, 0, 8.0, 1.0, 0.8, 0.08); T.box('g', 0xffffff, 0, 1.0, 0, 8.2, 0.08, 1.0, 0.03); for (let i = 0; i < 8; i++) T.box('m', i % 2 ? 0xd97706 : 0xf59e0b, -3.5 + i, 0.1, -0.41, 0.9, 0.8, 0.02, 0.03);
    T.box('x', 0xd1d5db, 1.8, 1.08, 0.0, 1.1, 0.8, 0.6, 0.08); T.box('g', CHEESE, 1.8, 1.88, 0.0, 1.16, 0.12, 0.66, 0.04); [-1, 1].forEach((s) => { T.add('x', cyl(10), 0x94a3b8, 1.8 + s * 0.25, 1.2, -0.35, 0, 0, 0, 0.04, 0.2, 0.04); T.add('g', rcyl(0.08, 0.12, 0.02, 12), 0xffffff, 1.8 + s * 0.25, 1.08, -0.38); }); T.add('l', sph(8), 0x4ade80, 1.5, 1.6, -0.32, 0, 0, 0, 0.05, 0.05, 0.03, 0.8);
    T.box('e', 0xe0f7ff, -1.6, 1.08, 0, 1.8, 0.7, 0.7, 0.06); for (let k = 0; k < 2; k++) for (let i = 0; i < 4; i++) { const p = T.P(-2.3 + i * 0.45, 1.16 + k * 0.32, 0); w.add('g', rcyl(0.11, 0.1, 0.03, 14), pick([0xf3c58b, 0xe8b06a]), p[0], p[1], p[2]); w.add('g', sph(10), pick([CHEESE, PINK, 0xfef3c7, 0x8b5a2b]), p[0], p[1] + 0.12, p[2], 0, 0, 0, 0.11, 0.08, 0.11); }
    T.box('g', NAVY, -3.3, 1.08, 0.05, 0.6, 0.35, 0.45, 0.06); T.box('l', 0x4ade80, -3.3, 1.3, -0.2, 0.42, 0.14, 0.02, 0.01, 0.4); for (let i = 0; i < 6; i++) T.add('g', rcyl(0.06, 0.14, 0.02, 12), pick([0xffffff, PINK, TEAL]), 0.2 + (i % 3) * 0.16, 1.08, 0.2 + ((i / 3) | 0) * 0.15); }
  { const T = w.tf(59.5, 2.2, 66.62, PI); T.box('m', 0x1f2937, 0, 0, 0, 5.4, 1.8, 0.08, 0.05); T.box('m', 0x8b5a2b, 0, -0.06, -0.02, 5.6, 1.92, 0.04, 0.05); sign3d(w, 'MENU', 59.5, 3.55, 66.5, PI, 0.18, CHEESE, null);
    ['CHEESE-A-CCINO', 'BRIE SMOOTHIE', 'GOUDA LATTE', 'SCIENCE SHAKE'].forEach((t, i) => sign3d(w, t, 59.5 - 1.1 + (i % 2) * 2.2, 3.1 - ((i / 2) | 0) * 0.55, 66.52, PI, 0.1, 0xffffff, null)); }
  for (let i = 0; i < 4; i++) { w.add('g', rcyl(0.38, 0.32, 0.08, 24), CHEESE, 55.2 + i * 0.9, 1.6 + F, 66.4 - 0.25); w.add('m', cyl(20), 0xe9a92a, 55.2 + i * 0.9, 1.6 + F + 0.16, 66.15, 0, 0, 0, 0.385, 0.06, 0.385); } w.add('m', rbox(4.0, 0.08, 0.6, 0.02), 0x9a6a3e, 56.6, 1.6, 66.35);
  I({ kind: 'rmg', id: 'cafe', x: 62.9, y: F, z: 62.6, r: 1.4, label: '🧀 Be the BARISTA at the Gouda Byte Cafe' });
  // tables + chairs; the fondue fountain; cups and plates
  const tbl = (x, z, c) => { K.tableR(w, x, z, 0.62, 0.8, 0xffffff, 0x334155); w.add('g', torus(0.1, 40), c, x, 0.75, z, PI / 2, 0, 0, 0.62, 0.62, 0.45); [0, 1, 2].forEach((k) => { const a = k / 3 * PI * 2 + 0.4; bistro(w, x + Math.cos(a) * 1.0, z + Math.sin(a) * 1.0, Math.atan2(-Math.cos(a), -Math.sin(a)), c); }); w.add('g', rcyl(0.07, 0.12, 0.02, 12), 0xffffff, x + 0.2, 0.82, z); w.add('g', rcyl(0.14, 0.02, 0.01, 16), 0xffffff, x - 0.15, 0.82, z + 0.1); w.add('g', wedge(), CHEESE, x - 0.15, 0.86, z + 0.1, 0, 0.6, 0, 0.07); };
  tbl(57.4, 57.4, PINK); tbl(62.4, 56.2, TEAL); tbl(57.2, 61.6, 0xff8a3d);
  { const x = 61.6, z = 60.2; K.tableR(w, x, z, 0.7, 0.8, 0xffffff, 0x334155); for (let i = 0; i < 3; i++) w.add('x', lathe([[0, 0], [0.32 - i * 0.08, 0.02], [0.3 - i * 0.08, 0.08], [0.05, 0.1], [0.05, 0.28], [0, 0.28]], 24, 'fnd' + i), 0xd1d5db, x, 0.8 + i * 0.26, z); for (let i = 0; i < 3; i++) w.add('l', rcyl(0.28 - i * 0.08, 0.05, 0.02, 24), CHEESE, x, 0.86 + i * 0.26, z, 0, 0, 0, 1, 1, 1, 0.3); for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2; w.add('m', cyl(6), 0xd6b88a, x + Math.cos(a) * 0.45, 0.85, z + Math.sin(a) * 0.45, 0.6 * Math.sin(a), 0, -0.6 * Math.cos(a), 0.01, 0.3, 0.01); w.add('m', rbox(0.08, 0.08, 0.08, 0.02), 0xf3c58b, x + Math.cos(a) * 0.55, 1.1, z + Math.sin(a) * 0.55); } }
  // Torty's sun-lamp corner: warm sand, lettuce plate, glowing lamp
  { const x = 64.6, z = 61.8; w.add('m', blobGeo(5, 0.15, 2), 0xf3d9a4, x, F - 0.08, z, 0, 0, 0, 1.3, 0.12, 1.1); w.add('x', cyl(8), 0x334155, x + 0.9, F, z + 1.0, 0, 0, 0, 0.04, 2.2, 0.04); w.add('x', tube([[x + 0.9, 2.2, z + 1.0], [x + 0.9, 2.5, z + 0.7], [x + 0.5, 2.3, z + 0.3]], 0.04, 10, 6), 0x334155, 0, 0, 0); w.add('g', cone(16), 0xff8a3d, x + 0.45, 2.15, z + 0.25, 0.6, 0, 0, 0.3, 0.3, 0.3); w.add('l', sph(10), 0xffe08a, x + 0.4, 2.02, z + 0.2, 0, 0, 0, 0.16, 0.12, 0.16, 0.8); w.lights.push({ x: x, y: 1.8, z, c: 0xffc96b, i: 8, d: 6 });
    w.add('g', rcyl(0.22, 0.03, 0.01, 18), 0xffffff, x - 0.6, F + 0.02, z - 0.5); for (let k = 0; k < 4; k++) w.add('g', sph(10), 0x86efac, x - 0.6 + Math.cos(k) * 0.08, F + 0.07, z - 0.5 + Math.sin(k) * 0.08, 0, 0, 0, 0.1, 0.04, 0.08); sign3d(w, 'TORTY\'S SPOT', 65.6, 1.6, 64.0, -PI / 2, 0.09, 0xff8a3d, 0xffffff); }
  // clue: the instruction card under table three (+ the sweep marks)
  { w.add('m', rbox(0.3, 0.01, 0.2, 0.005), 0xffffff, 57.0, F + 0.01, 62.4, 0, 0.4, 0); for (let i = 0; i < 8; i++) w.add('m', rbox(0.6, 0.004, 0.05, 0.002), 0xfde68a, 54.5 + i * 0.8, F + 0.008, 59.5 + Math.sin(i) * 0.3, 0, 0.2 * i, 0);
    I({ kind: 'rclue', id: 'cafe', x: 57.0, y: F, z: 62.8, r: 1.0, label: '🔍 Something under table three…' }); }
  for (let i = 0; i < 3; i++) pendant(w, 56.4 + i * 3.2, 4.8, 58.8, [PINK, CHEESE, TEAL][i]);
  K.plant(w, 53.9, 54.2, 1.1); K.plant(w, 65.1, 54.2, 1.1); K.plant(w, 53.9, 66.0, 1.0); K.hh('lamp', w, 53.9, 60.0, 0.14, 0, 16, 0xffe4b5);
  w.add('x', torus(0.05, 24), 0xd4a017, 53.4, 2.6, 57.6, 0, PI / 2, 0, 0.5); w.add('g', wedge(), CHEESE, 53.42, 2.55, 57.6, 0, PI / 2, PI / 2, 0.25); w.add('x', torus(0.05, 24), 0xd4a017, 53.4, 2.6, 62.4, 0, PI / 2, 0, 0.5); ratHead(w, 53.45, 2.6, 62.4, PI / 2, 0.45);
  gearAt(w, 55.6, 1.6 + F + 0.75, 66.2);
  dress(w, { x0: 53, z0: 53, x1: 66, z1: 67, door: { side: 'n', a: 58, b: 61 } }, { n: [], e: [[60.8, 63]], w: [[57, 58.2], [62, 63]] }, { seed: 2, frame: 0x8b5a2b, cols: [CHEESE, 0xff8a3d, PINK, 0xfef3c7] });
  w.lights.push({ x: 59.5, y: 3.6, z: 59, c: 0xffe8c2, i: 12, d: 12 });
}
// ---------------- R&D WORKSHOP
function workshop(w) { w.region = 'r_work'; const I = w.I;
  const bench = (x, z, ry, L = 3.2) => { const T = w.tf(x, F, z, ry); T.slab('m', 0xb07a45, 0, 0.82, 0, L, 0.12, 1.0, 0.04); T.box('x', 0x64748b, 0, 0, 0, L - 0.2, 0.82, 0.9, 0.04); for (let i = 0; i < 3; i++) T.box('g', 0xef4444, -L / 2 + 0.6 + i * (L - 1.2) / 2, 0.15, 0.46, 0.7, 0.55, 0.02, 0.03);
    T.box('m', 0xd6b88a, 0, 0.94, -0.45, L, 1.4, 0.06, 0.02); for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) T.add('x', sph(4), 0x8b5a2b, -L / 2 + 0.2 + i * (L - 0.4) / 8, 1.1 + j * 0.35, -0.41, 0, 0, 0, 0.012);
    T.add('x', rbox(0.06, 0.45, 0.04, 0.02), 0x94a3b8, -0.8, 1.6, -0.39, 0, 0, 0.3); T.add('g', rbox(0.18, 0.1, 0.06, 0.03), 0xef4444, -0.75, 1.82, -0.39); T.add('x', capsule(8), 0x94a3b8, -0.3, 1.55, -0.39, 0, 0, 0, 0.03, 0.35, 0.03); T.add('g', capsule(8), CHEESE, -0.3, 1.32, -0.39, 0, 0, 0, 0.05, 0.12, 0.05);
    T.add('x', torus(0.25, 16), 0x94a3b8, 0.3, 1.6, -0.39, 0, 0, 0, 0.12); T.add('x', rbox(0.04, 0.3, 0.03, 0.01), 0x94a3b8, 0.3, 1.38, -0.39); T.add('g', rbox(0.5, 0.12, 0.04, 0.02), TEAL, 0.9, 1.5, -0.39); T.add('x', rbox(0.06, 0.4, 0.03, 0.02), 0x64748b, 0.9, 1.25, -0.39);
    for (let i = 0; i < 6; i++) T.add(i % 2 ? 'x' : 'g', [sph(8), capsule(8), gear(6)][i % 3], i % 2 ? 0xd1d5db : pick(BR), -L / 2 + 0.4 + R() * (L - 0.8), 0.98, -0.1 + R() * 0.4, 0, R() * 3, 0, 0.08, 0.08, 0.08); return T; };
  bench(70.0, 57.0, PI / 2); bench(70.0, 61.0, PI / 2); bench(81.0, 57.0, -PI / 2); bench(81.0, 61.0, -PI / 2);
  // Pi-rat's own bench with the log book (clue) + pirate flag
  { const T = bench(72.8, 66.2, PI, 3.4); T.add('m', rbox(0.5, 0.06, 0.38, 0.02), 0x7c2d12, 0.4, 0.97, 0.1); T.add('m', rbox(0.46, 0.02, 0.34, 0.01), 0xfff7ed, 0.4, 1.01, 0.1); w.add('x', cyl(8), 0x8b5a2b, 70.4, F, 66.3, 0, 0, 0, 0.04, 2.6, 0.04); w.add('f', rbox(0.9, 0.6, 0.03, 0.02), 0x111827, 70.85, 2.3, 66.3); w.add('g', sph(10), 0xffffff, 70.85, 2.35, 66.28, 0, 0, 0, 0.12, 0.13, 0.03); w.add('g', wedge(), CHEESE, 71.05, 2.1, 66.28, 0, 0, PI / 2, 0.08);
    I({ kind: 'rclue', id: 'work', x: 72.4, y: F, z: 64.8, r: 1.4, label: '📓 Read Pi-rat\'s workbench log' }); }
  // the test stand: a half-built robot dog with glowing eyes + the Circuit Fixer control panel
  { const x = 75.5, z = 61.0; w.add('x', rcyl(1.3, 0.25, 0.06, 32), 0x475569, x, F, z); w.add('l', rcyl(1.2, 0.03, 0.01, 32), TEAL, x, F + 0.26, z, 0, 0, 0, 1, 1, 1, 0.4); w.solid(x - 1.25, 0, z - 1.25, x + 1.25, 0.3, z + 1.25, { cam: false });
    const T = w.tf(x, F + 0.3, z, PI); T.add('g', capsule(20), 0xe5e7eb, 0, 0.95, 0, PI / 2, 0, 0, 0.42, 0.9, 0.42); T.add('g', rbox(0.7, 0.1, 1.2, 0.05), PINK, 0, 1.38, 0); [-1, 1].forEach((s) => [-1, 1].forEach((t) => { T.add('x', cyl(12), 0x94a3b8, s * 0.3, 0.3, t * 0.45, 0, 0, 0, 0.08, 0.6, 0.08); T.add('g', sph(12), 0x475569, s * 0.3, 0.62, t * 0.45, 0, 0, 0, 0.12); T.add('g', rbox(0.2, 0.08, 0.28, 0.04), 0x334155, s * 0.3, 0, t * 0.45 + 0.05); }));
    T.add('g', sph(20), 0xe5e7eb, 0, 1.45, 0.75, 0, 0, 0, 0.36, 0.32, 0.36); T.add('g', capsule(12), 0xd1d5db, 0, 1.38, 1.08, PI / 2, 0, 0, 0.14, 0.16, 0.14); [-1, 1].forEach((s) => { T.add('l', sph(10), 0x22d3ee, s * 0.14, 1.52, 1.06, 0, 0, 0, 0.07, 0.07, 0.04, 0.9); T.add('g', cone(12), 0x94a3b8, s * 0.22, 1.78, 0.7, 0, 0, s * -0.3, 0.1, 0.25, 0.06); });
    T.add('x', capsule(8), 0x94a3b8, 0, 1.3, -0.95, -0.9, 0, 0, 0.04, 0.3, 0.04); for (let i = 0; i < 4; i++) T.add('x', tube([[0.1 * i - 0.15, 1.1, -0.2], [0.1 * i - 0.1, 0.7, -0.6 + i * 0.1], [0.1 * i - 0.2, 0.05, -1.2]], 0.02, 10, 5), [0xef4444, 0x3b82f6, 0xfacc15, 0x22c55e][i], 0, 0, 0);
    { const P = w.tf(78.4, F, 62.2, -PI / 2 - 0.4); P.slab('x', 0x334155, 0, 0, 0, 0.9, 1.0, 0.6, 0.06); P.add('g', rbox(0.95, 0.12, 0.7, 0.04), 0x1e293b, 0, 1.06, 0.05, -0.45, 0, 0); [[0xef4444, -0.22, 0.1], [0x3b82f6, 0.22, 0.1], [0xfacc15, -0.22, -0.12], [0x22c55e, 0.22, -0.12]].forEach(([c, a, b]) => P.add('l', rcyl(0.09, 0.05, 0.02, 16), c, a, 1.15 + b * 0.4, 0.1 - b * 0.9 + 0.02, -0.45, 0, 0, 1, 1, 1, 0.5)); sign3d(w, 'CIRCUIT FIXER', ...[P.P(0, 0, 0.32)[0]], F + 0.62, P.P(0, 0, 0.32)[2], P.ry, 0.07, CHEESE, null); }
    I({ kind: 'rmg', id: 'circuit', x: 78.0, y: F, z: 61.5, r: 1.4, label: '🔧 Play CIRCUIT FIXER' }); }
  // robot arm (full), conveyor with parts, crates, tyre stack, rolling tool chest, welding corner
  { const x = 79.4, z = 64.8; w.add('x', rcyl(0.5, 0.3, 0.06, 24), 0x475569, x, F, z); w.add('g', rcyl(0.3, 0.3, 0.06, 20), 0xff8a3d, x, F + 0.3, z); w.add('g', capsule(12), 0xff8a3d, x, F + 1.1, z - 0.2, -0.35, 0, 0, 0.16, 0.7, 0.16); w.add('g', sph(14), 0x334155, x, F + 1.75, z - 0.45, 0, 0, 0, 0.2); w.add('g', capsule(12), 0xff8a3d, x, F + 1.9, z - 0.95, 1.1, 0, 0, 0.13, 0.5, 0.13); [-1, 1].forEach((s) => w.add('x', rbox(0.05, 0.25, 0.08, 0.02), 0xd1d5db, x + s * 0.08, F + 1.85, z - 1.4)); w.solid(x - 0.5, 0, z - 0.5, x + 0.5, 1.6, z + 0.5); }
  K.conveyor(w, 75.5, 66.0 - 0.0, 0, 3.6); for (let i = 0; i < 4; i++) w.add('x', gear(8), [CHEESE, 0xd1d5db, PINK, TEAL][i], 74.2 + i * 0.9, 0.86, 66.0, PI / 2, 0, 0, 0.18, 0.18, 0.1);
  K.crate(w, 81.0, 0, 54.4, 1.0); K.crate(w, 80.9, 1.0, 54.4, 0.8); K.crate(w, 79.8, 0, 54.2, 0.9, 0xc58b52); gearAt(w, 80.9, 2.25, 54.4);
  for (let k = 0; k < 4; k++) w.add('m', torus(0.4, 20), 0x111827, 70.2, F + 0.18 + k * 0.32, 54.6, PI / 2, 0, 0, 0.5, 0.5, 0.6); w.solid(69.6, 0, 54.0, 70.8, 1.4, 55.2, { cam: false });
  { const T = w.tf(72.0, F, 54.2, 0); T.slab('g', 0xef4444, 0, 0.12, 0, 1.4, 1.1, 0.6, 0.06); for (let k = 0; k < 4; k++) T.box('x', 0xd1d5db, 0, 0.3 + k * 0.25, 0.31, 1.2, 0.03, 0.02, 0.01); [-1, 1].forEach((s) => T.add('m', torus(0.4, 12), 0x111827, s * 0.55, 0.08, 0.2, 0, PI / 2, 0, 0.08, 0.08, 0.1)); }
  { const x = 81.0, z = 59.0; w.add('g', rbox(0.9, 1.6, 0.6, 0.08), 0x1f2937, x - 0.0, F + 0.8, z + 0.0); w.add('l', sph(10), 0x93c5fd, x - 0.5, F + 1.0, z, 0, 0, 0, 0.12, 0.12, 0.12, 1.2); w.lights.push({ x: x - 0.6, y: 1.2, z, c: 0x93c5fd, i: 6, d: 4 }); }
  // Sweepy's spare parts + blueprint table
  { const T = w.tf(73.0, F, 58.0, 0.2); T.slab('m', 0xffffff, 0, 0.82, 0, 1.6, 0.06, 1.0, 0.02); for (let k = 0; k < 4; k++) T.add('x', cyl(8), 0x94a3b8, (k % 2 ? 0.7 : -0.7), 0, (k < 2 ? 0.4 : -0.4), 0, 0, 0, 0.04, 0.82, 0.04); T.add('g', rbox(1.4, 0.01, 0.8, 0.005), 0x3b82f6, 0, 0.89, 0); for (let k = 0; k < 4; k++) T.add('l', rbox(1.0 - k * 0.2, 0.004, 0.02, 0.002), 0xffffff, 0, 0.9, -0.25 + k * 0.15, 0, 0, 0, 1, 1, 1, 0.1); T.add('g', rcyl(0.25, 0.1, 0.04, 20), 0xa9afbd, 0.4, 0.88, 0.2); }
  // half-built hover-car on a lift
  { const T = w.tf(71.0, F, 61.8 - 3.2 + 0.0, 0); }
  K.hazard(w, 75.5, 61.0, 3.4, 3.4, 0); K.pipes(w, 'z', 81.6, 53.6, 66.4, 5.0, [0xff8a3d, 0x3b82f6]);
  // ceiling: a drone flock + a gantry crane with a hook; floor: oil drums, traffic cones, a tool trolley
  drone(w, 72.5, 4.3, 59.5, PINK, 5.6); drone(w, 78.5, 4.4, 59.5, CHEESE, 5.6); blimp(w, 75.5, 4.8, 65.2, TEAL, 5.6);
  w.add('x', rbox(12.6, 0.25, 0.3, 0.05), CHEESE, 75.5, 5.3, 63.8); { const x = 77.2; w.add('x', rbox(0.5, 0.35, 0.5, 0.06), 0x334155, x, 5.05, 63.8); w.add('x', cyl(4), 0x111827, x, 4.3, 63.8, 0, 0, 0, 0.01, 0.75, 0.01); w.add('x', torus(0.05, 16, PI * 1.4), 0x94a3b8, x, 3.45, 63.8, 0, 0, PI / 2, 0.14); }
  [[81.0, 65.8, 0x3b82f6], [80.2, 66.0, 0xef4444]].forEach(([x, z, c]) => { w.add('g', rcyl(0.32, 0.95, 0.04, 20), c, x, F, z); [0.2, 0.75].forEach((h) => w.add('x', torus(0.03, 20), 0xd1d5db, x, F + h, z, PI / 2, 0, 0, 0.33, 0.33, 0.33)); w.solid(x - 0.32, 0, z - 0.32, x + 0.32, 1.0, z + 0.32, { cam: false }); });
  [[73.2, 55.2], [77.8, 55.2], [72.0, 60.0]].forEach(([x, z]) => { w.add('g', cone(14), 0xff8a3d, x, F + 0.03, z, 0, 0, 0, 0.18, 0.5, 0.18); w.add('m', rbox(0.42, 0.04, 0.42, 0.02), 0x111827, x, F + 0.02, z); w.add('m', torus(0.06, 14), 0xffffff, x, F + 0.28, z, PI / 2, 0, 0, 0.12, 0.12, 0.12); });
  { const T = w.tf(79.0, F, 55.4, 0.3); T.slab('g', 0xef4444, 0, 0.1, 0, 0.9, 0.9, 0.5, 0.06); T.box('x', 0x94a3b8, 0, 1.0, 0, 0.95, 0.04, 0.55, 0.02); for (let i = 0; i < 4; i++) T.add('x', [capsule(8), torus(0.2, 12), rbox(0.3, 0.06, 0.08, 0.02), cyl(8)][i], [0x94a3b8, 0xd1d5db, CHEESE, 0x64748b][i], -0.3 + i * 0.2, 1.08, 0, PI / 2, 0, 0, 0.06, 0.06, 0.06); [-1, 1].forEach((k) => [-1, 1].forEach((j) => T.add('m', sph(8), 0x111827, k * 0.38, 0.05, j * 0.2, 0, 0, 0, 0.06))); T.solid(-0.45, 0, -0.25, 0.45, 1.1, 0.25, { cam: false }); }
  dress(w, { x0: 69, z0: 53, x1: 82, z1: 67, door: { side: 'n', a: 73.5, b: 77.5 } }, { n: [[69, 73]], s: [[70, 75]], e: [], w: [] }, { seed: 3, y: 3.1, frame: 0xff8a3d, cols: [0x3b82f6, 0xffffff, CHEESE, 0x334155], shelfCol: 0x64748b });
  w.lights.push({ x: 75.5, y: 4, z: 60, c: 0xf0f9ff, i: 14, d: 13 });
}
// ---------------- MUSEUM OF INVENTIONS
function museum(w) { w.region = 'r_museum'; const I = w.I;
  K.rug(w, 91.5, 59.0, 0, 2.6, 11.0, 0x7c3aed, 0xa78bfa);
  const ped = (x, z, put, txt, msgs) => { w.add('g', lathe([[0, 0], [0.65, 0], [0.65, 0.12], [0.5, 0.25], [0.48, 0.9], [0.62, 1.0], [0.62, 1.1], [0, 1.1]], 24, 'mped'), 0xffffff, x, F, z); put(x, F + 1.1, z); w.solid(x - 0.6, F, z - 0.6, x + 0.6, F + 1.1, z + 0.6); plaque(w, x + (x < 91.5 ? 1.0 : -1.0), z + 0.4, x < 91.5 ? PI / 2 - 0.5 : -PI / 2 + 0.5, txt);
    I({ kind: 'fun', id: 'mx' + txt, x: x + (x < 91.5 ? 1.2 : -1.2), y: F, z, r: 1.3, label: '🏛️ Read about the ' + txt.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase()), sfx: 'check', msgs }); };
  ped(86.8, 55.4, (x, y, z) => { w.add('x', rcyl(0.5, 0.08, 0.02, 32), 0x94a3b8, x, y, z); w.add('l', torus(0.06, 40), TEAL, x, y + 0.7, z, 0, 0, 0, 0.5, 0.5, 0.5, 0.6); w.add('x', torus(0.1, 40), 0xd4a017, x, y + 0.7, z, 0, 0, 0, 0.6, 0.6, 0.6); w.add('e', sph(16), 0xa5f3fc, x, y + 0.7, z, 0, 0, 0, 0.4, 0.4, 0.08); }, 'TIME JUMPER',
    ['🌀 The TIME JUMPER (model). The real one lives in the Grok Arcade and lets you play games before they\'re finished!', '🌀 Fun fact: it misfires about 1 in 4 jumps. Luna calls that "a feature".']);
  ped(86.8, 59.4, (x, y, z) => { w.add('x', rcyl(0.25, 0.12, 0.03, 18), 0x475569, x, y, z); w.add('g', capsule(14), CHEESE, x, y + 0.42, z, 0.9, 0, 0, 0.18, 0.55, 0.18); w.add('x', torus(0.1, 20), 0x475569, x, y + 0.3, z - 0.2, 0.9, 0, 0, 0.2); w.add('g', wedge(), 0xffd23f, x, y + 0.75, z + 0.38, 0, 0, 0, 0.12); }, 'CHEESE CANNON',
    ['🧀 The CHEESE CANNON. Fires cheese wheels at 40 km/h. Used only for science. And one lunch fight.', '🧀 Pi-rat\'s first invention. He built it in a single afternoon. Then spent a week cleaning the ceiling.']);
  ped(86.8, 63.4, (x, y, z) => { const T = w.tf(x, y, z, 0.6, 0.35); T.add('g', capsule(16), PINK, 0, 0.5, 0, PI / 2, 0, 0, 0.7, 1.4, 0.7); T.add('e', sph(16), 0xbfe9ff, 0, 0.9, 0.3, 0, 0, 0, 0.5, 0.35, 0.6); [-1, 1].forEach((s) => T.add('l', rcyl(0.3, 0.1, 0.03, 16), TEAL, s * 0.7, 0.25, 0, 0, 0, 0, 1, 1, 1, 0.5)); }, 'HOVER CAR',
    ['🚗 The RATITA HOVER-CAR, scale model. The full-size one is in Grok Rides. Beep beep, whoosh!', '🚗 It floats on cushions of air and good vibes.']);
  ped(96.2, 55.4, (x, y, z) => { w.add('x', cyl(10), 0x94a3b8, x, y, z, 0, 0, 0, 0.03, 0.3, 0.03); w.add('g', rcyl(0.3, 0.12, 0.05, 24), 0xa9afbd, x, y + 0.3, z); w.add('g', sph(12), 0x334155, x, y + 0.46, z, 0, 0, 0, 0.15, 0.08, 0.15); w.add('l', sph(8), 0xef4444, x + 0.2, y + 0.38, z + 0.2, 0, 0, 0, 0.04, 0.04, 0.04, 0.8); }, 'ROBO SWEEPY',
    ['🧹 ROBO SWEEPY (version 1). Cleans everything. EVERYTHING. Please keep shiny things out of reach.', '🧹 Version 2 is out on duty somewhere in Ratita Row. Keep an eye out!']);
  ped(96.2, 59.4, (x, y, z) => { w.add('x', rcyl(0.38, 0.32, 0.08, 28), 0xffc83d, x, y, z); w.add('x', cyl(20), 0xd4a017, x, y + 0.16, z, 0, 0, 0, 0.385, 0.06, 0.385); w.add('l', sph(8), 0xffffff, x + 0.2, y + 0.3, z + 0.2, 0, 0, 0, 0.05, 0.05, 0.05, 0.8); }, 'GOLDEN GOUDA',
    ['🏆 The GOLDEN GOUDA (replica). The real one is at Ratita HQ, guarded by Dr. Brie. And Rocco. And a very loud alarm.', '🏆 It was stolen once! The case was solved by a very clever detective.']);
  ped(96.2, 63.4, (x, y, z) => { w.add('g', rbox(0.6, 0.05, 0.4, 0.02), 0xffffff, x, y, z); for (let k = 0; k < 4; k++) w.add('g', capsule(10), [0xff8fc8, 0xfef3c7, 0x93c5fd, 0x86efac][k], x - 0.22 + k * 0.15, y + 0.12, z, 0, 0, 0, 0.05, 0.12, 0.05); w.add('g', sph(12), 0xffffff, x, y + 0.3, z - 0.1, 0, 0, 0, 0.14); }, 'SQUEAK PROOF SOCKS',
    ['🧦 SQUEAK-PROOF SOCKS. Sneak past any sleeping dog! (Tested on Officer Gouda. He still woke up. Snacks were involved.)', '🧦 Available in four flavours. Wait, colours. Four colours.']);
  // the big rocket in the back corner (reaches the ceiling)
  { const x = 96.2, z = 66.0 - 0.4; w.add('g', lathe([[0, 0], [0.55, 0], [0.62, 0.5], [0.62, 3.2], [0.45, 4.2], [0.18, 4.8], [0, 5.0]], 32, 'rkt'), 0xffffff, x - 2.0, F + 0.2, z - 0.2); w.add('g', rcyl(0.64, 0.3, 0.05, 32), PINK, x - 2.0, F + 2.4, z - 0.2); for (let k = 0; k < 3; k++) { const a = k / 3 * PI * 2; w.add('g', rbox(0.08, 1.0, 0.6, 0.04), PINK, x - 2.0 + Math.cos(a) * 0.6, F + 0.6, z - 0.2 + Math.sin(a) * 0.6, 0, -a, 0); } w.add('e', sph(14), 0x7dd3fc, x - 2.0, F + 3.4, z + 0.36, 0, 0, 0, 0.22, 0.22, 0.08); w.add('x', rcyl(0.9, 0.2, 0.05, 28), 0x94a3b8, x - 2.0, F, z - 0.2); w.solid(x - 2.9, F, z - 1.1, x - 1.1, F + 5.2, z + 0.7); gearAt(w, x - 2.6, 1.9, z + 0.9);
    plaque(w, x - 3.4, z - 0.5, PI / 2, 'RATITA ROCKET'); I({ kind: 'fun', id: 'mrocket', x: x - 3.4, y: F, z: z - 0.8, r: 1.4, label: '🚀 Read about the Ratita Rocket', sfx: 'check', msgs: ['🚀 The RATITA ROCKET. It went to the moon once! Well, the moon-shaped bounce castle at Luna\'s birthday.', '🚀 Snowie painted the pink stripe. She wanted it to be ALL pink. Luna said "one stripe". They compromised: one BIG stripe.'] }); }
  // timeline wall with framed pictures (raised 3D frames), benches, velvet ropes
  for (let i = 0; i < 5; i++) { const x = 86.4 + i * 2.6; w.add('g', rbox(1.6, 1.1, 0.1, 0.04), 0xd4a017, x, 3.0, 66.62); w.add('m', rbox(1.4, 0.9, 0.04, 0.02), [0xbfdbfe, 0xfbcfe8, 0xfde68a, 0xbbf7d0, 0xddd6fe][i], x, 3.0, 66.56); w.add('g', [star(), heart(), wedge(), gear(8), sph(10)][i], [CHEESE, PINK, 0xffc83d, 0x94a3b8, TEAL][i], x, 3.0, 66.5, 0, 0, 0, 0.25, 0.25, 0.08); sign3d(w, ['2019', '2021', '2023', '2025', '2026'][i], x, 2.25, 66.55, PI, 0.08, NAVY, null); }
  sign3d(w, 'A HISTORY OF RATITA INDUSTRIES', 91.5, 3.95, 66.58, PI, 0.13, 0x7c3aed, null);
  K.bench(w, 91.5, 64.6, PI, 0x7c3aed);
  [[89.6, 57.4], [93.4, 57.4], [93.4, 63.4], [89.6, 63.4]].forEach(([a, b]) => { w.add('x', rcyl(0.15, 0.05, 0.02, 14), 0xd4a017, a, F, b); w.add('x', cyl(8), 0xd4a017, a, F, b, 0, 0, 0, 0.035, 0.9, 0.035); w.add('x', sph(8), 0xd4a017, a, F + 0.93, b, 0, 0, 0, 0.06); });
  [[[89.6, 57.4], [93.4, 57.4]], [[93.4, 57.4], [93.4, 63.4]], [[89.6, 63.4], [89.6, 57.4]]].forEach(([p, q]) => w.add('f', tube([[p[0], F + 0.85, p[1]], [(p[0] + q[0]) / 2, F + 0.6, (p[1] + q[1]) / 2], [q[0], F + 0.85, q[1]]], 0.035, 12, 6), 0x7c3aed, 0, 0, 0));
  // the centre pedestal: waits for the Pup-Translator (the game places it once the mystery is solved)
  { const x = 91.5, z = 60.4; w.add('g', lathe([[0, 0], [0.8, 0], [0.8, 0.15], [0.6, 0.3], [0.55, 1.0], [0.75, 1.1], [0.75, 1.25], [0, 1.25]], 28, 'mped2'), 0xffffff, x, F, z); w.add('f', rcyl(0.6, 0.05, 0.02, 24), 0x7c3aed, x, F + 1.25, z); w.add('e', lathe([[0.62, 0], [0.63, 0.4], [0.5, 0.8], [0.26, 0.98], [0, 1.02]], 28, 'mdome'), 0xe0f7ff, x, F + 1.3, z); w.solid(x - 0.75, F, z - 0.75, x + 0.75, F + 2.3, z + 0.75);
    sign3d(w, 'PUP-TRANSLATOR', x, F + 0.55, z - 0.82, PI, 0.08, 0x7c3aed, 0xffffff); w.rowSpots.museumPed = [x, F + 1.35, z]; }
  K.plant(w, 85.9, 54.0, 1.2);
  for (let i = 0; i < 3; i++) { const x = 87.6 + i * 3.9; w.add('l', rbox(1.6, 0.06, 0.3, 0.03), 0xfff1dc, x, 5.5, 60, 0, 0, 0, 1, 1, 1, 0.5); }
  // flying-machine models hung from the ceiling + a big gear sculpture
  blimp(w, 88.2, 4.4, 58.0, PINK, 5.6, 0.4); blimp(w, 95.0, 4.5, 61.5, TEAL, 5.6, -0.6); drone(w, 91.5, 4.6, 63.6, CHEESE, 5.6);
  { const x = 97.2, z = 54.0; w.add('x', rcyl(0.5, 0.2, 0.05, 24), 0xffffff, x, F, z); w.add('x', gear(10), 0xd4a017, x, F + 1.2, z, 0, -0.6, 0, 0.7, 0.7, 0.22); w.add('x', gear(8), 0x94a3b8, x - 0.5, F + 1.85, z + 0.3, 0, -0.6, 0.4, 0.45, 0.45, 0.2); w.solid(x - 0.5, 0, z - 0.5, x + 0.5, 2.2, z + 0.5, { cam: false }); }
  dress(w, { x0: 85, z0: 53, x1: 98, z1: 67, door: { side: 'n', a: 89.5, b: 93.5 }, winW: 1.8 }, { n: [], e: [[64, 67]], w: [] }, { seed: 4, y: 2.9, frame: 0xd4a017, shelf: false, cols: [0xddd6fe, 0xfbcfe8, 0xbfdbfe, 0xfde68a] });
  w.lights.push({ x: 91.5, y: 4, z: 60, c: 0xf3e8ff, i: 14, d: 13 });
}
export { gearAt, ratHead, pendant, plaque, dress, drone, blimp, bistro, cake };
