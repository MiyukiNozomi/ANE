// See https://svelte.dev/docs/kit/types#app.d.ts

import type { ClientSideAccount } from "$lib/ANEAuthAPI/apiTypes";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session?: {
        sessionToken: string;
        accountInfo: ClientSideAccount;
      };
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
