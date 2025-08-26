#!bin/sh
echo "Setting up Reverse Proxy"
cd /SERVICE

npm i
tsc

cd ssl
./copy-certs.sh
cd ..

node bin/prebuild.js

echo "No errors above? good, all done!"