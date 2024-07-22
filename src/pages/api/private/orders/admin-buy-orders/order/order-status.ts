import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { BuyOrderStatus } from "@/definitions/statuses";

const possibleOrderStatus = Object.values(BuyOrderStatus);

export const prerender = false;

export async function PATCH(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const { orderStatus, orderId } = await context.request.json();

    if (!possibleOrderStatus.includes(orderStatus)) {
      return new Response(JSON.stringify({ message: "Invalid order status" }), {
        status: 400,
      });
    }

    if (!orderId || typeof orderId !== "string") {
      return new Response(JSON.stringify({ message: "Order ID is required" }), {
        status: 400,
      });
    }

    const order = await prisma.buyOrder.update({
      where: {
        id: orderId,
      },
      data: {
        orderStatus: orderStatus,
        purchaseDate:
          orderStatus === BuyOrderStatus.AWAITING_ARRIVAL ? new Date() : null,
      },
    });

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: "주문 상태 변경 성공" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
