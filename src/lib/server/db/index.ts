import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "$env/dynamic/private"
import * as schema from "./schema"

if (!env.DATABASE_USER) throw new Error("DATABASE_USER is not set")
if (!env.DATABASE_PASSWORD) throw new Error("DATABASE_PASSWORD is not set")
if (!env.DATABASE_DB) throw new Error("DATABASE_DB is not set")
if (!env.DATABASE_HOST) throw new Error("DATABASE_HOST is not set")
if (!env.DATABASE_PORT) throw new Error("DATABASE_PORT is not set")

const databaseUrl = `postgres://${env.DATABASE_USER}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_DB}`

const client = postgres(databaseUrl)

export const db = drizzle(client, { schema, casing: 'snake_case' })
