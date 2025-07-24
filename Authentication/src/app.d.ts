// See https://svelte.dev/docs/kit/types#app.d.ts

import type { AccountInfo } from "$lib/server/backend-types";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Never, ever send this to the front end directly.
			 * use for internal API requests to miyuki.gov.nt
			 */
			sessionToken: string | null,
			account: AccountInfo | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
