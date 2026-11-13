# Setting up a new device for direct push (ww-D9)

> **Runbook.** Written 2026-11-11, after doing this the first time on Alberto's Mac. Read this when a Cowork session needs direct push on a device that has never had it, rather than re-deriving the steps in chat.

## Why this exists

ww-D9 lets a product session push and open the PR itself, not just commit and hand the branch over. That capability lives in one specific place: the `gh` login inside **that device's own device-bridge sandbox** (a small Linux VM the Claude desktop app runs per device, separate from the computer's own OS and from Claude Code's environment). It is **per device, not per account or per repo clone**. A different computer — even the same Claude account, even the same repo — starts with no `gh`, same as this one did before 2026-11-11.

Known so far: Alberto's Mac has it (done). Alberto's Windows Dell does not yet, and runs a separate Claude account besides. The same three steps below apply regardless of account or OS, because they act on the sandbox, not on the Windows or macOS side.

## Before you start: check whether it is already needed

```bash
command -v gh || echo "no gh"
gh auth status 2>&1
```

If `gh auth status` already shows "Logged in", stop — nothing to do. If `gh` is missing or logged out, continue.

## 1. Install `gh` into that device's sandbox

The sandbox has no root and no writable system directory, so install to a user-local path and always reference it by full path or with `PATH` set in the same command (the sandbox does not source `.bashrc`, so a bare `gh` will not resolve otherwise):

```bash
ARCH=$(uname -m)   # aarch64 on Apple Silicon Macs, x86_64 on most Windows/Intel machines
case "$ARCH" in
  aarch64|arm64) GH_ARCH=arm64 ;;
  x86_64)        GH_ARCH=amd64 ;;
  *) echo "unknown arch: $ARCH — check https://github.com/cli/cli/releases manually"; exit 1 ;;
esac
URL=$(curl -sS https://api.github.com/repos/cli/cli/releases/latest \
  | grep -o "\"browser_download_url\": *\"[^\"]*linux_${GH_ARCH}\.tar\.gz\"" \
  | cut -d'"' -f4)
cd /tmp && curl -sSL -o gh.tar.gz "$URL"
mkdir -p "$HOME/.local/bin"
tar -xzf gh.tar.gz
install -m 0755 gh_*/bin/gh "$HOME/.local/bin/gh"
rm -rf gh.tar.gz gh_*
"$HOME/.local/bin/gh" --version
```

From here on, any command that needs `gh` must run with:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

in the same shell call — each device-bridge call starts a fresh shell, so this does not carry over between calls on its own.

## 2. Create a fresh, scoped token — do not reuse another device's

On github.com: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token** (https://github.com/settings/personal-access-tokens/new).

| Field | Value |
|---|---|
| Token name | `cowork-trip-planner-docs-push-<device>` (e.g. `-dell`, so it's identifiable in the token list later) |
| Expiration | 30 days — short enough that a lost or abandoned device's token dies on its own |
| Resource owner | `Fogataz` |
| Repository access | Only select repositories → `trip-planner` |
| Permissions | `Contents`: Read and write · `Pull requests`: Read and write. Leave everything else at no access (`Metadata` auto-sets to read-only) |

One token per device. Reusing a token across devices defeats the point of it being revocable per machine.

## 3. Get the token into that sandbox without it touching the chat

1. On the device itself (not through chat), save the token as **plain text** (not rich text / `.rtf`) to a file inside the folder already connected to that Cowork session, e.g. `gh-token.txt`.
2. Ask the session to confirm the file exists (size check only, never `cat` it) and run:
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   gh auth login --hostname github.com --git-protocol https --with-token < "$HOME/mnt/<folder>/gh-token.txt"
   gh auth status
   ```
3. Once `gh auth status` confirms it, delete `gh-token.txt` from that device — the token itself now lives in `gh`'s own config inside that sandbox, not in the file.

## What does not transfer, and what does

- **Does not transfer between devices:** the `gh` install, the login, the token. Each device repeats steps 1–3 once.
- **Does transfer, because it is in the repo:** ww-D8's git-command rules, `scripts/docs-commit.sh` itself, and this runbook. That is the whole reason they are written down here instead of staying in a chat.
- **Expires on its own:** the token (30 days, by design). Re-run step 2–3 when `gh auth status` starts failing again.
- **Can vanish with the sandbox:** on 2026-11-13 the sandbox had been reset and `gh` was gone, though the token was still valid. Steps 1 and 3 again, with the same token if it has not expired. Keeping `gh-token.txt` in the folder makes that one command instead of a new token, at the cost of a plaintext token on disk outside git (it is not in `.gitignore`, and `scripts/docs-commit.sh` never stages it). Delete it if that trade-off is not worth it.
- **Why `gh` is needed even to push:** the clone sets `credential.https://github.com.helper` to `!gh auth git-credential`, so without a logged-in `gh`, git cannot authenticate the push at all.

## A sandbox quirk worth knowing before you fight it

The device-bridge sandbox often cannot delete its own stale git `.lock` files (`Operation not permitted`) until delete is explicitly granted for that session. Two things that go wrong if you don't know this:

- `mv`-ing a lock file "out of the way" can silently leave the original in place (the rename's unlink half fails) — check the source is actually gone, don't assume it from the `mv` command succeeding.
- **Never rename a stray lock file to a new name that is still under `.git/refs/`** (e.g. `.git/refs/heads/<branch>.lock` → `.git/refs/heads/<branch>.lock.stale`). Git treats anything under `refs/heads/` or `refs/remotes/` as a ref by its path, so the renamed file becomes a broken ref and can break `fetch`/`push`. Move such files to a plain name directly under `.git/` instead, or request real delete permission for the session and remove them properly.
