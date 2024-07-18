import { verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { BuyOrderStatus, ItemStatus } from "@/definitions/statuses";

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
        },
      );
    }

    const buyOrders = await prisma.buyOrder.findMany({
      where: {
        userId: session.userId,
      },
      select: {
        id: true,
        orderStatus: true,
        shipRightAway: true,
        createdAt: true,
        productInvoice: {
          select: {
            invoiceNumber: true,
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
      },
      orderBy: {
        createdAt: "desc",
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
