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

    const searchTerm = context.url.searchParams.get("searchTerm");

    if (!searchTerm) {
      return new Response(
        JSON.stringify({ message: "Search term is required" }),
        {
          status: 400,
        }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: searchTerm } },
          { fullName: { contains: searchTerm } },
          { pfCode: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        pfCode: true,
        creditAmount: true,
        createdAt: true,
        kakaoId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
