# Bilt prompt

Connect this repository in Bilt under Settings > Convert Website, then send:

```text
Convert this repository into a React Native mobile game for phones in portrait mode. index.html is a complete, offline, single-file game called Aegis of the Mad King.

Keep the game logic and rules from src/data.js, src/world.js, src/sim.js, and src/acts.js. Do not remove or simplify any system. For the first build, the fastest reliable approach is to load index.html in a full-screen WebView with JavaScript and DOM storage enabled, and to keep saved games between launches. Hide the status bar overlap with safe-area padding, and block pinch zoom and overscroll.

The app must work offline, including its save system. If the Google Fonts are unavailable, use the fallback fonts already defined in the CSS.

Test these on a phone preview: start a new game, move with the on-screen pad, tap a tile to open its actions, long-press a tile, open Pack, Magic, Craft, and Build, close and reopen the app, then choose Continue.
```
