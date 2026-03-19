import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Manually load your Next.js environment variables
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,

    // @ts-expect-error directUrl is supported by the engine but missing from v7 types
    directUrl: process.env.DIRECT_URL!,
  },
});
