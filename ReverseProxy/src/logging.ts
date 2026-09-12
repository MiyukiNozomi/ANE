/*** straight from haxe, lmao */
// You really love that language dont ya?
// want me to rewrite the proxy for you? cutie?
const println = info;

function info(...b: any[]) {
  let t = b.map((t) => t + "").join(" ");
  let msg = new Date().toISOString() + ": " + t;
  console.log(msg);
}
function fatal(...b: any[]) {
  let t = b.map((t) => t + "").join(" ");
  let msg = "[FATAL ERROR] " + new Date().toISOString() + ": " + t;
  console.log(msg);
}

function error(...b: any[]) {
  let t = b.map((t) => t + "").join(" ");
  let msg = new Date().toISOString() + ": " + t;
  console.log(msg);
}

const Sys = { info, println, fatal, error };
export default Sys;
