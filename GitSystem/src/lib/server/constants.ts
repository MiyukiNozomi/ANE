import { dev } from "$app/environment";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import bridge from "./git/bridge";

export const ACTIVE_FOLDER = dev
  ? "./debug-data"
  : "/service/storage/gitSystem";
export const DB_FILE_NAME = ACTIVE_FOLDER + "/gitSystem.db";
export const GIT_USER_HOME_FOLDER = ACTIVE_FOLDER + "/users/";

export const DEFAULT_REPOSITORY_INIT = ACTIVE_FOLDER + "/.git-template";

mkdirSync(ACTIVE_FOLDER, { recursive: true });

/**
 * Setting up the default files for repositories.
 */
if (!existsSync(DEFAULT_REPOSITORY_INIT)) {
  mkdirSync(DEFAULT_REPOSITORY_INIT, { recursive: true });
  let readmePath = join(DEFAULT_REPOSITORY_INIT, "README.md");
  writeFileSync(
    readmePath,
    `# ANE

Welcome to your repository, feel free to perform a push-force and overwrite this README.md

Have fun!
`,
  );

  await bridge.runImmediate(DEFAULT_REPOSITORY_INIT, "init");
  await bridge.runImmediate(
    DEFAULT_REPOSITORY_INIT,
    "config",
    "user.name",
    "ANE Configurator",
  );
  await bridge.runImmediate(
    DEFAULT_REPOSITORY_INIT,
    "config",
    "user.email",
    "miyuki@ane.jp.net",
  );
  await bridge.runImmediate(DEFAULT_REPOSITORY_INIT, "add", "README.md");
  await bridge.runImmediate(
    DEFAULT_REPOSITORY_INIT,
    "commit",
    "-m",
    "Repository Created",
  );
  await bridge.runImmediate(
    DEFAULT_REPOSITORY_INIT,
    "config",
    "--bool",
    "core.bare",
    "true",
  );
  rmSync(readmePath);
  cpSync(join(DEFAULT_REPOSITORY_INIT, ".git"), DEFAULT_REPOSITORY_INIT, {
    recursive: true,
    force: true,
  });
  rmSync(join(DEFAULT_REPOSITORY_INIT, ".git"), { recursive: true });

  await bridge.runImmediate(DEFAULT_REPOSITORY_INIT, "update-server-info");
  await bridge.runImmediate(
    DEFAULT_REPOSITORY_INIT,
    "config",
    "http.receivepack",
    "true",
  );
}
