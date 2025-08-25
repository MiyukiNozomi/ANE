![ANE Logo](GalateaCDN/default/images/logos/ane-logo-final.png)

#

Anemachi is my website, and this repository holds every micro service used in it
This github repository is purely temporary as git.ane.jp.net is still missing

# Should I run anything on this?

No. I also hardcoded a lot of things during this project (mostly pathnames, but still, you shouldn't run this.)

## Why the hell can I open the source code then?

Mostly for user reference, lets say someone is curious about how the microservices work.
The other reason is convenience, it's easier to clone and replace services if they're on GitHub instead of git.ane.jp.net;
It also doubles as a backup system!.

From my perspective, it also doubles as a security measure: I wont have to store a github token in my server to clone/pull this repository.

# Contributing

Don't, if you think anything is off, open an issue.
I will not merge any PRs unless they're so critical that I absolutely need to change it.

# Creating Services

First off, install the respective service manually (for now)
Run `cat ExampleRCService | sed "s/%NAME/INSERT NAME HERE/"` to create a service file, you will have to manually write it into the jail's location

# TODO

- [ ] Consider moving shared logic into AuthAPI and into a custom "svelte-common" library or something of type.
- [ ] Add a README on all microservices
- [ ] Add Embbed support in all pages (partial)
  - [ ] git.ane.jp.net
- [ ] Galatea Tweaks
  - [ ] Ability to get images but in a resized mode.
  - [ ] Consider rewrite to not rely in NodeJS.
- [ ] Finish auth.ane.jp.net (Functional, but missing features)

  - [x] Data not updating cookies when properties are changed (When the display name is updated, change is only seen after signing in again, this is bad.)

  - [x] Bug in registration page (incorrect passwords.. matched? retest this later) Yes, this is a real bug, idiot!

  - [ ] Descriptive errors in API endpoints (give real error messages on the public endpoints) (better to do this at reverse proxy level, honestly.)

  - [ ] Profile Picture support (this can wait)

- [ ] Finish git.ane.jp.net
  - [ ] Optimize landing page background code
  - [ ] Move compass images to galatea (first, do the task in galatea)
  - [ ] ANE Authorizations
  - [ ] Repositories
  - [ ] Git
    - [ ] Git Push
    - [ ] Git Pull
  - [ ] Contributor Support
  - [ ] File Explorer
    - [ ] Code Reader
    - [ ] Join empty directories (like github does with javaprojects, example: src/com/miyuki/blabla)
    - [ ] Explore by commit history
    - [ ] Branch support
    - [ ] Visible README.mds on active directory
- [ ] Finish root.ane.jp.net (aka ane.jp.net)

- [ ] Document all microservices (the readme.md on all of them)
- [ ] Stop using wasm32 sharp in microservices (it does support FreeBSD natively, i should NOT be using the wasm module anymore.)
