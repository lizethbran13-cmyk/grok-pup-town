// RATITA SUPER EXPANSION (DLC #38, MEGA, unlock key grokDLC.puptown.ratita_super_expansion)
// Ratita Industries opens its Pup Town branch: Ratita Row, a whole new district east of Paw Park.
// Data only: ownership check, the district save, employees + what they say, the mystery, the Gadget Store and achievements.
import { S, persist } from './save.js';
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
const DEF = () => ({ q: 0, clues: {}, coins: 0, gears: [], items: {}, off: {}, best: { track: 0, range: 0, cafe: 0, circuit: 0 }, badges: {}, talks: {}, seen: 0, zip: 0 });
export function R() { if (!S.row || typeof S.row !== 'object') S.row = DEF(); const d = DEF(); for (const k in d) if (S.row[k] == null) S.row[k] = d[k]; if (!Array.isArray(S.row.gears)) S.row.gears = []; S.row.best = Object.assign(d.best, S.row.best || {}); return S.row; }
export function coins(n, G, why) { const r = R(); r.coins = Math.max(0, (r.coins | 0) + n); persist(); if (G) { G.hud.dirty = true; if (n > 0) G.toastMsg(`🧀 +${n} Cheese Coins${why ? ' · ' + why : ''}`); } }
// ---------------------------------------------------------------- achievements
export const ROW_BADGES = { rowHero: '🎀 Grand Opening Hero', rowGears: '⚙️ Gear Collector', rowTrack: '🏁 Test Track Ace', rowRange: '🎯 Squeak Sharpshooter', rowCafe: '🧀 Cheese Barista', rowFix: '🔧 Circuit Genius', rowShop: '🛍️ Gadget Fan', rowCrew: '🐀 Ratita Crew', rowZip: '🌀 Zip-Pad Rider' };
export const ROW_BADGE_HOW = { rowHero: 'Solve the Missing Prototype mystery', rowGears: 'Find all 12 Golden Gears in Ratita Row', rowTrack: 'Gold on the Turbo Test Track', rowRange: 'Score 120+ at the Squeak Zapper Range', rowCafe: '3 perfect orders at the Gouda Byte Cafe', rowFix: 'Reach level 7 in Circuit Fixer', rowShop: 'Buy 3 things at the Gadget Store', rowCrew: 'Say hi to everyone in Ratita Row', rowZip: 'Ride a Zip-Pad' };
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
export function rowStep() { const r = R(), q = r.q | 0, n = ROW_CLUES.filter((c) => r.clues[c]).length;
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
  N('gizmo', 'Gizmo (Intern Rat)', { rat: 'brownie', hat: 'party' }, [71.4, 48.6, PI / 2], 'row'),
];
export const ROW_IDS = new Set(ROW_NPCS.map((n) => n.id));
export function rowWants(id) { const r = R(), q = r.q | 0; const t = (k) => !r.talks[k];
  if (id === 'rluna') return q === 0 || q === 3; if (id === 'brie') return q === 1 && !r.clues.cafe || !r.best.cafe && t(id); if (id === 'dot') return !r.best.track; if (id === 'ranger') return !r.best.range; if (id === 'wrench') return !r.best.circuit;
  if (id === 'sprocket') return t(id); if (id === 'rpirat') return q === 1 && !r.clues.work && t(id); return false; }
// ---------------------------------------------------------------- dialogue
export function rowTalk(id, G) {
  const r = R(); const L = (...a) => a.map((x) => (Array.isArray(x) ? x : [null, x])); const n = (r.talks[id] = (r.talks[id] | 0) + 1); persist(); const cyc = (arr) => arr[(n - 1) % arr.length]; const q = r.q | 0;
  const crew = () => { if (!r.badges.rowCrew && ROW_NPCS.every((d) => r.talks[d.id])) G.row.badge('rowCrew'); };
  const out = (() => { switch (id) {
    case 'rluna': {
      if (q === 0) return { lines: L('You made it! Welcome to Ratita Row, our brand-new Pup Town branch! I told you I wanted to open one. Pawsome Labs was taken, so… Ratita Row!', 'Today is our GRAND OPENING. Big ribbon, cheese cake, everything. And our star invention was going to be on show: the PUP-TRANSLATOR. It turns barks into words!', 'But it\'s GONE. It was on its stand in the lab this morning. Will you be our detective? Look around every building and ask my team!', 'Start with the empty stand in the Branch Lab, through the door behind me.'), fx: () => { r.q = 1; persist(); G.toastMsg('🔎 New mystery: The Missing Prototype!'); G.sfx('check'); G.hud.dirty = true; } };
      if (q === 1 || q === 2) return { lines: L(cyc(['Any luck, detective? ' + rowStep(), 'Snowie already baked the opening cake. It\'s shaped like a cheese wedge. I\'ve had to guard it from Pi-rat twice.', 'If you see Torty in the cafe, say hi! She came all the way from the garden shop. Slowly. Very slowly. She left yesterday.'])) };
      if (q === 3) return { lines: L('The PUP-TRANSLATOR! You found it!', 'SWEEPY took it? Because Pi-rat told it to "tidy up everything shiny"? Oh, Pi-rat…', 'Everyone, gather round! With the scissors of honor… I declare Ratita Row OPEN! 🎀'), fx: () => G.row.solve() };
      return { lines: L(cyc(['Our Grand Opening Hero! The Pup-Translator is in the museum now. Go try it on Pip!', 'Profits are up 400%. That\'s because Sprocket sold four Propeller Caps. To himself.', 'Next week: a Ratita branch on the moon. Kidding! Probably.', 'Torty says the cafe sun lamp is the best seat in Pup Town. I agree.'])) }; }
    case 'tilly': return { lines: L(cyc(['Welcome to Ratita Industries, Pup Town branch! Please sign in. With your paw. Or your hand. Hands are fine.', 'Luna\'s office is wherever Luna is standing. Today that\'s the lobby.', 'The Zip-Pad outside zaps you straight to the town square. It tickles!']), q === 1 ? 'Pssst. I saw something roll past my desk at 7am. Round. Humming. Very tidy.' : cyc(['Have you been to the Gouda Byte Cafe? The cheese-a-ccino is amazing.', 'Golden Gears are hidden all over Ratita Row. Twelve of them! Sprocket trades them for Cheese Coins.'])) };
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
    case 'gizmo': return { lines: L(cyc(['I\'m Gizmo, the new intern! I made the party hats for the opening. All 400 of them.', 'Lost a Golden Gear? There are 12 hidden around Ratita Row. Look up high, and inside every building!', 'The statue is Luna holding the Golden Cheese-Gear. She posed for six hours. She only sneezed once.']), q >= 4 ? 'Best. Opening. EVER. I\'m keeping my party hat on forever.' : 'Something weird is going on. Luna looked really worried this morning.') };
  } return { lines: L('Squeak!') }; })();
  const fx0 = out.fx; out.fx = () => { if (fx0) fx0(); crew(); }; return out; }
