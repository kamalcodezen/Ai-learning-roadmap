// ============================================================
// BETTER AUTH
// ============================================================
// আমাদের পুরো authentication system তৈরি এবং configure করার
// জন্য Better Auth ব্যবহার করছি.
// ============================================================

import { betterAuth } from "better-auth";

// ============================================================
// BETTER AUTH PLUGINS
// ============================================================
// emailOTP → signup-এর সময় email verification OTP
// twoFactor → login-এর সময় 2FA OTP
// ============================================================

import { emailOTP, twoFactor } from "better-auth/plugins";

// ============================================================
// POSTGRESQL DATABASE
// ============================================================
// PostgreSQL database-এর সাথে connection তৈরি করার জন্য
// pg-এর Pool ব্যবহার করছি.
// ============================================================

import { Pool } from "pg";

// ============================================================
// NODEMAILER
// ============================================================
// OTP, password reset ইত্যাদির email পাঠানোর জন্য
// Nodemailer ব্যবহার করছি.
// ============================================================

import nodemailer from "nodemailer";

// ============================================================
// EMAIL HTML TEMPLATE
// ============================================================
// সব authentication email-এর জন্য একটি reusable HTML template.
//
// এই একই function ব্যবহার করে:
// 1. Password Reset email
// 2. Signup Verification OTP email
// 3. Login 2FA OTP email
//
// পাঠানো হচ্ছে.
//
// title       → email-এর heading
// message     → email-এর description
// codeOrLink  → OTP অথবা reset URL
// isLink      → reset link নাকি OTP সেটা নির্ধারণ করে
// ============================================================

const getHtmlEmailTemplate = (
  title: string,
  message: string,
  codeOrLink: string,
  isLink = false,
) => `
<!DOCTYPE html>
<html lang="en">

<head>

    <!-- Email-এর character encoding -->
    <meta charset="UTF-8">

    <!-- Mobile device-এর জন্য responsive viewport -->
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    >

    <!-- Email title -->
    <title>AI Pather</title>


    <!-- Google Font -->
    <link
      href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    >


    <!-- ======================================================
         EMAIL STYLES
         ====================================================== -->

    <style>

        /* পুরো email-এর background এবং default font */
        body {
            margin: 0;
            padding: 0;
            background-color: #F9F9F9;
            font-family: 'Hind Siliguri', -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
        }


        /* Email-এর outer wrapper */
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #F9F9F9;
            padding: 40px 0;
        }


        /* Main email card */
        .main-card {
            max-width: 540px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 16px;
            border: 1px solid #E6E9EE;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
            overflow: hidden;
        }


        /* Email-এর top banner */
        .header-banner {
            background: linear-gradient(
              135deg,
              #9F54F7 0%,
              #8523F5 100%
            );

            padding: 35px 32px;
            text-align: center;
        }


        /* AI Pather logo/text */
        .brand-logo {
            font-family: 'Hind Siliguri', sans-serif;
            color: #ffffff;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
        }


        /* Logo-এর নিচের tagline */
        .brand-tagline {
            color: #F9F9F9;
            font-size: 12px;
            margin: 12px 0 0 0;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 600;
        }


        /* Email-এর main content */
        .body-content {
            padding: 45px 35px;
            text-align: center;
        }


        /* Email heading */
        .welcome-title {
            color: #1E1E1E;
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 16px 0;
        }


        /* Email description */
        .welcome-desc {
            color: #4D4D4D;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 35px 0;
        }


        /* OTP-এর background/card */
        .action-container {
            background-color: #F5F5F5;
            border-radius: 12px;
            padding: 20px 32px;
            display: inline-block;
            border: 1px solid #E6E9EE;
        }


        /* "Verification Code" label */
        .action-label {
            color: #6B6B6B;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 600;
            display: block;
            margin-bottom: 8px;
        }


        /* OTP number-এর design */
        .action-value {
            color: #8523F5;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 6px;
            display: block;
        }


        /* Password reset button */
        .action-btn {
            display: inline-block;
            background: linear-gradient(
              135deg,
              #9F54F7 0%,
              #8523F5 100%
            );

            color: #FFFFFF !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(159, 84, 247, 0.3);
        }


        /* Email footer */
        .footer {
            background-color: #F5F5F5;
            border-top: 1px solid #E6E9EE;
            padding: 24px 32px;
            text-align: center;
        }


        /* Footer links-এর spacing */
        .footer-links {
            margin-bottom: 10px;
        }


        /* Footer links-এর design */
        .footer-links a {
            color: #8523F5;
            text-decoration: none;
            font-size: 13px;
            margin: 0 10px;
            font-weight: 600;
        }


        /* Mouse hover করলে footer link-এর color */
        .footer-links a:hover {
            color: #9F54F7;
        }


        /* Footer-এর ছোট text */
        .footer-text {
            color: #6B6B6B;
            font-size: 12px;
            margin: 0;
            line-height: 1.5;
        }

    </style>

</head>


<body>

    <!-- ======================================================
         EMAIL WRAPPER
         ====================================================== -->

    <div class="wrapper">

        <!-- Main email card -->
        <div class="main-card">


            <!-- ==================================================
                 HEADER
                 ================================================== -->

            <div class="header-banner">

                <!-- Application name -->
                <h1 class="brand-logo">
                    AI Pather
                </h1>

                <!-- Application tagline -->
                <p class="brand-tagline">
                    Your Personalized Learning Path
                </p>

            </div>


            <!-- ==================================================
                 EMAIL BODY
                 ================================================== -->

            <div class="body-content">

                <!-- Dynamic title -->
                <h2 class="welcome-title">
                    ${title}
                </h2>


                <!-- Dynamic message -->
                <p class="welcome-desc">
                    ${message}
                </p>


                <!-- =================================================
                     ACTION AREA
                     =================================================
                     
                     যদি isLink true হয়:
                     → Password Reset button দেখাবে
                     
                     যদি false হয়:
                     → OTP number দেখাবে
                     ================================================= -->

                ${
                  isLink
                    ? `
                      <!-- Password Reset Button -->

                      <a
                        href="${codeOrLink}"
                        class="action-btn"
                      >
                        Reset Password
                      </a>
                      `
                    : `
                      <!-- OTP Container -->

                      <div class="action-container">

                        <span class="action-label">
                          Verification Code
                        </span>

                        <span class="action-value">
                          ${codeOrLink}
                        </span>

                      </div>
                      `
                }

            </div>


            <!-- ==================================================
                 FOOTER
                 ================================================== -->

            <div class="footer">

                <div class="footer-links">

                    <a href="#">
                        Dashboard
                    </a>

                    <a href="#">
                        Features
                    </a>

                    <a href="#">
                        Support
                    </a>

                </div>


                <p class="footer-text">

                    &copy; ${new Date().getFullYear()}
                    AI Pather.
                    All rights reserved.

                    <br>

                    If you did not request this,
                    you can safely ignore this email.

                </p>

            </div>

        </div>

    </div>

</body>

</html>
`;

// ============================================================
// NODEMAILER EMAIL TRANSPORTER
// ============================================================
// Gmail-এর মাধ্যমে email পাঠানোর configuration.
//
// EMAIL_USER এবং EMAIL_PASSWORD .env থেকে আসবে.
// ============================================================

const transporter = nodemailer.createTransport({
  // Gmail service
  service: "gmail",

  // Gmail authentication
  auth: {
    // Gmail account
    user: process.env.EMAIL_USER,

    // Gmail app password
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ============================================================
// GLOBAL DATABASE POOL
// ============================================================
// Development environment-এ বারবার নতুন PostgreSQL
// connection তৈরি না করার জন্য global pool ব্যবহার করছি.
// ============================================================

const globalForPool = globalThis as unknown as {
  pool: Pool;
};

// ============================================================
// POSTGRESQL CONNECTION POOL
// ============================================================
// DATABASE_URL থেকে PostgreSQL database-এর connection তৈরি হচ্ছে.
// ============================================================

// Clean up Neon's default connection string to fix warnings and TLS handshake delays
const cleanDbUrl = process.env.DATABASE_URL
  ?.replace("&channel_binding=require", "")
  ?.replace("?channel_binding=require", "")
  ?.replace("&sslmode=require", "")
  ?.replace("?sslmode=require", "") as string;

// ============================================================
// POSTGRESQL CONNECTION POOL
// ============================================================

export const pool =
  globalForPool.pool ||
  new Pool({
    connectionString: cleanDbUrl,
    max: 10,
    min: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false,
    },
  });

// Handle idle connection errors to prevent uncaught exceptions from Neon terminating idle connections
pool.on("error", (err) => {
  console.error("Unexpected error on idle Better Auth pool client:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  globalForPool.pool = pool;
}

// ============================================================
// BETTER AUTH MAIN CONFIGURATION
// ============================================================

export const auth = betterAuth({
  database: pool,

  // ==========================================================
  // BETTER AUTH BASE URL
  // ==========================================================
  // Better Auth-এর base URL .env থেকে নেওয়া হচ্ছে.
  // ==========================================================

  baseURL: process.env.BETTER_AUTH_URL,

  // ==========================================================
  // USER CUSTOM FIELDS
  // ==========================================================
  // আমাদের user table-এ Better Auth-এর default field-এর বাইরে
  // custom `role` field আছে.
  //
  // Prisma:
  //
  // role String @default("LEARNER")
  //
  // এখানে Better Auth-কে সেই existing role সম্পর্কে জানানো হচ্ছে.
  //
  // Role:
  //
  // LEARNER → সাধারণ user
  // ADMIN   → Admin user
  //
  // IMPORTANT:
  // এখানে নতুন database column তৈরি হচ্ছে না.
  // Existing `user.role` field-ই ব্যবহার হচ্ছে.
  // ==========================================================

  user: {
    additionalFields: {
      role: {
        // role-এর database value string
        type: "string",

        // নতুন user-এর default role
        defaultValue: "LEARNER",
      },
    },
  },

  // ==========================================================
  // EMAIL + PASSWORD AUTHENTICATION
  // ==========================================================
  // User email এবং password দিয়ে signup/login করতে পারবে.
  // ==========================================================

  emailAndPassword: {
    enabled: true,

    // ========================================================
    // PASSWORD RESET EMAIL
    // ========================================================
    // User password ভুলে গেলে Better Auth reset URL তৈরি করে.
    //
    // তারপর সেই URL user-এর email-এ পাঠানো হয়.
    // ========================================================

    async sendResetPassword({ user, url }) {
      try {
        await transporter.sendMail({
          // কোন email থেকে পাঠানো হবে
          from: `"AI Pather" <${process.env.EMAIL_USER}>`,

          // কোন user-এর কাছে যাবে
          to: user.email,

          // Email subject
          subject: "Your AIPather Password Reset Link",

          // Plain text version
          text: `Click the link to reset your password: ${url}`,

          // সুন্দর HTML email
          html: getHtmlEmailTemplate(
            "Password Reset Request",

            "We received a request to reset your password. Click the button below to choose a new password. This link will expire in 5 minutes.",

            // Reset URL
            url,

            // true মানে এটি link
            true,
          ),
        });
      } catch (error) {
        // Email পাঠাতে সমস্যা হলে server console-এ দেখাবে
        console.error("Error sending reset password email:", error);
      }
    },
  },

  // ==========================================================
  // SOCIAL LOGIN
  // ==========================================================
  // Google এবং GitHub দিয়ে login করার ব্যবস্থা.
  // ==========================================================

  socialProviders: {
    // ========================================================
    // GOOGLE LOGIN
    // ========================================================

    google: {
      // Google OAuth Client ID
      clientId: process.env.GOOGLE_CLIENT_ID as string,

      // Google OAuth Client Secret
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },

    // ========================================================
    // GITHUB LOGIN
    // ========================================================

    github: {
      // GitHub OAuth Client ID
      clientId: process.env.GITHUB_CLIENT_ID as string,

      // GitHub OAuth Client Secret
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  // ==========================================================
  // BETTER AUTH PLUGINS
  // ==========================================================
  // এখানে additional authentication features রাখা হয়েছে.
  // ==========================================================

  plugins: [
    // ========================================================
    // EMAIL OTP
    // ========================================================
    // Signup-এর সময় email verification OTP পাঠানোর জন্য.
    // ========================================================

    emailOTP({
      // Signup-এর সময় automatically OTP পাঠাবে
      sendVerificationOnSignUp: true,

      // ======================================================
      // SEND EMAIL VERIFICATION OTP
      // ======================================================
      // Better Auth OTP generate করার পর এই function call করবে.
      // ======================================================

      async sendVerificationOTP({ email, otp }) {
        try {
          await transporter.sendMail({
            // Sender
            from: `"AI Pather" <${process.env.EMAIL_USER}>`,

            // Receiver
            to: email,

            // Subject
            subject: "Your AI Pather Email Verification OTP",

            // Plain text email
            text: `Your OTP code is ${otp}. It is valid for a short time.`,

            // HTML email
            html: getHtmlEmailTemplate(
              "Account Verification",

              "Your verification code is below. This code expires in 5 minutes.",

              // OTP
              otp,

              // false → এটা link নয়, OTP
              false,
            ),
          });
        } catch (error) {
          // OTP email পাঠাতে সমস্যা হলে
          console.error("Error sending OTP email:", error);
        }
      },
    }),

    // ========================================================
    // TWO-FACTOR AUTHENTICATION
    // ========================================================
    // User-এর account-এ 2FA enabled থাকলে login-এর সময়
    // additional OTP verification করবে.
    // ========================================================

    twoFactor({
      otpOptions: {
        // ====================================================
        // SEND LOGIN 2FA OTP
        // ====================================================
        // Login-এর সময় Better Auth OTP তৈরি করলে
        // এই function email পাঠাবে.
        // ====================================================

        async sendOTP({ user, otp }) {
          try {
            await transporter.sendMail({
              // Sender
              from: `"AI Pather" <${process.env.EMAIL_USER}>`,

              // User-এর email
              to: user.email,

              // Subject
              subject: "Your AI Pather Login OTP",

              // Plain text email
              text: `Your login verification code is ${otp}.`,

              // HTML email
              html: getHtmlEmailTemplate(
                "Secure Login Attempt",

                "Your login verification code is below. This code expires in 5 minutes.",

                // OTP
                otp,

                // false → OTP
                false,
              ),
            });
          } catch (error) {
            // 2FA email পাঠাতে সমস্যা হলে
            console.error("Error sending 2FA OTP email:", error);
          }
        },
      },

      // ======================================================
      // 2FA ENABLE VERIFICATION
      // ======================================================
      // তোমার existing configuration অনুযায়ী 2FA enable করার
      // সময় আলাদা verification skip করা হচ্ছে.
      // ======================================================

      skipVerificationOnEnable: true,
    }),
  ],
});
