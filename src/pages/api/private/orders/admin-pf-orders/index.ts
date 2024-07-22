import { verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { PFOrderStatus, ItemStatus } from "@/definitions/statuses";

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
    const orderStatus = searchParams.get("orderStatus") as PFOrderStatus;

    if (!orderStatus) {
      return new Response(
        JSON.stringify({ message: "Order status is required" }),
        {
          status: 400,
        },
      );
    }

    const buyOrders = await prisma.pfOrder.findMany({
      where: {
        orderStatus: orderStatus,
      },
      select: {
        id: true,
        orderStatus: true,
        shipRightAway: true,
        createdAt: true,
        updatedAt: true,
        shippingMethod: true,
        address: {
          include: {
            country: true,
          },
        },

        _count: {
          select: {
            items: {
              where: {
                productStatus: {
                  notIn: [ItemStatus.CREDITED, ItemStatus.REMOVED],
                },
              },
            },
          },
        },
        items: {
          select: {
            href: true,
            receivedQuantity: true,
          },
        },
        user: {
          select: {
            fullName: true,
            email: true,
            pfCode: true,
          },
        },
      },

      orderBy: {
        updatedAt: "asc",
      },
    });

    return new Response(JSON.stringify(buyOrders), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
