# MayhtraORM (..subsided)

## I'm going to work this on another time, and move this to another repository in the future.

A SQLite3 abstraction layer for Node JS

## Why not Prisma?

Prisma uses over 900+ rust dependencies in their native libraries (this count is as of writing this, it might have decreased at the time of reading),
By the way, try to use it anywhere outside arm or x86_64 or anywhere outside Linux, Windows or Mac and you will quickly encouter problems.

_Don't get me wrong_, the conveinence is a bliss, but problems will arrise when you try to put it in production that it's simply not worth it.

## Why not Drizzle?

Drizzle is.. fine for the most part, but using native SQLite3 with it is... complicated to say the least.

### Drizzle and SQLite3 is a complicated relationship

The other options are SQLite3 forks, they're mostly fine... until they aren't.

Firstly, I dislike the Expo ecosystem.
Secondly, libSQL + nodejs has problems outside of the the standard platforms, SPECIALLY if your server is RISC or PowerPC.

It's as if it's begging for me to not use it and instead run PostgreSQL.

## The goal of this project

Provide a more friendly way for everyone working on small-scale projects to have databases.
Even for the stubborn ones that like UNIX and BSD systems as server OSes.

## Contributing

If you're wondering on how to support other database drivers, check the `src/maythra/drivers/` folder and implement the interfaces located on the `idriver.ts` file.
An example driver is located at `src/maythra/drivers/sqlite3/`.

## Usage

TODO
