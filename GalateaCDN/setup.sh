#!bin/sh
echo "Setting up..."
cd /SERVICE

echo "Galatea uses PNPM! ensure it is installed beforehand!"

pnpm i
tsc
node prebuild.js

echo "No errors above? good, all done!"