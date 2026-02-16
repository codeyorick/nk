import { defineRelations } from "drizzle-orm"
import { event, registrationForm, formPart, formField, formFieldOption, registration, registrationData } from "./tables"

export const relations = defineRelations(
  { event, registrationForm, formPart, formField, formFieldOption, registration, registrationData },
  r => ({
    event: {
      forms: r.many.registrationForm({
        from: r.event.id,
        to: r.registrationForm.eventId
      }),
      registrations: r.many.registration({
        from: r.event.id,
        to: r.registration.eventId
      })
    },
    registrationForm: {
      event: r.one.event({
        from: r.registrationForm.eventId,
        to: r.event.id
      }),
      parts: r.many.formPart({
        from: r.registrationForm.id,
        to: r.formPart.formId
      })
    },
    formPart: {
      form: r.one.registrationForm({
        from: r.formPart.formId,
        to: r.registrationForm.id
      }),
      fields: r.many.formField({
        from: r.formPart.id,
        to: r.formField.partId
      })
    },
    formField: {
      part: r.one.formPart({
        from: r.formField.partId,
        to: r.formPart.id
      }),
      options: r.many.formFieldOption({
        from: r.formField.id,
        to: r.formFieldOption.fieldId
      })
    },
    registration: {
      event: r.one.event({
        from: r.registration.eventId,
        to: r.event.id
      }),
      form: r.one.registrationForm({
        from: r.registration.formId,
        to: r.registrationForm.id
      }),
      data: r.many.registrationData({
        from: r.registration.id,
        to: r.registrationData.registrationId
      })
    },
    registrationData: {
      registration: r.one.registration({
        from: r.registrationData.registrationId,
        to: r.registration.id
      }),
      field: r.one.formField({
        from: r.registrationData.fieldId,
        to: r.formField.id
      })
    }
  })
)
