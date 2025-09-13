export const GIT_OBJECT_NAME_MIN = 3;
export const GIT_OBJECT_NAME_MAX = 64;

export const REPOSITORY_DESCRIPTION_MAX = 128;

/***
 * Doc note: the values here are only supposed to be used by fileList to ID the icon name.
 * Use the key value as an actual language identifier in Lexer
 *
 *  - Miyuki, to Miyuki of the Future
 */
export const SUPPORTED_LANGUAGES_BY_EXTENSION = {
  /** languages with actual highlighting */
  ash: "ashen",
  ashen: "ashen",
  cpp: "c",
  c: "c",
  h: "c",
  git: "git",
  java: "java",
  js: "js",
  json: "js",
  ts: "ts", // done
  tsconfig: "js",

  /** files that yes, we want to display, BUT as text. (no highlighting) */
  txt: "text/plain",
} as const;
