import { NextRequest, NextResponse } from "next/server";
import { auth, pool } from "@/src/lib/auth";

/**
 * ============================================================
 * TEMPORARY DEMO ADMIN AUTHENTICATION API
 * ============================================================
 * Seeds or updates the demo admin account with role: 'ADMIN',
 * emailVerified: true, and twoFactorEnabled: false so that
 * Better-Auth native authentication succeeds seamlessly.
 * ============================================================
 */
export async function POST(req: NextRequest) {
  const adminEmail = "admin@aipather.com";
  const adminPassword = "AdminPassword123!";
  const adminName = "System Administrator";

  try {
    // 1. Check if user already exists
    const userCheck = await pool.query(
      `SELECT id, role FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [adminEmail]
    );

    let needsSignUp = false;
    if (userCheck.rows.length === 0) {
      needsSignUp = true;
    } else {
      const userId = userCheck.rows[0].id;
      // Check if credential account exists
      const accountCheck = await pool.query(
        `SELECT id, password FROM "account" WHERE "userId" = $1 AND "providerId" = 'credential' LIMIT 1`,
        [userId]
      );
      if (accountCheck.rows.length === 0 || !accountCheck.rows[0].password) {
        // Clear stale incomplete records so signUpEmail creates a clean new user & credential account
        try {
          await pool.query(`DELETE FROM "session" WHERE "userId" = $1`, [userId]);
          await pool.query(`DELETE FROM "account" WHERE "userId" = $1`, [userId]);
          await pool.query(`DELETE FROM "user" WHERE "id" = $1`, [userId]);
        } catch {
          // Ignore deletion errors
        }
        needsSignUp = true;
      }
    }

    // 2. Create demo admin via Better-Auth's signUpEmail if needed
    if (needsSignUp) {
      try {
        await auth.api.signUpEmail({
          body: {
            email: adminEmail,
            password: adminPassword,
            name: adminName,
          },
        });
      } catch (signUpErr) {
        console.log("[Demo Admin SignUp note]:", signUpErr);
      }
    }

    // 3. Ensure role is always ADMIN, plan is PRO, emailVerified is true, and 2FA is disabled
    await pool.query(
      `UPDATE "user" 
       SET "role" = 'ADMIN', "plan" = 'PRO', "emailVerified" = true, "twoFactorEnabled" = false, "updatedAt" = NOW() 
       WHERE LOWER(email) = LOWER($1)`,
      [adminEmail]
    );

    // 4. Try native Better-Auth server signin with signed cookies
    try {
      const signInRes = await auth.api.signInEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
        },
        asResponse: true,
        headers: req.headers,
      });

      if (signInRes && signInRes.ok) {
        return signInRes;
      }
    } catch (signInErr) {
      console.log("[Demo Admin server signin note]:", signInErr);
    }

    return NextResponse.json({
      success: true,
      ready: true,
      email: adminEmail,
      password: adminPassword,
      message: "Demo admin prepared successfully",
    });
  } catch (error: unknown) {
    console.error("[Demo Admin Preparation Error]:", error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Failed to prepare demo admin account",
      },
      { status: 500 }
    );
  }
}
