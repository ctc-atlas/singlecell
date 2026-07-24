#!/usr/bin/env bash
set -euo pipefail

EXPECTED_REMOTE="git@github-ctc-atlas:ctc-atlas/singlecell.git"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

actual_remote="$(git remote get-url origin)"
if [[ "$actual_remote" != "$EXPECTED_REMOTE" ]]; then
  echo "origin mismatch: expected $EXPECTED_REMOTE, got $actual_remote" >&2
  exit 1
fi

git fetch origin main

worktree_dir="$(mktemp -d /private/tmp/singlecell-sync-XXXXXX)"
git worktree add --detach "$worktree_dir" origin/main >/dev/null

echo "$worktree_dir"
