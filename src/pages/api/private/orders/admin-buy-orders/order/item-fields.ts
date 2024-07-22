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

    const { orderId, itemId, field, value } = await context.request.json();

    if (
      !orderId ||
      typeof orderId !== "string" ||
      !itemId ||
      typeof itemId !== "string" ||
      !field ||
      typeof field !== "string"
    ) {
      return new Response(JSON.stringify({ message: "Invalid Request" }), {
        status: 400,
      });
    }

    const data = {
      [field]: value,
    };

    const order = await prisma.buyOrder.update({
      where: { id: orderId },
      data: {
        items: { update: { where: { id: itemId }, data } },
        updatedAt: new Date(),
      },
    });

    if (order) {
      return Response.json({ success: true }, { status: 200 });
    } else throw new Error("Order not found");
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
