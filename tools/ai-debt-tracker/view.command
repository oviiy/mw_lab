#!/bin/bash
# Double-click to view the site locally: builds it, serves it, opens your browser.
# Close this Terminal window (or press Ctrl+C) to stop.
cd "$(dirname "$0")/web" || exit 1
export NODE_OPTIONS=
[ -d node_modules ] || npm ci
echo "Building the site..."
npm run build >/dev/null 2>&1 || { echo "Build failed. Run 'npm run build' in web/ to see why."; exit 1; }

# Astro runs one preview server at a time; if one is already up, it now serves the fresh build.
RUNNING=$(npx astro preview status 2>&1 | grep -o 'http://localhost:[0-9]*' | head -1)
if [ -n "$RUNNING" ]; then
  echo "Already running at $RUNNING"
  open "$RUNNING/"
  exit 0
fi

PORT=4400
(sleep 2 && open "http://localhost:$PORT/") &
npx astro preview --port $PORT
