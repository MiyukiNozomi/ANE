# FreeBSD Jail Service Setup Cheat Sheet

This document outlines the permissions setup and service script used for securing a FreeBSD jail with a shell script executed by user `AZKi`.

---

## 🔐 Permissions Setup

### `start.sh` Script Restrictions

Ensure AZKi can execute the script but not modify it.

```sh
# Make AZKi's script directory secure
chown root:AZKi /home/AZKi
chmod 750 /home/AZKi

# Lock down /home/AZKi/start.sh
chown root:wheel /home/AZKi/start.sh
chmod 555 /home/AZKi/start.sh  # read & execute only
```

# /SERVICE and start.sh

start.sh will be set up with the code above
/SERVICE should contain the service to be daemonized.
Always have AZKi be the running user.
Ensure AZKi always has little to no permissions (if you give it wheel, i hope the jail explodes and your database gets leaked!)
seriously, don't give permissions to AZKi, SPECIALLY write permissions, even if start.sh will be run by AZKi itself.

Write files into AZKI's home folder
Don't code it to modify the SERVICE files, or you risk an evil RCE.

# Example RC service, for daemonized processes on /SERVICE
You don't have to modify it, just copy and paste and enable it through `sysrc jailservice_enable=YES`

```sh
#!/bin/sh

# REQUIRE: NETWORKING

. /etc/rc.subr

name=jailservice
rcvar=${name}_enable

pidfile="/var/run/${name}.pid"
command="/usr/sbin/daemon"
command_args="-c -r -f -S -P ${pidfile} -T ${name} -u AZKi /usr/bin/env /start.sh"

start_cmd="jailservice_start"
stop_cmd="jailservice_stop"
status_cmd="jailservice_status"

jailservice_start()
{
    echo "Starting ${name}..."
    ${command} ${command_args}
}

jailservice_stop() 
{
    echo "Stopping ${name}..."
    if [ -f "${pidfile}" ]; then
        kill "$(cat "${pidfile}")" && rm -f "${pidfile}"
    else
        echo "${name} is not running (pidfile not found)."
    fi
}

jailservice_status()
{
    if [ -f "${pidfile}" ]; then
        pid="$(cat "${pidfile}")"
        if kill -0 "${pid}" 2>/dev/null; then
            echo "${name} is running (PID: ${pid})"
            return 0
        fi
    fi
    echo "${name} is not running"
    return 1
}

load_rc_config $name
run_rc_command "$1"
```

# The Production Update Script

Update and run it when a new production release is made. Github Actions? idk what's that.
Note: it will not create the jail, create it beforehand, Miyuki.

# Creating a new microservice

Use this template for setup.sh (it will be called by the production update script)

```sh
#!bin/sh
echo "Setting up..."
cd /SERVICE

# code here

echo "No errors above? good, all done!"
```