import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
	const found = await db.query.event.findFirst({
		where: { id: params.id }
	});
	if (!found) error(404, 'Event not found');
	return { event: found };
};
