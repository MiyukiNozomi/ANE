import crypto, { randomUUID } from "crypto";

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

  // TODO Move these somewhere else?
  export function genAuthToken() {
    return base32Encode(crypto.randomBytes(70));
  }

  export function genRecoveryKey() {
    return base32Encode(crypto.randomBytes(80));
  }

  export function genSecret() {
    return base32Encode(crypto.randomBytes(61));
  }

  function base32Encode(buffer: Buffer) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let output = "";

    for (let byte of buffer) {
      bits += byte.toString(2).padStart(8, "0");
    }

    while (bits.length % 5 !== 0) {
      bits += "0";
    }

    for (let i = 0; i < bits.length; i += 5) {
      const chunk = bits.substring(i, i + 5);
      const index = parseInt(chunk, 2);
      output += alphabet[index];
    }

    while (output.length % 8 !== 0) {
      output += "=";
    }

    return output;
  }

  function base32Decode(base32: string) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    let output = [];

    base32 = base32.replace(/=+$/, "").toUpperCase();

    for (let char of base32) {
      const val = alphabet.indexOf(char);
      if (val === -1) throw new Error("Invalid Base32 character.");
      bits += val.toString(2).padStart(5, "0");
    }

    for (let i = 0; i + 8 <= bits.length; i += 8) {
      output.push(parseInt(bits.substring(i, i + 8), 2));
    }

    return Buffer.from(output);
  }
}
