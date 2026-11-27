# Modding Aegis of the Mad King

Mods are plain JSON. They add content, but they cannot run code, so installing one is safe. Open **Menu → Mods**, then paste the JSON or pick a `.json` file. Installed mods are kept in your browser and load every time the game starts.

A complete working example is in [`mods/marsh-folk.json`](mods/marsh-folk.json).

## The file

```json
{ "id": "marsh-folk", "name": "Marsh Folk", "version": "1", ...sections }
```

`id` must be unique. If you install a mod with an `id` you already have, the new one replaces the old one.

## Sections

| Section | Shape | Notes |
|---|---|---|
| `species` | `{ key: row }` | A row is `[name, sprite, color, color2, hp, attack, armor, speed, faction, tags, xp, loot]`. Sprites: `hum`, `quad_s`, `quad_m`, `quad_l`, `big`, `bird`, `croc`, `skel`. Tags are space-separated, such as `animal predator pack`. Loot looks like `"pelt:2,fang"`. |
| `items` | `{ key: item }` | Needs `n` (name) and `k` (kind: `food`, `potion`, `weapon`, `armor`, `tool`, `mat`). Food uses `hun`; every item can set `v` (value) and `stack`. |
| `spells` | `{ key: spell }` | Needs `n` and `mp`. Optional: `int` (Intellect needed), `rng` (range), `self` (1 for self-cast), `d` (description). |
| `kits` | `{ class: [items] }` | Replaces a class's starting kit. |
| `recipes` | `[recipe]` | `{ "out": item, "q": count, "need": { item: count }, "g": "Camp" }`. The output item must exist, including items your own mod adds. |
| `wild` | `{ biome: [[species, weight]] }` | Adds creatures to a biome's spawn table. Biomes include `grass`, `forest`, `birch`, `darkwood`, `swamp`, `desert`, `tundra`, `jungle`, `mountain`, `sea`. |
| `rumors` | `{ faction: [text] }` | Lines that people of that faction can tell you. Factions include `free`, `hunter`, `nomad`, `horde`, `bandit`, `goblin`, `troll`, `pirate`. |
| `events` | `[event]` | See below. |

### Events

Two simple event types work without code:

- `{ "on": "day", "chance": 0.05, "message": "...", "tone": "story" }` posts a message to the log at the start of a day, with the given chance.
- `{ "on": "talk", "species": "bogling", "option": "Ask about the marsh", "reply": "..." }` adds a conversation option to that species.

## Script hooks

For people building on the source, the game emits events on `window.Aegis`:

```js
Aegis.on('day', ({day}) => {});
Aegis.on('season', ({season}) => {});
Aegis.on('year', ({year}) => {});
Aegis.on('turn', ({turn}) => {});
Aegis.on('death', ({creature, by, kind}) => {}); // any creature dies
Aegis.on('talk', ({npc, sheet}) => {}); // edit sheet.options before it shows
Aegis.on('crime', ({kind, victim}) => {});
Aegis.on('skillUp', ({skill, value}) => {});
Aegis.on('worldEvent', ({text, site, weight}) => {});
```

`Aegis.off(name, fn)` removes a listener, and `Aegis.mods` lists what is installed. JSON mods never get these hooks; they are for forks of the code.
