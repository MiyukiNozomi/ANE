#!bin/sh
echo "Setting up Ane-AuthD..."
cd /SERVICE

# just to be safe..
rm ANE-DEBUG.db 

dub build -b=release

su - AZKi -c 'cd /SERVICE && ./ane-authd apply-migrations'

echo "No errors above? good, all done!"