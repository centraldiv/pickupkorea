import { verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";

export const prerender = false;

export const GET = async (context: APIContext) => {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const session = await verifySession(context.cookies);
    if (!session) {
      return new Response(
        JSON.stringify({ message: "You are not logged in!" }),
        {
          status: 401,
        }
      );
    }

    const shippingRequests = await prisma.shippingRequest.findMany({
      where: {
        userId: session.userId,
      },
      select: {
        id: true,
        createdAt: true,
        requestStatus: true,
        _count: {
          select: {
            toShipItems: true,
          },
        },
        toShipItems: {
          select: {
            toShipQuantity: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return new Response(JSON.stringify(shippingRequests), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
