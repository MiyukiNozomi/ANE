#!/bin/sh

set -e trap 'echo "❌ Error occurred. Aborting deployment."; exit 1' ERR

echo "Stopping all microservices (aka:"
echo "Forbiding jails from running previous services)..."

updateService() {
    NAME=$1
    OUTPATH=/jails/containers/$2
    JAILNAME=$3

    echo "/==================================================================\\"
    echo "    Setting up $NAME at $OUTPATH (jail name $JAILNAME)"
    echo "===================================================================="

    jexec -u root $JAILNAME service jailservice stop

    echo "Removing $OUTPATH/SERVICE"
    rm -rf $OUTPATH/SERVICE

    echo "Updating SERVICE NAME"
    cp -r /root/ANE/$NAME $OUTPATH/SERVICE    

    echo "Running setup script.."
    jexec -u root $JAILNAME /SERVICE/setup.sh

    echo "\\====================================================================/"
}

updateService "GalateaCDN" "Galatea" "galatea"
updateService "ReverseProxy" "ReverseProxy" "reverse-proxy"
updateService "AuthDaemon" "AuthDaemon" "auth-daemon"
updateService "Authentication" "Authentication" "authentication"

echo "Production is ready!"
echo "Do manual configuration now before restarting those services."