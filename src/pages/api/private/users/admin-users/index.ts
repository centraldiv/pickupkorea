import { verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";

export async function GET(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const session = await verifySession(context.cookies);
    if (!session || !session.isAdmin) {
      return new Response(
        JSON.stringify({ message: "You are not logged in!" }),
        {
          status: 401,
        }
      );
    }

    const searchParams = context.url.searchParams;
    const take = parseInt(searchParams.get("take") || "1000");
    const skip = parseInt(searchParams.get("skip") || "0");

    const users = await prisma.user.findMany({
      include: {
        creditHistory: true,
        country: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
      skip,
    });

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
