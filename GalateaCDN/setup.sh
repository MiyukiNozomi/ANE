#!bin/sh
echo "Setting up..."
cd /SERVICE

npm i
tsc

echo "No errors above? good, all done!"