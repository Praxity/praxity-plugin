#!/bin/sh
set -eu

main() {
  toolkit="$HOME/rubato-main"
  course="$HOME/praxity-trial-course"
  praxity="$HOME/.praxity/bin/praxity"

  step() { printf '\n== %s\n' "$1"; }

  if [ -e "$toolkit" ] || [ -L "$toolkit" ]; then
    echo "$toolkit already exists. Move or delete it, then run this command again."
    exit 1
  fi
  step "Downloading Rubato to $toolkit"
  curl -fsSL https://github.com/Praxity/rubato/archive/refs/heads/main.tar.gz | tar xz -C "$HOME"

  step "Installing the pack and checking it (no administrator rights needed)"
  if ! (cd "$toolkit" && sh install.sh </dev/null); then
    [ -x "$praxity" ] || { echo "The install failed; the details are above."; exit 1; }
    echo "(the install or the doctor reported a problem above; trying Studio anyway)"
  fi

  step "Starting Studio's editor on a copy of the sample course"
  if [ ! -d "$course" ]; then cp -R "$toolkit/fixtures/course" "$course"; fi
  log=$(mktemp "${TMPDIR:-/tmp}/praxity-studio.XXXXXX")
  "$praxity" studio "$course" --no-open </dev/null >"$log" 2>&1 &
  server=$!
  url=""
  tries=0
  while [ -z "$url" ] && [ "$tries" -lt 60 ]; do
    if ! kill -0 "$server" 2>/dev/null; then
      cat "$log"; rm -f "$log"; echo "Studio stopped before it was ready."; exit 1
    fi
    url=$(grep -o 'http://127\.0\.0\.1:[0-9]*/#session=[A-Za-z0-9_-]*' "$log" | head -n 1 || true)
    tries=$((tries + 1))
    [ -n "$url" ] || sleep 1
  done
  rm -f "$log"
  if [ -z "$url" ]; then kill "$server" 2>/dev/null || true; echo "Studio did not print a ready URL."; exit 1; fi

  open -a Safari "$url"
  printf '\nStudio is open in Safari. Edit something, save, then try HTML and PDF export.\n'
  printf 'Course copy: %s\nPress Ctrl+C here when you are done.\n' "$course"
  trap 'kill "$server" 2>/dev/null || true; printf "\nStopped Studio.\n"; exit 0' INT TERM
  wait "$server"
}

main "$@"
