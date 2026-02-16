import { fail, redirect, error } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { db } from "$lib/server/db"
import { event } from "$lib/server/db/schema"
import { eventSchema } from "$lib/schemas"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
  const found = await db.query.event.findFirst({
    where: { id: params.id }
  })
  if (!found) error(404, "Event not found")
  return { event: found }
}

export const actions: Actions = {
  update: async ({ request, params }) => {
    const formData = await request.formData()
    const raw = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: (formData.get("description") as string) || undefined,
      startDate: (formData.get("startDate") as string) || undefined,
      endDate: (formData.get("endDate") as string) || undefined,
      maxRegistrations: formData.get("maxRegistrations") ? Number(formData.get("maxRegistrations")) : undefined,
      isPublished: formData.get("isPublished") === "on"
    }

    const parsed = eventSchema.safeParse(raw)
    if (!parsed.success) {
      return fail(400, { errors: parsed.error.flatten().fieldErrors, values: raw })
    }

    const data = parsed.data

    await db
      .update(event)
      .set({
        name: data.name,
        slug: data.slug,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        maxRegistrations: data.maxRegistrations ?? null,
        isPublished: data.isPublished,
        updatedAt: new Date()
      })
      .where(eq(event.id, params.id))

    return { success: true }
  },

  delete: async ({ params }) => {
    await db.delete(event).where(eq(event.id, params.id))
    redirect(303, "/admin/events")
  }
}
