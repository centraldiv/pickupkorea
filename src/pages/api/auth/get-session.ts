import { verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";

export const prerender = false;

export async function GET(context: APIContext) {
  if (context.request.headers.get("Content-Type") !== "application/json") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  const session = await verifySession(context.cookies);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized session" }), {
      status: 401,
    });
  }

  return new Response(
    JSON.stringify({
      userId: session.userId,
      isAdmin: session.isAdmin,
    })
  );
}
