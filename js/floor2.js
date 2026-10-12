// RATITA HQ FLOOR 2 + ROOFTOP runtime (free update for Ratita Super Expansion owners): the elevator (doors, ride, ding),
// the Missing Heli Keys quest, rooftop telescopes and SNOWIE'S SKY TOURS: a scripted heli flight over Ratita Row and
// Pup Town with commentary, the occasional cartoony bumpy landing (1 in 4, never on your first tour), dizzy stars,
// and the Ratita tow-drone that brings the heli home. Co-op: the tour start is broadcast and everyone near the pad rides.
import * as THREE from 'three';
import { MB, toGroup, makeRat } from './models.js?v=20261011r38c';
import { P } from './geo.js?v=20261011r38c';
import { rcyl, star } from './shapes.js?v=20261011r38c';
import { persist } from './save.js?v=20261011r38c';
import { panel, closePanel } from './ui.js?v=20261011r38c';
import { R, F2, F2_CLUES, f2ClueText, coins } from './rowdata.js?v=20261011r38c';
import { ELEV, PAD, F2Y, ROOFY } from './floor2geo.js?v=20261011r38c';
const PI = Math.PI, PINK = 0xff4fa0, CHEESE = 0xffc93c, TEAL = 0x22d3ee;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const smooth = (t) => t * t * (3 - 2 * t);
const angLerp = (a, b, k) => { let d = b - a; while (d > PI) d -= PI * 2; while (d < -PI) d += PI * 2; return a + d * k; };
const FLOORS = { g: '1 · Lobby', f2: '2 · Luna, Lab, Break Room', roof: 'R · Rooftop + Heli Tours' };
const FN = { g: '1', f2: '2', roof: 'R' };
const PAD_Y = ROOFY + 0.12, PAD_YAW = -PI / 2;
// the tour: waypoints [x, y, z, Snowie's line]
const WP = [
  [PAD[0], PAD_Y, PAD[2]], [PAD[0], ROOFY + 5, PAD[2], 'Buckle up! Snowie\'s Sky Tours, now departing. Paws and tails inside the heli, please!'],
  [74, 22, 44, 'Below us: Ratita Row! And that golden statue? That\'s Luna. She polishes it every single morning.'],
  [90, 22, 58, 'The Museum of Inventions! The Pup-Translator lives there now, all thanks to you!'],
  [97, 21, 30], [80, 19, 8, 'The Turbo Test Track! From up here, Sweepy\'s tire marks look like a big smiley face.'],
  [50, 27, -14, 'The Lookout Tower! The fire pups can see all of Pup Town from there. Not as well as US though.'],
  [14, 26, -30, 'Town Hall! Mayor Biscuit waves at every heli. Wave back!'],
  [-4, 27, -52, 'Lookout Hill, the highest spot in town. Torty climbed it once. It took her all summer.'],
  [-28, 25, -30, 'The library! Shhh… I\'ll fly extra quietly. Whirr whirr.'], [-30, 23, 0, 'Smell that? The bakery! Fresh biscuits. Even up here!'],
  [-6, 20, 6, 'The Town Square fountain! Make a wish. Mine is: more cheese.'],
  [-34, 22, 40, 'Candy\'s backyard! Rumour says there are bones buried everywhere down there.'],
  [-8, 20, 52, 'Paw Park! The ducks call me "the big pink bird". We\'re friends.'], [22, 20, 50],
  [46, 20, 46, 'The Ratita Gate! Torty walked through it this morning. Hi Torty! She\'s still waving.'],
  [62, 18, 38], [PAD[0], ROOFY + 5, PAD[2], 'And now… gentle as a cheese soufflé… we\'re landing!'], [PAD[0], PAD_Y, PAD[2]],
];
// safe, soft crash-landing spots: [name, x, z, starts after waypoint, ground y, Snowie's quip]
export const CRASH = [
  ['park', 10.0, 36.0, 12, 0, 'Ta-daa! A perfect landing… on the grass… a little sideways. The ducks give it a 7!'],
  ['fountain', 7.0, -6.0, 10, 0, 'SPLASH! Free heli wash! Torty always says I need one.'],
  ['hay', 85.5, 8.0, 4, 0.85, 'BOING! Who put a giant haystack here? …Rotor did. For exactly this. Smart dog!'],
];
export class Floor2 {
  constructor(g, rp) { this.g = g; this.rp = rp; const w = this.w = g.world; this.el = null; this.tour = null; this.tow = null; this.heliAt = 'pad'; this.scope = null;
    this.curve = new THREE.CatmullRomCurve3(WP.map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, 'centripetal', 0.5);
    { const L = this.curve.getLengths(400); this.L = L[400]; this.wpS = WP.map((_, i) => L[Math.round(i / (WP.length - 1) * 400)]); }
    // elevator doors at each stop (they slide), with a warm lit cab behind
    this.stops = {}; for (const [id, x, y] of [['g', 53.5, 0.05], ['f2', 53.5, F2Y + 0.05], ['roof', 56.02, ROOFY]]) { const root = new THREE.Group(); root.position.set(x, y, 33); const mk = () => { const b = MB(); b.x.add(P.rbox, 0xdbe2ea, 0, 1.42, 0, 0, 0, 0, 0.06, 2.84, 0.92); b.g.add(P.rbox, PINK, 0.035, 1.42, 0, 0, 0, 0, 0.01, 2.6, 0.1); b.l.add(P.sphere, CHEESE, 0.04, 2.2, 0, 0, 0, 0, 0.02, 0.06, 0.06, 0.6); return toGroup(b, false); };
      const L = mk(), Rr = mk(); root.add(L, Rr); const cb = MB(); cb.l.add(P.rbox, 0xffb3d9, -0.05, 1.42, 0, 0, 0, 0, 0.02, 2.8, 1.84, 0.55); cb.x.add(P.rbox, 0xd1d5db, -0.02, 1.0, 0, 0, 0, 0, 0.05, 0.05, 1.5); const cab = toGroup(cb, false); root.add(cab); g.add(root); this.stops[id] = { root, L, R: Rr, cab, k: 0, want: 0 }; this.doorPose(this.stops[id]); }
    this.heli = this.makeHeli(); g.add(this.heli.root); this.heliS = w.solid(0, -10, 0, 1, -9, 1, { dyn: true });
    this.drone = this.makeDrone(); g.add(this.drone.root); this.drone.root.visible = false;
    this.heliI = { kind: 'rf2heli', x: PAD[0], y: ROOFY, z: PAD[2] + 2.6, r: 2.2, label: '🚁 Snowie\'s Sky Tours' }; w.inter.push(this.heliI);
    { const grp = new THREE.Group(); const geo = star(); const mat = new THREE.MeshBasicMaterial({ color: 0xffe14d, toneMapped: false }); for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(geo, mat); m.scale.set(0.14, 0.14, 0.05); grp.add(m); } grp.visible = false; g.add(grp); this.stars = { grp, t: 0 }; }
    this.sub = document.createElement('div'); this.sub.id = 'f2sub'; document.body.appendChild(this.sub);
    this.ov = document.createElement('div'); this.ov.id = 'f2elev'; document.body.appendChild(this.ov);
    this.parkHeli(); this.refresh(); }
  owned() { return this.rp.owned(); }
  localId() { const n = this.g.net; return n && n.online && n.room ? n.room.pid : this.g.me.pid; }
  // ------------------------------------------------ models
  makeHeli() { const b = MB();
    b.g.add(P.sphere, PINK, 0, 1.0, 0, 0, 0, 0, 1.4, 0.85, 2.2); b.e.add(P.sphere, 0xbfefff, 0, 1.85, 0.35, 0, 0, 0, 1.3, 1.1, 1.85);
    b.g.add(P.sphere, CHEESE, 0, 1.2, 0, 0, 0, 0, 1.42, 0.14, 2.23); b.g.add(P.sphere, 0xffffff, 0, 1.02, 0, 0, 0, 0, 1.43, 0.06, 2.24); b.l.add(P.sphere, 0xfff7c2, -0.55, 1.05, 2.05, 0, 0, 0, 0.18, 0.14, 0.08, 0.9); b.l.add(P.sphere, 0xfff7c2, 0.55, 1.05, 2.05, 0, 0, 0, 0.18, 0.14, 0.08, 0.9);
    b.g.add(P.capsule, PINK, 0, 1.45, -3.0, PI / 2, 0, 0, 0.26, 1.5, 0.26); b.g.add(P.rbox, CHEESE, 0, 2.05, -4.35, 0, 0, 0, 0.12, 1.1, 0.7); b.g.add(P.rbox, CHEESE, 0, 1.5, -4.25, 0, 0, 0, 1.3, 0.1, 0.5);
    b.x.add(P.cyl, 0x94a3b8, 0, 2.9, 0, 0, 0, 0, 0.09, 0.45, 0.09); [-1, 1].forEach((s) => { b.x.add(P.capsule, 0x64748b, s * 1.05, 0.12, 0.1, PI / 2, 0, 0, 0.07, 1.7, 0.07); b.x.add(P.cyl, 0x64748b, s * 0.85, 0.32, 0.9, 0, 0, s * 0.5, 0.05, 0.5, 0.05); b.x.add(P.cyl, 0x64748b, s * 0.85, 0.32, -0.8, 0, 0, s * 0.5, 0.05, 0.5, 0.05);
      b.g.add(P.sphere, 0xa9afbd, s * 0.6, 2.2, -1.25, 0, 0, s * 0.3, 0.42, 0.42, 0.12); b.g.add(P.sphere, 0xffb3c8, s * 0.6, 2.2, -1.2, 0, 0, s * 0.3, 0.32, 0.32, 0.1); });
    b.m.add(P.rbox, 0x1e293b, 0, 0.62, 0.1, 0, 0, 0, 1.9, 0.12, 2.6); [[-0.55, 0.7], [0.55, 0.7], [-0.55, -0.6], [0.55, -0.6]].forEach(([x, z]) => { b.f.add(P.rbox, TEAL, x, 0.8, z - 0.25, 0, 0, 0, 0.62, 0.5, 0.14); });
    const root = new THREE.Group(); root.add(toGroup(b)); const rb = MB(); rb.x.add(P.sphere, 0xd1d5db, 0, 0, 0, 0, 0, 0, 0.22, 0.14, 0.22); for (let i = 0; i < 4; i++) { const a = i * PI / 2; rb.g.add(P.rbox, i % 2 ? CHEESE : 0xffffff, Math.sin(a) * 1.9, 0, Math.cos(a) * 1.9, 0, a, 0, 0.32, 0.05, 3.6); }
    const rotor = toGroup(rb); rotor.position.set(0, 3.15, 0); root.add(rotor); const tb = MB(); for (let i = 0; i < 2; i++) tb.g.add(P.rbox, 0xffffff, 0, 0, 0, i * PI / 2, 0, 0, 0.04, 1.1, 0.16); tb.x.add(P.sphere, 0xd1d5db, 0, 0, 0, 0, 0, 0, 0.1); const tail = toGroup(tb); tail.position.set(0.12, 2.0, -4.35); root.add(tail);
    const pilot = makeRat('snowie', 'flower', { pack: false, extras: ['bow'], noBlaster: true }); pilot.root.scale.setScalar(1.1); pilot.root.position.set(-0.55, 0.62, 0.55); root.add(pilot.root);
    const seats = [[0.55, 0.62, 0.55], [-0.55, 0.62, -0.75], [0.55, 0.62, -0.75]].map((p) => new THREE.Vector3(...p));
    return { root, rotor, tail, pilot, seats, spin: 0, pos: new THREE.Vector3(), yaw: PAD_YAW, roll: 0, pitch: 0 }; }
  makeDrone() { const b = MB(); b.g.add(P.rbox, TEAL, 0, 0, 0, 0, 0, 0, 1.6, 0.45, 1.2); b.g.add(P.sphere, PINK, 0, 0.3, 0, 0, 0, 0, 0.5, 0.3, 0.4); b.l.add(P.sphere, CHEESE, 0, 0.0, 0.62, 0, 0, 0, 0.12, 0.08, 0.05, 1.0);
    const props = []; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { b.x.add(P.cyl, 0x64748b, sx * 0.75, 0.05, sz * 0.55, 0, 0, PI / 2, 0.05, 0.6, 0.05); b.x.add(P.torus, 0x94a3b8, sx * 1.15, 0.12, sz * 0.85, PI / 2, 0, 0, 0.5, 0.5, 0.6); });
    const root = new THREE.Group(); root.add(toGroup(b)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const pb = MB(); pb.g.add(P.rbox, 0xffffff, 0, 0, 0, 0, 0, 0, 0.85, 0.03, 0.1); pb.g.add(P.rbox, 0xffffff, 0, 0, 0, 0, PI / 2, 0, 0.85, 0.03, 0.1); const p = toGroup(pb, false); p.position.set(sx * 1.15, 0.16, sz * 0.85); root.add(p); props.push(p); });
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 8), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })); root.add(cable); const hk = MB(); hk.x.add(P.torus, 0xffd23f, 0, 0, 0, 0, 0, 0, 0.2, 0.2, 0.25); const hook = toGroup(hk); root.add(hook);
    return { root, props, cable, hook }; }
  // ------------------------------------------------ state
  refresh() { const g = this.g, q = R().q | 0, N = g.npc || {}; const up = q >= 4; // after the Grand Opening, Luna, Pi-rat and Torty move upstairs
    for (const [a, b] of [['rluna', 'f2luna'], ['rpirat', 'f2pirat'], ['rtorty', 'f2torty']]) { if (N[a]) N[a].hidden = up; if (N[b]) N[b].hidden = !up; } if (N.rsnowie) N.rsnowie.hidden = true; // Snowie is the pilot now: she lives on the roof
    g.hud.dirty = true; }
  parkHeli() { const H = this.heli; H.pos.set(PAD[0], PAD_Y, PAD[2]); H.yaw = PAD_YAW; H.roll = H.pitch = 0; this.heliAt = 'pad'; this.pose(); this.heliI.x = PAD[0]; this.heliI.z = PAD[2] + 2.6; this.heliI.y = ROOFY; this.heliI.r = 2.2;
    const s = this.heliS; s.off = false; s.min[0] = PAD[0] - 2.2; s.max[0] = PAD[0] + 2.2; s.min[2] = PAD[2] - 1.3; s.max[2] = PAD[2] + 1.3; s.min[1] = PAD_Y; s.max[1] = PAD_Y + 2.4; this.w.dirtyDyn && this.w.dirtyDyn(); }
  pose() { const H = this.heli, r = H.root; r.position.copy(H.pos); r.rotation.set(H.pitch, H.yaw, H.roll, 'YXZ'); r.updateMatrixWorld(true); }
  seatPos(i, out) { return this.heli.root.localToWorld(out.copy(this.heli.seats[Math.min(i, 2)])); }
  doorPose(s) { const o = 0.46 + s.k * 0.86; s.L.position.z = -o; s.R.position.z = o; s.cab.visible = s.k > 0.02; }
  // ------------------------------------------------ labels + actions
  label(o) { const f = F2(), fq = f.q | 0;
    if (o.kind === 'relev') return this.el ? null : Object.assign({}, o, { label: '🛗 Ride the elevator' });
    if (o.kind === 'rf2clue') { if (fq < 1) return Object.assign({}, o, { label: o.label.replace(/^\S+/, '👀') }); if (f.clues[o.id]) return Object.assign({}, o, { label: o.label.replace(/^\S+/, '✅') }); return o; }
    if (o.kind === 'rf2heli') { if (this.tour || this.tow || this.heliAt === 'gone') return null; if (this.heliAt === 'crash') return Object.assign({}, o, { label: '🛸 Ride the tow-drone back' }); return Object.assign({}, o, { label: fq >= 4 ? '🚁 Board Snowie\'s Sky Tour!' : '🚁 The Ratita Heli (keys missing!)' }); }
    return o; }
  act(o) { const g = this.g, f = F2();
    if (!this.owned()) { g.app.ui.rowLocked(); return; }
    if (o.kind === 'relev') return this.elevPanel(o.id);
    if (o.kind === 'rf2clue') { if ((f.q | 0) < 1) { g.toastMsg(({ desk: '📝 A sticky note… about keys? Snowie on the roof might know more.', lab: '🧪 A test log for a Key-Finder 3000. Interesting!', fridge: '🧊 A grumpy note about the snack machine.' })[o.id]); return; } const nw = !f.clues[o.id]; f.clues[o.id] = 1; persist(); const c = f2ClueText(o.id); g.app.ui.clue('f2' + o.id, c.t + ': ' + c.b, nw);
      if ((f.q | 0) === 1 && F2_CLUES.every((k) => f.clues[k])) { f.q = 2; persist(); setTimeout(() => { g.toastMsg('💡 Pi-rat → Key-Finder → break room → snack machine… The keys are stuck in spiral B4!'); g.sfx('check'); }, 700); } g.hud.dirty = true; return; }
    if (o.kind === 'rf2snack') { if ((f.q | 0) === 2) { f.q = 3; persist(); g.sfx('cheese'); g.fx.burst(66.0, F2Y + 1.5, 22.3, 0xffd23f, 16, 4); g.toastMsg('🔑 Clunk… jingle! The HELI KEYS drop out (with a Cheddar Crunch). Take them to Snowie on the roof!'); g.hud.dirty = true; return; }
      g.sfx('pop'); g.toastMsg(['🍪 Clunk! A Cheddar Crunch. Crunchy!', '🧃 A cheese smoothie box pops out. Slurp!', '🍪 Spiral B4 is empty now. A bit sad, but tidy.'][(Math.random() * 3) | 0]); return; }
    if (o.kind === 'rf2scope') return this.lookScope(o.id);
    if (o.kind === 'rf2heli') { if (this.heliAt === 'crash') { this.rideTow = true; g.toastMsg('🛸 Hop in! The tow-drone will fly you home.'); return; } if ((f.q | 0) < 4) { g.toastMsg((f.q | 0) === 3 ? '🔑 Give the keys to Snowie first! She\'s by the Heli Tours booth.' : '🔑 No keys, no flying! Snowie lost the heli keys. Talk to her by the booth.'); return; } this.startTour(); } }
  // ------------------------------------------------ ELEVATOR: pick a floor, doors close, ride with the floor dial, DING, doors open
  stopAt() { const me = this.g.me; return me.y > ROOFY - 0.5 ? 'roof' : me.y > F2Y - 0.5 ? 'f2' : 'g'; }
  elevPanel(from) { const g = this.g, ui = g.app.ui; ui.open(); const btn = Object.keys(FLOORS).map((k) => `<button class="${k === from ? 'mbtn2 cur' : 'go'}" data-f="${k}" ${k === from ? 'disabled' : ''}>${FN[k]}<small>${esc(FLOORS[k].split(' · ')[1])}</small></button>`).join('');
    panel(`<h2>🛗 RATITA ELEVATOR</h2><p class="sub">You are on floor <b>${FN[from]}</b>. Where to?</p><div class="elevBtns">${btn}</div><button class="mbtn2" id="eX">✖ Stay here</button>`, (c) => {
      c.querySelectorAll('[data-f]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); if (b.disabled) return; g.sfx('click'); closePanel(); this.ride(from, b.dataset.f); });
      c.querySelector('#eX').onclick = (ev) => { ev.stopPropagation(); ui.done(); }; }, 'elevP'); }
  ride(from, to) { const g = this.g; g.app.busy = true; this.el = { t: 0, from, to, moved: false, dinged: false }; this.stops[from].want = 1; g.sfx('door'); }
  updateElev(dt) { for (const s of Object.values(this.stops)) { const k = s.k + Math.sign(s.want - s.k) * dt * 2.4; s.k = Math.max(0, Math.min(1, k)); this.doorPose(s); }
    const E = this.el; if (!E) return; const g = this.g, me = g.me, ov = this.ov; E.t += dt; const a = ELEV[E.from], b = ELEV[E.to], up = (E.to === 'roof') || (E.to === 'f2' && E.from === 'g');
    if (E.t > 1.2 && E.t < 3.3) me.root.visible = false;
    if (E.t < 0.9) { if (E.t > 0.35) { const k = Math.min(1, (E.t - 0.35) / 0.45); me.x += (a[0] - 1.0 - me.x) * Math.min(1, dt * 8) * k; me.z += (a[2] - me.z) * Math.min(1, dt * 8) * k; me.yaw = angLerp(me.yaw, -PI / 2, dt * 8); } return; }
    if (E.t < 1.4) { this.stops[E.from].want = 0; return; }
    if (!E.shown) { E.shown = 1; ov.innerHTML = `<b>${FN[E.from]}</b><i>${up ? '▲' : '▼'}</i><b class="to">${FN[E.to]}</b>`; ov.className = 'on'; g.sfx('glide'); }
    if (E.t < 3.0) { g.cam.shake = Math.max(g.cam.shake || 0, 0.04); if (E.t > 2.0 && !E.moved) { E.moved = true; me.place([b[0] - 1.0, b[1], b[2]], -PI / 2); g.cam.yaw = -PI / 2; g.cam.snap = true; ov.innerHTML = `<b class="to big">${FN[E.to]}</b>`; } return; }
    if (!E.dinged) { E.dinged = true; ov.className = ''; g.sfx('ding'); this.stops[E.to].want = 1; const f = F2(); if (!f.up && E.to !== 'g') { f.up = 1; persist(); this.rp.badge('f2Up'); } g.toastMsg(E.to === 'roof' ? '🚁 DING! Rooftop: Snowie\'s Sky Tours!' : E.to === 'f2' ? '🛗 DING! Floor 2: Luna\'s office, the Test Lab and the Break Room.' : '🛗 DING! Lobby.'); }
    if (E.t < 4.2) { const k = Math.min(1, (E.t - 3.3) / 0.8); if (k > 0) { const tx = b[0] + 0.3, tz = b[2]; me.x += (tx - me.x) * Math.min(1, dt * 6); me.z += (tz - me.z) * Math.min(1, dt * 6); me.yaw = angLerp(me.yaw, PI / 2, dt * 8); } return; }
    this.stops[E.to].want = 0; this.el = null; g.app.busy = false; g.cam.yaw = PI / 2; }
  // ------------------------------------------------ TELESCOPES: a zoomed look at a landmark
  lookScope(i) { const g = this.g; const sights = [[[0, 6, -27], '🔭 Town Hall! The clock says it\'s… telescope o\'clock.'], [[0, 2.5, 0], '🔭 The Town Square fountain. A pup is making a wish!'], [[2, 1.5, 47], '🔭 Paw Park! Ducks, dogs and one very fast squirrel.'], [[-2, 9, -56], '🔭 Lookout Hill. Someone up there is looking back at you!']];
    const [tgt, msg] = sights[(i + (this._sc = ((this._sc | 0) + 1))) % sights.length]; const eye = new THREE.Vector3(g.me.x - 1.0, ROOFY + 1.6, g.me.z); g.toastMsg(msg); g.sfx('click'); g.app.busy = true; document.body.classList.add('riding'); const cam = g.cam;
    let t = 0, F0 = null; const T = new THREE.Vector3(...tgt);
    g.camRide = (dt, c, camera) => { t += dt; const k = smooth(Math.min(1, t / 0.6)) * (t > 3.4 ? Math.max(0, 1 - (t - 3.4) / 0.5) : 1); if (F0 == null) F0 = camera.fov; camera.position.copy(eye); const L = eye.clone().lerp(T, 0.02 + 0.98 * k); camera.lookAt(L.x, L.y, L.z); camera.fov = F0 * (1 - 0.6 * k); camera.updateProjectionMatrix();
      if (t > 3.9) { g.camRide = null; g.app.busy = false; document.body.classList.remove('riding'); camera.fov = F0; camera.updateProjectionMatrix(); cam.snap = true; } }; }
  // ------------------------------------------------ SKY TOURS
  startTour() { const g = this.g, f = F2(), me = g.me; if (this.tour || this.tow) return;
    const crash = !!(f.tours >= 1 && (window.__f2crash != null ? window.__f2crash : Math.random() < 0.25)), site = window.__f2site != null ? window.__f2site : (Math.random() * CRASH.length) | 0;
    const riders = []; for (const [k, p] of g.players) { if (Math.hypot(p.x - PAD[0], p.z - PAD[2]) < 8.5 && p.y > ROOFY - 1) riders.push(p.local ? this.localId() : k); } if (!riders.includes(this.localId())) riders.unshift(this.localId());
    const m = { t: 'heli', id: Math.random().toString(36).slice(2, 8), T0: +(g.T + 0.6).toFixed(2), crash: crash ? 1 : 0, site, riders: riders.slice(0, 3) };
    this.beginTour(m); const n = g.net; if (n && n.online) { if (n.isHost) n.bc(m); else n.send(m); } }
  onNet(m) { if (!m || m.t !== 'heli' || (this.tour && this.tour.id === m.id)) return; if (this.tour || this.tow) return; this.beginTour(m); }
  beginTour(m) { const g = this.g, me = g.me; const seat = m.riders.indexOf(this.localId()); const ride = seat >= 0 && Math.hypot(me.x - PAD[0], me.z - PAD[2]) < 9 && me.y > ROOFY - 1;
    this.tour = { id: m.id, T0: m.T0, crash: !!m.crash, site: CRASH[m.site % CRASH.length], riders: m.riders, seat: ride ? seat : -1, said: -1, phase: 'fly', cy: this.heli.yaw };
    if (m.crash) { const c = this.tour.site; this.tour.crashS = this.wpS[c[3]] + 6; }
    this.heliS.off = true; this.w.dirtyDyn && this.w.dirtyDyn(); this.heliAt = 'air'; this.heliI.r = 0;
    if (ride) { g.app.busy = true; document.body.classList.add('riding'); this.hideChat(); g.ride = (dt) => this.rideMe(dt); this.camStart(); g.sfx('honk'); this.say('🐀 Snowie: Welcome aboard! Rotor, clear the pad! Spinning up…'); }
    else if (seat >= 0) g.toastMsg('🚁 Snowie took off without you! Wait on the pad for the next tour.'); }
  hideChat() { const g = this.g; if (g.chat && g.endChat) g.endChat(); }
  say(t) { this.sub.textContent = t; this.sub.className = 'on'; clearTimeout(this._st); this._st = setTimeout(() => { this.sub.className = ''; }, 5200); }
  tourS(tt) { const V = 9.5, ta = 4, Tc = this.L / V; // trapezoid speed profile: gentle lift-off and landing
    if (tt <= 0) return 0; const Ttot = Tc + ta; if (tt >= Ttot) return this.L; const acc = V / ta; if (tt < ta) return 0.5 * acc * tt * tt; if (tt > Tc) { const r = Ttot - tt; return this.L - 0.5 * acc * r * r; } return 0.5 * acc * ta * ta + (tt - ta) * V; }
  updateTour(dt) { const A = this.tour; if (!A) return; const g = this.g, H = this.heli, T = g.T - A.T0;
    H.spin = Math.min(1, H.spin + dt * 0.6);
    if (A.phase === 'fly') { const s = this.tourS(T - 1.5), u = Math.min(1, s / this.L); const p = this.curve.getPointAt(u), tg = this.curve.getTangentAt(Math.min(0.999, Math.max(0.001, u)));
      H.pos.copy(p); if (T < 1.5) H.pos.y = PAD_Y + Math.max(0, T - 0.8) * 0.15; const hz = Math.hypot(tg.x, tg.z); const py = H.yaw; if (hz > 0.35) H.yaw = angLerp(H.yaw, Math.atan2(tg.x, tg.z), Math.min(1, dt * 1.6)); let yr = (H.yaw - py); if (yr > PI) yr -= 2 * PI; if (yr < -PI) yr += 2 * PI;
      H.roll += (Math.max(-0.38, Math.min(0.38, -yr / Math.max(dt, 1e-3) * 0.45)) - H.roll) * Math.min(1, dt * 3); H.pitch += ((s > 0 && s < this.L - 2 ? 0.07 : 0) - H.pitch) * Math.min(1, dt * 2);
      for (let i = A.said + 1; i < WP.length; i++) { if (s >= this.wpS[i] - 4) { A.said = i; if (WP[i][3] && A.seat >= 0) this.say('🐀 Snowie: ' + WP[i][3]); } else break; }
      if (A.crash && s >= A.crashS) { A.phase = 'fail'; A.ft = 0; A.p0 = H.pos.clone(); A.y0 = H.yaw; if (A.seat >= 0) { this.say('🐀 Snowie: Uh-oh. That\'s not a happy putt-putt… Hold on to your ears!'); g.sfx('sputter'); } }
      if (s >= this.L) { this.endTour(false); return; } }
    else if (A.phase === 'fail') { A.ft += dt; const c = A.site, D = 6.5, k = Math.min(1, A.ft / D); const gy = c[4] + 0.05, end = new THREE.Vector3(c[1], gy, c[2]); const mid = A.p0.clone().lerp(end, 0.5); mid.y = Math.max(A.p0.y, end.y) + 4;
      const q = 1 - k; H.pos.set(q * q * A.p0.x + 2 * q * k * mid.x + k * k * end.x, q * q * A.p0.y + 2 * q * k * mid.y + k * k * end.y, q * q * A.p0.z + 2 * q * k * mid.z + k * k * end.z);
      H.yaw = A.y0 + smooth(k) * PI * 2.5; H.roll = Math.sin(A.ft * 11) * 0.35 * (1 - k * 0.6); H.pitch = Math.sin(A.ft * 7) * 0.12; H.spin = 0.55 + Math.sin(A.ft * 9) * 0.35;
      if (Math.random() < dt * 22) { const t = this.heli.root.localToWorld(new THREE.Vector3(0, 1.8, -3.6)); g.fx.puff(t.x, t.y, t.z, 2, Math.random() < 0.5 ? 0x6b7280 : 0x9ca3af); }
      A.sp = (A.sp || 0) - dt; if (A.sp <= 0 && A.seat >= 0) { A.sp = 0.55; g.sfx('sputter'); } if (A.seat >= 0 && A.ft > 3 && !A.mid) { A.mid = 1; this.say('🐀 Snowie: Finding a soft spot… soft spot… THERE!'); }
      if (k >= 1) { A.phase = 'bounce'; A.bt = 0; g.sfx('bounce'); if (c[0] === 'fountain') g.fx.splash(c[1], gy + 0.4, c[2]); else g.fx.puff(c[1], gy + 0.3, c[2], 18, c[0] === 'hay' ? 0xfde68a : 0xd9f99d); g.cam.shake = 0.5; } }
    else if (A.phase === 'bounce') { A.bt += dt; const c = A.site, gy = c[4] + 0.05, t = A.bt; let h = 0; if (t < 0.7) h = Math.sin(t / 0.7 * PI) * 2.0; else if (t < 1.1) h = Math.sin((t - 0.7) / 0.4 * PI) * 0.6; else if (t < 1.3) h = Math.sin((t - 1.1) / 0.2 * PI) * 0.15;
      H.pos.set(c[1], gy + h, c[2]); H.roll += (0.14 - H.roll) * Math.min(1, dt * 6); H.pitch += (-0.08 - H.pitch) * Math.min(1, dt * 6); H.spin = Math.max(0, H.spin - dt * 0.6); if (t > 0.69 && !A.b2) { A.b2 = 1; g.sfx('bounce'); }
      if (t > 1.6) this.crashLanded(); }
    if (this.tour) { this.pose(); H.rotor.rotation.y += dt * 26 * H.spin; H.tail.rotation.x += dt * 30 * H.spin; this.pinRemotes(); } }
  pinRemotes() { const A = this.tour; if (!A || A.phase === 'down') return; const v = new THREE.Vector3(); for (const [k, p] of this.g.players) { if (p.local) continue; const i = A.riders.indexOf(k); if (i < 0) continue; if (Math.hypot(p.tx - this.heli.pos.x, p.tz - this.heli.pos.z) > 12) continue; this.seatPos(i, v); p.root.position.copy(v); p.root.rotation.y = this.heli.yaw; } }
  rideMe(dt) { const g = this.g, me = g.me, A = this.tour; const v = this.seatPos(A ? A.seat : 0, new THREE.Vector3()); me.x = v.x; me.y = v.y; me.z = v.z; me.yaw = this.heli.yaw; me.vx = me.vy = me.vz = 0; me.onGround = true; me.speed = 0; me.anim(dt); }
  camStart() { const g = this.g, c = g.cam; this.cr = { pos: E0(g), yaw: this.heli.yaw, look: new THREE.Vector3(this.heli.pos.x, this.heli.pos.y + 1.5, this.heli.pos.z) };
    g.camRide = (dt, cc, camera) => { const H = this.heli, C = this.cr; C.yaw = angLerp(C.yaw, H.yaw, Math.min(1, dt * 1.3)); const fw = new THREE.Vector3(Math.sin(C.yaw), 0, Math.cos(C.yaw)); const air = H.pos.y > ROOFY + 3 || (this.tour && this.tour.phase !== 'fly') || this.tow;
      const back = air ? 13 : 9.5, upY = air ? 5.2 : 3.6; const ca = C.yaw + (air ? 0.6 : 0.35), want = new THREE.Vector3(H.pos.x - Math.sin(ca) * back, H.pos.y + upY, H.pos.z - Math.cos(ca) * back); // 3/4 rear view: the passengers show past the tail const lk = new THREE.Vector3(H.pos.x + fw.x * 4, H.pos.y + 1.4, H.pos.z + fw.z * 4);
      const k = 1 - Math.exp(-dt * 2.6); C.pos.lerp(want, k); C.look.lerp(lk, 1 - Math.exp(-dt * 4)); const sh = (cc.shake || 0); cc.shake = Math.max(0, sh - dt * 1.5);
      camera.position.set(C.pos.x + (Math.random() - 0.5) * sh, C.pos.y + (Math.random() - 0.5) * sh, C.pos.z + (Math.random() - 0.5) * sh); camera.lookAt(C.look); if (C.f0 == null) C.f0 = camera.fov; const fv = C.f0 * 0.92; if (Math.abs(camera.fov - fv) > 0.01) { camera.fov = fv; camera.updateProjectionMatrix(); } cc.pos.copy(camera.position); cc.tgt.copy(C.look); }; }
  camEnd() { const g = this.g; if (this.cr && this.cr.f0) { E_CAM(g).fov = this.cr.f0; E_CAM(g).updateProjectionMatrix(); } g.camRide = null; document.body.classList.remove('riding'); const c = g.cam; c.yaw = g.me.yaw; c.snap = true; const cam = g.cam; void cam; }
  crashLanded() { const g = this.g, A = this.tour, f = F2(), me = g.me, c = A.site; A.phase = 'down'; this.heliAt = 'crash'; this.crashAt = g.T;
    const H = this.heli; this.heliI.x = H.pos.x + 2.6; this.heliI.z = H.pos.z; this.heliI.y = c[4]; this.heliI.r = 2.4; const s = this.heliS; s.off = false; s.min[0] = H.pos.x - 1.8; s.max[0] = H.pos.x + 1.8; s.min[2] = H.pos.z - 1.8; s.max[2] = H.pos.z + 1.8; s.min[1] = c[4]; s.max[1] = c[4] + 2.2; this.w.dirtyDyn && this.w.dirtyDyn();
    if (A.seat >= 0) { g.ride = null; this.camEnd(); g.app.busy = false; const a = H.yaw + PI / 2 + A.seat * 0.6; const px = H.pos.x + Math.sin(a) * 2.8, pz = H.pos.z + Math.cos(a) * 2.8; const gy = this.w.ground(px, pz, c[4] + 3, 0.1).y; me.place([px, (gy > -50 ? gy : c[4]) + 0.15, pz], a); g.cam.yaw = a + PI; g.cam.snap = true;
      this.stars.t = 3.8; this.stars.grp.visible = true; f.crashes = (f.crashes | 0) + 1; f.tours = (f.tours | 0) + 1; persist(); this.rp.badge('f2Crash'); if (f.tours >= 1) this.rp.badge('f2Tour'); g.hud.dirty = true;
      this.say('🐀 Snowie: ' + c[5]); setTimeout(() => { if (this.heliAt === 'crash') this.say('🐀 Snowie: Everyone OK? Dizzy stars are totally normal! Walk back, or hop in and ride Rotor\'s tow-drone home!'); }, 4500);
      g.toastMsg('💫 Bumpy landing! Nobody hurt. Walk back to Ratita Row, or tap the heli to ride the tow-drone home.'); }
    this.tour = null; this.rideTow = false; }
  endTour() { const g = this.g, A = this.tour, f = F2(); this.tour = null; this.parkHeli(); this.heli.spin = 0.6;
    if (A && A.seat >= 0) { g.ride = null; this.camEnd(); g.app.busy = false; const v = new THREE.Vector3(PAD[0], ROOFY + 0.15, PAD[2] + 3.4); g.me.place([v.x, v.y, v.z], PI); g.cam.yaw = PI; g.cam.snap = true; f.tours = (f.tours | 0) + 1; persist(); this.rp.badge('f2Tour'); coins(8, g, 'Sky Tour'); this.say('🐀 Snowie: Thanks for flying Snowie\'s Sky Tours! Come back soon! 💖'); g.fx.confetti(v.x, v.y + 1.5, v.z, 40); g.sfx('win'); g.hud.dirty = true; } }
  // tow-drone: flies out from the roof, hooks the heli and carries it home (riders included)
  updateTow(dt) { const g = this.g, H = this.heli;
    if (this.heliAt === 'crash' && !this.tow && g.T - this.crashAt > 9) { this.tow = { t: 0, from: H.pos.clone(), ride: !!this.rideTow && Math.hypot(g.me.x - H.pos.x, g.me.z - H.pos.z) < 9 }; this.drone.root.visible = true; this.heliI.r = 0; if (this.tow.ride) { g.app.busy = true; g.ride = (d) => { const v = this.seatPos(0, new THREE.Vector3()); const me = g.me; me.x = v.x; me.y = v.y; me.z = v.z; me.yaw = H.yaw; me.vy = 0; me.onGround = true; me.speed = 0; me.anim(d); }; document.body.classList.add('riding'); this.camStart(); this.say('🛸 Rotor: Tow-drone here! Hold tight, flying you home!'); } else if (Math.hypot(g.me.x - H.pos.x, g.me.z - H.pos.z) < 30) g.toastMsg('🛸 Here comes Rotor\'s tow-drone to carry the heli home!'); this.heliS.off = true; this.w.dirtyDyn && this.w.dirtyDyn(); }
    const T = this.tow; const D = this.drone; for (const p of D.props) p.rotation.y += dt * 30; if (!T) return; T.t += dt; const t = T.t;
    const home = new THREE.Vector3(PAD[0], PAD_Y, PAD[2]); const dist = T.from.distanceTo(home), dur = Math.max(6, dist / 11); const hang = 3.6;
    if (t < 3) { const k = smooth(t / 3); const start = new THREE.Vector3(PAD[0], ROOFY + 8, PAD[2]); const over = T.from.clone(); over.y += 3.6 + hang; D.root.position.lerpVectors(start, over, k); D.root.position.y += Math.sin(k * PI) * 6; }
    else if (t < 4) { const over = T.from.clone(); over.y += 3.6 + hang * (1 - (t - 3) * 0.0); D.root.position.copy(over); H.roll += (0 - H.roll) * dt * 4; H.pitch += (0 - H.pitch) * dt * 4; }
    else if (t < 4 + dur) { const k = smooth((t - 4) / dur); const a = T.from, b = home; H.pos.set(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k + Math.sin(k * PI) * 14, a.z + (b.z - a.z) * k); H.yaw = angLerp(H.yaw, PAD_YAW, dt * 0.8); H.roll = Math.sin(t * 2) * 0.05; H.pitch = 0; D.root.position.set(H.pos.x, H.pos.y + 3.6 + hang, H.pos.z); }
    else { this.tow = null; D.root.visible = false; const rode = !!g.ride && T.ride; this.parkHeli(); if (rode) { g.ride = null; this.camEnd(); g.app.busy = false; g.me.place([PAD[0], ROOFY + 0.15, PAD[2] + 3.4], PI); g.cam.yaw = PI; g.cam.snap = true; this.say('🛸 Rotor: Delivered! One heli, one happy passenger. Good as new!'); } return; }
    D.root.rotation.y = H.yaw; const top = new THREE.Vector3(H.pos.x, H.pos.y + 3.3, H.pos.z), dp = D.root.position; const len = Math.max(0.1, dp.y - top.y); D.cable.visible = t > 2.6; D.cable.position.set(0, -len / 2, 0); D.cable.scale.set(1, len, 1); D.hook.position.set(0, -len, 0); D.cable.rotation.set(0, 0, 0);
    this.pose(); }
  updateStars(dt) { const S = this.stars; if (S.t <= 0) return; S.t -= dt; const me = this.g.me; S.grp.position.set(me.x, me.y + me.hgt + 0.45, me.z); S.grp.children.forEach((m, i) => { const a = this.g.T * 4 + i / 5 * PI * 2; m.position.set(Math.cos(a) * 0.42, Math.sin(this.g.T * 6 + i) * 0.05, Math.sin(a) * 0.42); m.rotation.set(0, -a, 0); }); if (S.t <= 0) S.grp.visible = false; }
  gearCheck(got) { const s = this.w.f2GearStart; if (s == null) return; for (let i = s; i < this.w.rowGears.length; i++) if (!got.has(i)) return; this.rp.badge('f2Gears'); }
  update(dt) { const g = this.g; this.updateElev(dt); this.updateTour(dt); this.updateTow(dt); this.updateStars(dt);
    if (this.heliAt === 'pad' && !this.tour) { const H = this.heli; H.spin = Math.max(0, H.spin - dt * 0.25); H.rotor.rotation.y += dt * 26 * H.spin; H.tail.rotation.x += dt * 30 * H.spin; }
    if (this.heliAt === 'crash') { const H = this.heli; H.rotor.rotation.y += dt * 2 * Math.max(0.05, H.spin); if (Math.random() < dt * 3) { const t = H.root.localToWorld(new THREE.Vector3(0, 2.2, -1)); g.fx.puff(t.x, t.y, t.z, 1, 0xd1d5db); } }
    const near = Math.hypot(g.me.x - this.heli.pos.x, g.me.z - this.heli.pos.z) < 140; this.heli.root.visible = near; }
}
function E0(g) { return g.cam.pos.clone ? g.cam.pos.clone() : new THREE.Vector3(); }
function E_CAM(g) { return g.app.E ? g.app.E.camera : window.__hq.E.camera; }
