#!/bin/sh

# -----------------------------------------------------------------------------
# Script Name: run-commitlint.sh
# Purpose: This script runs `commitlint` on the commit message provided as an
#          argument to ensure it follows the defined commit message conventions.
#          It can be used as part of a pre-commit hook or run manually to verify
#          commit messages.
#
# Usage:
#   ./run-commitlint.sh [commit_message_file]
#       - [commit_message_file]: The path to the file containing the commit message.
#
# Examples:
#   - Run commitlint on a commit message stored in msg.txt:
#       ./run-commitlint.sh msg.txt
#   - Use with a Git hook to automatically lint commit messages before commit:
#       cp run-commitlint.sh .git/hooks/commit-msg
#
# Bypass (for urgent situations):
#   git commit -am "message" --no-verify
# -----------------------------------------------------------------------------

echo "==== Run commitlint ===="

# Run commitlint on the commit message passed as an argument
npx --no -- commitlint --edit "$1"

# If commitlint fails, show helpful information
if [ $? -ne 0 ]; then
  echo "📚 Best practices - Conventional Commits:"
  echo "   Format: <type>(<scope>): <subject>"
  echo ""
  echo "   Types: feat, fix, docs, style, refactor, test, chore"
  echo ""
  echo "   Examples:"
  echo "   ✅ feat: add user authentication"
  echo "   ✅ fix(api): handle null response"
  echo "   ✅ docs: update README with installation steps"
  echo ""
  echo "📖 Documentation: https://www.conventionalcommits.org"
  echo "📖 Commitlint: https://commitlint.js.org"
  echo ""
  echo "💡 Bypass (urgent): git commit --no-verify"
  exit 1
else
  echo "✅ Commit message passed commitlint."
fi