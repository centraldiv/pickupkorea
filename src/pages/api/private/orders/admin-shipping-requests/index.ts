import { verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { ShippingRequestStatus } from "@/definitions/statuses";

export const prerender = false;

export const GET = async (context: APIContext) => {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const session = await verifySession(context.cookies);
    if (!session || !session.isAdmin) {
      return new Response(JSON.stringify({ message: "Session not valid" }), {
        status: 401,
      });
    }

    const url = new URL(context.request.url);
    const searchParams = new URLSearchParams(url.search);

    const requestStatus = searchParams.get(
      "requestStatus"
    ) as ShippingRequestStatus;

    if (!requestStatus) {
      return new Response(
        JSON.stringify({ message: "Request status is required" }),
        {
          status: 400,
        }
      );
    }

    const shippingRequests = await prisma.shippingRequest.findMany({
      where: {
        requestStatus: requestStatus,
      },
      include: {
        address: {
          include: {
            country: true,
          },
        },
        items: {
          include: {
            buyOrder: true,
            pfOrder: true,
          },
        },
        toShipItems: true,
        shippingMethod: true,
        user: {
          omit: {
            password: true,
          },
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
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
