#!/bin/sh

echo "Stopping all microservices (aka:"
echo "Forbiding jails from running previous services)..."
jexec -u root galatea       service jailservice stop 
jexec -u root reverse-proxy service jailservice stop

echo "Removing previous services..."
rm -rf /jails/containers/Galatea/SERVICE
rm -rf /jails/containers/ReverseProxy/SERVICE

echo "Updating SERVICES.."
cp -r /root/ANE/GalateaCDN   /jails/containers/Galatea/SERVICE
cp -r /root/ANE/ReverseProxy /jails/containers/ReverseProxy/SERVICE

# echo "Restarting jails and running setup scripts..."
# service jail start galatea reverse-proxy

jexec -u root galatea       /SERVICE/setup.sh
jexec -u root reverse-proxy /SERVICE/setup.sh

echo "Production is ready!"
echo "Do manual configuration now before restarting those services."