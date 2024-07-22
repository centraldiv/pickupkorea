import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
export const prerender = false;
export async function GET(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const countries = await prisma.country.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return Response.json(countries);
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
