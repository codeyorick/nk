import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { registration } from '$lib/server/db/schema';
import { sendEmail, buildRegistrationConfirmedEmail } from '$lib/server/email';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const reg = await db.query.registration.findFirst({
		where: { confirmationToken: params.token }
	});

	if (!reg) error(404, 'Invalid confirmation token');

	if (reg.status === 'confirmed') {
		return { alreadyConfirmed: true, eventSlug: params.slug };
	}

	// Confirm the registration
	await db
		.update(registration)
		.set({
			status: 'confirmed',
			confirmedAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(registration.id, reg.id));

	// Get event name for the email
	const foundEvent = await db.query.event.findFirst({
		where: { id: reg.eventId }
	});

	// Send confirmed email
	if (foundEvent) {
		await sendEmail(
			buildRegistrationConfirmedEmail({
				eventName: foundEvent.name,
				registrantEmail: reg.email
			})
		);
	}

	return { alreadyConfirmed: false, eventSlug: params.slug };
};
