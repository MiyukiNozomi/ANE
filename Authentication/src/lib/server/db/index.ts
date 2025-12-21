import type { Session } from "inspector/promises";
import type { Schema, ThirdPartySessionRequest, User } from "./schema";
import {
  existsSync,
  mkdir,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { AUTH_DB_FOLDER } from "$env/static/private";
import { join } from "path";
import { BSON } from "bson";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { fi } from "zod/locales";

export type id_t = string;

export type InsertionSchema<K extends keyof Schema> = Omit<
  Schema[K],
  "id" | "createdAt" | "updatedAt"
>;

/**
 * TODO: rewrite this in Ashen when Ashen Svelte is done
 * also please dont run this with a node cluster, keep it singlethreaded
 *
 * Although we really only have two CPU cores so there isnt a lot of benefict
 * in multithreading this..
 */
class DatabaseStore<K extends keyof Schema> {
  localFile: string;
  keyname: K;

  cache: Map<string, Schema[K]>;
  indexes: Map<string, Map<string, id_t>>;

  inMemoryOnly: boolean;

  constructor(keyname: K, inMemoryOnly = false) {
    this.keyname = keyname;
    this.localFile = join(AUTH_DB_FOLDER, keyname);
    this.cache = new Map();
    this.indexes = new Map();
    this.inMemoryOnly = inMemoryOnly;

    if (!this.inMemoryOnly) mkdirSync(this.localFile, { recursive: true });
  }

  private changes = new Array<{
    type: "UPDATE" | "DROP";
    obj: Schema[K] | { id: id_t };
  }>();

  public forceSync() {
    this.changes.forEach(({ type, obj }) => {
      if (type == "UPDATE") {
        writeFileSync(this.fileNameOf(obj.id), BSON.serialize(obj));
      } else {
        rmSync(this.fileNameOf(obj.id));
      }
    });
    this.changes.length = 0;
  }

  private async sync(
    type?: "UPDATE" | "DROP",
    obj?: (typeof this.changes)[number]["obj"],
    needImmediateStore: boolean = false,
  ) {
    if (this.inMemoryOnly) return;

    if (type && obj) this.changes.push({ type, obj });
    if (this.changes.length > 20 || needImmediateStore) this.forceSync();
  }

  private indexElm(lp: Schema[K]) {
    this.indexes.keys().forEach((key) => {
      let indexedField = lp[key as keyof Schema[K]];

      let indexMap = this.indexes.get(key);
      if (!indexMap) this.indexes.set(key, (indexMap = new Map()));

      if (!lp.id) {
        throw "Object is not identificable, got " + JSON.stringify(lp);
      }
      indexMap.set(indexedField + "", lp["id"]);
    });
  }

  private fileNameOf(id: id_t) {
    return join(this.localFile, id + "");
  }

  /*** Init only! DO NOT CALL THIS BEYOND DATABASE INITIALIZATION! */
  public makeIndex(fields: Array<keyof Schema[K]>) {
    if (this.indexes.size > 0) {
      console.error(
        "Attempted to redo indexes when database has already indexed a field, bozo.",
      );
      return this;
    }

    fields.forEach((v) => this.indexes.set(v.toString(), new Map()));

    if (this.inMemoryOnly) return this;
    readdirSync(this.localFile).forEach((v) => this.indexElm(this.fetch(v)!));
    return this;
  }

  public delete(id: id_t) {
    this.cache.delete(id);

    this.indexes.values().forEach((v) => {
      let r = v.entries().find((v) => v[1] == id);
      if (r) v.delete(r[0]);
    });

    this.sync("DROP", { id });
  }

  public has(id: id_t) {
    if (this.cache.has(id)) return true;

    if (this.inMemoryOnly) return false;
    return existsSync(this.fileNameOf(id));
  }

  public queryFirst(query: Partial<Schema[K]>): string | null {
    if (this.indexes.size == 0) {
      throw `No indexes for table ${this.localFile}`;
    }

    let queryKeys = Object.keys(query);

    for (const key of queryKeys) {
      if (key == "id") {
        return this.has((query as any)[key]) ? (query as any)[key] : null;
      }

      let indexMap = this.indexes.get(key);
      if (!indexMap)
        throw `Field ${key} was not indexed in table ${this.localFile}`;

      let fId = indexMap.get((query as any)[key]);
      if (fId) return fId;
    }

    return null;
  }

  public queryAll(query: Partial<Schema[K]>) {
    if (this.indexes.size == 0) {
      throw `No indexes for table ${this.localFile}`;
    }

    let results = new Set<id_t>();

    Object.keys(query).forEach((v) => {
      if (v == "id") {
        if (this.has((query as any)[v])) results.add((query as any)[v]);
        return;
      }
      let indexMap = this.indexes.get(v);
      if (!indexMap)
        throw `Field ${v} was not indexed in table ${this.localFile}`;

      let fId = indexMap.get((query as any)[v]);
      if (fId) results.add(fId);
    });

    return Array.from(results);
  }

  public fetch(id?: id_t | null) {
    if (!id) return null;

    let ret = this.cache.get(id);

    if (!ret) {
      if (!this.has(id)) return null;

      try {
        // Just as a safeguard for paranoia reasons, even though this.has should already return false anyway
        if (this.inMemoryOnly) return null;
        ret = BSON.deserialize(readFileSync(this.fileNameOf(id))) as Schema[K];
        this.cache.set(id, ret);
        this.indexElm(ret);
      } catch (err) {
        console.log(err);
        return null;
      }
    }

    if ("expiresIn" in ret) {
      if (Date.now() - ret.createdAt >= ret.expiresIn) {
        this.delete(id);
        return null;
      }
    }

    return ret;
  }

  public insert(insertionData: InsertionSchema<K>) {
    // Typescript, fuck you!
    let obj = {
      ...insertionData,
      id: randomUUID().toString().replaceAll("-", ""),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any as Schema[K];

    this.indexElm(obj);
    this.cache.set(obj.id, obj);
    this.sync("UPDATE", obj);
    return obj;
  }

  public update(o: Schema[K]) {
    if (!o.id) {
      throw "Object is not identificable, got " + JSON.stringify(o);
    }

    if ("updatedAt" in o) {
      o.updatedAt = Date.now();
    }

    this.indexElm(o);
    this.cache.set(o.id, o);
    this.sync("UPDATE", o);
    return o;
  }
}

class Database {
  stores: Map<keyof Schema, DatabaseStore<keyof Schema>>;

  constructor() {
    this.stores = new Map();

    this.stores.set("User", new DatabaseStore("User").makeIndex(["username"]));
    this.stores.set(
      "Session",
      new DatabaseStore("Session").makeIndex(["userId"]),
    );
    this.stores.set(
      "TwoFactorSetupInformation",
      new DatabaseStore("TwoFactorSetupInformation", true).makeIndex([
        "userId",
      ]),
    );
    this.stores.set(
      "ThirdPartySessionRequest",
      new DatabaseStore("ThirdPartySessionRequest").makeIndex(["sharedSecret"]),
    );

    mkdirSync(AUTH_DB_FOLDER, { recursive: true });
  }

  public tables() {
    return this.stores.values();
  }

  public of<K extends keyof Schema>(name: K) {
    return this.stores.get(name)! as DatabaseStore<K>;
  }

  public with<K extends keyof Schema, R>(
    name: K,
    f: (d: DatabaseStore<K>) => R,
  ): R {
    return f(this.of(name));
  }
}

process.on("beforeExit", () => db.tables().forEach((v) => v.forceSync()));

export const db = new Database();
