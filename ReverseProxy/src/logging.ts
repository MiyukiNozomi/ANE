import { appendFileSync } from "fs";
import { ERRORS_FILE } from "./constants";

/*** straight from haxe, lmao */
const println = info;

function info(...b: any[]) {
  let t = b.map((t) => t + "").join(" ");
  let msg = new Date().toISOString() + ": " + t;
  console.log(msg);
}
function fatal(...b: any[]) {
  let t = b.map((t) => t + "").join(" ");
  let msg = "[FATAL ERROR] " + new Date().toISOString() + ": " + t;
  appendFileSync(ERRORS_FILE, msg + "\n");
  console.log(msg);
}

function error(...b: any[]) {
  let t = b.map((t) => t + "").join(" ");
  let msg = new Date().toISOString() + ": " + t;
  appendFileSync(ERRORS_FILE, msg + "\n");
  console.log(msg);
}

const Sys = { info, println, fatal, error };
export default Sys;
