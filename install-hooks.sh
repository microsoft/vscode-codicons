#!/bin/bash

cd .git/hooks
if [ ! -f pre-commit ]; then
    cat << 'EOF' > pre-commit
#!/bin/sh

# Run SVGO optimization
npm run svgo
if [ $? -ne 0 ]; then
  echo "SVGO optimization failed. Please fix the issues and try again."
  exit 1
fi

# If there are whitespace errors, print the offending file names and fail.
exec git diff-index --check --cached HEAD --

EOF
chmod +x pre-commit
fi