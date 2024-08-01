import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import type { OrderType } from "@/lib/react-query/config";

export const prerender = false;

export async function PATCH(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    
    const {
      name,
      orderId,
      orderType,
    }: { name: string; orderId: string; orderType: OrderType } =
      await context.request.json();

    if (
      !orderId ||
      typeof orderId !== "string" ||
      !name ||
      typeof name !== "string"
    ) {
      return new Response(JSON.stringify({ message: "Order ID is required" }), {
        status: 400,
      });
    }
    let order;
    if (orderType === "BuyOrder") {
      order = await prisma.buyOrder.update({
        where: {
          id: orderId,
        },
        data: {
          shippingMethod: {
            connect: {
              name: name,
            },
          },
        },
      });
    }
    if (orderType === "PFOrder") {
      order = await prisma.pfOrder.update({
        where: {
          id: orderId,
        },
        data: {
          shippingMethod: {
            connect: {
              name: name,
            },
          },
        },
      });
    }

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "배송 방법 변경 성공", success: true }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
