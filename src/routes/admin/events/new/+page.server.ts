import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { event } from '$lib/server/db/schema';
import { registrationForm } from '$lib/server/db/schema';
import { formPart } from '$lib/server/db/schema';
import { eventSchema } from '$lib/schemas';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const raw = {
			name: formData.get('name') as string,
			slug: formData.get('slug') as string,
			description: (formData.get('description') as string) || undefined,
			startDate: (formData.get('startDate') as string) || undefined,
			endDate: (formData.get('endDate') as string) || undefined,
			maxRegistrations: formData.get('maxRegistrations')
				? Number(formData.get('maxRegistrations'))
				: undefined,
			isPublished: formData.get('isPublished') === 'on'
		};

		const parsed = eventSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: raw });
		}

		const data = parsed.data;

		const [created] = await db
			.insert(event)
			.values({
				name: data.name,
				slug: data.slug,
				description: data.description,
				startDate: data.startDate ? new Date(data.startDate) : null,
				endDate: data.endDate ? new Date(data.endDate) : null,
				maxRegistrations: data.maxRegistrations ?? null,
				isPublished: data.isPublished
			})
			.returning();

		// Create a default registration form with one part
		const [defaultForm] = await db
			.insert(registrationForm)
			.values({
				eventId: created.id,
				name: 'Registration Form',
				description: 'Default registration form'
			})
			.returning();

		await db.insert(formPart).values({
			formId: defaultForm.id,
			title: 'Personal Information',
			sortOrder: 0
		});

		redirect(303, `/admin/events/${created.id}`);
	}
};
