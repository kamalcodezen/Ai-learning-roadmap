import { NextRequest, NextResponse } from "next/server";

async function handleProxy(
  req: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  try {
    const subPath = Array.isArray(pathSegments)
      ? pathSegments.join("/")
      : pathSegments;

    // Guard against directory traversal or protocol injection (SSRF prevention)
    if (
      !subPath ||
      subPath.includes("..") ||
      subPath.includes("\\") ||
      /^[a-zA-Z]+:\/\//.test(subPath)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request path" },
        { status: 400 },
      );
    }

    const backendBaseUrl = (
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000"
    ).replace(/\/+$/, "");

    const search = req.nextUrl.search || "";
    const targetUrl = `${backendBaseUrl}/${subPath}${search}`;

    const forwardHeaders = new Headers();

    // Forward the cookie header containing the Better Auth session token
    const cookie = req.headers.get("cookie");
    if (cookie) {
      forwardHeaders.set("cookie", cookie);
    }

    const contentType = req.headers.get("content-type");
    if (contentType) {
      forwardHeaders.set("content-type", contentType);
    }

    const accept = req.headers.get("accept");
    if (accept) {
      forwardHeaders.set("accept", accept);
    }

    const authorization = req.headers.get("authorization");
    if (authorization) {
      forwardHeaders.set("authorization", authorization);
    }

    const method = req.method.toUpperCase();
    const hasBody = !["GET", "HEAD"].includes(method);
    let body: BodyInit | undefined = undefined;

    if (hasBody) {
      body = await req.arrayBuffer();
    }

    const backendRes = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
    });

    const responseHeaders = new Headers();
    const respContentType = backendRes.headers.get("content-type");
    if (respContentType) {
      responseHeaders.set("content-type", respContentType);
    }

    // Forward Set-Cookie if the backend sets any
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) {
      responseHeaders.set("set-cookie", setCookie);
    }

    return new Response(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Proxy Error]", error);
    return NextResponse.json(
      { success: false, message: "Failed to communicate with backend service." },
      { status: 502 },
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return handleProxy(req, path);
}
