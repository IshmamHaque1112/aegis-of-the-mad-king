#!/bin/bash
# Bundles src/ into the single-file index.html
cd "$(dirname "$0")"
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
  cat src/head.html; cat src/data.js src/world.js src/sim.js src/acts.js src/ui.js; echo '</script></body></html>'; } > index.html
