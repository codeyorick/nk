import type { User, Session } from 'better-auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
		}

		interface PageData {
			breadcrumb?: { url: string; label: string }[];
		}

		// interface Error {}
		// interface Locals {}
		// interface PageState {}
		// interface Platform {}
	}
}
