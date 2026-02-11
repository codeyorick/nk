import { drizzle } from "drizzle-orm/postgres-js"
import { env } from "$env/dynamic/private"
import * as schema from "./schema"
import { relations } from "./schema"

if (!env.DATABASE_USER) throw new Error("DATABASE_USER is not set")
if (!env.DATABASE_PASSWORD) throw new Error("DATABASE_PASSWORD is not set")
if (!env.DATABASE_DB) throw new Error("DATABASE_DB is not set")
if (!env.DATABASE_HOST) throw new Error("DATABASE_HOST is not set")
if (!env.DATABASE_PORT) throw new Error("DATABASE_PORT is not set")

const databaseUrl = `postgres://${env.DATABASE_USER}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_DB}`

export const db = drizzle(databaseUrl, { schema, relations, casing: "snake_case" })
