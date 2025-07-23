#!bin/sh
echo "Setting up..."
cd /SERVICE

npm i
tsc
node prebuild.js

echo "No errors above? good, all done!"