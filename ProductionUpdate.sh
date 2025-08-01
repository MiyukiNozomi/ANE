#!/bin/sh

echo "Stopping all microservices (aka:"
echo "Forbiding jails from running previous services)..."

jexec -u root galatea       service jailservice stop 
jexec -u root reverse-proxy service jailservice stop 
jexec -u root auth-daemon   service jailservice stop
jexec -u root authentication   service jailservice stop

echo "Removing previous services..."

rm -rf /jails/containers/Galatea/SERVICE
rm -rf /jails/containers/ReverseProxy/SERVICE
rm -rf /jails/containers/AuthDaemon/SERVICE
rm -rf /jails/containers/Authentication/SERVICE

echo "Updating SERVICES.."

cp -r /root/ANE/GalateaCDN     /jails/containers/Galatea/SERVICE
cp -r /root/ANE/ReverseProxy   /jails/containers/ReverseProxy/SERVICE
cp -r /root/ANE/AuthDaemon     /jails/containers/AuthDaemon/SERVICE
cp -r /root/ANE/Authentication /jails/containers/Authentication/SERVICE

# echo "Restarting jails and running setup scripts..."
# service jail start galatea reverse-proxy

jexec -u root galatea          /SERVICE/setup.sh
jexec -u root reverse-proxy    /SERVICE/setup.sh
jexec -u root auth-daemon      /SERVICE/setup.sh
jexec -u root authentication   /SERVICE/setup.sh

echo "Production is ready!"
echo "Do manual configuration now before restarting those services."