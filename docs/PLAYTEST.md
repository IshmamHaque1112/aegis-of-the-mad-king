# Playtest report

## Method
- **Scripted recordings:** I recorded six automated sessions in Chromium with Playwright, at 1280×720 and 390×844 (phone). They covered:
  - Character creation and the village, including dialogue.
  - Sailing, fishing, and cannons.
  - A Horde raid while mounted.
  - Seasons, the moon, vampirism, augments, and brewing.
  - The phone layout.
- **Fuzzing:** a fuzz test (`tests/smoke.js`) played thousands of random actions across several seeds, opened every dialogue branch up to 4 levels deep, and round-tripped the save. A separate test idled new characters for 4.6 days on 12 seeds.
- **Scale and features:** I checked world generation at every scale and opened every menu screen.

## Bugs found and fixed
| Found | Fix |
|---|---|
| Freshly spawned NPCs had no `sleep` value, so the **Talk** option was missing for most villagers. This was a major dialogue dead end. | Defaulted it, and added a *Wake them and talk* option for sleepers. |
| A sub-king could spawn inside large non-citadel settlements, crashing population generation on some seeds. | That seat now gets a noble; sub-kings only appear in citadels. |
| Shrines without an altar crashed generation on some seeds. | Guarded. |
| New characters could start 25 tiles from a Horde fort. 4 of 12 idle characters died, three of them within 0.6 days. | The start village is now one of the three safest, and the Horde won't target it for 4 days. Now 11 of 12 survive 4.6 days of idling. |
| No armies or caravans existed until turn 50. | Bands are seeded at world creation. |
| Three sharks sank a 90-hull longship and killed the player through the deck. | Small sea creatures now only scratch the hull. Huge ones still hit hard. A sinking ship leaves a salvage raft. |
| Starting a game with a blank name crashed. | Fixed. |
| The solar-charge meter showed without augments, and meter labels overlapped. | Fixed. |
| The climate setting barely changed the world. | Its effect is roughly doubled. |
| Inspiration could trigger on the death message. | Fixed. |
| Offensive spells were offered on your own tile. | Hidden. |
| The world map fog drew as a grid. | Now smoothed. |

## Round 2: vehicles, islands, and battle magic
I tested this round with a scripted check:
- I drove every one of the 24 vehicles for 14 moves and fired each mounted weapon.
- I checked that NPC armies spawn with vehicles and move them, and that a fleeing raider steals a parked wagon about 60% of the time.
- I fought a full nation-versus-Horde battle with casters warding, blessing, hexing, and throwing fireballs.
- I visited every island site type and rescued a castaway.
- I round-tripped a save with vehicles and islands, then re-ran the fuzz test.

| Found | Fix |
|---|---|
| A mounted player couldn't board most vehicles. | The rider now dismounts automatically and leaves the horse tied nearby, or hitches it if the vehicle needs a draft animal. |
| Island huts never spawned because trees counted as blocked ground. | Fixed. |
| The vehicle and island data didn't survive a save (a Map in the save). | Now rebuilt from the seed instead of saved. |
| Fleeing NPCs rarely reached a vehicle before running past it. | They now grab one far more eagerly. |

New known issues:
- A parked land vehicle can be climbed over by people. That avoids blocked gates, but pedestrians and a parked cart can share a tile.
- NPC boats can get stranded in small inlets.

## Round 3: creature AI and a bug sweep
I tested each creature type in isolation:
- A pack howled and fanned out around the player.
- A hungry jaguar stalked hidden, then pounced.
- A bear warned, then charged when the player stayed.
- A berserker raged, an assassin vanished after striking, and a musketeer backed off to firing range.
- A herd scattered, and an outmatched warband sounded the retreat.

At the strategic level, rulers sent relief, retook towns, and sent hunters. I also ran a 3,000-action soak test on a Vast world, and six-seed fuzz runs now capture console errors as well as crashes. Both were clean.

| Found | Fix |
|---|---|
| Hit messages showed damage before armor, wards, mounts, and hulls reduced it. Some even appeared after "You die". | They now report the damage actually taken, in the right order. |
| Repeated persuasion flooded the log with d20 lines. | Consecutive rolls now collapse into one line. |
| Casting at an empty tile or a resisting target said nothing. | It now gives a response. |
| Choosing "Stay on land" at deep water said nothing. | It now gives a response. |
| Off-screen monster bands of the same kind fought each other ("A yeti routed a yeti"). | They no longer do. |
| Land armies could pick island villages as targets they could never reach. | Islands are now excluded. |
| Animal pack leaders shouted orders in words. | They now howl, yelp, and snarl instead. |
| Ambushers froze in place once a target was 3–4 tiles away. | They now creep in and pounce. |

## Known issues still open
- **Hit messages report damage before reductions.** For example, "Shark hits you for 8" appears even when the hull absorbed it.
- **Saves grow with exploration,** to about 1.2 MB after ~30 in-game days of heavy travel. IndexedDB handles this, but the localStorage fallback (about 5 MB) could fill on very long runs.
- **Mid-game Horde raids are frequent and lethal** to a passive player. This is intended, but harsh. Horde forts often sit 25–40 tiles from towns.
- **A kraken can sink a longship in a few turns.**
- **Continents are mostly rounded blobs,** and the *Many islands* setting is subtle.
- **Vision at sea draws as a hard circle** with black outside, which looks odd when zoomed out.
- **Repeated persuasion spams d20 lines** in the log.
- **The desktop (Electron) and Android (Capacitor) builds are untested.** They are configured, with CI workflows, but couldn't be built in the sandbox used to make this release.
- **The audio is procedural and untested on iOS Safari,** which needs a tap before sound can start. The game waits for your first tap.
