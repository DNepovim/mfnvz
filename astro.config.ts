// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

import { envConfig } from "./env.config.ts";

import icon from "astro-icon";

const { SITE_URL } = loadEnv(process.env.SITE_URL ?? "", process.cwd(), "");
const { VERCEL_URL } = loadEnv(process.env.VERCEL_URL ?? "", process.cwd(), "");
const { ENV_NAME } = loadEnv(process.env.ENV_NAME ?? "", process.cwd(), "");

export default defineConfig({
  env: envConfig,
  site:
    SITE_URL ??
    (VERCEL_URL ? `https://${VERCEL_URL}` : "http://localhost:4321/"),

  integrations: [
    mdx(),
    sitemap(),
    ENV_NAME === "production" && sitemap({ lastmod: new Date() }),
    svelte(),
    icon(),
  ],

  vite: {
    // @ts-expect-error vite versions incompatibility
    plugins: [...tailwindcss()],
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});