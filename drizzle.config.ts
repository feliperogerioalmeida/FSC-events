import "dotenv/config"

import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
