import { fail, error } from "@sveltejs/kit"
import { eq, and } from "drizzle-orm"
import { db } from "$lib/server/db"
import { registrationForm, formPart, formField, formFieldOption } from "$lib/server/db/schema"
import { formPartSchema, formFieldSchema, formFieldOptionSchema } from "$lib/schemas"
import type { PageServerLoad, Actions } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
  const found = await db.query.event.findFirst({
    where: { id: params.id }
  })
  if (!found) error(404, "Event not found")

  const forms = await db.query.registrationForm.findMany({
    where: { eventId: params.id }
  })

  const activeForm = forms.find(f => f.isActive) ?? forms[0]
  if (!activeForm) {
    // Create a default form
    const [newForm] = await db
      .insert(registrationForm)
      .values({
        eventId: params.id,
        name: "Registration Form",
        description: "Default registration form",
        isActive: true
      })
      .returning()

    const [newPart] = await db
      .insert(formPart)
      .values({
        formId: newForm.id,
        title: "Personal Information",
        sortOrder: 0
      })
      .returning()

    return {
      event: found,
      form: newForm,
      parts: [{ ...newPart, fields: [] as Array<(typeof formField.$inferSelect) & { options: (typeof formFieldOption.$inferSelect)[] }> }]
    }
  }

  const parts = await db.query.formPart.findMany({
    where: { formId: activeForm.id },
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

  // Get all fields across all parts for condition configuration
  const allFields = partsWithFields.flatMap(p => p.fields)

  return {
    event: found,
    form: activeForm,
    parts: partsWithFields,
    allFields
  }
}

export const actions: Actions = {
  addPart: async ({ request }) => {
    const formData = await request.formData()
    const formId = formData.get("formId") as string

    const parsed = formPartSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      sortOrder: formData.get("sortOrder") ?? 0
    })

    if (!parsed.success) {
      return fail(400, { partErrors: parsed.error.flatten().fieldErrors })
    }

    await db.insert(formPart).values({
      formId,
      ...parsed.data
    })

    return { success: true }
  },

  updatePart: async ({ request }) => {
    const formData = await request.formData()
    const partId = formData.get("partId") as string

    const conditionType = (formData.get("conditionType") as string) || "none"
    let conditionConfig = null

    if (conditionType === "field_value") {
      conditionConfig = {
        fieldId: formData.get("conditionFieldId") as string,
        operator: formData.get("conditionOperator") as "equals" | "not_equals" | "contains" | "in",
        value: formData.get("conditionValue") as string
      }
    } else if (conditionType === "date_range") {
      conditionConfig = {
        after: (formData.get("conditionAfter") as string) || undefined,
        before: (formData.get("conditionBefore") as string) || undefined
      }
    } else if (conditionType === "registration_count") {
      conditionConfig = {
        operator: formData.get("conditionCountOperator") as "less_than" | "greater_than" | "equals",
        value: Number(formData.get("conditionCountValue"))
      }
    }

    await db
      .update(formPart)
      .set({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        conditionType: conditionType as "none" | "field_value" | "date_range" | "registration_count",
        conditionConfig
      })
      .where(eq(formPart.id, partId))

    return { success: true }
  },

  deletePart: async ({ request }) => {
    const formData = await request.formData()
    const partId = formData.get("partId") as string
    await db.delete(formPart).where(eq(formPart.id, partId))
    return { success: true }
  },

  addField: async ({ request }) => {
    const formData = await request.formData()
    const partId = formData.get("partId") as string

    const parsed = formFieldSchema.safeParse({
      type: formData.get("type"),
      label: formData.get("label"),
      description: formData.get("description") || undefined,
      placeholder: formData.get("placeholder") || undefined,
      defaultValue: formData.get("defaultValue") || undefined,
      required: formData.get("required") === "on",
      sortOrder: formData.get("sortOrder") ?? 0
    })

    if (!parsed.success) {
      return fail(400, { fieldErrors: parsed.error.flatten().fieldErrors })
    }

    await db.insert(formField).values({
      partId,
      ...parsed.data
    })

    return { success: true }
  },

  updateField: async ({ request }) => {
    const formData = await request.formData()
    const fieldId = formData.get("fieldId") as string

    await db
      .update(formField)
      .set({
        type: formData.get("type") as "text" | "textarea" | "email" | "phone" | "number" | "date" | "checkbox" | "select" | "radio" | "hidden",
        label: formData.get("label") as string,
        description: (formData.get("description") as string) || null,
        placeholder: (formData.get("placeholder") as string) || null,
        defaultValue: (formData.get("defaultValue") as string) || null,
        required: formData.get("required") === "on",
        sortOrder: Number(formData.get("sortOrder") ?? 0)
      })
      .where(eq(formField.id, fieldId))

    return { success: true }
  },

  deleteField: async ({ request }) => {
    const formData = await request.formData()
    const fieldId = formData.get("fieldId") as string
    await db.delete(formField).where(eq(formField.id, fieldId))
    return { success: true }
  },

  addOption: async ({ request }) => {
    const formData = await request.formData()
    const fieldId = formData.get("fieldId") as string

    const parsed = formFieldOptionSchema.safeParse({
      label: formData.get("label"),
      value: formData.get("value"),
      sortOrder: formData.get("sortOrder") ?? 0
    })

    if (!parsed.success) {
      return fail(400, { optionErrors: parsed.error.flatten().fieldErrors })
    }

    await db.insert(formFieldOption).values({
      fieldId,
      ...parsed.data
    })

    return { success: true }
  },

  deleteOption: async ({ request }) => {
    const formData = await request.formData()
    const fieldId = formData.get("fieldId") as string
    const value = formData.get("value") as string
    await db
      .delete(formFieldOption)
      .where(and(eq(formFieldOption.fieldId, fieldId), eq(formFieldOption.value, value)))
    return { success: true }
  }
}
