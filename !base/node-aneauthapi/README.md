# node-ANEAuthAPI

This provides a basic implementation for applications to use and request a ANE account session.
Please refer to the [ANE Account Handbook](https://auth.ane.jp.net/handbook) for details.

## Building

Just use `tsc` or `pnpm tsc`

## Using

import AuthAPI from "node-aneauthapi";

AuthAPI.[press control space here]

## Developer Notice

If you're using this AuthAPI for any reason, do NOT invoke AuthAPI.ANEInternal\_\_productionMode().
_Why?_ it will point your requests to localhost.
Unless of course you're running your own authentication system at 4000 and conviently choose to use my auth protocol
