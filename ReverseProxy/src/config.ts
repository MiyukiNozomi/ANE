import { readFileSync } from "fs";
import Sys from "./logging";

export let mappings = new Map<string, number>();
export let NoCORSCheckList = new Array<string>();

export let MaintenanceMode = false;

{
  const confLines = readFileSync("./rules.conf")
    .toString()
    .split("\n")
    .filter((v) => v.trim().length > 0 && !v.trim().startsWith("#"));
  for (let line of confLines) {
    console.log(line);
    let ii = line.indexOf("=");
    let domain = line.substring(0, ii);
    let values = line.substring(ii + 1);
    let valuesArray = values.split(",");

    if (domain == "$Proxy.MaintenanceMode") {
      MaintenanceMode = values === "true";
      continue;
    }

    let port = parseInt(valuesArray[0]);

    if (isNaN(port))
      throw (
        "You moron! port was NOT a number for '" +
        domain +
        "': " +
        line.substring(ii + 1) +
        "recheck configuration!"
      );

    if (values.includes("no-cors-check")) {
      Sys.println(
        "Mapping for " +
          domain +
          " has CORS protection disabled, this isn't critical, but take note."
      );
      NoCORSCheckList.push(domain);
    }
    mappings.set(domain, port);
  }
  Sys.println("Loaded mappings: " + confLines);

  if (MaintenanceMode) {
    Sys.println("WARN // Proxy is in maintenance mode!");
  }
}
