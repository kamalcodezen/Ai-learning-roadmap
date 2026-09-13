import { auth } from "@/src/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const start = Date.now();
  console.log(`[BetterAuth GET] Started at ${start}`);
  const res = await handler.GET(req);
  console.log(`[BetterAuth GET] Finished in ${Date.now() - start}ms`);
  return res;
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  console.log(`[BetterAuth POST] Started at ${start}`);
  const res = await handler.POST(req);
  console.log(`[BetterAuth POST] Finished in ${Date.now() - start}ms`);
  return res;
}
