import type { AstroUserConfig } from "astro";
import { envField } from "astro/config";

export const envConfig = {
  schema: {
    SITE_URL: envField.string({
      context: "server",
      access: "public",
      default: "http://localhost:4321",
    }),
    VERCEL_URL: envField.string({
      context: "server",
      access: "public",
      optional: true,
    }),
    ENV_NAME: envField.string({
      context: "server",
      access: "public",
      default: "staging",
    }),
    PUBLIC_CLOUDINARY_CLOUD_NAME: envField.string({
      context: "client",
      access: "public",
    }),
    PUBLIC_CLOUDINARY_API_KEY: envField.string({
      context: "client",
      access: "public",
      optional: true,
    }),
    CLOUDINARY_API_SECRET: envField.string({
      context: "server",
      access: "public",
      optional: true,
    }),
  },
} as const satisfies AstroUserConfig["env"];
