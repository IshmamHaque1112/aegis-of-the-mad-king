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

## Round 4: the living-world systems

Twenty new systems went in (stats and skills, economy, harvests, people as records, families, word-of-mouth reputation, live history, rumors, wildlife, rival adventurers, guilds, courts, faith, property, travel, rulers, settlement change, migration and hibernation, injuries, and mods). Automated checks cover each one, plus save and load, fuzzed play across four seeds, a long soak, and screenshots on desktop and phone.

- **Yearly ageing skipped anyone you had met.** Fixed so that only deaths and growing up wait while a person is on screen.
- **Rival adventurers all died within twelve days** and the survivors levelled far too fast. They now pick dungeons near their level, survive failures more often, earn less experience, need twenty days and level 8 before trying for a shard, and new ones arrive when fewer than three are alive.
- **No village was ever founded.** The search now tries harder and uses sensible spacing; new roads keep their full path, not just their two ends.
- **Health and mana showed decimals** (36.3/36.3) after the Endurance bonus. Now rounded.
- **Stamina could read above its maximum** after an injury lowered the cap. Now clamped.
- **The world seed box overflowed** on narrow phones. Fixed.
- **Prices look flat when towns are well stocked,** and births are rare. Both are by design for now, but worth tuning.

## Round 5: family, letters, wars, and the living land

Twenty more systems went in, with a new automated check for each one, plus 70-day soaks on several seeds and desktop and phone screenshots.

- **Towns had no buildings.** In every world tested, towns had only merchants and guards: no ruler, palace, smith, healer, temple, scholar or inn. Every plot was checked with a one-tile margin, and since all plots border a street, the margin always failed. Plots are now checked on their own footprint, and a building that doesn't fit moves to the next plot. Towns now have their full set of people.
- **History written during play was lost on loading a save.** It's now saved separately and restored.
- **The chronicle recorded events twice,** once as news and once under the player's name. Each event is now recorded once.
- **Replies showed doubled quote marks** in several conversations from earlier rounds. Fixed in one place.
- **New-moon assassins could kill a brand-new character on the first night.** Characters now get three days' grace.
- **Lairs:** the first version marked every monster lair as empty because lair monsters live in roaming bands, not in the lair's population. It now tracks kills near the lair and enemies inside its dungeon levels.
- **Balance:** wars were too frequent and never ended, prophecies came too often, and plagues were rare. All three are tuned.
- **Gifts:** courting offered your equipped weapon as a gift. It no longer does.

## Round 6: legends, crime, honors and wounds

Twenty more systems, each with its own automated check, plus the full regression suite and multi-seed soaks.

- **Explosions were delayed by a day.** Last round's war module defined a helper with the same name as a core one, so firebombs and powder kegs waited for the next daily tick. Renamed, and I checked the whole codebase for other name clashes.
- **A duplicate wrapper name** in this round stopped the game from loading at all. Caught by a syntax check of the built file, which is now part of every build.
- **Legendary beasts grew too fast** (level 13 after three in-game years, with eight times normal health). They now grow about once a year, cap at level 10, and scale more gently.
- **Lairs cleared by rival adventurers refilled at once.** They now wait like any other cleared lair.
- **Small fixes:** the character sheet read "Known as Rook Knight"; titles are now listed separately. Ghosts that want a candle now tell you where to get one, and priests, merchants and innkeepers sell candles.

## Round 7: pits, outlaws, cults and home life

Twenty more systems, each with its own automated check, plus all earlier suites, fuzzing, and soaks of up to 74 days on three seeds.

- **Player caravans locked up the game.** A caravan that arrived set off again at once as a new band, the world loop picked it up in the same pass, and it bounced between towns forever until the browser tab crashed. Return trips now wait in town for half a day.
- **Settlements could crash on growth** if a town's population list was empty (a bug from round 4 that long soaks finally hit). Guarded.
- **The first day of play hitched for half a second** while landmarks were placed. That work now happens during world creation and loading.
- **Prison sentences ignored which nation sentenced you,** so escapes added no bounty. Fixed.
- **Small fixes:** sellsword companies always include one on your starting continent, and hiring one no longer needs the target already on your map. The caravan screen now explains why it's empty when you know no other markets. The pits no longer say "against A caged boar".

## Round 8: the rest of the idea list, a new look, and a debugging sweep

Every remaining idea from the design doc was built in eight batches (ecology, work, society, war, lore and magic, survival, life and travel, engine), each with its own automated check. After that came the visual overhaul and a debugging sweep: the autoplay bot on 13 seeds across all four world sizes, the fuzzer on 7 seeds, long soaks, save/load round trips of every new system, and phone screenshots of every new screen.

- **One duplicated name stopped the whole game loading.** Two modules declared the same wrapper variable, a syntax error that left a black screen. `build.sh` now syntax-checks the bundle and refuses to write `index.html` if it fails. The same sweep caught two new helpers that silently replaced older ones with the same name (one broke world generation).
- **Starting a second world reused the first world's towns.** Town layouts and terrain chunks were cached and never cleared, so *Play again* after a death, or loading a different save, built towns from the old world's plans. Both caches now reset on every new game and load.
- **Owned houses could vanish** when a bigger town overlapped your village. The game looked up the nearest site instead of your own. Fixed.
- **A new option list crashed loading** because it was added before the screen that defines it existed. It now loads after the UI.
- **The journal map and history time-lapse revealed unexplored land** and every settlement. Both now respect fog of war until the game ends, and the region stats layer only covers places you know.
- **The escape scenario was a death sentence:** it could drop an unarmed player on a glacier among ice bears. You now start in the mildest spot near the camp, with a club, bread and a head start.
- **Diet was far too harsh** in the first draft (scurvy within a week). It now takes two weeks without fruit, and you get a warning first.
- **Small fixes:** every cave was named "Cave"; number keys could pick a hidden option; the god view drew nothing; fishing weirs, rafting and tidepools now have proper tests. Earlier batches fixed region keys parsed as text, "old yeti" in lower case, barter that spent your best items first, toll and caravan messages that fired too often, "fine plain wool", and a pilgrimage that read a kill count that didn't exist.

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
- **Titanic worlds take about six seconds to generate** (three on Vast) and about three seconds to load, because loading regenerates the world from its seed.
- **One old system test (founding a settlement) is flaky:** whether free land exists depends on the turn it runs, not on a bug.
