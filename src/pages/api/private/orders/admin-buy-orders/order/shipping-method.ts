import type { APIContext } from "astro";
import prisma from "@/lib/prisma";

export const prerender = false;

export async function PATCH(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const { name, orderId } = await context.request.json();

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

    const order = await prisma.buyOrder.update({
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

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "배송 방법 변경 성공", success: true }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
