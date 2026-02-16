import { json } from '@sveltejs/kit';
import { eq, and, count } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { registration } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const [result] = await db
		.select({ count: count() })
		.from(registration)
		.where(and(eq(registration.eventId, params.id), eq(registration.status, 'confirmed')));

	return json({ count: result?.count ?? 0 });
};
