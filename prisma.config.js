import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  engine: "classic",
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node db/seed.js",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});