import type { ConditionConfig, DateRangeCondition, FieldValueCondition, RegistrationCountCondition } from "$lib/server/db/schema/tables"

export type EvaluationContext = {
  fieldValues: Record<string, string | string[]>
  currentDate: Date
  registrationCount: number
}

export function evaluateCondition(
  conditionType: string,
  config: ConditionConfig,
  context: EvaluationContext
): boolean {
  if (conditionType === "none" || !config) return true

  switch (conditionType) {
    case "field_value":
      return evaluateFieldValue(config as FieldValueCondition, context)
    case "date_range":
      return evaluateDateRange(config as DateRangeCondition, context)
    case "registration_count":
      return evaluateRegistrationCount(config as RegistrationCountCondition, context)
    default:
      return true
  }
}

function evaluateFieldValue(config: FieldValueCondition, context: EvaluationContext): boolean {
  const fieldValue = context.fieldValues[config.fieldId]
  if (fieldValue === undefined) return false

  const currentValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
  const targetValue = Array.isArray(config.value) ? config.value : [config.value]

  switch (config.operator) {
    case "equals":
      return currentValue.length === 1 && currentValue[0] === targetValue[0]
    case "not_equals":
      return currentValue.length !== 1 || currentValue[0] !== targetValue[0]
    case "contains":
      return currentValue.some(v => v.includes(targetValue[0]))
    case "in":
      return currentValue.some(v => targetValue.includes(v))
    default:
      return false
  }
}

function evaluateDateRange(config: DateRangeCondition, context: EvaluationContext): boolean {
  const now = context.currentDate
  if (config.after && now < new Date(config.after)) return false
  if (config.before && now > new Date(config.before)) return false
  return true
}

function evaluateRegistrationCount(config: RegistrationCountCondition, context: EvaluationContext): boolean {
  switch (config.operator) {
    case "less_than":
      return context.registrationCount < config.value
    case "greater_than":
      return context.registrationCount > config.value
    case "equals":
      return context.registrationCount === config.value
    default:
      return false
  }
}
