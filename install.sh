  #!/usr/bin/env bash
set -e
cd "$(dirname "$0")/cli"
go build -o mantis .
mkdir -p "$HOME/.local/bin"
mv mantis "$HOME/.local/bin/mantis"
echo "Installed to $HOME/.local/bin/mantis"

EXPORT_LINE='export PATH="$HOME/.local/bin:$PATH"'

# Detect shell rc file
if [ -n "$ZSH_VERSION" ] || [ "$(basename "$SHELL")" = "zsh" ]; then
  RC_FILE="$HOME/.zshrc"
else
  RC_FILE="$HOME/.bashrc"
fi

if ! grep -qF "$EXPORT_LINE" "$RC_FILE" 2>/dev/null; then
  echo "" >> "$RC_FILE"
  echo "# added by mantis installer" >> "$RC_FILE"
  echo "$EXPORT_LINE" >> "$RC_FILE"
  echo "Added to $RC_FILE"
fi

echo ""
echo "Run this to use mantis now (or open a new terminal):"
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""