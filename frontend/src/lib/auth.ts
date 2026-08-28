import { betterAuth } from "better-auth";
import { emailOTP, twoFactor } from "better-auth/plugins";
import { Pool } from "pg";
import nodemailer from "nodemailer";

const getHtmlEmailTemplate = (title: string, message: string, codeOrLink: string, isLink = false) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Pather</title>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #F9F9F9; 
            font-family: 'Hind Siliguri', -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #F9F9F9;
            padding: 40px 0;
        }
        .main-card {
            max-width: 540px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 16px;
            border: 1px solid #E6E9EE;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
            overflow: hidden;
        }
        .header-banner {
            background: linear-gradient(135deg, #9F54F7 0%, #8523F5 100%);
            padding: 35px 32px;
            text-align: center;
        }
        .brand-logo {
            font-family: 'Hind Siliguri', sans-serif;
            color: #ffffff;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
        }
        .brand-tagline {
            color: #F9F9F9;
            font-size: 12px;
            margin: 12px 0 0 0;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .body-content {
            padding: 45px 35px;
            text-align: center;
        }
        .welcome-title {
            color: #1E1E1E;
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 16px 0;
        }
        .welcome-desc {
            color: #4D4D4D;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 35px 0;
        }
        .action-container {
            background-color: #F5F5F5;
            border-radius: 12px;
            padding: 20px 32px;
            display: inline-block;
            border: 1px solid #E6E9EE;
        }
        .action-label {
            color: #6B6B6B;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 600;
            display: block;
            margin-bottom: 8px;
        }
        .action-value {
            color: #8523F5;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 6px;
            display: block;
        }
        .action-btn {
            display: inline-block;
            background: linear-gradient(135deg, #9F54F7 0%, #8523F5 100%);
            color: #FFFFFF !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(159, 84, 247, 0.3);
        }
        .footer {
            background-color: #F5F5F5;
            border-top: 1px solid #E6E9EE;
            padding: 24px 32px;
            text-align: center;
        }
        .footer-links {
            margin-bottom: 10px;
        }
        .footer-links a {
            color: #8523F5;
            text-decoration: none;
            font-size: 13px;
            margin: 0 10px;
            font-weight: 600;
        }
        .footer-links a:hover {
            color: #9F54F7;
        }
        .footer-text {
            color: #6B6B6B;
            font-size: 12px;
            margin: 0;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main-card">
            <!-- Header banner -->
            <div class="header-banner">
                <h1 class="brand-logo">AI Pather</h1>
                <p class="brand-tagline">Your Personalized Learning Path</p>
            </div>

            <!-- Main body content -->
            <div class="body-content">
                <h2 class="welcome-title">${title}</h2>
                <p class="welcome-desc">
                    ${message}
                </p>

                <!-- Action Card -->
                ${isLink 
                  ? `<a href="${codeOrLink}" class="action-btn">Reset Password</a>`
                  : `<div class="action-container"><span class="action-label">Verification Code</span><span class="action-value">${codeOrLink}</span></div>`
                }
            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="footer-links">
                    <a href="#">Dashboard</a>
                    <a href="#">Features</a>
                    <a href="#">Support</a>
                </div>
                <p class="footer-text">
                    &copy; ${new Date().getFullYear()} AI Pather. All rights reserved.<br>
                    If you did not request this, you can safely ignore this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
    async sendResetPassword({ user, url }) {
      try {
        await transporter.sendMail({
          from: `"AI Pather" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Your AIPather Password Reset Link",
          text: `Click the link to reset your password: ${url}`,
          html: getHtmlEmailTemplate(
            "Password Reset Request",
            "We received a request to reset your password. Click the button below to choose a new password. This link will expire in 5 minutes.",
            url,
            true
          ),
        });
      } catch (error) {
        console.error("Error sending reset password email:", error);
      }
    },
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
      async sendVerificationOTP({ email, otp }) {
        try {
          await transporter.sendMail({
            from: `"AI Pather" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your AI Pather Email Verification OTP",
            text: `Your OTP code is ${otp}. It is valid for a short time.`,
            html: getHtmlEmailTemplate(
              "Account Verification",
              "Your verification code is below. This code expires in 5 minutes.",
              otp,
              false
            ),
          });
        } catch (error) {
          console.error("Error sending OTP email:", error);
        }
      },
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          try {
            await transporter.sendMail({
              from: `"AI Pather" <${process.env.EMAIL_USER}>`,
              to: user.email,
              subject: "Your AI Pather Login OTP",
              text: `Your login OTP code is ${otp}.`,
              html: getHtmlEmailTemplate(
                "Secure Login Attempt",
                "Your login verification code is below. This code expires in 5 minutes.",
                otp,
                false
              ),
            });
          } catch (error) {
            console.error("Error sending 2FA OTP email:", error);
          }
        },
      },
      skipVerificationOnEnable: true,
    }),
  ],
});
