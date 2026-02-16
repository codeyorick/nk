import { error } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { db } from "$lib/server/db"
import { registration } from "$lib/server/db/schema"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
  const found = await db.query.event.findFirst({
    where: { id: params.id }
  })
  if (!found) error(404, "Event not found")

  const registrations = await db.query.registration.findMany({
    where: { eventId: params.id },
    orderBy: { createdAt: "desc" }
  })

  const registrationsWithData = await Promise.all(
    registrations.map(async reg => {
      const data = await db.query.registrationData.findMany({
        where: { registrationId: reg.id }
      })

      const dataWithLabels = await Promise.all(
        data.map(async d => {
          const field = await db.query.formField.findFirst({
            where: { id: d.fieldId }
          })
          return { ...d, fieldLabel: field?.label ?? "Unknown" }
        })
      )

      return { ...reg, data: dataWithLabels }
    })
  )

  return { event: found, registrations: registrationsWithData }
}

export const actions: Actions = {
  updateStatus: async ({ request }) => {
    const formData = await request.formData()
    const registrationId = formData.get("registrationId") as string
    const status = formData.get("status") as "pending" | "confirmed" | "cancelled" | "waitlisted"

    await db
      .update(registration)
      .set({
        status,
        confirmedAt: status === "confirmed" ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(registration.id, registrationId))

    return { success: true }
  }
}
