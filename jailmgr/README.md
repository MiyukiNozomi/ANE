# ANE Service

..aka, a FreeBSD jail manager.

### Writing recipe files

Basically, it is made up of:

```
image <name>

task : user {
    ...commands like in a bash script
}
```

### Tasks that will be automatically invoked

#### The build task

This gets run every time ane-service build is ran. It executes line by line, without sharing environment variables (yet):

```
build : root {
    pkg install -y sqlite3 node24 npm-node24
    npm i -g pnpm
    pnpm i
    SHARP_FORCE_GLOBAL_LIBVIPS=1 pnpm approve-builds
    SHARP_FORCE_GLOBAL_LIBVIPS=1 pnpm build
}
```

#### The run task

This gets assembled into a shell script that launches the service

```
run : azki {

}
```
