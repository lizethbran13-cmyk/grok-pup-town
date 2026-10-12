// RATITA ROW runtime (Ratita Super Expansion DLC): the gate force field, Zip-Pads, Golden Gears, the Missing Prototype
// mystery (clues, runaway Sweepy, the ribbon cutting), the Turbo Test Track + Squeak Zapper Range (3D), the Gadget Store
// gadgets, region culling for the district and co-op DLC sharing (the host's copy unlocks it for guests).
import * as THREE from 'three';
import { MB, toGroup, makeRat } from './models.js?v=20261011r38d';
import { P } from './geo.js?v=20261011r38d';
import { rcyl, sph, torus, gear, capsule, cone, wedge } from './shapes.js?v=20261011r38d';
import { S, persist } from './save.js?v=20261011r38d';
import { inView } from './perf.js?v=20261011r38d';
import { inRow, trackPt, TRACK } from './row.js?v=20261011r38d';
import { Floor2 } from './floor2.js?v=20261011r38d';
import { R, ownsRow, coins, ROW_BADGES, ROW_CLUES, rowClueText, shopItem, SHOP, DLC_NAME } from './rowdata.js?v=20261011r38d';
const PI = Math.PI;
const PINK = 0xff4fa0, CHEESE = 0xffc93c, TEAL = 0x22d3ee;
export const TRACK_GOLD = 30, TRACK_SILVER = 36, TRACK_BRONZE = 45;
export class RowPlay {
  constructor(g) { this.g = g; const w = this.w = g.world, sp = w.rowSpots; this.sp = sp; R(); this.track = null; this.range = null; this.flying = [];
    // gate force field (a dynamic collider + a shimmering curtain) while the DLC is locked
    this.fieldS = w.solid(48.3, 0, 42.6, 49.7, 7, 50.4, { dyn: true });
    { const m = new THREE.Mesh(new THREE.PlaneGeometry(6.3, 5.4), new THREE.MeshBasicMaterial({ color: 0xff7ac8, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
      m.position.set(49, 2.7, 46.5); m.rotation.y = PI / 2; this.field = g.add(m);
      const lk = MB(); lk.x.add(P.torus, 0xffd23f, 0, 0.42, 0, 0, 0, 0, 0.32, 0.32, 0.5); lk.g.add(P.rbox, 0xffd23f, 0, 0, 0, 0, 0, 0, 0.9, 0.75, 0.3); lk.m.add(P.sphere, 0x7c4a03, 0, 0.02, 0.14, 0, 0, 0, 0.1, 0.12, 0.04); this.lock = g.add(toGroup(lk)); this.lock.position.set(48.6, 2.8, 46.5); this.lock.rotation.y = -PI / 2; }
    // Golden Gears (instanced, spinning)
    { const geo = gear(10).clone(); geo.computeBoundingSphere(); this.gearIM = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xffc83d, metalness: 0.85, roughness: 0.22, emissive: 0x6a4700, emissiveIntensity: 0.5 }), w.rowGears.length); this.gearIM.frustumCulled = false; this.gearIM.castShadow = true; g.add(this.gearIM); }
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._s = new THREE.Vector3(); this._p = new THREE.Vector3();
    // grand opening ribbon with a big bow
    { const [x, y, z] = sp.ribbon, b = MB(); b.f.add(P.rbox, 0xff2d78, 0, 0, 0, 0, 0, 0, 3.5, 0.22, 0.04); [-1, 1].forEach((s) => { b.f.add(P.sphere, 0xff2d78, s * 0.22, 0.02, 0.03, 0, 0, s * 0.5, 0.24, 0.16, 0.08); b.f.add(P.rbox, 0xff2d78, s * 0.14, -0.28, 0.03, 0, 0, s * 0.3, 0.1, 0.45, 0.03); }); b.g.add(P.sphere, 0xffd23f, 0, 0.02, 0.06, 0, 0, 0, 0.08); this.ribbon = g.add(toGroup(b)); this.ribbon.position.set(x, y, z); }
    // the PUP-TRANSLATOR: a pink gadget with a screen, a speaker grille, puppy ears and an antenna
    { const b = MB(); b.g.add(P.rbox, PINK, 0, 0, 0, 0, 0, 0, 0.5, 0.36, 0.24); b.l.add(P.rbox, 0x7df9ff, 0, 0.03, 0.12, 0, 0, 0, 0.34, 0.16, 0.02, 0.6); [-1, 1].forEach((s) => b.g.add(P.sphere, 0xa9afbd, s * 0.2, 0.22, 0, 0, 0, s * 0.4, 0.09, 0.14, 0.05)); b.x.add(P.cyl, 0x94a3b8, 0.12, 0.3, 0, 0, 0, 0, 0.015, 0.22, 0.015); b.l.add(P.sphere, 0xffd23f, 0.12, 0.43, 0, 0, 0, 0, 0.04, 0.04, 0.04, 1);
      for (let i = 0; i < 3; i++) b.m.add(P.sphere, 0x1e293b, -0.1 + i * 0.1, -0.11, 0.12, 0, 0, 0, 0.025, 0.025, 0.01); this.trans = g.add(toGroup(b)); }
    // SWEEPY v2: the runaway robo-vacuum
    { const b = MB(); b.g.add(rcyl(0.45, 0.16, 0.06, 32), 0xe5e7eb, 0, 0.05, 0); b.x.add(rcyl(0.3, 0.08, 0.03, 24), 0x94a3b8, 0, 0.21, 0); b.l.add(P.sphere, 0xff3b3b, 0, 0.18, 0.4, 0, 0, 0, 0.05, 0.04, 0.03, 0.9); b.g.add(P.rbox, PINK, 0, 0.13, -0.36, 0, 0, 0, 0.36, 0.06, 0.06); [-1, 1].forEach((s) => b.l.add(P.sphere, 0x7df9ff, s * 0.1, 0.24, 0.24, 0, 0, 0, 0.05, 0.03, 0.03, 0.7));
      const root = new THREE.Group(); root.add(toGroup(b)); const br = MB(); for (let k = 0; k < 6; k++) br.f.add(P.rbox, 0xffd23f, Math.cos(k) * 0.08, 0, Math.sin(k) * 0.08, 0, k, 0, 0.26, 0.02, 0.04); const brush = toGroup(br, false); brush.position.set(0.32, 0.04, 0.28); root.add(brush); const brush2 = brush.clone(); brush2.position.x = -0.32; root.add(brush2);
      root.scale.setScalar(1.25); this.sweepy = { root, brush, brush2, s: 0 }; g.add(root); }
    // Luna's golden statue on the plaza
    { const r = makeRat('luna', 'crown', { pack: false, noBlaster: true }); const gold = new THREE.MeshStandardMaterial({ color: 0xffc83d, metalness: 0.95, roughness: 0.22 }); r.root.traverse((o) => { if (o.isMesh) o.material = gold; }); r.root.position.set(...sp.statue); r.root.rotation.y = -PI / 2; r.root.scale.setScalar(2.3); g.add(r.root); this.statue = r.root;
      const gb = MB(); gb.x.add(gear(10), 0xffc83d, 0, 0, 0, 0, 0, 0, 0.32, 0.32, 0.2); const ge = toGroup(gb); ge.position.set(sp.statue[0] - 0.55, sp.statue[1] + 2.35, sp.statue[2] + 0.5); g.add(ge); this.statueGear = ge; }
    // Zapper Range targets (pop-up robots and golden cheese)
    this.targets = sp.targets.map(([x, z], i) => { const grp = new THREE.Group(); const robo = MB(); robo.x.add(P.cyl, 0x64748b, 0, 0.3, 0, 0, 0, 0, 0.04, 0.6, 0.04); robo.g.add(P.rbox, [PINK, TEAL, 0xa66bff][i % 3], 0, 0.85, 0, 0, 0, 0, 0.62, 0.5, 0.16); robo.l.add(P.sphere, 0xffffff, -0.13, 0.9, 0.08, 0, 0, 0, 0.08, 0.08, 0.03, 0.5); robo.l.add(P.sphere, 0xffffff, 0.13, 0.9, 0.08, 0, 0, 0, 0.08, 0.08, 0.03, 0.5); robo.m.add(P.sphere, 0x111827, -0.13, 0.9, 0.11, 0, 0, 0, 0.04, 0.04, 0.02); robo.m.add(P.sphere, 0x111827, 0.13, 0.9, 0.11, 0, 0, 0, 0.04, 0.04, 0.02); robo.x.add(P.cyl, 0x94a3b8, 0, 1.18, 0, 0, 0, 0, 0.015, 0.16, 0.015); robo.l.add(P.sphere, 0xffd23f, 0, 1.28, 0, 0, 0, 0, 0.05, 0.05, 0.05, 1);
      const r = toGroup(robo); const ch = MB(); ch.x.add(P.cyl, 0x64748b, 0, 0.3, 0, 0, 0, 0, 0.04, 0.6, 0.04); ch.x.add(wedge(), 0xffc83d, -0.35, 0.65, -0.08, 0, 0, 0, 0.7, 0.7, 0.18); const c = toGroup(ch); grp.add(r, c); grp.position.set(x, 0, z); grp.scale.set(1, 0.001, 1); g.add(grp); return { grp, r, c, x, z, up: 0, t: 0, kind: 0, k: 0 }; });
    // track marker ring
    this.ring = g.add(new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.1, 12, 40), new THREE.MeshBasicMaterial({ color: 0xff4fa0, toneMapped: false }))); this.ring.visible = false;
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 12), new THREE.MeshStandardMaterial({ color: 0xc6f432, roughness: 0.7 }));
    this.gearGot = new Set(R().gears); this.applyGadgets(); this.refresh(); this.f2 = new Floor2(g, this); }
  owned() { return ownsRow() || !!this.g.rowShared; }
  // ------------------------------------------------ state-driven placement
  refresh() { const r = R(), q = r.q | 0, sp = this.sp, own = this.owned();
    this.fieldS.off = own; this.field.visible = this.lock.visible = !own;
    this.ribbon.visible = q < 4; this.trans.visible = q >= 2; this.sweepy.root.visible = q >= 2 || q < 2;
    if (q >= 4) { this.trans.position.set(...sp.museumPed); this.trans.position.y += 0.25; this.trans.scale.setScalar(1.3); } else this.trans.scale.setScalar(1);
    if (q !== 2) { this.sweepy.root.position.set(59.4, 0.0, 16.0); this.sweepy.root.rotation.y = PI; } if (this.f2) this.f2.refresh(); this.g.hud.dirty = true; }
  applyGadgets() { const r = R(), me = this.g.me, own = this.owned(); for (const it of SHOP) if (it.kind === 'gadget') { if (own && r.items[it.id] && !r.off[it.id]) me.gadgets.add(it.id); else me.gadgets.delete(it.id); } }
  vis(v, R0) { const me = this.g.me; if (inRow(me.x, me.z) || (me.x > 30 && me.z > -14 && me.z < 84)) v.add('row'); else v.add('rowFar'); const dO = Math.hypot(me.x - 63, me.z - 30); const reg = R0 || this.g.region; if (me.y > 9 && dO < 60) v.add('r_roof'); if (me.y > 6) v.delete('r_office'); if (reg === 'r_office') v.delete('r_f2'); /* one storey at a time */ }
  inside() { return inRow(this.g.me.x, this.g.me.z); }
  // ------------------------------------------------ frame
  update(dt) { const g = this.g, me = g.me, T = g.T, r = R(), q = r.q | 0, inside = this.inside(), near = inside || me.x > 30;
    { const zk = (near ? 1 : 0) + (inside ? 2 : 0); if (zk !== this._zk) { this._zk = zk; g.setVis(g.region, true); g.hud.dirty = true; } }
    if (this._own !== this.owned()) { this._own = this.owned(); this.refresh(); this.applyGadgets(); }
    // locked (e.g. the host left): send you back through the gate
    if (inside && !this.owned() && !this._kick) { this._kick = 1; g.app.ui.fade(() => { me.place([45.5, 0.2, 46.5], -PI / 2); g.cam.snap = true; this._kick = 0; }); g.toastMsg('🔒 Ratita Row needs the ' + DLC_NAME + ' DLC'); }
    if (inside && this.owned() && !r.seen) { r.seen = 1; persist(); g.toastMsg('🐀 Welcome to RATITA ROW! Luna is waiting in the Branch Office.'); g.sfx('cheese'); }
    if (this.field.visible) { this.field.material.opacity = 0.26 + Math.sin(T * 3) * 0.08; this.lock.position.y = 2.8 + Math.sin(T * 2) * 0.1; }
    // gears
    const G = this.w.rowGears; this.gearIM.visible = near; if (near) { for (let i = 0; i < G.length; i++) { const p = G[i], got = this.gearGot.has(i); this._q.setFromEuler(this._e.set(PI / 2 * 0, T * 1.6 + i, 0)); this._p.set(p[0], p[1] + Math.sin(T * 2 + i) * 0.08, p[2]); this._s.set(got ? 0 : 0.42, got ? 0 : 0.42, got ? 0 : 0.3); this._m.compose(this._p, this._q, this._s); this.gearIM.setMatrixAt(i, this._m); } this.gearIM.instanceMatrix.needsUpdate = true; if (this.owned()) this.collect(); }
    // statue gear spin, ribbon flutter, translator
    this.statueGear.rotation.z = T * 0.8; if (this.ribbon.visible) this.ribbon.rotation.x = Math.sin(T * 2.2) * 0.05;
    if (q === 3) { this.trans.position.set(me.x, me.y + me.hgt + 0.42 + Math.sin(T * 4) * 0.05, me.z); this.trans.rotation.y = T * 1.5; if (Math.random() < dt * 5) g.fx.sparkle(me.x, me.y + me.hgt + 0.4, me.z, 0xff9bd2); }
    else if (q >= 4) this.trans.rotation.y = T * 0.6;
    // Sweepy: zooms round the Test Track with the Translator (q 2), naps on its dock otherwise
    { const sw = this.sweepy; sw.brush.rotation.y = T * 14; sw.brush2.rotation.y = -T * 14;
      if (q === 2) { sw.s = (sw.s + dt * 5.6 / (2 * (TRACK.xb - TRACK.xa) + 2 * PI * TRACK.r)) % 1; const [x, z, yaw] = trackPt(sw.s); sw.root.position.set(x, Math.abs(Math.sin(T * 9)) * 0.03, z); sw.root.rotation.y = yaw; this.trans.position.set(x, 0.62, z); this.trans.rotation.y = yaw;
        if (Math.random() < dt * 10) g.fx.puff(x - Math.sin(yaw) * 0.6, 0.1, z - Math.cos(yaw) * 0.6, 1, 0xfde68a);
        if (Math.hypot(me.x - x, me.z - z) < 1.6 && Math.abs(me.y - 0) < 1.6) this.caught(); } }
    if (q >= 4 && this.region() === 'row' && Math.random() < dt * 2.2) g.fx.confetti(75 + (Math.random() - 0.5) * 8, 6, 46.5 + (Math.random() - 0.5) * 6, 5);
    for (const p of g.players.values()) { const pr = p.rig.hat && p.rig.hat.getObjectByName('prop'); if (pr) pr.rotation.y += dt * (3 + Math.min(10, p.speed || 0) * 2.2); } // propeller caps spin faster when you run
    this._fc = (this._fc || 0) - dt; if (this._fc <= 0) { this._fc = 0.5; this.farCull(); }
    this.updateTrack(dt); this.updateRange(dt); this.updateFlying(dt); this.f2.update(dt); }
  // deep inside Ratita Row the far side of town (park + square props, ~80 m+ away and behind the hedge) is skipped
  farCull() { const g = this.g, me = g.me, deep = me.x > 52 && this.inside() && !g.ride && !g.camRide && g.region !== 'r_roof', out = g.world.regionMeshes.out || [], on = g.vis && g.vis.has('out'); if (!deep && !this._culled) return; this._culled = deep;
    for (const m of out) { if (!on) { m.visible = false; continue; } if (!deep) { m.visible = true; continue; } const s = m.geometry.boundingSphere; m.visible = Math.hypot(s.center.x - me.x, s.center.z - me.z) - s.radius < 62; } }
  region() { return this.inside() && this.g.region === 'out' ? 'row' : this.g.region; }
  collect() { const me = this.g.me, G = this.w.rowGears, g = this.g;
    for (let i = 0; i < G.length; i++) { if (this.gearGot.has(i)) continue; const p = G[i]; if (Math.abs(me.x - p[0]) < 0.85 && Math.abs(me.z - p[2]) < 0.85 && me.y + me.hgt + 0.3 > p[1] && me.y < p[1] + 0.7) { this.gearGot.add(i); const r = R(); r.gears = [...this.gearGot]; persist(); g.sfx('part'); g.fx.sparkle(p[0], p[1], p[2], 0xffd23f); g.fx.burst(p[0], p[1], p[2], 0xffd23f, 12, 4);
      const n = this.gearGot.size; g.toastMsg(`⚙️ Golden Gear ${n}/${G.length} · +5 🧀`); coins(5, null); if (n >= G.length) { this.badge('rowGears'); coins(25, g, 'every Golden Gear!'); } this.f2.gearCheck(this.gearGot); g.hud.dirty = true; } } }
  badge(id) { const r = R(); if (r.badges[id]) return; r.badges[id] = 1; S.badges['row_' + id] = 1; persist(); this.g.toastMsg('🏅 Badge: ' + ROW_BADGES[id]); this.g.sfx('win'); }
  // ------------------------------------------------ the mystery
  addClue(id) { const r = R(); if ((r.q | 0) < 1) { this.g.toastMsg('🤔 Hmm, something is odd here… Luna in the Branch Office might know more.'); return; } const nw = !r.clues[id]; r.clues[id] = 1; persist(); this.g.app.ui.clue(id, rowClueText(id), nw);
    if ((r.q | 0) === 1 && ROW_CLUES.every((c) => r.clues[c])) { r.q = 2; persist(); this.sweepy.s = 0.1; this.refresh(); setTimeout(() => { this.g.toastMsg('💡 Tire tracks, sweeping, a round blur, TIDY UP EVERYTHING SHINY… It\'s SWEEPY! Catch it at the Test Track!'); this.g.sfx('check'); }, 700); }
    this.g.hud.dirty = true; }
  caught() { const r = R(), g = this.g; if ((r.q | 0) !== 2) return; r.q = 3; persist(); this.refresh(); g.fx.confetti(g.me.x, g.me.y + 1.5, g.me.z, 50); g.sfx('win'); g.toastMsg('🧹 Gotcha, Sweepy! You got the PUP-TRANSLATOR back. Bring it to Luna!'); }
  solve() { const r = R(), g = this.g; r.q = 4; persist(); this.refresh(); this.badge('rowHero'); coins(50, g, 'Grand Opening Hero'); g.fx.confetti(g.me.x, g.me.y + 1.5, g.me.z, 140); g.sfx('win'); const [x, y, z] = this.sp.ribbon; for (let i = 0; i < 3; i++) setTimeout(() => g.fx.confetti(x, y + 1, z, 50), 300 * i);
    setTimeout(() => { g.app.busy = true; g.app.ui.rowFinale(); }, 500); }
  // ------------------------------------------------ interaction labels / actions
  label(o) { const own = this.owned(), q = R().q | 0;
    if (this.track || this.range) return o && o.kind === 'rmg' && o.id === (this.track ? 'track' : 'range') ? Object.assign({}, o, { label: '✖ Stop' }) : null;
    if (!o) return o;
    if (o.kind === 'relev' || o.kind.startsWith('rf2')) return this.f2.label(o);
    if (o.kind === 'rgate') return own ? null : o;
    if (o.kind === 'rzip' && o.id === 'town' && !own) return Object.assign({}, o, { label: '🔒 Zip-Pad to Ratita Row (DLC)' });
    if (o.kind === 'rclue' && (q < 1 || R().clues[o.id])) return q < 1 ? null : Object.assign({}, o, { label: o.label.replace(/^\S+/, '✅') });
    return o; }
  act(o) { const g = this.g, ui = g.app.ui, r = R();
    if (o.kind === 'rgate') { ui.rowLocked(); return; }
    if (o.kind === 'relev' || o.kind.startsWith('rf2')) { this.f2.act(o); return; }
    if (o.kind === 'rzip') { if (!this.owned()) { ui.rowLocked(); return; } const to = o.id === 'town' ? [80.4, 0.3, 48.6, PI] : [-8.8, 0.3, 13.4, 0]; g.sfx('glide'); g.fx.ring(g.me.x, g.me.y + 0.2, g.me.z, 0x3ff0ff, 2, 0.5);
      ui.fade(() => { g.me.place([to[0], to[1], to[2]], to[3]); g.cam.snap = true; g.cam.yaw = to[3]; g.fx.ring(to[0], 0.3, to[2], 0xff4fa0, 2, 0.5); }); if (!r.zip) { r.zip = 1; persist(); this.badge('rowZip'); } g.toastMsg(o.id === 'town' ? '🌀 ZAP! Welcome to Ratita Row!' : '🌀 ZAP! Back to the Town Square.'); return; }
    if (o.kind === 'rclue') { this.addClue(o.id); return; }
    if (o.kind === 'rshop') { ui.rowShop(this); return; }
    if (o.kind === 'rmg') { if (o.id === 'track') { if (this.track) this.endTrack(true); else this.startTrack(); } else if (o.id === 'range') { if (this.range) this.endRange(true); else this.startRange(); } else ui.rowGame(o.id, this); } }
  // ------------------------------------------------ TURBO TEST TRACK: 2 laps through the glowing gates
  startTrack() { const g = this.g; const [sx, sz] = this.sp.trackStart; g.me.place([sx, 0.1, sz], -PI / 2); g.cam.yaw = -PI / 2; g.cam.snap = true; const gates = []; for (let l = 0; l < 2; l++) for (let k = 1; k <= 8; k++) gates.push(l + k / 8);
    this.track = { t: -3, i: 0, last: 4, gates }; this.ring.visible = true; g.sfx('check'); g.toastMsg('🏁 Ready… 2 laps, follow the pink rings!' + (g.me.gadgets.has('turbo') ? ' (Turbo Sneakers ON 👟)' : '')); }
  updateTrack(dt) { const A = this.track; if (!A) return; const g = this.g, me = g.me; A.t += dt; const [sx, sz] = this.sp.trackStart;
    if (A.t < 0) { const c = Math.ceil(-A.t); if (c !== A.last) { A.last = c; g.toastMsg(c + '…'); g.sfx('click'); } g.hud.timer('🏁 ' + c); me.x = sx; me.z = sz; this.placeRing(A); return; }
    if (A.last > 0) { A.last = 0; g.toastMsg('🏁 GO GO GO!'); g.sfx('win'); }
    const [gx, gz] = this.placeRing(A); if (Math.hypot(me.x - gx, me.z - gz) < 2.5) { A.i++; g.sfx(A.i >= A.gates.length ? 'win' : 'part'); g.fx.burst(gx, me.y + 1, gz, 0xff4fa0, 10, 4); if (A.i >= A.gates.length) return this.endTrack(); }
    g.hud.timer(`🏁 ${A.t.toFixed(1)} s · lap ${Math.min(2, 1 + Math.floor(A.i / 8))}/2 · ${A.i}/${A.gates.length}`); if (A.t > 90) { g.toastMsg('🏁 Time\'s up! Try again from the green pad.'); this.endTrack(true); } }
  placeRing(A) { const s = A.gates[Math.min(A.i, A.gates.length - 1)] % 1; const [x, z, yaw] = trackPt(s === 0 ? 0.9999 : s); this.ring.position.set(x, 1.3, z); this.ring.rotation.set(0, yaw, 0); this.ring.scale.setScalar(1 + Math.sin(this.g.T * 6) * 0.05); return [x, z]; }
  endTrack(quit) { const A = this.track, g = this.g; this.track = null; this.ring.visible = false; g.hud.timer(''); if (quit || !A) { if (quit) g.toastMsg('🏁 Run cancelled'); return; } const r = R(), t = A.t, nb = !r.best.track || t < r.best.track; if (nb) r.best.track = +t.toFixed(2); persist();
    const medal = t < TRACK_GOLD ? '🥇 GOLD' : t < TRACK_SILVER ? '🥈 SILVER' : t < TRACK_BRONZE ? '🥉 BRONZE' : ''; const pay = t < TRACK_GOLD ? 30 : t < TRACK_SILVER ? 20 : t < TRACK_BRONZE ? 12 : 6;
    g.fx.confetti(g.me.x, g.me.y + 1.5, g.me.z, 60); g.toastMsg(`🏁 ${t.toFixed(1)} s${medal ? ' · ' + medal + '!' : ''}${nb ? ' · NEW BEST' : ''}`); setTimeout(() => coins(pay, g, 'Test Track'), 900); if (t < TRACK_GOLD) this.badge('rowTrack'); }
  // ------------------------------------------------ SQUEAK ZAPPER RANGE: 40 s of pop-up targets
  startRange() { const g = this.g, [lx, lz] = this.sp.rangeLine; g.me.place([lx, 0.1, lz], PI); g.cam.yaw = PI; g.cam.snap = true; this.range = { t: -3, last: 4, score: 0, hits: 0, next: 0 }; g.hud.throwMode(true); g.sfx('check'); g.toastMsg('🎯 Tap 🎾 THROW to zap the pop-up targets! Robots 10, golden cheese 25.'); }
  updateRange(dt) { const A = this.range, g = this.g; this.targets.forEach((t) => { const want = A && t.up > 0 ? 1 : 0.001; t.k += (want - t.k) * Math.min(1, dt * 12); t.grp.scale.y = Math.max(0.001, t.k); t.grp.visible = t.k > 0.01; t.r.visible = t.kind === 0; t.c.visible = t.kind === 1; if (t.up > 0 && t.kind === 1) t.grp.rotation.y = Math.sin(g.T * 5) * 0.3; else t.grp.rotation.y = 0; });
    if (!A) return; const me = g.me, [lx, lz] = this.sp.rangeLine; A.t += dt;
    if (A.t < 0) { const c = Math.ceil(-A.t); if (c !== A.last) { A.last = c; g.toastMsg(c + '…'); g.sfx('click'); } g.hud.timer('🎯 ' + c); return; }
    if (A.last > 0) { A.last = 0; g.toastMsg('🎯 ZAP AWAY!'); g.sfx('win'); }
    if (Math.hypot(me.x - lx, me.z - lz) > 4) { this.endRange(true); return; }
    A.next -= dt; this.targets.forEach((t) => { if (t.up > 0) { t.up -= dt; if (t.up <= 0) t.up = 0; } });
    if (A.next <= 0) { const free = this.targets.filter((t) => t.up <= 0); if (free.length) { const t = free[(Math.random() * free.length) | 0]; t.kind = Math.random() < 0.22 ? 1 : 0; t.up = 1.5 + Math.random() * 1.1 - Math.min(0.6, A.t * 0.01); g.sfx('pop'); } A.next = 0.55 + Math.random() * 0.5 - Math.min(0.25, A.t * 0.006); }
    const left = 40 - A.t; g.hud.timer(`🎯 ${Math.ceil(left)} s · ${A.score} pts`); if (left <= 0) this.endRange(); }
  throwAt(p) { const A = this.range, g = this.g; if (!A || A.t < 0) return true; let best = null, bd = 0.95; for (const t of this.targets) { if (t.up <= 0 || t.flying) continue; let a = Math.atan2(t.x - p.x, t.z - p.z) - p.yaw; while (a > PI) a -= PI * 2; while (a < -PI) a += PI * 2; if (Math.abs(a) < bd) { bd = Math.abs(a); best = t; } }
    const m = this.ball.clone(); g.scene.add(m); const fx = best ? best.x : p.x + Math.sin(p.yaw) * 5, fz = best ? best.z : p.z + Math.cos(p.yaw) * 5; if (best) best.flying = true; this.flying.push({ m, t: 0, d: 0.42, a: [p.x + Math.sin(p.yaw) * 0.4, p.y + 1.4, p.z + Math.cos(p.yaw) * 0.4], b: [fx, best ? 0.9 : 0.1, fz], tg: best }); g.sfx('jump'); return true; }
  updateFlying(dt) { const g = this.g; for (const f of [...this.flying]) { f.t += dt; const k = Math.min(1, f.t / f.d); f.m.position.set(f.a[0] + (f.b[0] - f.a[0]) * k, f.a[1] + (f.b[1] - f.a[1]) * k + Math.sin(k * PI) * 1.1, f.a[2] + (f.b[2] - f.a[2]) * k);
      if (k >= 1) { g.scene.remove(f.m); this.flying.splice(this.flying.indexOf(f), 1); const t = f.tg; if (t) { t.flying = false; if (t.up > 0 && this.range) { const pts = t.kind === 1 ? 25 : 10; this.range.score += pts; this.range.hits++; t.up = 0; g.sfx(pts > 10 ? 'win' : 'squeak'); g.fx.burst(t.x, 0.9, t.z, t.kind === 1 ? 0xffd23f : 0xff4fa0, 14, 5); g.toastMsg(t.kind === 1 ? '🧀 GOLDEN CHEESE! +25' : '🤖 ZAP! +10'); } else g.fx.puff(t.x, 0.2, t.z, 3); } else g.fx.puff(f.b[0], 0.1, f.b[2], 3); } } }
  endRange(quit) { const A = this.range, g = this.g; this.range = null; g.hud.throwMode(false); g.hud.timer(''); this.targets.forEach((t) => { t.up = 0; t.flying = false; }); if (quit || !A) { if (quit) g.toastMsg('🎯 Range closed'); return; }
    const r = R(), nb = A.score > (r.best.range | 0); r.best.range = Math.max(r.best.range | 0, A.score); persist(); g.fx.confetti(g.me.x, g.me.y + 1.5, g.me.z, A.score >= 120 ? 60 : 15); g.sfx('win'); g.toastMsg(`🎯 Time! ${A.score} points · ${A.hits} hits${nb ? ' · NEW BEST' : ''}`); setTimeout(() => coins(Math.max(4, Math.round(A.score / 6)), g, 'Zapper Range'), 900); if (A.score >= 120) this.badge('rowRange'); }
  // ------------------------------------------------ shop
  buy(id) { const it = shopItem(id), r = R(), g = this.g; if (!it || r.items[id]) return false; if ((r.coins | 0) < it.price) { g.sfx('deny'); return false; } r.items[id] = 1; coins(-it.price, null); if (it.kind === 'hat') S.hats[id] = 1; persist(); g.sfx('buy'); g.fx.confetti(g.me.x, g.me.y + 1.5, g.me.z, 30); this.applyGadgets(); if (Object.keys(r.items).length >= 3) this.badge('rowShop'); return true; }
  toggle(id) { const r = R(); r.off[id] = r.off[id] ? 0 : 1; persist(); this.applyGadgets(); this.g.sfx('click'); }
  stats() { const r = R(); return { q: r.q | 0, clues: ROW_CLUES.filter((c) => r.clues[c]).length, gears: this.gearGot.size, gearsAll: this.w.rowGears.length, coins: r.coins | 0 }; }
}
