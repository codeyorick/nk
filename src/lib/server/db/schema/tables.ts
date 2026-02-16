import { boolean, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core"

// ── Enums ───────────────────────────────────────────────────────────────────

export const fieldType = pgEnum("field_type", [
  "text",
  "textarea",
  "email",
  "phone",
  "number",
  "date",
  "checkbox",
  "select",
  "radio",
  "hidden"
])

export const conditionType = pgEnum("condition_type", ["none", "field_value", "date_range", "registration_count"])

export const registrationStatus = pgEnum("registration_status", ["pending", "confirmed", "cancelled", "waitlisted"])

// ── Events ──────────────────────────────────────────────────────────────────

export const event = pgTable("event", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text(),
  startDate: timestamp({ withTimezone: true }),
  endDate: timestamp({ withTimezone: true }),
  maxRegistrations: integer(),
  isPublished: boolean().default(false).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull()
})

// ── Registration Forms ──────────────────────────────────────────────────────

export const registrationForm = pgTable("registration_form", {
  id: uuid().defaultRandom().primaryKey(),
  eventId: uuid()
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  name: text().notNull(),
  description: text(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull()
})

// ── Form Parts (Sections) ───────────────────────────────────────────────────

export const formPart = pgTable("form_part", {
  id: uuid().defaultRandom().primaryKey(),
  formId: uuid()
    .notNull()
    .references(() => registrationForm.id, { onDelete: "cascade" }),
  title: text().notNull(),
  description: text(),
  sortOrder: integer().default(0).notNull(),
  conditionType: conditionType().default("none").notNull(),
  conditionConfig: jsonb().$type<ConditionConfig>(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull()
})

// ── Form Fields ─────────────────────────────────────────────────────────────

export const formField = pgTable("form_field", {
  id: uuid().defaultRandom().primaryKey(),
  partId: uuid()
    .notNull()
    .references(() => formPart.id, { onDelete: "cascade" }),
  type: fieldType().notNull(),
  label: text().notNull(),
  description: text(),
  placeholder: text(),
  defaultValue: text(),
  required: boolean().default(false).notNull(),
  sortOrder: integer().default(0).notNull(),
  validationRules: jsonb().$type<ValidationRules>(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull()
})

// ── Form Field Options ──────────────────────────────────────────────────────

export const formFieldOption = pgTable(
  "form_field_option",
  {
    label: text().notNull(),
    value: text().notNull(),
    sortOrder: integer().default(0).notNull(),
    fieldId: uuid()
      .notNull()
      .references(() => formField.id, { onDelete: "cascade" })
  },
  table => [primaryKey({ columns: [table.fieldId, table.value] })]
)

// ── Registrations ───────────────────────────────────────────────────────────

export const registration = pgTable("registration", {
  id: uuid().defaultRandom().primaryKey(),
  eventId: uuid()
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  formId: uuid()
    .notNull()
    .references(() => registrationForm.id, { onDelete: "cascade" }),
  email: text().notNull(),
  status: registrationStatus().default("pending").notNull(),
  confirmationToken: text().unique(),
  confirmedAt: timestamp({ withTimezone: true }),
  metadata: jsonb().$type<Record<string, unknown>>(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull()
})

// ── Registration Data ───────────────────────────────────────────────────────

export const registrationData = pgTable("registration_data", {
  id: uuid().defaultRandom().primaryKey(),
  registrationId: uuid()
    .notNull()
    .references(() => registration.id, { onDelete: "cascade" }),
  fieldId: uuid()
    .notNull()
    .references(() => formField.id, { onDelete: "cascade" }),
  value: text().notNull()
})

// ── Types ───────────────────────────────────────────────────────────────────

export type ConditionConfig = FieldValueCondition | DateRangeCondition | RegistrationCountCondition | null

export type FieldValueCondition = {
  fieldId: string
  operator: "equals" | "not_equals" | "contains" | "in"
  value: string | string[]
}

export type DateRangeCondition = {
  after?: string
  before?: string
}

export type RegistrationCountCondition = {
  operator: "less_than" | "greater_than" | "equals"
  value: number
}

export type ValidationRules = {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  patternMessage?: string
} | null
