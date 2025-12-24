import crypto, { randomUUID } from "crypto";
import { base32Decode } from "./keystores";

export namespace TimeBasedOTP {
  export function getCode(
    secret: string,
    timeStep = 30,
    digits = 6,
    algorithm = "SHA1",
  ) {
    const key = base32Decode(secret);

    let buffer = Buffer.alloc(8);
    let counter = Math.floor(Date.now() / 1000 / timeStep);
    for (let i = 7; i >= 0; i--) {
      buffer[i] = counter & 0xff;
      counter >>>= 8;
    }

    const hmac = crypto
      .createHmac(algorithm.toLowerCase(), key)
      .update(buffer)
      .digest();

    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    return (code % Math.pow(10, digits)).toString().padStart(digits, "0");
  }

  export function verify(token: string, secret: string, window = 1) {
    const timeStep = 30;
    for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
      const counter = Math.floor(Date.now() / 1000 / timeStep) + errorWindow;
      const generated = getCode(secret, timeStep);
      if (generated === token) return true;
    }
    return false;
  }
}
