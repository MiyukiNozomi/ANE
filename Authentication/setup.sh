#!bin/sh
echo "Setting up Authentication FrontEnd..."
cd /SERVICE

echo "Authentication uses PNPM! ensure it is installed beforehand!"

pnpm i
pnpm run build

echo "No errors above? good, all done!"