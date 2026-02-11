import { defineConfig } from "drizzle-kit"

if (!process.env.DATABASE_USER) throw new Error("DATABASE_USER is not set")
if (!process.env.DATABASE_PASSWORD) throw new Error("DATABASE_PASSWORD is not set")
if (!process.env.DATABASE_DB) throw new Error("DATABASE_DB is not set")
if (!process.env.DATABASE_HOST) throw new Error("DATABASE_HOST is not set")
if (!process.env.DATABASE_PORT) throw new Error("DATABASE_PORT is not set")

const databaseUrl = `postgres://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_DB}`

export default defineConfig({
  schema: "./src/lib/server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  casing: "snake_case",
  verbose: true,
  strict: true
})
