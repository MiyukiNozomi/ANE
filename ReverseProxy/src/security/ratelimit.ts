import { IncomingMessage } from "http";
import Sys from "../logging";
import { IS_DEV_MODE } from "../constants";
import { getASNInfoByIp } from "./asn";

const MAX_REQUEST_COUNT_PER_ASN = 400;
const MAX_REQUEST_COUNT_UNBOUND = MAX_REQUEST_COUNT_PER_ASN / 4;

const WINDOW_DURATION = 60 * 1000; // 1 minute (in millis)

class WindowRateLimiter {
  private timestamp: number;
  private count: number;

  private limit: number;

  public constructor(limit: number) {
    this.limit = limit;
    this.timestamp = Date.now();
    this.count = 0;
  }

  public allowed(): boolean {
    let now = Date.now();
    if (IS_DEV_MODE)
      Sys.println(
        "Window time: " +
          (now - this.timestamp) +
          " (duration of window in millis: " +
          WINDOW_DURATION +
          ");"
      );

    // reinitialize window if window is no longer valid.
    if (now - this.timestamp > WINDOW_DURATION) {
      Sys.println("[ratelimit] Window has been reset.");
      this.timestamp = now;
      this.count = 0;
      return true;
    }

    this.count++;
    if (this.count >= this.limit) {
      if (IS_DEV_MODE)
        Sys.println(
          "Window has had it's maximum request count exceeded: " + this.count
        );
      return false; // exceed count = out.
    }
    return true;
  }

  public getCount() {
    return this.count;
  }
}

const unboundRateLimiter = new WindowRateLimiter(MAX_REQUEST_COUNT_UNBOUND);
let rateLimiters: Record<string, WindowRateLimiter> = {};

export function shouldNotRateLimit(req: IncomingMessage) {
  if (!req.socket.remoteAddress) {
    Sys.println(
      "[ratelimit] No remote address! defaulting to the unbound rate limiter."
    );
    return unboundRateLimiter.allowed();
  }

  let remoteAddress = req.socket.remoteAddress;
  if (remoteAddress.startsWith("::ffff:") && remoteAddress.includes("."))
    remoteAddress = remoteAddress.substring(remoteAddress.lastIndexOf(":") + 1);

  const asnRegion = getASNInfoByIp(remoteAddress);
  let ratelimiter: WindowRateLimiter;

  if (!asnRegion) {
    Sys.println(
      "[ratelimit] ASN Region not found for " +
        remoteAddress +
        "! defaulting to the unbound rate limiter."
    );
    ratelimiter = unboundRateLimiter;
  } else {
    Sys.println(
      "[ratelimit] ASN Region found for " + remoteAddress + "! ",
      asnRegion.asn,
      asnRegion.cidr,
      asnRegion.countryCode
    );

    ratelimiter = rateLimiters[asnRegion.asn];

    if (!ratelimiter) {
      Sys.println("[ratelimit] New window created for ASN: " + asnRegion.asn);
      ratelimiter = new WindowRateLimiter(MAX_REQUEST_COUNT_PER_ASN);
    }

    rateLimiters[asnRegion.asn] = ratelimiter;
  }

  Sys.println(
    "[ratelimit] Window#" +
      (asnRegion?.asn ?? "<unbound>") +
      " received " +
      ratelimiter.getCount() +
      " requests."
  );
  return ratelimiter.allowed();
}
