#!/bin/sh
echo "Setting up Authentication FrontEnd..."
cd /SERVICE

echo "Authentication uses PNPM! ensure it is installed beforehand!"

pnpm i
pnpm rebuild sharp # this is because sharp is a badly coded PIECE OF SHIT
pnpm run build

echo "No errors above? good, all done!"