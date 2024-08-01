import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import type { OrderType } from "@/lib/react-query/config";
import { verifySession } from "@/lib/sessions";

export const GET = async (context: APIContext) => {
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

    const url = new URL(context.request.url);
    const searchParams = new URLSearchParams(url.search);
    const orderId = searchParams.get("orderId") as string;
    const orderType = searchParams.get("orderType") as OrderType;

    if (!orderId || !orderType) {
      return new Response(
        JSON.stringify({ message: "Order id and order type are required" }),
        {
          status: 400,
        }
      );
    }

    if (
      orderType !== "BuyOrder" &&
      orderType !== "PFOrder" &&
      orderType !== "ShippingRequest"
    ) {
      return new Response(
        JSON.stringify({ message: "Order type is invalid" }),
        {
          status: 400,
        }
      );
    }

    const where =
      orderType === "BuyOrder"
        ? {
            buyOrder: {
              id: orderId,
            },
          }
        : orderType === "PFOrder"
        ? {
            pfOrder: {
              id: orderId,
            },
          }
        : {
            shippingRequest: {
              id: orderId,
            },
          };

    const shippingInvoices = await prisma.shippingInvoice.findMany({
      where: where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        buyOrder: {
          include: {
            address: true,
          },
        },
        pfOrder: {
          include: {
            address: true,
          },
        },
        shippingRequest: {
          include: {
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(shippingInvoices), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
