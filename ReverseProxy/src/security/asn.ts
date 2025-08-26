import Database from "better-sqlite3";
import { DATABASE_FILE } from "../constants";

export type ASNInfo = {
  cidr: string;
  asn: string;
  countryCode: string;
};

export type ASNRow = {
  addressType: 4 | 6;
  fromIp: Buffer;
  toIp: Buffer;
} & ASNInfo;

let db: Database.Database | null = null;
let asnQueryStatement: Database.Statement | null = null;

export function initASN() {
  db = new Database(DATABASE_FILE);
  asnQueryStatement = db.prepare(
    "SELECT cidr, asn, countryCode FROM asnMap WHERE addressType = ? AND fromIp <= ? AND ? <= toIp LIMIT 1"
  );
}

export function getASNInfoByIp(ipAddr: string): ASNInfo | null {
  if (!asnQueryStatement) throw "Database not open!";

  const ipAddrInfo = IPvNtoBlob(ipAddr);

  return asnQueryStatement.all(
    ipAddrInfo.addressType,
    ipAddrInfo.buffer,
    ipAddrInfo.buffer
  )[0] as ASNInfo;
}

export function IPvNtoBlob(addr: string): {
  addressType: 4 | 6;
  buffer: Buffer;
} {
  if (addr.includes(":")) {
    // an IPv6!
    return {
      addressType: 6,
      buffer: Buffer.from(
        normalizeIP6(addr)
          .split(":")
          .flatMap((part) => {
            const hex = part.padStart(4, "0"); // Ensure each part is 4 characters
            return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2), 16)];
          })
      ),
    };
  }
  // likely an ipv4..
  return {
    addressType: 4,
    buffer: Buffer.from(addr.split(".").map(Number)),
  };
}

// Taken from https://github.com/elgs/ip6/blob/master/ip6.js
function normalizeIP6(a: string) {
  a = a.toLowerCase();

  const nh = a.split(/\:\:/g);
  if (nh.length > 2) {
    throw new Error("Invalid address: " + a);
  }

  let sections: string[] = [];
  if (nh.length === 1) {
    // full mode
    sections = a.split(/\:/g);
    if (sections.length !== 8) {
      throw new Error("Invalid address: " + a);
    }
  } else if (nh.length === 2) {
    // compact mode
    const n = nh[0];
    const h = nh[1];
    const ns = n.split(/\:/g);
    const hs = h.split(/\:/g);
    for (let i in ns) {
      sections[i] = ns[i];
    }
    for (let i = hs.length; i > 0; --i) {
      sections[7 - (hs.length - i)] = hs[i - 1];
    }
  }
  for (let i = 0; i < 8; ++i) {
    if (sections[i] === undefined) {
      sections[i] = "0000";
    }
    sections[i] = sections[i].padStart(4, "0");
  }

  return sections.join(":");
}
