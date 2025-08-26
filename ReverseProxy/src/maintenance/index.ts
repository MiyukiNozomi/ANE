import { readFileSync } from "fs";
import { MaintenanceMode } from "../config";
import { IncomingMessage, ServerResponse } from "http";
import { HandleFunc } from "..";

export async function maintenanceMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: HandleFunc
) {
  if (MaintenanceMode) {
    if (req.method?.toLowerCase() != "get") {
      res.writeHead(503, { "content-type": "application/json" });
      res.write(JSON.stringify({ message: "Maintenance mode." }));
    } else {
      res.writeHead(503, { "content-type": "text/html" });
      res.write(readFileSync("./maintenance.html"));
    }
    return res.end();
  }

  return await next(req, res);
}
