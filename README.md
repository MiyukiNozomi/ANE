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

- [ ] Add a README on all microservices
- [x] Say the servicename on setup.sh scripts
- [ ] Add Embbed support in all pages (partial)
  - [x] Galatea CDN
  - [x] Reverse Proxy (might not be necessary)
  - [x] auth.ane.jp.net
  - [ ] git.ane.jp.net
- [x] Fix Responsiveness issue in Reverse Proxy error pages (done in a previous commit)
- [x] Finish auth.ane.jp.net (Functional, but missing features)
  - [x] Embeds
  - [x] Session Manager
  - [x] A way to create third party sessions yourself
  - [x] Ensure it wont be possible to duplicate requests on all pages
  - [x] When redirecting on the registration pathway, remove the leftover ?redir or any other search paths.
  - [ ] Descriptive errors in API endpoints (give real error messages on the public endpoints)
  - [ ] Profile Picture support (this can wait)
- [x] Auth Daemon (Possible Security Concerns)
  - [x] Limit Secret size (minimum should be 16 characters and maximum should be 256)
  - [x] Limit the name of the Realm (minimum should be 3 characters and maximum should be 128)
- [ ] Finish git.ane.jp.net
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
