import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";

const globalForPool = globalThis as unknown as { pool: Pool };
export const pool =
  globalForPool.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;

export const auth = betterAuth({
  database: pool,

  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

   plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,

      async sendVerificationOTP({ email, otp, type }) {
        console.log("OTP:", otp);
        console.log("Email:", email);
        console.log("Type:", type);

        // Send email here
      },
    }),
  ],
});
