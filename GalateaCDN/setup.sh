#!bin/sh
echo "Setting up GalateaCDN"
cd /SERVICE

echo "Galatea uses PNPM! ensure it is installed beforehand!"

pnpm i
tsc
su - AZKi -c 'cd /SERVICE && SHARP_FORCE_GLOBAL_LIBVIPS=1 node bin/prebuild.js --force'

echo "No errors above? good, all done!"