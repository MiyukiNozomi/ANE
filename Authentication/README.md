# ANE Authorization!

This is the source code for the front end of auth.ane.jp.net;
You wont see any actual database handling here.

Yes, it is a SvelteKit project, but the SvelteKit is only a men in the middle that provides a secondary layer of verification.

The actual database handling is done in AuthDaemon due to D's better resource efficiency and for extra security.

## Why Svelte?

It's in my perspective one of the best Frameworks for web development out there, it's pretty much perfect for this project as it's both
convenient and provides nice reactivity when needed.
