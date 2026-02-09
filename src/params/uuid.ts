import type { ParamMatcher } from "@sveltejs/kit"
import * as z from "zod"

const uuidSchema = z.uuid()

export const match = ((param: string) => {
  try {
    uuidSchema.parse(param)
    return true
  } catch {
    return false
  }
}) as ParamMatcher
