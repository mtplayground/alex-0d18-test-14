import { existsSync, readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const apiBaseUrl = "http://127.0.0.1:8080";
const webBaseUrl = "http://127.0.0.1:5173";
const databaseUrl =
  process.env.DATABASE_URL ??
  (existsSync("/workspace/.database_url")
    ? readFileSync("/workspace/.database_url", "utf8").trim()
    : "");

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: webBaseUrl,
    trace: "on-first-retry"
  },
  webServer: [
    {
      command:
        "npm run db:migrate:deploy && npm run build --workspace apps/api && npm run start --workspace apps/api",
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        HOST: "0.0.0.0",
        PORT: "8080"
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: `${apiBaseUrl}/health`
    },
    {
      command: "npm run dev --workspace apps/web -- --host 0.0.0.0",
      env: {
        ...process.env,
        VITE_API_BASE_URL: apiBaseUrl
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: webBaseUrl
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
