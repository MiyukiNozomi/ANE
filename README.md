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

- [ ] Change the rule configuration format of the reverse proxy to allow for things such as:

  - [ ] Rate limit some regions differently (for example, limit to 2r/s in countries like China due to bots)
  - [ ] Rate limit pathnames differently, like Auth's /api/signed/update-picture

- [ ] Add Embbed support in all pages (partial)

  - [ ] git.ane.jp.net

- [ ] Finish auth.ane.jp.net (Functional, but missing features)

  - [ ] Restyle Auth

- [ ] Finish git.ane.jp.net
  - [ ] Use Git's C api instead of the CLI
  - [X] Contributor Support
  - [X] File Explorer
    - [-] Code Reader
      - [ ] Support Ashen
      - [ ] Support SQL
      - [ ] Support C and others....
    - [ ] Join empty directories (like github does with javaprojects, example: src/com/miyuki/blabla)
    - [N] Explore by commit history -- this has problems, likely wont do it until i can afford that supercomputer
    - [X] Branch support
    - [X] Visible README.mds on active directory
- [ ] Finish root.ane.jp.net (aka ane.jp.net)

# Future things for next code review...

- [ ] Modernize the Database of AuthDaemon. (Stop using SQLite)
- [ ] Recode AuthDaemon to no longer use D.....
  For context, this decision is one that... I did not want to do.
  Mostly due to the fact that D is a language I love, but recently there's been a lot of 
  trouble with basic libraries and even a.. divide in the comunity? now OpenD also exists..
  which makes the environment overrall harder to be understood and divided.

  ARSD, one of the most popular libraries for D which is a port of many libraries has recently
  adopted OpenD instead of Walter Bright's D, they're syntatically simillar but OpenD has a few
  more "javascripty" features.

  I really like D, I've met many people through the D community, but now.. i find it hard to 
  see a real future with me coding in the D programming language.

  I'll re-code the authdaemon using my own programming language.

- [ ] Modernize the Database of the Git Service. (Stop using SQLite)
- [ ] Consider moving shared logic into AuthAPI and into a custom "svelte-common" library or something of type.
- [ ] Validate octets of IPv4 addresses in ratelimit code of the reverse proxy, right now if the IP is:
      ::ffff:269.491.24.567.1561 it will still go through anyway as a normal IP, this should NOT be allowed, even if theoretically impossible..
- [ ] Maybe add a metrics page on the reverse proxy? just to see how server load is doing publically.
