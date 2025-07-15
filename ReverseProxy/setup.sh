#!bin/sh
echo "Setting up..."
cd /SERVICE

npm i
tsc
cd ssl
./copy-certs.sh
cd ..

echo "No errors above? good, all done!"