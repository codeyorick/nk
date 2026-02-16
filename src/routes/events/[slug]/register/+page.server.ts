import { error, fail, redirect } from "@sveltejs/kit"
import { eq, and, count } from "drizzle-orm"
import { db } from "$lib/server/db"
import {
  registration,
  registrationData,
  type formField
} from "$lib/server/db/schema"
import { sendEmail, buildConfirmationEmail } from "$lib/server/email"
import { env } from "$env/dynamic/private"
import crypto from "node:crypto"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
  const found = await db.query.event.findFirst({
    where: { slug: params.slug, isPublished: true }
  })
  if (!found) error(404, "Event not found")

  const form = await db.query.registrationForm.findFirst({
    where: { eventId: found.id, isActive: true }
  })
  if (!form) error(404, "No registration form available")

  const parts = await db.query.formPart.findMany({
    where: { formId: form.id },
    orderBy: { sortOrder: "asc" }
  })

  const partsWithFields = await Promise.all(
    parts.map(async part => {
      const fields = await db.query.formField.findMany({
        where: { partId: part.id },
        orderBy: { sortOrder: "asc" }
      })
      const fieldsWithOptions = await Promise.all(
        fields.map(async field => {
          const options = await db.query.formFieldOption.findMany({
            where: { fieldId: field.id },
            orderBy: { sortOrder: "asc" }
          })
          return { ...field, options }
        })
      )
      return { ...part, fields: fieldsWithOptions }
    })
  )

  // Get registration count for condition evaluation
  const [regCount] = await db
    .select({ count: count() })
    .from(registration)
    .where(and(eq(registration.eventId, found.id), eq(registration.status, "confirmed")))

  return {
    event: found,
    form,
    parts: partsWithFields,
    registrationCount: regCount?.count ?? 0
  }
}

export const actions: Actions = {
  default: async ({ request, params, url }) => {
    const formData = await request.formData()

    // Find event
    const found = await db.query.event.findFirst({
      where: { slug: params.slug, isPublished: true }
    })
    if (!found) error(404, "Event not found")

    // Check max registrations
    if (found.maxRegistrations) {
      const [regCount] = await db
        .select({ count: count() })
        .from(registration)
        .where(and(eq(registration.eventId, found.id), eq(registration.status, "confirmed")))

      if ((regCount?.count ?? 0) >= found.maxRegistrations) {
        return fail(400, { error: "This event has reached its maximum number of registrations." })
      }
    }

    // Get the form
    const form = await db.query.registrationForm.findFirst({
      where: { eventId: found.id, isActive: true }
    })
    if (!form) error(404, "No registration form available")

    // Get form parts and fields
    const parts = await db.query.formPart.findMany({
      where: { formId: form.id }
    })

    type FieldInfo = Pick<typeof formField.$inferSelect, "id" | "partId" | "required" | "label" | "type">
    const allFields: FieldInfo[] = []
    for (const part of parts) {
      const fields = await db.query.formField.findMany({
        where: { partId: part.id }
      })
      allFields.push(...fields)
    }

    // Extract email field value
    const emailFieldValue = formData.get("_email") as string
    if (!emailFieldValue) {
      return fail(400, { error: "Email is required for registration." })
    }

    // Validate required fields
    const fieldValues: Record<string, string> = {}
    const errors: Record<string, string> = {}

    for (const field of allFields) {
      const value = formData.get(`field_${field.id}`) as string
      fieldValues[field.id] = value ?? ""

      if (field.required && (!value || value.trim() === "")) {
        errors[field.id] = `${field.label} is required`
      }
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, { fieldErrors: errors, values: fieldValues })
    }

    // Create registration
    const confirmationToken = crypto.randomUUID()

    const [reg] = await db
      .insert(registration)
      .values({
        eventId: found.id,
        formId: form.id,
        email: emailFieldValue,
        status: "pending",
        confirmationToken
      })
      .returning()

    // Store registration data
    const dataEntries = Object.entries(fieldValues)
      .filter(([, value]) => value !== "")
      .map(([fieldId, value]) => ({
        registrationId: reg.id,
        fieldId,
        value
      }))

    if (dataEntries.length > 0) {
      await db.insert(registrationData).values(dataEntries)
    }

    // Send confirmation email
    const origin = env.ORIGIN || url.origin
    const confirmationUrl = `${origin}/events/${params.slug}/confirm/${confirmationToken}`

    await sendEmail(
      buildConfirmationEmail({
        eventName: found.name,
        confirmationUrl,
        registrantEmail: emailFieldValue
      })
    )

    redirect(303, `/events/${params.slug}/register?success=true`)
  }
}
