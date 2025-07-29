# ANE Authorization!
This is the source code for the front end of auth.ane.jp.net;
You wont see any actual database handling here.

Yes, it is a SvelteKit project, but the SvelteKit is only a men in the middle that provides a secondary layer of verification.

The actual database handling is in AuthDaemon.

## Why Svelte?
It's in my perspective one of the best Frameworks for web development out there, it's pretty much perfect for this project as it's both
convenient and provides nice reactivity when needed.

## Everything below is a lie...


# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
