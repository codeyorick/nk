import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const events = await db.query.event.findMany({
		where: { isPublished: true },
		orderBy: { startDate: 'asc' }
	});
	return { events };
};
