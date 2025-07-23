#!bin/sh
echo "Setting up..."
cd /SERVICE

echo "Galatea uses PNPM! ensure it is installed beforehand!"

pnpm i
tsc
su - AZKi -c 'cd /SERVICE && node prebuild.js'

echo "No errors above? good, all done!"