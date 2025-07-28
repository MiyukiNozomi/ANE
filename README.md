![ANE Logo](GalateaCDN/default/images/logos/miyuki-studio.png)

# 
Anemachi is my website, and this repository holds every micro service used in it
This github repository is purely temporary as git.ane.jp.net is still missing

# Should I run anything on this?
No. I also hardcoded a lot of things during this project (mostly pathnames, but still, you shouldn't run this.)

# Creating Services

First off, install the respective service manually (for now)
Run `cat ExampleRCService | sed "s/%NAME/INSERT NAME HERE/"` to create a service file, you will have to manually write it into the jail's location

# Contributing
Don't, if you think anything is off, open an issue.
I will not merge any PRs unless they're so critical that I absolutely need to change it.

# TODO

- [X] Say the servicename on setup.sh scripts
- [ ] Add Embbed support in all pages (partial)
    - [X] Galatea CDN
    - [X] Reverse Proxy (might not be necessary)
    - [ ] auth.ane.jp.net
- [ ] Fix Responsiveness issue in Reverse Proxy error pages
- [X] Finish auth.ane.jp.net (Functional, but missing features)
    - [ ] Embbeds 
    - [ ] Profile Picture support
    - [ ] Session Manager
- [ ] Auth Daemon (Possible Security Concerns)
    - [ ] Limit Secret size (minimum should be 16 characters and maximum should be 256)
    - [ ] Limit the name of the Realm (minimum should be 3 characters and maximum should be 128)
- [ ] Finish git.ane.jp.net
- [ ] Finish root.ane.jp.net (aka ane.jp.net)
