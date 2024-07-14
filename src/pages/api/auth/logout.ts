import { deleteSession, verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";

export const prerender = false;

export async function POST(context: APIContext) {
  try {
    const session = await verifySession(context.cookies);
    if (session) {
      await deleteSession(context.cookies);
    }
    console.log(context.cookies.has("session"));
    return new Response(
      JSON.stringify({ message: "You have been logged out!" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
