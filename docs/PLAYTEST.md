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
