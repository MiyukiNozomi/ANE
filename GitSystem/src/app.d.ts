// See https://svelte.dev/docs/kit/types#app.d.ts

import type AuthAPI from "node-aneauthapi";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session?: {
        sessionToken: string;
        accountInfo: AuthAPI.AccountInfo;
      };
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
