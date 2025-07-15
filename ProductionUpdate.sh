#!/bin/sh

echo "Stopping all microservices..."
service jail stop galatea reverse-proxy

echo "Removing previous services..."
rm -rf /jails/containers/Galatea/SERVICE
rm -rf /jails/containers/ReverseProxy/SERVICE

echo "Updating SERVICES.."
cp -r /root/ANE/GalateaCDN   /jails/containers/Galatea/SERVICE
cp -r /root/ANE/ReverseProxy /jails/containers/ReverseProxy/SERVICE

echo "Restarting jails and running setup scripts..."
service jail start galatea reverse-proxy

jexec -u root galatea       /SERVICE/setup
jexec -u root reverse-proxy /SERVICE/setup

echo "Production is ready!"