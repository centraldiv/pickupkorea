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

    const { orderId, staffMemo } = await context.request.json();

    if (!orderId || typeof orderId !== "string") {
      return new Response(JSON.stringify({ message: "Invalid Request" }), {
        status: 400,
      });
    }

    const order = await prisma.buyOrder.update({
      where: { id: orderId },
      data: { staffMemo: staffMemo.trim() },
    });

    if (order) {
      return Response.json(
        { message: "관리자 메모 저장 성공" },
        { status: 200 },
      );
    } else throw new Error("Order not found");
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
