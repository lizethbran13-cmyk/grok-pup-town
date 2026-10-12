// RATITA SUPER EXPANSION (DLC #38, MEGA, unlock key grokDLC.puptown.ratita_super_expansion)
// Ratita Industries opens its Pup Town branch: Ratita Row, a whole new district east of Paw Park.
// Data only: ownership check, the district save, employees + what they say, the mystery, the Gadget Store and achievements.
import { S, persist } from './save.js?v=20261011r38d';
const PI = Math.PI;
export const DLC_KEY = 'grokDLC.puptown.ratita_super_expansion';
export const DLC_NAME = 'Ratita Super Expansion';
export const ARCADE_URL = 'https://lizethbran13-cmyk.github.io/grok-arcade/';
// bought in the Grok Arcade DLC Machine (same origin, shared localStorage). Time Jumper previews / Save Vault betas play with it on.
export function ownsRow() {
  try { if (localStorage.getItem(DLC_KEY)) return true; const l = JSON.parse(localStorage.getItem('grokDLC.owned') || '[]'); if (Array.isArray(l) && l.indexOf(DLC_KEY) >= 0) return true; } catch (e) {}
  try { if (/\/(previews|archive)\//.test(location.pathname)) return true; } catch (e) {}
  return false;
}
const DEF = () => ({ q: 0, clues: {}, coins: 0, gears: [], items: {}, off: {}, best: { track: 0, range: 0, cafe: 0, circuit: 0 }, badges: {}, talks: {}, seen: 0, zip: 0, f2: null });
export function R() { if (!S.row || typeof S.row !== 'object') S.row = DEF(); const d = DEF(); for (const k in d) if (S.row[k] == null) S.row[k] = d[k]; if (!Array.isArray(S.row.gears)) S.row.gears = []; if (!S.row.f2 || typeof S.row.f2 !== 'object') S.row.f2 = { q: 0, clues: {}, tours: 0, crashes: 0, rides: 0, up: 0 }; if (!S.row.f2.clues) S.row.f2.clues = {}; S.row.best = Object.assign(d.best, S.row.best || {}); return S.row; }
export function coins(n, G, why) { const r = R(); r.coins = Math.max(0, (r.coins | 0) + n); persist(); if (G) { G.hud.dirty = true; if (n > 0) G.toastMsg(`🧀 +${n} Cheese Coins${why ? ' · ' + why : ''}`); } }
// ---------------------------------------------------------------- achievements
export const ROW_BADGES = { rowHero: '🎀 Grand Opening Hero', rowGears: '⚙️ Gear Collector', rowTrack: '🏁 Test Track Ace', rowRange: '🎯 Squeak Sharpshooter', rowCafe: '🧀 Cheese Barista', rowFix: '🔧 Circuit Genius', rowShop: '🛍️ Gadget Fan', rowCrew: '🐀 Ratita Crew', rowZip: '🌀 Zip-Pad Rider' , f2Up: '🛗 Going Up!', f2Keys: '🔑 Sky Captain', f2Tour: '🚁 Sky Tourist', f2Crash: '💫 Bumpy Landing Survivor', f2Gears: '⚙️ High Gear' };
export const ROW_BADGE_HOW = { rowHero: 'Solve the Missing Prototype mystery', rowGears: 'Find all 18 Golden Gears in Ratita Row', rowTrack: 'Gold on the Turbo Test Track', rowRange: 'Score 120+ at the Squeak Zapper Range', rowCafe: '3 perfect orders at the Gouda Byte Cafe', rowFix: 'Reach level 7 in Circuit Fixer', rowShop: 'Buy 3 things at the Gadget Store', rowCrew: 'Say hi to everyone in Ratita Row', rowZip: 'Ride a Zip-Pad' , f2Up: 'Ride the elevator to Floor 2', f2Keys: 'Find Snowie\'s missing heli keys', f2Tour: 'Finish a Sky Tour with Snowie', f2Crash: 'Survive a bumpy heli landing (nobody gets hurt!)', f2Gears: 'Find the 6 Golden Gears on Floor 2 and the roof' };
// ---------------------------------------------------------------- Gadget Store (Cheese Coins). hats = wearables, gadgets = real abilities
export const SHOP = [
  { id: 'hardhat', kind: 'hat', n: 'Ratita Hard Hat', ic: '⛑️', price: 30, d: 'The official branch hard hat, with a headlamp.' },
  { id: 'goggles', kind: 'hat', n: 'Lab Goggles', ic: '🥽', price: 35, d: 'Glowy science goggles. Very serious.' },
  { id: 'propeller', kind: 'hat', n: 'Propeller Cap', ic: '🧢', price: 45, d: 'It spins when you run!' },
  { id: 'ratears', kind: 'hat', n: 'Ratita Ears', ic: '🐭', price: 40, d: 'Round pink mouse ears, like the founders.' },
  { id: 'astro', kind: 'hat', n: 'Astro Helmet', ic: '👩‍🚀', price: 60, d: 'From the Ratita Rocket exhibit.' },
  { id: 'cheesecrown', kind: 'hat', n: 'Cheese Crown', ic: '🧀', price: 80, d: 'A golden crown with cheese gems. Royal!' },
  { id: 'turbo', kind: 'gadget', n: 'Turbo Sneakers', ic: '👟', price: 80, d: 'Run 30% faster everywhere in Pup Town.' },
  { id: 'glider', kind: 'gadget', n: 'Ratita Glider', ic: '🪂', price: 100, d: 'Hold JUMP while falling to glide.' },
  { id: 'jet', kind: 'gadget', n: 'Jet-Pup Pack', ic: '🚀', price: 120, d: 'A third jump in the air: whoosh!' },
  { id: 'shield', kind: 'gadget', n: 'Bubble Shield', ic: '🫧', price: 60, d: 'A shiny bubble around you. Just for fun!' },
];
export const shopItem = (id) => SHOP.find((s) => s.id === id);
// ---------------------------------------------------------------- the mystery: "The Missing Prototype"
export const ROW_CLUES = ['lab', 'cafe', 'shop', 'work'];
const CLUE_TEXT = {
  lab: 'The Pup-Translator stand is EMPTY. Around it: tiny round tire tracks, a little puff of dust and a strip of shiny tape. Something small and round rolled in… and rolled out.',
  cafe: 'Brie the barista found the Translator\'s instruction card under a table, next to a trail of swept-up crumbs. Someone cleaned the WHOLE floor at 7:02 am. Nobody asked them to.',
  shop: 'Security camera, 7:05 am: a round blur with a spinning brush zooms past the Gadget Store window carrying something shiny… toward the Test Track.',
  work: 'Pi-rat\'s workbench log: "Upgraded SWEEPY the robo-vacuum for the opening. New setting: TIDY UP EVERYTHING SHINY. What could go wrong?" Uh oh.',
};
export const rowClueText = (id) => CLUE_TEXT[id] || id;
export const CLUE_HINT = { lab: 'Check the empty prototype stand in the Branch Lab (back of the office).', cafe: 'Ask around the Gouda Byte Cafe.', shop: 'The Gadget Store has a security camera by the counter.', work: 'Look at Pi-rat\'s workbench in the R&D Workshop.' };
export function rowStep(reg) { const r = R(), q = r.q | 0, n = ROW_CLUES.filter((c) => r.clues[c]).length; if (reg !== 'main' && (q >= 4 || reg === 'r_f2' || reg === 'r_roof')) return f2Step();
  if (q === 0) return 'Luna needs help! Visit the Ratita Branch Office.'; if (q === 1) return `Find out who took the Pup-Translator (${n}/4 clues)`;
  if (q === 2) return 'Sweepy is zooming round the Test Track! Catch it!'; if (q === 3) return 'Bring the Pup-Translator back to Luna for the Grand Opening!'; return 'Grand Opening done! Play, shop and find Golden Gears.'; }
// ---------------------------------------------------------------- Ratita Row folks (rats + dogs). at: [x, z, yaw]
const N = (id, n, look, at, region, o = {}) => Object.assign({ id, n, look, at, region, row: true }, region.startsWith('r_') ? { y: 0 } : {}, o); // indoor staff stand on the floor (a ground probe from above would land them on the roof)
export const ROW_NPCS = [
  N('rluna', 'Luna (Ratita CEO)', { rat: 'luna', hat: 'crown' }, [63, 33.2, PI], 'r_office'),
  N('tilly', 'Tilly (Receptionist)', { rat: 'cream', hat: 'flower' }, [57.4, 35.6, PI / 2], 'r_office'),
  N('gouda', 'Officer Gouda (Bulldog)', { b: 'bulldog', hat: 'cap', hatC: 0x1e3a8a, neck: 'vest', neckC: 0x1e3a8a }, [69.2, 37.6, -PI / 2], 'r_office'),
  N('whiskers', 'Dr. Whiskers (Lab Chief)', { rat: 'ash', hat: 'goggles' }, [58.2, 25.4, PI / 2], 'r_office'),
  N('nova', 'Nova (Lab Pup)', { b: 'shiba', glasses: 0x22d3ee, neck: 'bandana', neckC: 0xffffff }, [68.6, 24.4, -PI / 2], 'r_office'),
  N('sprocket', 'Sprocket (Shop Clerk)', { rat: 'ginger', hat: 'hardhat' }, [85, 26.2, 0], 'r_store'),
  N('zap', 'Zap (Corgi)', { b: 'corgi', hat: 'cap', hatC: 0xffd23f }, [80.4, 33.4, PI / 2], 'r_store', { walk: [[80.4, 33.4], [89.6, 33.4], [89.6, 30], [80.4, 30]] }),
  N('brie', 'Brie (Barista)', { b: 'poodle', hat: 'chef', neck: 'apron', neckC: 0xffc93c, tint: { fur: 0xfff4e0, light: 0xffffff } }, [59.5, 64.6, 0], 'r_cafe'),
  N('cheddar', 'Cheddar (Pug)', { b: 'pug', neck: 'scarf', neckC: 0xff8a3d }, [62.8, 57.6, PI], 'r_cafe', { mode: 'sit' }),
  N('rsnowie', 'Snowie (Head of Fun)', { rat: 'snowie', hat: 'flower', extras: ['bow'] }, [55.6, 58.2, PI / 2], 'r_cafe'),
  N('rtorty', 'Martina "Torty" (Tortoise)', { martina: 1 }, [64.6, 61.8, -PI / 2], 'r_cafe'),
  N('rpirat', 'Pi-rat (Chief Inventor)', { rat: 'pirat', hat: 'pirate', extras: ['patch'] }, [72.6, 63.4, PI / 2], 'r_work'),
  N('wrench', 'Wrench (Husky Engineer)', { b: 'husky', hat: 'helmet', hatC: 0xffd23f, neck: 'apron', neckC: 0x1e3a8a }, [79.2, 57.6, -PI / 2], 'r_work'),
  N('bolt', 'Bolt (Apprentice Beagle)', { b: 'beagle', hat: 'cap', hatC: 0xff8a3d }, [75.6, 64.4, PI], 'r_work', { mode: 'sit' }),
  N('pawsley', 'Professor Pawsley (Curator)', { b: 'basset', glasses: true, neck: 'bowtie', neckC: 0x7c3aed }, [91.5, 56.4, PI], 'r_museum'),
  N('pip', 'Pip (Museum Pup)', { b: 'pupcorgi', hat: 'beanie', hatC: 0xa66bff }, [95.4, 63.2, -PI / 2], 'r_museum', { mode: 'sit' }),
  N('pepper', 'Pepper (Visitor)', { b: 'dachshund', hat: 'beanie', hatC: 0xff4fa0 }, [70.6, 34.6, -PI / 2], 'r_office', { mode: 'sit' }),
  N('mochi', 'Mochi (Shopper)', { b: 'pomeranian', neck: 'bow', neckC: 0xff4fa0 }, [85.2, 35.6, PI], 'r_store'),
  N('duke', 'Duke (Museum Visitor)', { b: 'greatdane', glasses: true, neck: 'scarf', neckC: 0x22d3ee }, [88.6, 61.4, PI / 2], 'r_museum'),
  N('tula', 'Tula (Junior Explorer)', { b: 'golden', hat: 'cap', hatC: 0xffd23f }, [94.4, 57.0, -PI / 2], 'r_museum', { walk: [[94.4, 57.0], [94.4, 62.6]] }),
  N('dot', 'Dot (Track Marshal)', { b: 'dalmatian', hat: 'helmet', hatC: 0xff4fa0 }, [72.6, 18.4, 0], 'row', { y: 0 }),
  N('ranger', 'Ranger Ruff (Range Officer)', { b: 'collie', hat: 'cap', hatC: 0x22c55e, neck: 'vest', neckC: 0x22c55e }, [77.6, 10.2, -PI / 2], 'row', { y: 0 }),
  N('zippy', 'Zippy (Delivery Pup)', { b: 'chihuahua', hat: 'cap', hatC: 0xff4fa0, neck: 'vest', neckC: 0xff4fa0 }, [56, 50.8, PI / 2], 'row', { walk: [[56, 50.8], [96, 50.8], [96, 42.2], [56, 42.2]] }),
  N('gizmo', 'Gizmo (Intern Rat)', { rat: 'brownie', hat: 'party' }, [71.4, 48.6, PI / 2], 'row'),  N('f2luna', 'Luna (Ratita CEO)', { rat: 'luna', hat: 'crown' }, [66.0, 38.4, PI * 0.8], 'r_f2', { y: 6.52 }),
  N('hazel', 'Hazel (Luna\'s Assistant)', { b: 'poodle', glasses: true, neck: 'bowtie', neckC: 0xff4fa0, tint: { fur: 0xd6a77a, light: 0xf1d2a8 } }, [58.6, 38.6, PI], 'r_f2', { y: 6.52 }),
  N('f2pirat', 'Pi-rat (Chief Inventor)', { rat: 'pirat', hat: 'pirate', extras: ['patch'] }, [60.4, 22.4, -PI / 2], 'r_f2', { y: 6.52 }),
  N('volt', 'Volt (Test Pilot Husky)', { b: 'husky', hat: 'helmet', hatC: 0x22d3ee, glasses: 0x22d3ee }, [56.8, 26.4, PI * 0.8], 'r_f2', { y: 6.52 }),
  N('f2torty', 'Martina "Torty" (Tortoise)', { martina: 1 }, [69.2, 24.0, PI / 2], 'r_f2', { y: 6.52 }),
  N('muffin', 'Muffin (Snack Fan)', { b: 'dachshund', neck: 'scarf', neckC: 0xffc93c }, [66.2, 26.6, PI], 'r_f2', { y: 6.52, mode: 'sit' }),
  N('f2snowie', 'Snowie (Pilot · Head of Fun)', { rat: 'snowie', hat: 'flower', extras: ['bow'] }, [68.4, 34.8, PI * 0.85], 'r_roof', { y: 11.32 }),
  N('rotor', 'Rotor (Heli Mechanic)', { b: 'beagle', hat: 'cap', hatC: 0xff8a3d, neck: 'vest', neckC: 0xff8a3d }, [61.6, 26.6, PI / 2], 'r_roof', { y: 11.32 }),
  N('waffles', 'Waffles (Sightseer)', { b: 'pupcorgi', hat: 'beanie', hatC: 0x22d3ee }, [55.2, 36.2, -PI / 2], 'r_roof', { y: 11.32 }),
];
export const ROW_IDS = new Set(ROW_NPCS.map((n) => n.id));
export function rowWants(id) { const r = R(), q = r.q | 0; const t = (k) => !r.talks[k];
  if (id === 'rluna') return q === 0 || q === 3; if (id === 'brie') return q === 1 && !r.clues.cafe || !r.best.cafe && t(id); if (id === 'dot') return !r.best.track; if (id === 'ranger') return !r.best.range; if (id === 'wrench') return !r.best.circuit;
  if (id === 'f2snowie') { const f = r.f2 || {}; return (f.q | 0) === 0 || (f.q | 0) === 3 || ((f.q | 0) >= 4 && !f.tours); } if (id === 'f2luna' || id === 'f2pirat' || id === 'f2torty' || id === 'hazel') return t(id);
  if (id === 'sprocket') return t(id); if (id === 'rpirat') return q === 1 && !r.clues.work && t(id); return false; }
// ---------------------------------------------------------------- dialogue
export function rowTalk(id, G) {
  const r = R(); const L = (...a) => a.map((x) => (Array.isArray(x) ? x : [null, x])); const n = (r.talks[id] = (r.talks[id] | 0) + 1); persist(); const cyc = (arr) => arr[(n - 1) % arr.length]; const q = r.q | 0;
  const crew = () => { const cn = (k) => CANON[k] || k, got = new Set(Object.keys(r.talks).map(cn)); if (!r.badges.rowCrew && ROW_NPCS.every((d) => got.has(cn(d.id)))) G.row.badge('rowCrew'); };
  const out = (() => { switch (id) {
    case 'rluna': {
      if (q === 0) return { lines: L('You made it! Welcome to Ratita Row, our brand-new Pup Town branch! I told you I wanted to open one. Pawsome Labs was taken, so… Ratita Row!', 'Today is our GRAND OPENING. Big ribbon, cheese cake, everything. And our star invention was going to be on show: the PUP-TRANSLATOR. It turns barks into words!', 'But it\'s GONE. It was on its stand in the lab this morning. Will you be our detective? Look around every building and ask my team!', 'Start with the empty stand in the Branch Lab, through the door behind me.'), fx: () => { r.q = 1; persist(); G.toastMsg('🔎 New mystery: The Missing Prototype!'); G.sfx('check'); G.hud.dirty = true; } };
      if (q === 1 || q === 2) return { lines: L(cyc(['Any luck, detective? ' + rowStep(), 'Snowie already baked the opening cake. It\'s shaped like a cheese wedge. I\'ve had to guard it from Pi-rat twice.', 'If you see Torty in the cafe, say hi! She came all the way from the garden shop. Slowly. Very slowly. She left yesterday.'])) };
      if (q === 3) return { lines: L('The PUP-TRANSLATOR! You found it!', 'SWEEPY took it? Because Pi-rat told it to "tidy up everything shiny"? Oh, Pi-rat…', 'Everyone, gather round! With the scissors of honor… I declare Ratita Row OPEN! 🎀'), fx: () => G.row.solve() };
      return { lines: L(cyc(['Our Grand Opening Hero! The Pup-Translator is in the museum now. Go try it on Pip!', 'Profits are up 400%. That\'s because Sprocket sold four Propeller Caps. To himself.', 'Next week: a Ratita branch on the moon. Kidding! Probably.', 'Torty says the cafe sun lamp is the best seat in Pup Town. I agree.'])) }; }
    case 'tilly': return { lines: L(cyc(['Welcome to Ratita Industries, Pup Town branch! Please sign in. With your paw. Or your hand. Hands are fine.', 'Luna\'s office is upstairs now! Ride the elevator to Floor 2. It goes DING.', 'The Zip-Pad outside zaps you straight to the town square. It tickles!']), q === 1 ? 'Pssst. I saw something roll past my desk at 7am. Round. Humming. Very tidy.' : cyc(['Have you been to the Gouda Byte Cafe? The cheese-a-ccino is amazing.', 'Golden Gears are hidden all over Ratita Row. Twelve of them! Sprocket trades them for Cheese Coins.'])) };
    case 'gouda': return { lines: L(cyc(['Officer Gouda, branch security. Nobody gets past me. Except snacks. Snacks get past me.', 'I guard the lab door. I also guard the cheese plate. Mostly the cheese plate.', 'My cousin Rocco works security at the big Ratita HQ. He\'s very strict about keycards.'])) };
    case 'whiskers': { const ln = L(cyc(['Dr. Whiskers, Lab Chief. Mind the beakers, they bubble when they\'re happy.', 'This lab makes gadgets for dogs: squeak-proof socks, self-filling bowls, the Wag-O-Meter…', 'Our big one is the Pup-Translator. Pi-rat and I built it together. Mostly me. Don\'t tell him.']));
      if (q === 1 && !r.clues.lab) ln.push([null, 'The stand is right there in the middle of the lab. Take a good look at the floor around it!']); return { lines: ln }; }
    case 'nova': return { lines: L(cyc(['I\'m Nova! I test gadgets by chewing them. Scientifically.', 'The goo vats glow brighter when you hum. Try it!', 'My dream is to invent a ball that throws ITSELF.'])) };
    case 'sprocket': return { lines: L(cyc(['Welcome to the Ratita Gadget Store! Everything costs Cheese Coins, the official money of science.', 'Win coins in the mini-games: the Test Track, the Zapper Range, the Cafe and the Workshop. Golden Gears pay 5 each!', 'The Jet-Pup Pack is our best seller. The Propeller Cap is our best spinner.']), 'Use the counter to browse. Wear hats here or in the Style Station!') };
    case 'pepper': return { lines: L(cyc(['I came for the Grand Opening! And the cake. Mostly the cake.', 'These sofas are SO soft. I might live here now.', 'Did you know Luna answers every letter herself? I wrote her one about cheese.'])) };
    case 'mochi': return { lines: L(cyc(['Ooh, Propeller Cap or Cheese Crown? I can\'t decide! Both is an answer, right?', 'I\'m saving my Cheese Coins. Golden Gears give you coins too, did you know?', 'Sprocket says the Bubble Shield is "very bouncy". I like bouncy.'])) };
    case 'duke': return { lines: L(cyc(['Magnificent! Simply magnificent! The rocket alone is worth the trip.', 'I read every plaque. Twice. The Cheese Cannon story makes me laugh every time.', 'Museums are best enjoyed slowly. And with a snack.'])) };
    case 'tula': return { lines: L(cyc(['I\'m doing a museum report for school! I\'ve already got 3 pages!', 'When I grow up I\'m going to be an inventor like Pi-rat. But with less cheese on the ceiling.', 'Have you seen the Time Jumper model? It looks like a portal! Whoa!'])) };
    case 'zap': return { lines: L(cyc(['I\'m saving up for the Turbo Sneakers! Then I\'ll be the fastest corgi in history. Corgi-story.', 'Have you seen the Jet-Pup Pack? It goes WHOOSH. I go "wow".', 'I come here every day. To look. Just looking. Okay I bought a keychain.'])) };
    case 'brie': { const ln = L(cyc(['Bonjour! Welcome to the Gouda Byte Cafe! Fresh cheese-a-ccinos and science smoothies.', 'Every drink is made with Ratita tech. The blender has a turbo button. Do NOT press the turbo button.', 'Torty loves our sun-lamp corner. She orders lettuce. Every time. I respect it.']));
      if (q >= 1 && !r.clues.cafe) ln.push([null, 'Oh! Someone swept my WHOLE floor this morning. Spotless! And I found this card under table three. Take a look!']);
      ln.push([null, (r.best.cafe | 0) >= 3 ? 'You\'re my best barista ever. Come back any time!' : 'Want to help? Use the barista station behind the counter and make orders for my customers!']); return { lines: ln, fx: q >= 1 && !r.clues.cafe ? () => G.row.addClue('cafe') : null }; }
    case 'cheddar': return { lines: L(cyc(['*slurp* This cheese smoothie has a cheese straw. In a cheese cup. It\'s cheese all the way down.', 'I come here for the free cheese samples. And to see Snowie! She tells the best jokes.', 'The robo-vacuum cleaned under my chair this morning. Took my napkin. Rude, but tidy.'])) };
    case 'rsnowie': return { lines: L(cyc(['HI HI HI! You\'re here! This branch is SO fun! There\'s a cafe! And a museum! And a TRACK!', 'I\'m Head of Fun here too! My first rule: every Friday is cake day. Every day is Friday.', 'Torty came to the opening! She left the garden shop yesterday to get here on time. I gave her a cheese-free salad!', 'Did you know Martina has visited every Ratita building? She says the desert dome at HQ is still her favourite. Torty loves warm sand!'])) };
    case 'rtorty': return { lines: L(cyc(['Hello again, dear. Yes, Torty came to the opening. I started walking yesterday at lunch. Right on time.', 'Snowie got me a cheese-free salad. And the warmest seat under the sun lamp. That rat is a treasure.', 'Luna and I go way back. I used to live in the desert dome at Ratita HQ. This sun lamp is nearly as good.']), cyc(['Slow and steady wins the ribbon cutting, dear.', 'If you see a little robot zooming about, wave. They are always in such a hurry.'])) };
    case 'rpirat': { const ln = L(cyc(['Arr! Welcome to me R&D Workshop! Every gizmo in Ratita Row was born on these benches!', 'I be building a robot dog. He\'ll fetch, sit, and do the paperwork. Mostly the paperwork.', 'Wrench be the finest engineer in Pup Town. Bolt be the finest at holding things. Very important job.']));
      if (q === 1 && !r.clues.work) ln.push([null, 'Me log? It be on the workbench by the robot arm. Help yerself! I wrote down EVERYTHING I did this mornin\'. Even the bit with Sweepy.']);
      if (q >= 4) ln.push([null, 'Sweepy be back to normal. Its new setting be TIDY UP NOTHING. It just naps now.']); return { lines: ln }; }
    case 'wrench': { const ln = L(cyc(['Wrench, chief engineer. If it beeps, I can fix it. If it boops, I can probably fix it.', 'The robot on the test stand has a scrambled circuit board. Think you can help me rewire it?', 'Watch the lights, remember the order, tap them back. Easy! Then it gets harder. Then it gets VERY hard.']));
      ln.push([null, (r.best.circuit | 0) ? `Your best is level ${r.best.circuit}. Reach level 7 and you\'re a Circuit Genius!` : 'Use the control panel next to the test stand to start!']); return { lines: ln }; }
    case 'bolt': return { lines: L(cyc(['I\'m the apprentice! Today I learned what a screwdriver is. It drives screws! Not cars. I asked.', 'Pi-rat says I can build my own gadget when I\'m older. I\'m going to build a ball. A big one.', 'Wrench lets me hold the flashlight. I\'m the BEST flashlight holder.'])) };
    case 'pawsley': { const ln = L(cyc(['Welcome to the Ratita Museum of Inventions! I am Professor Pawsley, curator and part-time napper.', 'Every exhibit is a real Ratita invention. Do look. Do not lick. That means you, Pip.', 'The Time Jumper model is my favourite. The real one is at the Grok Arcade. It only misfires sometimes!']));
      if (q >= 4) ln.push([null, 'Our newest exhibit: the PUP-TRANSLATOR, rescued by YOU. Try it on Pip, he has a lot to say.']); else ln.push([null, 'That empty pedestal in the middle is for the Pup-Translator. If it ever turns up…']); return { lines: ln }; }
    case 'pip': return q >= 4 ? { lines: L(cyc(['*Pup-Translator beeps* "I LOVE THIS MUSEUM. ALSO I LOVE YOU. ALSO SNACK?"', '*beep* "The rocket is my favourite. I want to go to space. Do they have balls in space?"', '*beep* "Professor Pawsley snores. Loud. Like a tuba. Please don\'t tell him I said that."'])) } : { lines: L(cyc(['Woof! Arf arf! *wag wag*', 'Yip! *spins in a circle*', 'Arf? *tilts head*'])) };
    case 'dot': { const b = r.best.track; const ln = L(cyc(['Dot, track marshal! The Turbo Test Track is where we test speed gadgets. And speedy visitors!', 'Two laps, follow the glowing gates. Under 28 seconds is GOLD!', 'Turbo Sneakers help a LOT. Just saying. Sprocket sells them.']));
      ln.push([null, b ? `Your best: ${b.toFixed(1)} s. Start from the green pad at the starting line!` : 'Start from the green pad at the starting line!']); if (q === 2) ln.push([null, 'And catch that runaway robo-vacuum, will you? It keeps sweeping my track!']); return { lines: ln }; }
    case 'ranger': return { lines: L(cyc(['Ranger Ruff, Squeak Zapper Range! Toss balls at the pop-up targets. Robots are 10 points, golden cheese is 25!', 'Stand on the yellow line and tap THROW. Your throw auto-aims at the nearest target you\'re facing.', '40 seconds on the clock. Score 120 and you\'re a Squeak Sharpshooter!']), r.best.range ? `Your best: ${r.best.range} points.` : 'Use the button by the yellow line to start!') };
    case 'zippy': return { lines: L(cyc(['Can\'t stop! Delivering cheese to the cafe, gears to the workshop and a hat to… myself!', 'Ratita Row is the busiest street in Pup Town now. I counted!', 'Pro tip: the Zip-Pad in the plaza zaps you to the town square. And back!'])) };
    case 'gizmo': return { lines: L(cyc(['I\'m Gizmo, the new intern! I made the party hats for the opening. All 400 of them.', 'Lost a Golden Gear? There are 18 hidden around Ratita Row, even upstairs and on the roof. Look inside every building!', 'The statue is Luna holding the Golden Cheese-Gear. She posed for six hours. She only sneezed once.']), q >= 4 ? 'Best. Opening. EVER. I\'m keeping my party hat on forever.' : 'Something weird is going on. Luna looked really worried this morning.') };
    default: { const o = f2Talk(id, G, r, L, cyc); if (o) return o; }
  } return { lines: L('Squeak!') }; })();
  const fx0 = out.fx; out.fx = () => { if (fx0) fx0(); crew(); }; return out; }

// ---------------------------------------------------------------- FLOOR 2 + ROOFTOP (free update): the Missing Heli Keys
const CANON = { f2luna: 'rluna', f2pirat: 'rpirat', f2torty: 'rtorty', rsnowie: 'f2snowie' }; // the same folks on two floors count once
export const F2_CLUES = ['desk', 'lab', 'fridge'];
export function F2() { return R().f2; }
export function f2ClueText(id) { return ({
  desk: { t: '📝 Sticky note on Luna\'s desk', b: '"Pi-rat borrowed the HELI KEYS to test his new Key-Finder 3000. Must be back by lunch! - L." Lunch was yesterday.' },
  lab: { t: '🧪 Key-Finder 3000 test log', b: '"Test 1: Key-Finder beeped at the keys. Test 2: Key-Finder beeped at a cookie. Test 3: Key-Finder beeped at the BREAK ROOM. Paused for a snack."' },
  fridge: { t: '🧊 Note on the break room fridge', b: '"WHO BOUGHT A SNACK WITH KEYS?? The snack machine ate my coin AND something jingly. Spiral B4 is STUCK. - Muffin"' } })[id]; }
export function f2Step() { const f = F2(), q = f.q | 0, n = F2_CLUES.filter((c) => f.clues[c]).length;
  if (q === 0) return 'Floor 2: Snowie is upset on the roof! Say hi to her.'; if (q === 1) return `Find Snowie's heli keys (${n}/3 clues on Floor 2)`; if (q === 2) return 'The keys are stuck in the break room snack machine!';
  if (q === 3) return 'Bring the heli keys up to Snowie on the roof!'; return f.tours ? `Sky Tours: ${f.tours} flown${f.crashes ? ' · ' + f.crashes + ' bumpy landing' + (f.crashes > 1 ? 's' : '') : ''}. Fly again!` : 'Snowie\'s Sky Tours are open! Board the heli on the roof.'; }
function f2Talk(id, G, r, L, cyc) { const f = r.f2, fq = f.q | 0, q = r.q | 0;
  switch (id) {
    case 'f2snowie': {
      if (fq === 0) return { lines: L('Oh hi hi HI! Welcome to the ROOF! Isn\'t it the best? You can see all of Pup Town from here!', 'I\'m the official Ratita pilot now! I fly SKY TOURS in our shiny pink heli!', 'Except… I can\'t find the KEYS. Anywhere. I\'ve looked in my pockets, my other pockets, and Torty\'s shell. Torty was not amused.', ['🧭 Quest', 'Find the missing heli keys! Search Floor 2: Luna\'s office, the test lab and the break room.']), fx: () => { f.q = 1; G.row.f2.refresh(); G.hud.dirty = true; } };
      if (fq === 1 || fq === 2) return { lines: L(cyc(['Any luck with the keys? ' + f2Step(), 'Pi-rat says he "borrowed them for science". Science is very borrow-y.', 'I tried hot-wiring the heli with a cheese stick. It did not work. It was delicious though.'])) };
      if (fq === 3) return { lines: L('THE KEYS!!! You found them! In the SNACK MACHINE?! Pi-rat, honestly…', 'You know what that makes you? A real SKY CAPTAIN! 🔑', 'Hop in the heli any time and I\'ll fly you on a Sky Tour over all of Pup Town. Free for heroes!'), fx: () => { f.q = 4; G.row.badge('f2Keys'); coins(30, G, 'Heli keys found'); G.fx.confetti(G.me.x, G.me.y + 1.5, G.me.z, 70); G.sfx('win'); G.row.f2.refresh(); G.hud.dirty = true; } };
      return { lines: L(cyc(['Ready for a Sky Tour? Hop in the heli! Buckle up, keep your paws inside, and wave at everyone!', 'Sometimes the heli goes "putt putt BONK". That\'s normal. Probably. It always lands somewhere soft!', 'Torty asked for a tour once. We left at lunch. She got in by dinner. Best tour ever.', 'From up there, Ratita Row looks like a giant slice of cheese. I may be biased.', f.crashes ? `${f.crashes} bumpy landing${f.crashes > 1 ? 's' : ''} and still smiling! You\'re my favourite passenger.` : 'My flight record is perfect! Mostly perfect. Very nearly perfect.'])) }; }
    case 'f2luna': return { lines: L(cyc(['Welcome to my REAL office! Big desk, big window, big cheese paperweight. A CEO needs a big view.', 'From my window I can see the whole Row. And Pi-rat on the roof, testing something that is definitely not allowed.', 'That photo wall? The founders. Me, Pi-rat, Snowie… and Torty, who arrived for the photo three days later.', fq < 4 ? 'Snowie is moping on the roof. Something about keys. Could you help her? I have a meeting with a spreadsheet.' : 'Snowie\'s Sky Tours are our most popular gadget. Well, the heli is. Snowie is the popular part.'])) };
    case 'hazel': return { lines: L(cyc(['Welcome to Floor 2! Luna\'s office is through the glass door. Lab and break room are down the hall.', 'The elevator goes DING. I picked the ding. It\'s my proudest achievement.', 'Sky Tours leave from the roof! Take the elevator up. Snowie is the pilot. Hold on to your hat.', 'I sort Luna\'s mail. Today: 3 letters, 40 cheese coupons and a postcard from the moon branch. Kidding.'])) };
    case 'f2pirat': return { lines: L(cyc(['Arr! The Gadget Testing Lab! This be where gadgets learn to behave. Or explode. Usually explode.', 'Me KEY-FINDER 3000 finds keys! Well, it finds cookies. And sometimes keys near cookies.', fq < 4 ? 'The heli keys? I may have borrowed them… for SCIENCE. Then I got hungry. Then… hmm.' : 'Ye found the heli keys in the snack machine? Ha! The Key-Finder WAS right. It just also wanted a cookie.', 'Volt tests the Jet-Pup V2. He says "WHEEEE". That be the scientific term.'])) };
    case 'volt': return { lines: L(cyc(['I\'m Volt, official test pilot! I\'ve tested 47 gadgets. 46 went great. We don\'t talk about the toaster.', 'The crash test buddy is my best friend. He never complains. He also never talks.', 'See the sign? DAYS WITHOUT AN EXPLOSION: 0. It\'s a goal. A very hard goal.'])) };
    case 'f2torty': return { lines: L(cyc(['Hello, dear. Yes, Torty is upstairs now. I took the elevator. It was very fast. I closed my eyes.', 'Snowie gave me a Sky Tour once. I waved at my house. It took a while to wave. Snowie circled twice so I could finish.', 'The break room has the warmest window seat. And lettuce in the fridge. Labelled "TORTY. DO NOT TOUCH. - SNOWIE".', fq < 4 ? 'Keys, dear? I heard something jingle in that snack machine. But I did not get up. Getting up is a two-day project.' : 'You found the keys! I\'d have found them too. In about a year.'])) };
    case 'muffin': return { lines: L(cyc(['The snack machine ATE my coin! I wrote a strongly worded note. It\'s on the fridge.', 'Best snack here: Cheddar Crunch. Second best: also Cheddar Crunch.', fq >= 3 ? 'The machine gave you KEYS? It never gives me keys. Just crunch. Crunch is fine.' : 'Something jingly is stuck in spiral B4. I can see it, but I can\'t reach it.'])) };
    case 'rotor': return { lines: L(cyc(['Rotor, heli mechanic! Every bolt tight, every blade shiny, every cheese crumb removed from the seats.', 'If the heli ever goes putt-putt, don\'t worry. Snowie always finds a soft spot to land. And my tow-drone brings it home.', 'The tow-drone is my favourite gadget. It\'s like a big flying hug for helicopters.'])) };
    case 'waffles': return { lines: L(cyc(['Look through the telescopes! I can see the Town Hall clock! And a squirrel! The squirrel saw me!', 'Mom says I can do a Sky Tour when I\'m taller. I\'m standing on my tippy toes RIGHT NOW.', 'From up here Paw Park looks like a big green blanket. With ducks!'])) };
  } return null; }
