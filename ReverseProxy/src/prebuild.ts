import Database from "better-sqlite3";
import { createWriteStream, existsSync, readFileSync, rmSync } from "fs";
import https from "https";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { createGunzip } from "zlib";
import { DATABASE_FILE } from "./constants";
import { ASNRow, IPvNtoBlob } from "./security/asn";

function downloadGZipped() {
  return new Promise<Buffer>((resolve) => {
    process.stdout.write("Download of ASN IP prefixes in progress");
    https
      .get("https://mailfud.org/geoip-legacy/GeoIP-legacy.csv.gz", (res) => {
        let data: Buffer[] = [];
        res
          .on("data", (chunk) => {
            process.stdout.write(".");
            data.push(chunk);
          })
          .on("end", () => {
            let buffer = Buffer.concat(data);
            console.log("\nDownload complete!");
            resolve(buffer);
          });
      })
      .on("error", (err) => {
        console.log();
        throw err;
      });
  });
}

const csvFileLocation = DATABASE_FILE + ".tmp.csv";

async function downloadCSV() {
  const gzipFile = await downloadGZipped();
  const gzipFileStream = new Readable({
    read() {
      this.push(gzipFile);
      this.push(null); // Signal the end of the stream
    },
  });

  const stream = createWriteStream(csvFileLocation);
  await pipeline(gzipFileStream, createGunzip(), stream);
  stream.close((err) => {
    if (err) throw err;
  });
}

function parseLine(line: string) {
  let comps = new Array<string>();

  let currStr = "";
  for (let i = 0; i < line.length; ) {
    if (line[i] == '"') {
      ++i;
      while (i < line.length) {
        if (line[i] == '"') break;
        currStr += line[i++];
      }
      i++;
      continue;
    } else {
      i++;
      if (currStr.length > 0) comps.push(currStr);
      currStr = "";
    }
  }

  if (currStr.length > 0) comps.push(currStr);

  return comps;
}

async function prebuild() {
  if (!existsSync(csvFileLocation)) {
    console.log("Could not find " + csvFileLocation + " locally! downloading.");
    await downloadCSV();
  }

  if (existsSync(DATABASE_FILE)) rmSync(DATABASE_FILE);

  const db = new Database(DATABASE_FILE);

  db.exec(`
    CREATE TABLE asnMap (
        addressType INTEGER NOT NULL,

        fromIp BLOB NOT NULL,
        toIp BLOB NOT NULL,
        cidr TEXT NOT NULL,
        asn TEXT NOT NULL,
        countryCode TEXT NOT NULL,

        PRIMARY KEY (fromIp, toIp)
    )
`);

  const lines = readFileSync(csvFileLocation).toString().split("\n");

  db.pragma("journal_mode = WAL");

  const stmt = db.prepare(
    "INSERT INTO asnMap (addressType, fromIp, toIp, cidr, asn, countryCode) VALUES (?, ?,?,?,?,?)"
  );

  const insertTransaction = db.transaction((rows: Array<ASNRow>) => {
    for (const row of rows) {
      stmt.run(
        row.addressType,
        row.fromIp,
        row.toIp,
        row.cidr,
        row.asn,
        row.countryCode
      );
    }
  });

  let rows = new Array<ASNRow>();
  for (const line of lines) {
    if (line.length == 0) continue;

    const keys = parseLine(line);
    if (keys.length < 5) {
      throw new Error(
        "Oh shit! keys does not match 5 values! did the schema of that csv change?, got: \n" +
          line
      );
    }

    if (rows.length > 256) {
      insertTransaction(rows);
      rows = [];
    }

    const fromIpInfo = IPvNtoBlob(keys[0]);
    let obj = {
      addressType: fromIpInfo.addressType,

      fromIp: fromIpInfo.buffer,
      toIp: IPvNtoBlob(keys[1]).buffer,
      cidr: keys[2],
      asn: keys[3],

      countryCode: keys[4],
    } satisfies ASNRow;

    rows.push(obj);
  }

  console.log("Creating indexes..");

  db.exec(`CREATE INDEX asnIndex ON asnMap(addressType, fromIp, toIp)`);

  console.log("ASN database complete.");
}

prebuild().catch((err) => console.error(err));
