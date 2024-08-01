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
      orderId,
      staffMemo,
      orderType,
    }: {
      orderId: string;
      staffMemo: string;
      orderType: OrderType;
    } = await context.request.json();

    if (!orderId || typeof orderId !== "string") {
      return new Response(JSON.stringify({ message: "Invalid Request" }), {
        status: 400,
      });
    }

    if (orderType === "BuyOrder") {
      const order = await prisma.buyOrder.update({
        where: { id: orderId },
        data: { staffMemo: staffMemo.trim() },
      });

      if (order) {
        return Response.json(
          { message: "관리자 메모 저장 성공" },
          { status: 200 }
        );
      } else throw new Error("Order not found");
    } else if (orderType === "PFOrder") {
      const order = await prisma.pfOrder.update({
        where: { id: orderId },
        data: { staffMemo: staffMemo.trim() },
      });

      if (order) {
        return Response.json(
          { message: "관리자 메모 저장 성공" },
          { status: 200 }
        );
      } else throw new Error("Order not found");
    } else if (orderType === "ShippingRequest") {
      const order = await prisma.shippingRequest.update({
        where: { id: orderId },
        data: { staffMemo: staffMemo.trim() },
      });
      if (order) {
        return Response.json(
          { message: "관리자 메모 저장 성공" },
          { status: 200 }
        );
      } else throw new Error("Order not found");
    } else {
      return new Response(JSON.stringify({ message: "Invalid Request" }), {
        status: 400,
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
