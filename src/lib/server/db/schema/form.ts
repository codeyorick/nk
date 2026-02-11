import { boolean, pgEnum, primaryKey, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { defineRelations } from "drizzle-orm"

export const fieldTypes = pgEnum("field_types", ["text", "checkbox", "date", "email", "phone_number", "select"])

export const formField = pgTable("form_field", {
  id: uuid().defaultRandom().primaryKey(),
  type: fieldTypes(),
  label: text().notNull(),
  placeholder: text(),
  defaultValue: text(),
  multiple: boolean()
})

export const formFieldOption = pgTable(
  "form_field_option",
  {
    label: text().notNull(),
    value: text().notNull(),
    fieldId: uuid()
      .notNull()
      .references(() => formField.id)
  },
  table => [primaryKey({ columns: [table.fieldId, table.value] })]
)

export const relations = defineRelations({ formField, formFieldOption }, r => ({
  formField: {
    options: r.many.formFieldOption({
      from: r.formField.id,
      to: r.formFieldOption.fieldId
    })
  }
}))
