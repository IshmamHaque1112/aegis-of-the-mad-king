#!/bin/bash
# Bundles src/*.js into the single-file index.html
cd "$(dirname "$0")"
LOGO=$(base64 -w0 assets/logo.svg)
{ sed "s|LOGO64|$LOGO|" head.html; cat src/*.js; echo '</script></body></html>'; } > index.html
echo "built index.html ($(wc -c < index.html) bytes)"
# fail loudly on a syntax error (for example two modules declaring the same name)
if command -v node >/dev/null; then
  tmp=$(mktemp --suffix=.js); cat src/*.js > "$tmp"
  if ! node --check "$tmp"; then rm -f "$tmp"; echo "SYNTAX ERROR in src/*.js" >&2; exit 1; fi
  rm -f "$tmp"; echo "syntax ok"
fi
