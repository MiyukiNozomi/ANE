// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Session } from "$lib/server/db/schema";
import type { AccountInfo } from "$lib/server/serviceTypes";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      sessionToken: string | null;
      session: Session | null;
      account: AccountInfo | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
