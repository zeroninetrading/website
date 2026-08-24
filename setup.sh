#!/usr/bin/env bash
# =============================================================================
#  Zero Nine Trading — site setup, organise & deploy
#
#  Takes a folder of loose project files (however they landed), puts every one
#  in the directory GitHub Pages expects, checks nothing is missing, then
#  commits and pushes to the repo.
#
#  Usage:
#     ./setup.sh                    organise the current folder, commit, push
#     ./setup.sh ~/Downloads/zn     take the files from there instead
#     ./setup.sh --no-push          organise and commit, but don't push
#     ./setup.sh --dry-run          show what would move, change nothing
#     ./setup.sh --serve            organise, then start a local preview
#
#  Safe to run more than once — files already in the right place are left alone.
# =============================================================================

set -euo pipefail

REPO_URL="https://github.com/zeroninetrading/website.git"
BRANCH="main"
COMMIT_MSG="${COMMIT_MSG:-Add Zero Nine Trading static site (demo build)}"

SRC=""
DO_PUSH=1
DRY_RUN=0
DO_SERVE=0

for arg in "$@"; do
  case "$arg" in
    --no-push) DO_PUSH=0 ;;
    --dry-run) DRY_RUN=1; DO_PUSH=0 ;;
    --serve)   DO_SERVE=1; DO_PUSH=0 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    -*)        echo "Unknown option: $arg" >&2; exit 1 ;;
    *)         SRC="$arg" ;;
  esac
done

SRC="${SRC:-$PWD}"
[ -d "$SRC" ] || { echo "No such folder: $SRC" >&2; exit 1; }
SRC="$(cd "$SRC" && pwd)"
DEST="$SRC"

# ---- pretty output ----------------------------------------------------------
if [ -t 1 ]; then
  G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; B=$'\033[1m'; N=$'\033[0m'
else
  G=""; Y=""; R=""; B=""; N=""
fi
ok()   { echo "  ${G}✓${N} $*"; }
warn() { echo "  ${Y}!${N} $*"; }
err()  { echo "  ${R}✗${N} $*"; }
step() { echo; echo "${B}$*${N}"; }

# ---- where each file belongs ------------------------------------------------
dest_dir_for() {
  case "$1" in
    # pages and repo files at the root
    index.html|shop.html|product.html|about.html|contact.html|recipes.html|404.html) echo "." ;;
    admin.html)                                                                      echo "." ;;
    README.md|changes-summary.md|setup.sh|.nojekyll|.gitignore|robots.txt)           echo "." ;;
    # the image generator lives with the other tooling
    make-images.js)                                                                  echo "tools" ;;
    # everything else routes by extension
    *.css)                                                                           echo "assets/css" ;;
    *.svg|*.png|*.jpg|*.jpeg|*.webp)                                                 echo "assets/img" ;;
    *.js)                                                                            echo "assets/js" ;;
    *) echo "" ;;
  esac
}

# Browsers rename repeat downloads: "shop (1).html" -> "shop.html"
canonical_name() {
  echo "$1" | sed -E 's/ ?\(([0-9]+)\)(\.[A-Za-z0-9]+)$/\2/'
}

step "Organising files in $SRC"

moved=0; already=0; skipped=0

# Walk everything except .git and the folders we're building.
while IFS= read -r -d '' file; do
  base="$(basename "$file")"
  name="$(canonical_name "$base")"
  target_dir="$(dest_dir_for "$name")"

  if [ -z "$target_dir" ]; then
    skipped=$((skipped + 1))
    continue
  fi

  target="$DEST/$target_dir/$name"

  # Already exactly where it should be.
  if [ "$(cd "$(dirname "$file")" && pwd)/$base" = "$(cd "$DEST" && pwd)/${target_dir#./}/$name" ] 2>/dev/null; then
    already=$((already + 1))
    continue
  fi
  if [ "$file" -ef "$target" ] 2>/dev/null; then
    already=$((already + 1))
    continue
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "  would move  ${file#$SRC/}  ->  ${target_dir}/${name}"
  else
    mkdir -p "$DEST/$target_dir"
    mv -f "$file" "$target"
    ok "${target_dir}/${name}"
  fi
  moved=$((moved + 1))
done < <(find "$SRC" -type f \
           -not -path "*/.git/*" \
           -not -name ".DS_Store" \
           -print0)

[ "$already" -gt 0 ] && ok "$already file(s) already in place"
[ "$skipped" -gt 0 ] && warn "$skipped file(s) not part of the project, left alone"

if [ "$DRY_RUN" -eq 1 ]; then
  echo; echo "Dry run — nothing was changed."
  exit 0
fi

# ---- .nojekyll --------------------------------------------------------------
# Hidden files usually don't survive a download. Without this, GitHub Pages
# runs the site through Jekyll, which can drop files.
if [ ! -f "$DEST/.nojekyll" ]; then
  touch "$DEST/.nojekyll"
  ok ".nojekyll created"
fi

# ---- verify -----------------------------------------------------------------
step "Checking the site is complete"

REQUIRED=(
  "index.html" "shop.html" "product.html" "about.html" "contact.html"
  "recipes.html" "404.html" "admin.html" ".nojekyll"
  "assets/css/main.css" "assets/css/admin.css"
  "assets/img/logo.svg" "assets/img/favicon.svg"
  "assets/img/cat-organic.svg" "assets/img/cat-gluten-free.svg"
  "assets/img/cat-no-sugar.svg" "assets/img/cat-supplements.svg"
  "assets/img/cat-natural.svg" "assets/img/cat-vegan.svg"
  "assets/img/recipe-muffins.svg" "assets/img/recipe-smoothie.svg"
  "assets/img/recipe-toast.svg" "assets/img/recipe-baking.svg"
  "assets/img/recipe-tahini.svg" "assets/img/recipe-oats.svg"
  "assets/img/banner-organic.svg" "assets/img/banner-gluten-free.svg"
  "assets/img/banner-offers.svg" "assets/img/about-warehouse.svg"
  "assets/js/products.js" "assets/js/content.js" "assets/js/store.js"
  "assets/js/packshot.js" "assets/js/app.js" "assets/js/home.js"
  "assets/js/shop.js" "assets/js/product.js" "assets/js/pages.js"
  "assets/js/motion.js" "assets/js/bottle3d.js" "assets/js/admin.js"
)

missing=()
for f in "${REQUIRED[@]}"; do
  [ -f "$DEST/$f" ] || missing+=("$f")
done

if [ "${#missing[@]}" -gt 0 ]; then
  err "${#missing[@]} required file(s) missing:"
  for f in "${missing[@]}"; do echo "      $f"; done
  echo
  echo "  Re-download those from the chat and run this script again."
  exit 1
fi
ok "all ${#REQUIRED[@]} required files present"

# Every asset referenced by a page should resolve on disk.
broken=0
for page in index.html shop.html product.html about.html contact.html recipes.html 404.html admin.html; do
  while IFS= read -r ref; do
    if [ ! -f "$DEST/$ref" ]; then
      err "$page references $ref, which isn't on disk"
      broken=1
    fi
  done < <(grep -oE '(src|href)="(assets/[^"]+)"' "$DEST/$page" | sed -E 's/.*"(assets[^"]+)"/\1/' | sort -u)
done
[ "$broken" -eq 0 ] && ok "asset references on all 8 pages resolve"
[ "$broken" -eq 1 ] && exit 1

# Optional: syntax-check the JS if node is around.
if command -v node >/dev/null 2>&1; then
  jsfail=0
  for f in "$DEST"/assets/js/*.js "$DEST"/tools/*.js; do
    [ -f "$f" ] || continue
    node --check "$f" >/dev/null 2>&1 || { err "syntax error in $(basename "$f")"; jsfail=1; }
  done
  [ "$jsfail" -eq 0 ] && ok "all JavaScript parses cleanly"
  [ "$jsfail" -eq 1 ] && exit 1
fi

# ---- local preview ----------------------------------------------------------
if [ "$DO_SERVE" -eq 1 ]; then
  step "Serving at http://localhost:8000  (Ctrl-C to stop)"
  cd "$DEST"
  exec python3 -m http.server 8000
fi

# ---- git --------------------------------------------------------------------
step "Committing"

cd "$DEST"

if ! command -v git >/dev/null 2>&1; then
  err "git isn't installed — the files are organised, but you'll need to push manually."
  exit 1
fi

if [ ! -d .git ]; then
  git init -q
  git checkout -q -B "$BRANCH"
  ok "git repository initialised on $BRANCH"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO_URL"
  ok "remote 'origin' set to $REPO_URL"
fi

if [ ! -f .gitignore ]; then
  cat > .gitignore <<'EOF'
.DS_Store
Thumbs.db
node_modules/
*.log
EOF
  ok ".gitignore created"
fi

# git refuses to commit without an identity. Set a repo-local one if the
# machine has none, so the script doesn't stop half way.
if ! git config user.email >/dev/null 2>&1; then
  git config user.email "dev@zeronine.com.cy"
  git config user.name "Zero Nine Web"
  warn "no git identity found — using a local one for this repo."
  warn "to use your own:  git config --global user.name  \"Your Name\""
  warn "                  git config --global user.email \"you@example.com\""
fi

git add -A

if git diff --cached --quiet; then
  warn "nothing to commit — the repo already matches these files"
else
  git commit -q -m "$COMMIT_MSG"
  ok "committed: $COMMIT_MSG"
fi

# ---- push -------------------------------------------------------------------
if [ "$DO_PUSH" -eq 0 ]; then
  echo; echo "Skipping push. When you're ready:  git push -u origin $BRANCH"
  exit 0
fi

step "Pushing to $REPO_URL"

if git push -u origin "$BRANCH" 2>&1; then
  ok "pushed to $BRANCH"
  echo
  echo "${B}Now switch Pages on:${N}"
  echo "  1. https://github.com/zeroninetrading/website/settings/pages"
  echo "  2. Source: 'Deploy from a branch'"
  echo "  3. Branch: $BRANCH,  Folder: / (root)  →  Save"
  echo
  echo "  The demo will be live at ${B}https://zeroninetrading.github.io/website/${N}"
  echo "  in a minute or two."
else
  echo
  err "push failed"
  echo
  echo "  Usually authentication. Either:"
  echo
  echo "  ${B}GitHub CLI${N} (easiest)"
  echo "     gh auth login   then re-run this script"
  echo
  echo "  ${B}Personal access token${N}"
  echo "     Create one at https://github.com/settings/tokens with 'repo' scope,"
  echo "     then use it as the password when git prompts you."
  echo
  echo "  ${B}SSH${N}"
  echo "     git remote set-url origin git@github.com:zeroninetrading/website.git"
  echo "     git push -u origin $BRANCH"
  echo
  echo "  If the remote already has commits, you may also need:"
  echo "     git pull --rebase origin $BRANCH"
  exit 1
fi
