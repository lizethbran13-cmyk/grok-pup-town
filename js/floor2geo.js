// RATITA HQ FLOOR 2 + ROOFTOP (free update for Ratita Super Expansion owners): built on top of the Branch Office.
// Floor 2 (y 6.4): elevator lobby + reception, corridor, Luna's branch manager office, the Gadget Testing Lab and the
// break room. Rooftop (y 11.2): Snowie's Sky Tours helipad, telescopes over Pup Town, garden, deck chairs, the rat logo.
// Everything is authored at floor level and lifted with w.oy, so every prop helper works unchanged.
import * as THREE from 'three';
import * as K from './kit.js?v=20261011r38e';
import { gearAt, ratHead, pendant, dress, drone, bistro, cake } from './row.js?v=20261011r38e';
const { sign3d, rbox, rcyl, lathe, sph, cyl, cone, torus, capsule, tube, star, heart, wedge, gear, tree, bush, pick, D, G } = K;
const PI = Math.PI, F = 0.05, PINK = 0xff4fa0, CHEESE = 0xffc93c, TEAL = 0x22d3ee, NAVY = 0x1e293b, BR = [0xff5d73, 0x4f9dff, 0x3ddc84, 0xffc93c, 0xa66bff, 0x2dd4bf, 0xff8a3d, 0xff6fcf];
export const F2Y = 6.4, F2H = 4.8, ROOFY = F2Y + F2H; // floor 2 base, storey height, roof deck
export const F2_REGIONS = [
  { id: 'r_f2', x0: 53, x1: 73, z0: 20, z1: 40, y0: 6.3, y1: ROOFY - 0.3, ceil: F2Y + 4.4, name: '🛗 Ratita HQ · Floor 2' },
  { id: 'r_roof', x0: 52.6, x1: 73.4, z0: 19.6, z1: 40.4, y0: ROOFY - 0.3, y1: 60, ceil: 60, name: '🚁 Ratita Rooftop', open: true },
];
export const ELEV = { g: [54.9, 0.1, 33, PI / 2], f2: [54.9, F2Y + 0.1, 33, PI / 2], roof: [57.5, ROOFY + 0.1, 33, PI / 2] };
export const PAD = [65.5, ROOFY, 30.4]; // helipad centre
// lift a block of building code by dy: props, colliders, interactions, lights and gears all follow
function at(w, dy, fn) { const i0 = w.inter.length, l0 = w.lights.length, g0 = w.rowGears.length; w.oy = dy; try { fn(); } finally { w.oy = 0; }
  for (let i = i0; i < w.inter.length; i++) w.inter[i].y = (w.inter[i].y || 0) + dy; for (let i = l0; i < w.lights.length; i++) w.lights[i].y += dy; for (let i = g0; i < w.rowGears.length; i++) w.rowGears[i][1] += dy; }
const frameArt = (w, x, y, z, ry, wd, ht, col, icon, frame = 0xd4a017) => { const T = w.tf(x, y, z, ry); T.add('g', rbox(wd + 0.16, ht + 0.16, 0.08, 0.04), frame, 0, 0, 0); T.add('m', rbox(wd, ht, 0.04, 0.02), col, 0, 0, 0.04); if (icon) T.add('g', icon, pick([PINK, CHEESE, 0xffffff, TEAL]), 0, 0, 0.09, 0, 0, 0, ht * 0.28, ht * 0.28, 0.07); };
const portrait = (w, x, y, z, ry, fur, bg) => { const T = w.tf(x, y, z, ry); T.add('g', rbox(0.9, 1.1, 0.08, 0.04), 0xd4a017, 0, 0, 0); T.add('m', rbox(0.74, 0.94, 0.04, 0.02), bg, 0, 0, 0.04); const p = T.P(0, -0.05, 0.1); ratHead(w, p[0], p[1], p[2], ry, 0.42, fur); };
// ------------------------------------------------------------------------------------------------ entry
export function buildFloor2(w) { w.f2GearStart = w.rowGears.length;
  w.region = 'row'; at(w, F2Y, () => exterior(w));
  w.region = 'r_f2'; at(w, F2Y, () => { inner(w); lobby(w); lunaOffice(w); lab(w); breakRoom(w); });
  w.region = 'row'; at(w, ROOFY, () => roofShell(w));
  w.region = 'r_roof'; at(w, ROOFY, () => roofProps(w));
  w.region = 'r_office'; elevatorFront(w, 53.36, F, 33.0, 'g');
  w.region = 'row'; haystack(w, 85.5, 8.0);
  w.region = 'row'; }
// an elevator front on a west wall (faces +x): steel frame, call panel, floor dial; the doors are the game's (they slide)
function elevatorFront(w, x, y, z, id) { const T = w.tf(x, y, z, PI / 2); T.box('x', 0xd1d5db, 0, 0, 0, 2.2, 3.1, 0.12, 0.04); T.box('g', PINK, 0, 3.1, 0.02, 2.4, 0.18, 0.16, 0.05);
  T.box('l', 0x111827, 0, 0.0, 0.04, 1.84, 2.84, 0.02, 0.01, 0); T.add('g', rbox(0.9, 0.34, 0.06, 0.08), NAVY, 0, 3.42, 0.06);
  ['1', '2', 'R'].forEach((t, i) => { const p = T.P(-0.28 + i * 0.28, 0, 0.1); sign3d(w, t, p[0], y + 3.36, p[2], PI / 2, 0.11, i === (id === 'g' ? 0 : id === 'f2' ? 1 : 2) ? CHEESE : 0x94a3b8, null); });
  { const p = T.P(1.35, 0, 0.08); w.add('g', rbox(0.06, 0.6, 0.26, 0.03), 0xe5e7eb, p[0], y + 1.25, p[2]); w.add('l', sph(10), CHEESE, p[0] + 0.04, y + 1.38, p[2], 0, 0, 0, 0.05, 0.05, 0.05, 0.8); w.add('l', sph(10), TEAL, p[0] + 0.04, y + 1.12, p[2], 0, 0, 0, 0.05, 0.05, 0.05, 0.8); }
  sign3d(w, id === 'g' ? 'TO FLOOR 2 + ROOF' : id === 'f2' ? 'FLOOR 2' : 'ROOFTOP', ...[T.P(0, 0, 0.1)[0]], y + 3.75, T.P(0, 0, 0.1)[2], PI / 2, 0.12, NAVY, null);
  w.I({ kind: 'relev', id, x: x + 1.15, y: id === 'g' ? 0 : 0, z, r: 1.5, label: '🛗 Call the elevator' }); }
// ------------------------------------------------------------------------------------------------ outside of floor 2 (glass band + pink frames)
function exterior(w) { const H = F2H, ext = 0xffd3e8, o = { th: 0.3, frame: 0xffffff, trim: PINK, noBase: true };
  K.wall(w, 'x', 40.0, 52.85, 73.15, H, ext, [G(54, 60, 3.9, 1.5), G(62, 72, 3.9, 1.5)], o);
  K.wall(w, 'x', 20.0, 52.85, 73.15, H, ext, [G(54.5, 62.5, 3.9, 1.2), G(65.5, 72, 3.9, 1.2)], o);
  K.wall(w, 'z', 53.0, 20.15, 39.85, H, ext, [G(21, 27, 3.9, 1.2), G(35, 39, 3.9, 1.2)], o);
  K.wall(w, 'z', 73.0, 20.15, 39.85, H, ext, [G(21, 27, 3.9, 1.2), G(32, 39, 3.9, 1.2)], o);
  const band = (y, h, c, o) => { w.add('g', rbox(20.3 + o * 2, h, o, 0.05), c, 63, y, 40 + o / 2 - 0.12); w.add('g', rbox(20.3 + o * 2, h, o, 0.05), c, 63, y, 20 - o / 2 + 0.12); w.add('g', rbox(o, h, 20.3, 0.05), c, 53 - o / 2 + 0.12, y, 30); w.add('g', rbox(o, h, 20.3, 0.05), c, 73 + o / 2 - 0.12, y, 30); };
  band(0.1, 0.3, 0xffffff, 0.5); band(H - 0.1, 0.28, PINK, 0.55);
  for (let k = 0; k < 7; k++) [40.22, 19.78].forEach((z) => w.add('g', rbox(0.2, H - 0.4, 0.14, 0.05), 0xffffff, 54.0 + k * 3.33, H / 2, z));
  sign3d(w, 'RATITA INDUSTRIES', 63, 0.85, 40.25, 0, 0.62, PINK, 0xffffff, { glow: 0.5 }); }
// interior lining, partitions, floors and ceiling
function inner(w) { const H = 4.4, int = 0xfdf2f8, o = { th: 0.12, frame: PINK, trim: 0xffffff, base: 0xffffff };
  K.wall(w, 'x', 39.72, 53.3, 72.7, H, int, [G(54, 60, 3.9, 1.5), G(62, 72, 3.9, 1.5)], o);
  K.wall(w, 'x', 20.28, 53.3, 72.7, H, 0xf1f5f9, [G(54.5, 62.5, 3.9, 1.2), G(65.5, 72, 3.9, 1.2)], o);
  K.wall(w, 'z', 53.28, 20.3, 39.7, H, int, [G(21, 27, 3.9, 1.2), G(35, 39, 3.9, 1.2)], o);
  K.wall(w, 'z', 72.72, 20.3, 39.7, H, 0xfff7e6, [G(21, 27, 3.9, 1.2), G(32, 39, 3.9, 1.2)], o);
  // partitions: lab + break room (north), corridor, Luna's office (glass front)
  K.wall(w, 'x', 28.0, 53.3, 72.7, H, 0xffffff, [D(56.4, 59.0, 3.0), D(67.6, 70.2, 3.0)], { th: 0.2, frame: TEAL, trim: PINK, base: 0xe5e7eb });
  K.wall(w, 'z', 64.0, 20.3, 27.9, H, 0xffffff, [], { th: 0.2, trim: PINK, base: 0xe5e7eb });
  K.wall(w, 'z', 61.0, 31.0, 39.7, H, 0xffffff, [G(31.4, 34.6, 3.4, 0.9), D(35.2, 37.6, 3.0), G(38.0, 39.5, 3.4, 0.9)], { th: 0.2, frame: 0xd4a017, trim: PINK, base: 0xe5e7eb, blinds: 0xffffff, blindSide: -1 });
  K.wall(w, 'x', 31.0, 61.1, 72.7, H, 0xfff1f8, [], { th: 0.2, trim: PINK, base: 0xe5e7eb });
  w.solid(60.88, 0.9, 31.4, 61.12, 3.4, 34.6); w.solid(60.88, 0.9, 38.0, 61.12, 3.4, 39.5); // the glass keeps the camera in the room it belongs to
  K.floor(w, 53.3, 28.1, 61.0, 39.7, 'marble', F, 0xfff7fb, 0xfce7f3, 2.0); K.floor(w, 61.0, 28.1, 72.7, 30.9, 'marble', F, 0xfff7fb, 0xfce7f3, 2.0);
  K.floor(w, 61.1, 31.1, 72.7, 39.7, 'wood', F, 0xb7804b); K.floor(w, 53.3, 20.3, 63.9, 27.9, 'tile', F, 0xe2e8f0, 0xcbd5e1, 1.0); K.floor(w, 64.1, 20.3, 72.7, 27.9, 'wood', F, 0xe8b989);
  K.ceiling(w, 53.0, 20.0, 73.0, 40.0, H, 0xfffaf2, { li: 26, lightCol: 0xfff1f8 });
  elevatorFront(w, 53.36, F, 33.0, 'f2'); }
// ---------------- elevator lobby + reception (Hazel), lounge, notice board, the floor directory
function lobby(w) { const I = w.I;
  K.rug(w, 57.2, 33.6, 0, 6.6, 3.2, PINK, 0xffd1e8);
  { const T = w.tf(58.6, F, 37.6, PI); T.slab('g', 0xffffff, 0, 0, 0, 3.2, 1.05, 0.8, 0.2); T.box('g', PINK, 0, 1.05, 0, 3.4, 0.08, 1.0, 0.04); T.box('l', TEAL, 0, 0.12, 0.41, 3.0, 0.06, 0.02, 0.02, 0.4); K.monitor(w, T, -0.7, 1.13, -0.15, PI, 0xfda4af); T.add('x', sph(12), 0xd4a017, 0.6, 1.16, 0.1, 0, 0, 0, 0.1, 0.07, 0.1); for (let k = 0; k < 5; k++) T.add('g', sph(8), pick([PINK, CHEESE, 0xffffff]), 1.1 + (k - 2) * 0.06, 1.42, 0.2, 0, 0, 0, 0.06); T.add('g', rcyl(0.08, 0.2, 0.02, 14), TEAL, 1.1, 1.13, 0.2);
    sign3d(w, 'RECEPTION', ...[T.P(0, 0, -0.43)[0]], F + 0.5, T.P(0, 0, -0.43)[2], PI, 0.11, PINK, null); }
  K.sofa(w, 59.9, 30.2, PI, TEAL, 0x99f6e4); K.tableR(w, 57.6, 30.2, 0.5, 0.45, 0xffffff, 0x94a3b8); for (let k = 0; k < 3; k++) w.add('m', rbox(0.3, 0.02, 0.4, 0.01), pick([PINK, CHEESE, TEAL]), 57.5 + k * 0.12, 0.46 + k * 0.02, 30.2, 0, 0.4 * k, 0);
  K.plant(w, 53.9, 39.2, 1.2); K.plant(w, 60.4, 39.2, 1.0); K.plant(w, 53.9, 28.7, 1.0); K.cooler(w, 55.4, 28.6);
  // floor directory sign + bulletin board
  { const T = w.tf(56.8, 1.6, 28.12, 0); T.add('g', rbox(1.8, 1.4, 0.06, 0.05), NAVY, 0, 0, 0); ['FLOOR 2', 'LUNA · OFFICE', 'TEST LAB', 'BREAK ROOM', 'ROOF · HELI TOURS'].forEach((t, i) => sign3d(w, t, 56.8, 1.6 + 0.48 - i * 0.24, 28.18, 0, 0.085, i ? 0xffffff : CHEESE, null)); }
  { const T = w.tf(60.88, 1.4, 29.6, -PI / 2); T.add('m', rbox(1.6, 1.0, 0.05, 0.03), 0xc58b52, 0, 0, 0); for (let i = 0; i < 6; i++) T.add('m', rbox(0.34, 0.28, 0.02, 0.01), pick([0xffffff, 0xfef3c7, 0xfbcfe8, 0xbfdbfe]), -0.55 + (i % 3) * 0.55, 0.2 - ((i / 3) | 0) * 0.42, 0.04, 0, 0, (i - 2.5) * 0.06); for (let i = 0; i < 6; i++) T.add('g', sph(6), BR[i], -0.55 + (i % 3) * 0.55, 0.32 - ((i / 3) | 0) * 0.42, 0.06, 0, 0, 0, 0.03); }
  for (let i = 0; i < 3; i++) pendant(w, 55.4 + i * 2.6, 4.4, 34.6, [PINK, CHEESE, TEAL][i]);
  portrait(w, 53.42, 2.4, 37.0, PI / 2, 0xa9afbd, 0xfbcfe8); portrait(w, 53.42, 2.4, 29.6, PI / 2, 0xffffff, 0xbfdbfe);
  gearAt(w, 57.6, 0.95, 30.2); }
// ---------------- LUNA'S BRANCH MANAGER OFFICE
function lunaOffice(w) { const I = w.I;
  K.rug(w, 67, 35.4, 0, 7.0, 5.0, 0x7c3aed, 0xc4b5fd);
  // executive desk: curved front, two monitors, nameplate, golden cheese paperweight, cheese lamp, in/out trays
  { const T = w.tf(68.2, F, 37.6, PI); T.slab('m', 0x8b5a2b, 0, 0, 0, 3.0, 0.82, 1.1, 0.1); T.box('g', 0xfff7ed, 0, 0.82, 0, 3.2, 0.08, 1.25, 0.05); T.box('g', PINK, 0, 0.2, -0.56, 2.8, 0.5, 0.04, 0.03);
    K.monitor(w, T, -0.6, 0.9, 0.25, 0, 0xf9a8d4); K.monitor(w, T, 0.4, 0.9, 0.25, 0, 0x93c5fd); T.add('g', rbox(0.7, 0.14, 0.12, 0.04), 0xd4a017, 0, 0.97, -0.45); T.add('g', wedge(), 0xffc83d, 1.1, 0.96, -0.2, 0, 0.5, 0, 0.14);
    T.add('x', cyl(8), 0x94a3b8, -1.25, 0.9, 0.3, 0, 0, 0, 0.02, 0.45, 0.02); T.add('g', cone(14), CHEESE, -1.25, 1.42, 0.3, PI, 0, 0, 0.18, 0.22, 0.18); T.add('l', sph(8), 0xfff1c1, -1.25, 1.3, 0.3, 0, 0, 0, 0.1, 0.06, 0.1, 0.8);
    for (let k = 0; k < 2; k++) { T.box('x', 0x94a3b8, 0.9, 0.9 + k * 0.12, 0.3, 0.42, 0.03, 0.32, 0.01); T.box('m', 0xffffff, 0.9, 0.94 + k * 0.12, 0.3, 0.36, 0.04, 0.26, 0.01); } }
  sign3d(w, 'LUNA · BRANCH MANAGER', 68.2, F + 0.98, 37.0, 0, 0.06, 0x111827, null);
  K.chair(w, 68.2, 38.6, PI, 0x7c3aed);
  I({ kind: 'rf2clue', id: 'desk', x: 66.6, y: F, z: 36.6, r: 1.4, label: '🔍 Peek at the sticky note on Luna\'s desk' });
  // bookshelves (with a trophy shelf), a globe, framed founders, sofa set
  K.hh('bookshelf', w, 72.4, 34.6, 0.25, -PI / 2, 2.6 / 0.25, 2.6 / 0.25, 0.5 / 0.25, 0xffffff); for (let i = 0; i < 4; i++) { w.add('g', rcyl(0.12, 0.32, 0.03, 16), 0xd4a017, 72.4, 2.62, 33.6 + i * 0.6); w.add('g', star(), 0xffc83d, 72.4, 3.08, 33.6 + i * 0.6, 0, PI / 2, 0, 0.13, 0.13, 0.05); }
  K.hhY('globe', w, 71.6, F, 38.9, 0.25); K.plant(w, 72.0, 31.8, 1.3); K.plant(w, 61.8, 39.2, 1.1);
  portrait(w, 64.0, 2.6, 31.12, 0, 0xa9afbd, 0xfbcfe8); portrait(w, 65.4, 2.6, 31.12, 0, 0x8b8f9a, 0xfde68a); portrait(w, 66.8, 2.6, 31.12, 0, 0xffffff, 0xbfdbfe); { const T = w.tf(68.4, 2.6, 31.12, 0); T.add('g', rbox(0.9, 1.1, 0.08, 0.04), 0xd4a017, 0, 0, 0); T.add('m', rbox(0.74, 0.94, 0.04, 0.02), 0xbbf7d0, 0, 0, 0.04); T.add('g', sph(14), 0x7a8b4f, 0, -0.1, 0.1, 0, 0, 0, 0.28, 0.2, 0.08); T.add('g', sph(10), 0x9aa36b, 0.24, 0.05, 0.12, 0, 0, 0, 0.11, 0.09, 0.06); }
  sign3d(w, 'THE FOUNDERS', 66.2, 3.4, 31.14, 0, 0.12, PINK, null);
  K.sofa(w, 63.0, 34.6, PI / 2, PINK, 0xffb3d9); K.hh('coffeeTable', w, 64.6, 34.6, 0.12, PI / 2); K.hhY('mug', w, 64.4, 0.33, 34.4, 0.12); K.hhY('mug', w, 64.8, 0.33, 34.9, 0.12, 0, TEAL);
  // cheese-shaped beanbag + the "employee of the month" wall
  w.add('f', sph(20), CHEESE, 63.2, 0.35, 38.7, 0, 0, 0, 0.62, 0.38, 0.55); for (let i = 0; i < 4; i++) w.add('m', sph(8), 0xe9a92a, 63.0 + (i % 2) * 0.35, 0.55 + (i > 1 ? 0.1 : 0), 38.3 + i * 0.12, 0, 0, 0, 0.07);
  frameArt(w, 72.62, 2.4, 37.4, -PI / 2, 1.2, 0.9, 0xfde68a, star()); sign3d(w, 'EMPLOYEE OF THE MONTH: SWEEPY', 72.6, 1.7, 37.4, -PI / 2, 0.06, NAVY, null);
  pendant(w, 68.2, 4.4, 37.0, 0xd4a017); pendant(w, 64.2, 4.4, 34.6, PINK);
  gearAt(w, 72.0, 1.4, 38.9);
  w.lights.push({ x: 67, y: 3.2, z: 35.5, c: 0xfff1f8, i: 10, d: 10 }); }
// ---------------- GADGET TESTING LAB: test chamber, crash-test sled, jetpack rig, goggles rack
function lab(w) { const I = w.I;
  K.hazard(w, 58.6, 24.0, 4.2, 4.2, 0);
  // glass test chamber with a hovering gadget inside
  { const x = 58.6, z = 24.0; w.add('x', rcyl(1.6, 0.25, 0.06, 32), 0x475569, x, F, z); w.add('l', rcyl(1.5, 0.03, 0.01, 32), TEAL, x, F + 0.26, z, 0, 0, 0, 1, 1, 1, 0.5); w.add('e', rcyl(1.5, 2.8, 0.04, 32), 0xe0f7ff, x, F + 0.28, z); w.add('x', rcyl(1.6, 0.2, 0.05, 32), 0x475569, x, F + 3.08, z); w.solid(x - 1.5, 0, z - 1.5, x + 1.5, 3.3, z + 1.5);
    w.add('g', rbox(0.6, 0.36, 0.3, 0.1), PINK, x, 1.7, z); [-1, 1].forEach((k) => { w.add('g', rcyl(0.12, 0.42, 0.04, 16), 0xe5e7eb, x + k * 0.22, 1.52, z - 0.2); w.add('l', cone(12), 0xff8a3d, x + k * 0.22, 1.2, z - 0.2, PI, 0, 0, 0.09, 0.2, 0.09, 0.9); }); sign3d(w, 'TEST CHAMBER 1', x, F + 0.6, z + 1.62, 0, 0.09, NAVY, null); }
  // crash-test dummy dog on a rocket sled + bumper wall
  { const T = w.tf(54.6, F, 22.0, 0); T.slab('x', 0x94a3b8, 0, 0, 0, 1.2, 0.3, 1.6, 0.06); T.add('g', sph(16), 0xfde047, 0, 0.75, 0, 0, 0, 0, 0.35, 0.3, 0.45); T.add('g', sph(14), 0xfde047, 0, 1.15, 0.38, 0, 0, 0, 0.24); [[0x111827, -0.12], [0x111827, 0.12]].forEach(([c, dx]) => T.add('g', sph(8), c, dx, 1.2, 0.6, 0, 0, 0, 0.05)); for (let k = 0; k < 4; k++) T.add('m', rbox(0.12, 0.12, 0.12, 0.02), k % 2 ? 0x111827 : 0xfde047, -0.18 + (k % 2) * 0.36, 0.78, -0.2 + ((k / 2) | 0) * 0.4); T.add('g', capsule(12), 0xef4444, 0, 0.45, -0.95, PI / 2, 0, 0, 0.18, 0.4, 0.18);
    sign3d(w, 'CRASH TEST BUDDY', 54.6, F + 0.42, 22.85, 0, 0.07, NAVY, null); w.add('g', rbox(1.6, 1.2, 0.3, 0.12), 0xff8a3d, 54.6, 0.65, 20.7); for (let k = 0; k < 3; k++) w.add('g', rbox(1.5, 0.12, 0.32, 0.04), 0xffffff, 54.6, 0.3 + k * 0.4, 20.7); }
  // jetpack test rig: frame + harness + nozzles
  { const x = 62.2, z = 21.6; [-1, 1].forEach((s) => w.add('x', cyl(10), 0x64748b, x + s * 0.8, F, z, 0, 0, 0, 0.05, 2.6, 0.05)); w.add('x', rbox(1.8, 0.1, 0.1, 0.03), 0x64748b, x, 2.65, z); w.add('x', cyl(6), 0x94a3b8, x, 1.8, z, 0, 0, 0, 0.01, 0.85, 0.01); w.add('g', rbox(0.6, 0.7, 0.32, 0.1), CHEESE, x, 1.55, z); [-1, 1].forEach((s) => { w.add('g', rcyl(0.13, 0.5, 0.04, 16), 0xe5e7eb, x + s * 0.22, 1.25, z - 0.2); w.add('l', cone(12), 0xff5d2a, x + s * 0.22, 0.92, z - 0.2, PI, 0, 0, 0.1, 0.32, 0.1, 1.0); }); w.solid(x - 0.9, 0, z - 0.3, x + 0.9, 2.7, z + 0.3, { cam: false }); sign3d(w, 'JET-PUP V2', x, F + 0.4, z + 0.35, 0, 0.08, PINK, null); }
  K.labBench(w, 61.6, 26.6, PI, 4.0); K.stool(w, 60.6, 25.6, PINK); K.stool(w, 62.6, 25.6, TEAL);
  { const T = w.tf(61.6, 0.95, 26.6, PI); K.monitor(w, T, -1.2, 0, 0.2, 0, 0x4ade80); for (let i = 0; i < 4; i++) T.add(i % 2 ? 'x' : 'g', [sph(10), gear(8), capsule(8), rbox(0.2, 0.12, 0.14, 0.03)][i], BR[i * 2], -0.3 + i * 0.4, 0.08, 0, 0, i, 0, i === 3 ? 1 : 0.1, i === 3 ? 1 : 0.1, i === 3 ? 1 : 0.1); }
  I({ kind: 'rf2clue', id: 'lab', x: 61.0, y: F, z: 25.4, r: 1.3, label: '🔍 Read the Key-Finder 3000 test log' });
  // goggles rack + safety sign + whiteboard of equations
  { const T = w.tf(53.42, 1.6, 26.2, PI / 2); T.add('m', rbox(1.6, 0.9, 0.05, 0.03), 0xffffff, 0, 0, 0); for (let i = 0; i < 4; i++) { T.add('x', torus(0.03, 16), 0x334155, -0.55 + i * 0.37, 0.1, 0.08, 0, 0, 0, 0.13); T.add('e', sph(12), [0x7dd3fc, 0xf9a8d4, 0xfde68a, 0x86efac][i], -0.55 + i * 0.37, 0.1, 0.1, 0, 0, 0, 0.11, 0.08, 0.04); } }
  sign3d(w, 'DAYS WITHOUT AN EXPLOSION: 0', 58.6, 3.85, 20.42, 0, 0.12, 0xef4444, 0xffffff);
  K.whiteboard(w, 'x', 27.85, 56.2, 1.2, 2.4, -1); K.serverRack(w, 63.4, 22.6, -PI / 2); K.plant(w, 53.9, 27.4, 1.0);
  drone(w, 56.0, 3.5, 25.0, TEAL, 4.4); drone(w, 61.5, 3.6, 24.0, PINK, 4.4);
  gearAt(w, 54.6, 1.55, 22.0);
  w.lights.push({ x: 58.6, y: 3.3, z: 24, c: 0xe0f2fe, i: 10, d: 10 }); }
// ---------------- BREAK ROOM: kitchenette, snack machine (quest), tables, couch + TV, ping-pong
function breakRoom(w) { const I = w.I;
  // kitchenette along the north wall
  { const T = w.tf(68.4, F, 20.85, 0); T.slab('g', 0xffffff, 0, 0, 0, 4.4, 0.92, 0.7, 0.06); T.box('g', 0x334155, 0, 0.92, 0, 4.5, 0.06, 0.78, 0.02); for (let i = 0; i < 4; i++) T.box('g', [PINK, CHEESE, TEAL, PINK][i], -1.65 + i * 1.1, 0.12, 0.36, 1.0, 0.7, 0.02, 0.02);
    T.add('x', rcyl(0.3, 0.12, 0.03, 20), 0xd1d5db, -1.2, 0.86, 0); T.add('x', tube([[-1.2, 0.98, -0.28], [-1.2, 1.3, -0.28], [-1.2, 1.3, -0.1]], 0.025, 10, 6), 0xd1d5db, 0, 0, 0);
    for (let k = 0; k < 3; k++) T.box('m', 0xfef3c7, -0.2 + k * 0.5, 2.0, -0.12, 0.4, 0.5, 0.36, 0.04); }
  K.hhY('microwave', w, 69.4, 0.97, 20.85, 0.12); K.hhY('kettle', w, 67.9, 0.97, 20.9, 0.15); K.hhY('toaster', w, 70.3, 0.97, 20.9, 0.12, 0, TEAL);
  K.hh('fridge', w, 71.8, 21.1, 0.15, 0, 13, 0xfde7f3);
  I({ kind: 'rf2clue', id: 'fridge', x: 71.6, y: F, z: 22.6, r: 1.2, label: '🔍 Read the note on the fridge' });
  // snack machine (the keys are stuck in spiral B4)
  K.vending(w, 64.9, 22.3, PI / 2, TEAL); sign3d(w, 'SNACKS', 65.35, 2.5, 22.3, PI / 2, 0.12, 0xffffff, null);
  I({ kind: 'rf2snack', x: 66.0, y: F, z: 22.3, r: 1.3, label: '🍪 Use the snack machine' });
  // tables + bistro chairs, couch + TV, ping-pong table
  const tbl = (x, z, c) => { K.tableR(w, x, z, 0.55, 0.78, 0xffffff, 0x334155); w.add('g', torus(0.08, 32), c, x, 0.73, z, PI / 2, 0, 0, 0.55, 0.55, 0.4); [0, 1, 2].forEach((k) => { const a = k / 3 * PI * 2 + 0.6; bistro(w, x + Math.cos(a) * 0.9, z + Math.sin(a) * 0.9, Math.atan2(-Math.cos(a), -Math.sin(a)), c); }); K.hhY('mug', w, x + 0.15, 0.8, z, 0.1, 0, c); w.add('g', wedge(), CHEESE, x - 0.15, 0.84, z + 0.1, 0, 0.6, 0, 0.07); };
  tbl(66.8, 24.6, PINK); tbl(70.2, 26.2, TEAL);
  { const T = w.tf(71.2, F, 24.0, 0); T.slab('g', 0x16a34a, 0, 0.7, 0, 1.4, 0.06, 2.4, 0.03, { cam: false }); T.box('x', 0xffffff, 0, 0.76, 0, 1.42, 0.005, 0.03, 0.002); T.box('m', 0xffffff, 0, 0.76, 0, 1.5, 0.15, 0.02, 0.01); [-1, 1].forEach((a) => [-1, 1].forEach((b) => T.add('x', cyl(8), 0x334155, a * 0.6, 0, b * 1.05, 0, 0, 0, 0.03, 0.7, 0.03))); T.add('g', rcyl(0.09, 0.02, 0.01, 14), 0xef4444, -0.3, 0.77, -0.6); T.add('g', rcyl(0.09, 0.02, 0.01, 14), 0x3b82f6, 0.3, 0.77, 0.6); T.add('g', sph(8), 0xffffff, 0.1, 0.8, 0.2, 0, 0, 0, 0.03); }
  K.sofa(w, 66.2, 27.0, PI, 0xff8a3d, 0xffd2a8);
  { const x = 64.3, z = 26.2; w.add('g', rbox(0.08, 1.0, 1.7, 0.04), 0x111827, x, 2.1, z); w.add('l', rbox(0.02, 0.86, 1.56, 0.02), 0x60a5fa, x + 0.05, 2.1, z, 0, 0, 0, 1, 1, 1, 0.5); w.add('g', sph(14), 0xa9afbd, x + 0.07, 2.15, z, 0, 0, 0, 0.02, 0.22, 0.22); }
  sign3d(w, 'BREAK ROOM', 68.9, 3.4, 27.86, PI, 0.15, PINK, null); frameArt(w, 72.62, 2.4, 25.0, -PI / 2, 1.2, 0.9, 0xfef3c7, wedge());
  K.plant(w, 72.2, 27.4, 1.0); K.hh('lamp', w, 64.6, 27.4, 0.14, 0, 16, 0xffe4b5);
  gearAt(w, 66.8, 0.9, 24.6);
  w.lights.push({ x: 68.4, y: 3.3, z: 24, c: 0xffe8c2, i: 10, d: 10 }); }
// ------------------------------------------------------------------------------------------------ rooftop
function roofShell(w) { // deck, glass railing, elevator kiosk, the giant rat-head logo, AC units (always visible from the street)
  w.add('g', rbox(20.8, 0.24, 20.8, 0.08), 0xe7e5e4, 63, -0.12, 30); w.solid(52.6, -0.4, 19.6, 73.4, 0, 40.4, { floor: true });
  K.floor(w, 53.0, 20.0, 73.0, 40.0, 'tile', 0.0, 0xd6d3d1, 0xc4bfbb, 1.6);
  const rail = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0) + PI / 2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    w.add('e', rbox(L, 0.9, 0.05, 0.02), 0xcff4ff, cx, 0.55, cz, 0, ry, 0); w.add('g', rbox(L, 0.09, 0.14, 0.04), PINK, cx, 1.12, cz, 0, ry, 0); const n = Math.round(L / 2.5); for (let i = 0; i <= n; i++) { const t = i / n; w.add('x', cyl(8), 0xffffff, x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t, 0, 0, 0, 0.05, 1.12, 0.05); }
    w.solid(Math.min(x0, x1) - 0.12, 0, Math.min(z0, z1) - 0.12, Math.max(x0, x1) + 0.12, 1.3, Math.max(z0, z1) + 0.12, { cam: false }); };
  rail(52.8, 19.8, 73.2, 19.8); rail(52.8, 40.2, 73.2, 40.2); rail(52.8, 19.8, 52.8, 40.2); rail(73.2, 19.8, 73.2, 40.2);
  // elevator kiosk (west), door on its east face
  { const x0 = 53.2, x1 = 56.2, z0 = 31.2, z1 = 34.8, h = 3.4; K.wall(w, 'x', z0, x0, x1, h, 0xfff1f8, [], { th: 0.2, trim: PINK, noBase: true }); K.wall(w, 'x', z1, x0, x1, h, 0xfff1f8, [], { th: 0.2, trim: PINK, noBase: true }); K.wall(w, 'z', x0, z0, z1, h, 0xfff1f8, [], { th: 0.2, trim: PINK, noBase: true }); K.wall(w, 'z', x1, z0, z1, h, 0xfff1f8, [D(31.9, 34.1, 3.1)], { th: 0.2, frame: 0xd1d5db, trim: PINK, noBase: true });
    w.add('g', rbox(3.5, 0.3, 4.1, 0.1), PINK, (x0 + x1) / 2, h + 0.15, (z0 + z1) / 2); sign3d(w, 'RATITA', x1 + 0.12, h - 0.35, (z0 + z1) / 2, PI / 2, 0.22, PINK, null); w.solid(x0, 0, z0, x1 - 0.05, h, z1);
    w.add('g', rbox(0.06, 0.6, 0.26, 0.03), 0xe5e7eb, x1 + 0.14, 1.25, 34.55); w.add('l', sph(10), CHEESE, x1 + 0.18, 1.38, 34.55, 0, 0, 0, 0.05, 0.05, 0.05, 0.8); w.add('l', sph(10), TEAL, x1 + 0.18, 1.12, 34.55, 0, 0, 0, 0.05, 0.05, 0.05, 0.8);
    w.I({ kind: 'relev', id: 'roof', x: x1 + 1.1, y: 0, z: 33, r: 1.5, label: '🛗 Call the elevator' }); }
  // the giant rat-head logo (north-east corner)
  { const lx = 69.6, ly = 0, lz = 22.6, s = 0.85; w.add('g', rcyl(2.2 * s, 0.35, 0.1, 40), CHEESE, lx, ly, lz); w.add('g', sph(28), 0xa9afbd, lx, ly + 1.9 * s, lz, 0, 0, 0, 1.5 * s, 1.4 * s, 1.2 * s); [-1, 1].forEach((k) => { w.add('g', sph(20), 0xa9afbd, lx + k * 1.25 * s, ly + 3.0 * s, lz, 0, 0, 0, 0.8 * s, 0.8 * s, 0.35 * s); w.add('g', sph(20), 0xffb3c8, lx + k * 1.25 * s, ly + 3.0 * s, lz + 0.16, 0, 0, 0, 0.62 * s, 0.62 * s, 0.3 * s); w.add('g', sph(12), 0x1b1b24, lx + k * 0.5 * s, ly + 2.15 * s, lz + 1.05 * s, 0, 0, 0, 0.16 * s); w.add('l', sph(8), 0xffffff, lx + k * 0.5 * s + 0.05, ly + 2.22 * s, lz + 1.18 * s, 0, 0, 0, 0.05, 0.05, 0.05, 0.5); });
    w.add('g', sph(14), 0xff8fb1, lx, ly + 1.75 * s, lz + 1.4 * s, 0, 0, 0, 0.25 * s, 0.2 * s, 0.2 * s); w.solid(lx - 1.9, 0, lz - 1.9, lx + 1.9, 3.6, lz + 1.9); w.lights.push({ x: lx, y: 2.4, z: lz + 3, c: 0xffd9e8, i: 8, d: 12, out: true }); }
  for (let i = 0; i < 2; i++) { const x = 56.2 + i * 3.2; w.slab('x', 0x94a3b8, x, 0, 22.4, 2.0, 1.3, 1.4, 0.12); w.add('x', cyl(16), 0x64748b, x, 1.3, 22.4, 0, 0, 0, 0.5, 0.06, 0.5); for (let k = 0; k < 5; k++) w.add('x', rbox(1.8, 0.04, 0.02, 0.01), 0x475569, x, 0.3 + k * 0.2, 23.12); }
  // helipad: raised disc, yellow ring, white H, edge lights
  { const [x, , z] = PAD; w.add('g', rcyl(3.6, 0.12, 0.05, 48), 0x334155, x, 0, z); w.solid(x - 3.4, 0, z - 3.4, x + 3.4, 0.12, z + 3.4, { floor: true, cam: false }); w.add('g', torus(0.05, 64), CHEESE, x, 0.13, z, PI / 2, 0, 0, 3.0, 3.0, 1.2);
    w.add('g', rbox(0.4, 0.03, 2.2, 0.02), 0xffffff, x - 0.7, 0.135, z); w.add('g', rbox(0.4, 0.03, 2.2, 0.02), 0xffffff, x + 0.7, 0.135, z); w.add('g', rbox(1.0, 0.03, 0.4, 0.02), 0xffffff, x, 0.135, z);
    for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; w.add('l', sph(8), i % 2 ? TEAL : PINK, x + Math.cos(a) * 3.45, 0.16, z + Math.sin(a) * 3.45, 0, 0, 0, 0.09, 0.06, 0.09, 1.0); } }
  // windsock
  { const x = 72.4, z = 36.0; w.add('x', cyl(8), 0xffffff, x, 0, z, 0, 0, 0, 0.05, 3.2, 0.05); w.add('f', cone(16), 0xff8a3d, x - 0.6, 3.05, z, 0, 0, PI / 2 + 0.25, 0.2, 1.1, 0.2); w.add('g', torus(0.05, 16), 0xffffff, x - 0.6, 3.05, z, 0, 0, PI / 2 + 0.25, 0.2); }
  sign3d(w, 'SNOWIE\'S SKY TOURS', 63, 1.55, 40.25, 0, 0.32, 0xffffff, PINK, { glow: 0.4 }); }
function roofProps(w) { const I = w.I;
  // Sky Tours booth (Snowie's): counter, ticket roll, flight map, queue ropes, bench
  { const T = w.tf(69.2, F, 36.6, PI); T.slab('g', 0xffffff, 0, 0, 0, 2.6, 1.05, 0.9, 0.12); T.box('g', TEAL, 0, 1.05, 0, 2.8, 0.08, 1.1, 0.04); T.box('l', PINK, 0, 0.12, 0.46, 2.4, 0.06, 0.02, 0.02, 0.5);
    [-1, 1].forEach((k) => T.add('x', cyl(8), 0xffffff, k * 1.25, 1.05, 0.3, 0, 0, 0, 0.04, 1.3, 0.04)); T.box('f', PINK, 0, 2.3, 0.3, 2.9, 0.12, 1.4, 0.04); for (let i = 0; i < 6; i++) T.add('f', cone(3), [CHEESE, TEAL, 0xffffff][i % 3], -1.25 + i * 0.5, 2.18, 0.98, PI, 0, 0, 0.18, 0.3, 0.02);
    T.add('g', rcyl(0.15, 0.2, 0.04, 16), 0xfde68a, 0.9, 1.13, 0.1); T.add('m', rbox(0.9, 0.6, 0.04, 0.02), 0xbfdbfe, -0.6, 1.45, -0.3, -0.3, 0, 0); T.add('g', sph(8), PINK, -0.75, 1.5, -0.27, 0, 0, 0, 0.04); T.add('g', sph(8), CHEESE, -0.4, 1.4, -0.27, 0, 0, 0, 0.04); }
  sign3d(w, 'HELI TOURS', 69.2, F + 2.62, 36.0, 0, 0.2, PINK, 0xffffff);
  for (let i = 0; i < 3; i++) { const x = 64.8 + i * 1.3; w.add('x', rcyl(0.15, 0.05, 0.02, 14), 0xd4a017, x, F, 37.6); w.add('x', cyl(8), 0xd4a017, x, F, 37.6, 0, 0, 0, 0.035, 0.9, 0.035); } w.add('f', tube([[64.8, 0.85, 37.6], [65.45, 0.6, 37.6], [66.1, 0.85, 37.6], [66.75, 0.6, 37.6], [67.4, 0.85, 37.6]], 0.035, 16, 6), PINK, 0, 0, 0);
  // telescopes over Pup Town (west edge)
  [[54.0, 37.4], [54.0, 38.9], [54.0, 27.6]].forEach(([x, z], i) => { w.add('x', rcyl(0.25, 0.08, 0.03, 16), 0x475569, x, F, z); w.add('x', cyl(10), 0x64748b, x, F, z, 0, 0, 0, 0.06, 1.05, 0.06); w.add('g', capsule(14), i === 1 ? PINK : TEAL, x - 0.15, 1.25, z, 0, 0, PI / 2 + 0.15, 0.14, 0.45, 0.14); w.add('x', rcyl(0.1, 0.06, 0.02, 14), 0x111827, x - 0.6, 1.33, z, 0, 0, PI / 2); w.solid(x - 0.25, 0, z - 0.25, x + 0.25, 1.2, z + 0.25, { cam: false });
    I({ kind: 'rf2scope', id: i, x: x + 0.9, y: F, z, r: 1.1, label: '🔭 Look through the telescope' }); });
  // deck chairs + umbrellas, planters, picnic table
  [[58.6, 38.4, PINK], [60.6, 38.4, CHEESE]].forEach(([x, z, c]) => { const T = w.tf(x, F, z, PI); T.box('x', 0xffffff, 0, 0.25, 0, 0.6, 0.06, 1.6, 0.03); T.add('g', rbox(0.56, 0.06, 1.0, 0.03), c, 0, 0.36, 0.2); T.add('g', rbox(0.56, 0.7, 0.06, 0.03), c, 0, 0.6, -0.55, -0.55, 0, 0); [-1, 1].forEach((a) => [-1, 1].forEach((b) => T.add('x', cyl(6), 0xffffff, a * 0.25, 0, b * 0.7, 0, 0, 0, 0.02, 0.3, 0.02))); });
  { const x = 59.6, z = 37.2; w.add('x', cyl(8), 0xffffff, x, F, z, 0, 0, 0, 0.04, 2.4, 0.04); w.add('f', cone(24), TEAL, x, 2.45, z, 0, 0, 0, 1.4, 0.45, 1.4); w.add('g', sph(8), 0xffffff, x, 2.92, z, 0, 0, 0, 0.08); }
  for (let i = 0; i < 4; i++) { const x = 58.2 + i * 3.6; w.add('m', rbox(2.4, 0.6, 0.7, 0.12), 0xc58b52, x, 0.3, 39.5); for (let k = 0; k < 7; k++) w.add('g', sph(8), pick([0xff5d8f, 0xffd23f, 0xff8a3d, 0xa66bff, 0xffffff]), x - 1.0 + k * 0.33, 0.68, 39.5 + (k % 2 ? 0.12 : -0.12), 0, 0, 0, 0.13, 0.11, 0.13); for (let k = 0; k < 5; k++) w.add('g', sph(8), 0x3fae5a, x - 0.9 + k * 0.45, 0.62, 39.5, 0, 0, 0, 0.18, 0.12, 0.16); w.solid(x - 1.2, 0, 39.15, x + 1.2, 0.6, 39.85); }
  { const T = w.tf(71.0, F, 31.2, PI / 2); T.slab('m', 0xc58b52, 0, 0.72, 0, 1.8, 0.08, 0.9, 0.03); [-1, 1].forEach((s) => { T.box('m', 0xa86f3c, 0, 0.42, s * 0.75, 1.8, 0.07, 0.36, 0.03); T.box('m', 0x8b5a2b, s * 0.75, 0, 0, 0.1, 0.72, 1.7, 0.03); }); T.add('g', wedge(), CHEESE, 0.2, 0.82, 0, 0, 0.5, 0, 0.2); K.hhY('mug', w, ...[T.P(-0.4, 0, 0)[0]], 0.8, T.P(-0.4, 0, 0)[2], 0.1, 0, PINK); }
  K.plant(w, 72.4, 39.0, 1.2); K.plant(w, 72.4, 21.0, 1.1); bush(w, 56.6, 39.4, 0.7);
  // fuel cart + tool chest by the pad
  { const T = w.tf(62.4, F, 25.6, 0.4); T.slab('g', 0xef4444, 0, 0.12, 0, 0.9, 0.9, 0.6, 0.08); T.add('g', rcyl(0.25, 0.7, 0.05, 18), 0xfacc15, 0, 1.02, 0); T.add('x', tube([[0.2, 1.4, 0], [0.5, 1.2, 0.3], [0.5, 0.6, 0.4]], 0.03, 10, 6), 0x111827, 0, 0, 0); [-1, 1].forEach((s) => T.add('m', torus(0.4, 12), 0x111827, s * 0.42, 0.08, 0, 0, PI / 2, 0, 0.09, 0.09, 0.1)); }
  gearAt(w, 56.2, 1.55, 22.4); gearAt(w, 71.0, 1.15, 31.2);
  w.lights.push({ x: 65.5, y: 3, z: 30.4, c: 0xfff1dc, i: 6, d: 10, out: true }); }

// Rotor's SOFT LANDING ZONE in the Test Yard infield: a big cartoon haystack (where the heli bounces down sometimes)
function haystack(w, x, z) { const HAY = 0xf2c14e, HAY2 = 0xe0a93a;
  w.add('f', sph(28), HAY, x, 0.15, z, 0, 0, 0, 2.3, 0.95, 1.7); w.add('f', sph(24), HAY2, x - 0.8, 0.6, z + 0.3, 0, 0, 0, 1.2, 0.6, 1.0); w.add('f', sph(24), HAY, x + 0.9, 0.55, z - 0.4, 0, 0, 0, 1.1, 0.55, 0.9);
  for (let i = 0; i < 26; i++) { const a = i * 2.39, r = 0.6 + (i % 5) * 0.35; w.add('m', cyl(5), i % 2 ? 0xfde68a : HAY2, x + Math.cos(a) * r, 0.75 + Math.sin(i) * 0.15, z + Math.sin(a) * r * 0.75, 0.3 + (i % 3) * 0.4, a, 0.9, 0.02, 0.5, 0.02); }
  [[-2.6, -1.2, 0.3], [2.7, 1.0, -0.2], [-1.8, 1.9, 1.2], [2.0, -1.9, 0.8]].forEach(([dx, dz, ry]) => { const T = w.tf(x + dx, 0, z + dz, ry); T.slab('f', HAY, 0, 0, 0, 1.3, 0.75, 0.8, 0.2); [-0.35, 0.35].forEach((o) => T.box('m', 0xb45309, o, 0.375, 0, 0.05, 0.78, 0.84, 0.02)); });
  sign3d(w, 'SOFT LANDING ZONE', x, 1.35, z + 2.65, 0, 0.18, 0xffffff, 0xff8a3d); w.add('x', cyl(8), 0xffffff, x - 1.2, 0, z + 2.6, 0, 0, 0, 0.04, 1.2, 0.04); w.add('x', cyl(8), 0xffffff, x + 1.2, 0, z + 2.6, 0, 0, 0, 0.04, 1.2, 0.04);
  w.solid(x - 2.1, 0, z - 1.4, x + 2.1, 0.85, z + 1.4); }
