import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/sessions";

export const prerender = false;

export async function GET(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const session = await verifySession(context.cookies);
    if (!session || !session.userId) {
      return new Response(
        JSON.stringify({ message: "You are not logged in!" }),
        {
          status: 401,
        }
      );
    }
    const url = new URL(context.request.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return new Response(JSON.stringify({ message: "Order ID is required" }), {
        status: 400,
      });
    }

    const order = await prisma.shippingRequest.findUnique({
      where: {
        id: orderId,
        userId: session.userId,
      },
      include: {
        toShipItems: {
          include: {
            item: {
              include: {
                buyOrder: {
                  select: {
                    productInvoice: {
                      select: {
                        invoiceNumber: true,
                      },
                    },
                    id: true,
                  },
                },
                pfOrder: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        buyOrders: {
          select: {
            id: true,
            productInvoice: {
              select: {
                invoiceNumber: true,
              },
            },
          },
        },
        pfOrders: {
          select: {
            id: true,
          },
        },
        address: {
          include: {
            country: true,
          },
        },
      },
    });

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(order), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
