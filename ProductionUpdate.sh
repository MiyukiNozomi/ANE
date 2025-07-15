#!/bin/sh

rm -rf /jails/containers/Galatea/SERVICE
cp -r /root/ANE/GalateaCDN/ /jails/containers/Galatea/SERVICE

rm -rf /jails/containers/ReverseProxy/SERVICE
cp -r /root/ANE/ReverseProxy/ /jails/containers/ReverseProxy/SERVICE/