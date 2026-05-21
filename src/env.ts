import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_BASE_URL: z.string().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  ZALO_APP_ID: z.string().optional(),
  ZALO_APP_SECRET: z.string().optional(),
  ZALO_OA_ID: z.string().optional(),
  ZALO_OA_SECRET: z.string().optional(),
  ZALO_BOT_TOKEN: z.string().optional(),
  ZALO_MINI_APP_ID: z.string().optional(),
  ZALO_DEEP_LINK_BASE: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;