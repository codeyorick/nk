import { z } from "zod"

export const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxRegistrations: z.coerce.number().int().positive().optional(),
  isPublished: z.boolean().default(false)
})

export const formPartSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  conditionType: z.enum(["none", "field_value", "date_range", "registration_count"]).default("none"),
  conditionConfig: z.any().optional()
})

export const formFieldSchema = z.object({
  type: z.enum(["text", "textarea", "email", "phone", "number", "date", "checkbox", "select", "radio", "hidden"]),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  required: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  validationRules: z.any().optional()
})

export const formFieldOptionSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
  sortOrder: z.coerce.number().int().default(0)
})

export type EventFormData = z.infer<typeof eventSchema>
export type FormPartFormData = z.infer<typeof formPartSchema>
export type FormFieldFormData = z.infer<typeof formFieldSchema>
export type FormFieldOptionFormData = z.infer<typeof formFieldOptionSchema>
