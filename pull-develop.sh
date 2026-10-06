#!/usr/bin/env bash
# Check out the integration branch (default: develop) and fast-forward git repos
# inside this juspeace-mono checkout only: the monorepo root, its registered
# submodules, and nested repos under that tree.
#
# Sibling projects next to juspeace-mono are never fetched or checked out.
# juspeace-fe, juspeace-admin-fe, and juspeace-be share the root git history.
# Pulling the root updates those packages. Nested repos are synced only when they
# have their own .git inside this tree (for example a future submodule).
#
# Usage (from anywhere):
#   ./pull-develop.sh
#   ./pull-develop.sh --dry-run
#   ./pull-develop.sh --branch develop
#
# --dry-run fetches from origin and prints the planned checkout, but does not
# switch branches or merge.
#
# Safety:
#   - Fast-forward only. A diverged branch is reported and left untouched.
#   - Skips a repo with staged or unstaged tracked changes.
#   - Does not stash, reset, or force-push.
#   - If origin/develop does not exist, uses the branch recorded in .gitmodules.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)" || {
  echo "This script must live inside the juspeace-mono git repository." >&2
  exit 1
}
cd "$ROOT"

TARGET_BRANCH="develop"
DRY_RUN=0
export GIT_TERMINAL_PROMPT=0

if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  RED=$'\033[0;31m'
  GREEN=$'\033[0;32m'
  YELLOW=$'\033[1;33m'
  CYAN=$'\033[0;36m'
  NC=$'\033[0m'
else
  RED='' GREEN='' YELLOW='' CYAN='' NC=''
fi

SUCCESSES=()
FAILURES=()
SKIPPED=()

usage() {
  sed -n '2,23p' "$0"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      if [[ $# -lt 2 || -z "${2:-}" ]]; then
        echo "Missing value for --branch" >&2
        exit 2
      fi
      TARGET_BRANCH="$2"
      shift
      ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

is_git_repo() {
  git -C "$1" rev-parse --git-dir >/dev/null 2>&1
}

has_tracked_changes() {
  [[ -n "$(git -C "$1" status --porcelain --untracked-files=no 2>/dev/null)" ]]
}

remote_branch_exists() {
  local dir="$1"
  local branch="$2"
  git -C "$dir" show-ref --verify --quiet "refs/remotes/origin/${branch}"
}

configured_branch_for_path() {
  local rel="$1"
  local key name

  [[ -f "$ROOT/.gitmodules" ]] || return 0
  key="$(
    git config --file "$ROOT/.gitmodules" --get-regexp '^submodule\..*\.path$' 2>/dev/null \
      | awk -v p="$rel" '$2 == p { print $1; exit }'
  )"
  [[ -n "$key" ]] || return 0
  name="${key#submodule.}"
  name="${name%.path}"
  git config --file "$ROOT/.gitmodules" "submodule.${name}.branch" 2>/dev/null || true
}

short_sha() {
  git -C "$1" rev-parse --short HEAD 2>/dev/null || echo "unknown"
}

sync_repo() {
  local label="$1"
  local dir="$2"
  local relpath="$3"
  local branch note before after current

  echo ""
  echo -e "${CYAN}>>> ${label}${NC}"

  if ! is_git_repo "$dir"; then
    echo -e "${YELLOW}SKIP: not a git repository${NC}"
    SKIPPED+=("$label (not a git repository)")
    return 0
  fi

  if has_tracked_changes "$dir"; then
    echo -e "${YELLOW}SKIP: tracked changes present — commit, stash, or discard them first${NC}"
    SKIPPED+=("$label (dirty working tree)")
    return 0
  fi

  if ! git -C "$dir" remote get-url origin >/dev/null 2>&1; then
    echo -e "${RED}FAIL: no origin remote${NC}"
    FAILURES+=("$label (no origin)")
    return 1
  fi

  echo "Fetching origin..."
  if ! git -C "$dir" fetch --prune origin; then
    echo -e "${RED}FAIL: git fetch origin${NC}"
    FAILURES+=("$label (fetch failed)")
    return 1
  fi

  branch="$TARGET_BRANCH"
  note=""
  if ! remote_branch_exists "$dir" "$branch"; then
    local configured
    configured="$(configured_branch_for_path "$relpath")"
    if [[ -n "$configured" && "$configured" != "$branch" ]] && remote_branch_exists "$dir" "$configured"; then
      branch="$configured"
      note="origin/${TARGET_BRANCH} is missing; using .gitmodules branch ${branch}"
      echo -e "${YELLOW}${note}${NC}"
    else
      echo -e "${RED}FAIL: origin/${TARGET_BRANCH} does not exist${NC}"
      FAILURES+=("$label (no origin/${TARGET_BRANCH})")
      return 1
    fi
  fi

  current="$(git -C "$dir" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")"
  before="$(short_sha "$dir")"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "DRY-RUN: would check out ${branch} (now: ${current} @ ${before}) and fast-forward from origin/${branch}"
    SUCCESSES+=("$label (${branch}, dry-run)")
    return 0
  fi

  if [[ "$current" != "$branch" ]]; then
    echo "Checking out ${branch} (was ${current})..."
    if git -C "$dir" show-ref --verify --quiet "refs/heads/${branch}"; then
      if ! git -C "$dir" checkout "$branch"; then
        echo -e "${RED}FAIL: could not check out ${branch}${NC}"
        FAILURES+=("$label (checkout ${branch})")
        return 1
      fi
    elif ! git -C "$dir" checkout -b "$branch" --track "origin/${branch}"; then
      echo -e "${RED}FAIL: could not create local ${branch} from origin/${branch}${NC}"
      FAILURES+=("$label (checkout ${branch})")
      return 1
    fi
  fi

  if ! git -C "$dir" rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    git -C "$dir" branch --set-upstream-to="origin/${branch}" "$branch" >/dev/null 2>&1 || true
  fi

  echo "Pulling origin/${branch} (fast-forward only)..."
  if ! git -C "$dir" pull --ff-only origin "$branch"; then
    echo -e "${RED}FAIL: ${branch} is not a fast-forward from origin/${branch}${NC}"
    FAILURES+=("$label (${branch} diverged)")
    return 1
  fi

  after="$(short_sha "$dir")"
  if [[ "$before" == "$after" && "$current" == "$branch" ]]; then
    echo -e "${GREEN}OK: ${label} (${branch} @ ${after}, already up to date)${NC}"
  else
    echo -e "${GREEN}OK: ${label} (${branch} ${before} -> ${after})${NC}"
  fi
  if [[ -n "$note" ]]; then
    SUCCESSES+=("$label (${branch}; ${note})")
  else
    SUCCESSES+=("$label (${branch} @ ${after})")
  fi
  return 0
}

collect_repo_paths() {
  local path git_entry dir

  if [[ -f "$ROOT/.gitmodules" ]]; then
    while IFS= read -r path; do
      [[ -z "$path" ]] && continue
      case "$path" in
        /*|..|../*|*/..|*/../*) continue ;;
      esac
      printf '%s\n' "$path"
    done < <(git config --file "$ROOT/.gitmodules" --get-regexp '^submodule\..*\.path$' | awk '{ print $2 }')
  fi

  while IFS= read -r git_entry; do
    [[ -z "$git_entry" ]] && continue
    dir="$(dirname "$git_entry")"
    case "$dir" in
      "$ROOT"/*) ;;
      *) continue ;;
    esac
    printf '%s\n' "${dir#"$ROOT"/}"
  done < <(
    find "$ROOT" \
      \( \
        -path '*/node_modules' -o \
        -path '*/.next' -o \
        -path '*/dist' -o \
        -path '*/build' -o \
        -path '*/.git/*' \
      \) -prune -o \
      \( \( -type d -o -type f \) -name .git -print \)
  )
}

echo "=== Juspeace — pull ${TARGET_BRANCH} ==="
echo "Scope: ${ROOT} only"
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Mode: dry-run (fetch only; no checkout or pull)"
fi
echo "Package folders juspeace-fe, juspeace-admin-fe, and juspeace-be follow the root repository."

sync_repo "juspeace-mono (root)" "$ROOT" "" || true

if [[ -f "$ROOT/.gitmodules" ]]; then
  echo ""
  echo -e "${CYAN}>>> Registering submodules${NC}"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "DRY-RUN: would run git submodule sync && git submodule update --init --recursive"
  elif ! git submodule sync --recursive || ! git submodule update --init --recursive; then
    echo -e "${RED}FAIL: could not initialize submodules${NC}"
    FAILURES+=("submodules (init)")
  fi
fi

SEEN=$'\n'
while IFS= read -r relpath; do
  [[ -z "$relpath" || "$relpath" == "." ]] && continue
  case "$SEEN" in
    *$'\n'"$relpath"$'\n'*) continue ;;
  esac
  SEEN+="${relpath}"$'\n'
  sync_repo "$relpath" "$ROOT/$relpath" "$relpath" || true
done < <(collect_repo_paths | awk 'NF && !seen[$0]++')

echo ""
echo "=== Summary ==="
echo -e "${GREEN}Succeeded (${#SUCCESSES[@]}):${NC}"
if [[ ${#SUCCESSES[@]} -eq 0 ]]; then
  echo "  (none)"
else
  printf '  - %s\n' "${SUCCESSES[@]}"
fi

if [[ ${#SKIPPED[@]} -gt 0 ]]; then
  echo -e "${YELLOW}Skipped (${#SKIPPED[@]}):${NC}"
  printf '  - %s\n' "${SKIPPED[@]}"
fi

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo -e "${RED}Failed (${#FAILURES[@]}):${NC}"
  printf '  - %s\n' "${FAILURES[@]}"
  exit 1
fi

if [[ ${#SKIPPED[@]} -gt 0 ]]; then
  echo -e "${YELLOW}Finished with skipped repositories.${NC}"
  exit 1
fi

echo -e "${GREEN}Every discovered repository is on the latest ${TARGET_BRANCH} (or its .gitmodules branch).${NC}"
