#!/bin/bash
# Bundles src/*.js into the single-file index.html
cd "$(dirname "$0")"
LOGO=$(base64 -w0 assets/logo.svg)
{ sed "s|LOGO64|$LOGO|" head.html; cat src/*.js; echo '</script></body></html>'; } > index.html
echo "built index.html ($(wc -c < index.html) bytes)"
