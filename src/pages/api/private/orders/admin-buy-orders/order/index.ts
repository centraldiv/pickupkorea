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
    const url = new URL(context.request.url);
    const orderId = url.searchParams.get("orderId");
    if (!orderId) {
      return new Response(JSON.stringify({ message: "Order ID is required" }), {
        status: 400,
      });
    }
    const order = await prisma.buyOrder.findUnique({
      where: {
        id: orderId,
      },
      include: {
        address: {
          include: {
            country: true,
          },
        },
        items: {
          orderBy: {
            href: "asc",
          },
        },
        productInvoice: true,
        shippingMethod: true,
        user: true,
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
