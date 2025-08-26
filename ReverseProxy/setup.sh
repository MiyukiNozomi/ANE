#!bin/sh
echo "Setting up Reverse Proxy"
cd /SERVICE

npm i
tsc
cd ssl
./copy-certs.sh
node bin/prebuild.js
cd ..

echo "No errors above? good, all done!"