#!/bin/sh

# Download Prisma examples
if [ ! -d tests/playground/prisma-examples ]; then
  echo -e "Prisma examples not found. Downloading them..."
  git clone https://github.com/prisma/prisma-examples.git tests/playground/prisma-examples &> /dev/null;
  echo "Done."
fi