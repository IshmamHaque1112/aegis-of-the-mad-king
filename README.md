# Aegis of the Mad King

A turn-based, open-world mobile roguelike with permadeath, built as one offline HTML file with no sound or heavy art.

Explore a generated continent, recover three amulet shards from the grassland, jungle, and desert, then break King Vorgath's immortal shield in the mountains. You can kill him, or finish the entire quest without killing anyone.

## Play

Open `index.html` in a browser. Use the on-screen pad, or tap the map. Long-press any tile to see every action. On a keyboard, use the arrows or numpad, and Space for your own tile.

## Main systems

- **Classes:** Barbarian, Archer, Mage, Rogue, Speaker, Herbalist, and Sapper
- **Stats:** Strength, Intelligence, Stealth, Speed, and Agility
- **Seasons:** Each changes terrain, weather, farming, prices, and creature and NPC behavior
- **Reactive world:** Fire, gas, explosions, ice, lightning through water, noise, scent, snow tracks, avalanches, and predator-prey behavior
- **Plagues:** Red Mania can turn tribes against each other, and the Grey Walk can turn villages into marching swarms
- **NPC powers:** Villagers with guns, spellcasting witches, necromancers, assassins, sappers, thieves, and healers
- **Making things:** Crafting, cooking, enchanted forging, Morrowind-style spell creation, farming, and building

## Develop

Edit the files in `src/`, then run `./build.sh` to rebuild `index.html`.

Run the route tests:

```bash
cat src/data.js src/world.js src/sim.js src/acts.js tests/routes.js > /tmp/routes.js && node /tmp/routes.js
```

## Porting to Bilt

See [bilt/BILT_PROMPT.md](bilt/BILT_PROMPT.md).
