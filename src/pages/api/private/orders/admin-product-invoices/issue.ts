import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { generateProductInvoiceNumber } from "@/lib/utils";
import { BuyOrderStatus, ItemStatus } from "@/definitions/statuses";

export const prerender = false;

export async function POST(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { orderId, invoiceList, totalPrice, userId } =
      await context.request.json();

    if (
      !orderId ||
      typeof orderId !== "string" ||
      !invoiceList ||
      !Array.isArray(invoiceList) ||
      !totalPrice ||
      typeof totalPrice !== "number" ||
      !userId ||
      typeof userId !== "string"
    ) {
      return new Response(JSON.stringify({ message: "Invalid Request" }), {
        status: 400,
      });
    }
    const invoiceCountObj = await prisma.productInvoiceCount.findFirst({});

    const { count } = await prisma.productInvoiceCount.update({
      where: { id: invoiceCountObj?.id },
      data: {
        count: {
          increment: 1,
        },
      },
    });
    const order = await prisma.buyOrder.update({
      where: { id: orderId },
      data: {
        productInvoice: {
          create: {
            invoiceList,
            totalPrice,
            userId,
            invoiceNumber: generateProductInvoiceNumber(count),
          },
        },
        orderStatus: BuyOrderStatus.PRODUCT_INVOICED,
        items: {
          updateMany: {
            where: {
              productStatus: ItemStatus.PENDING,
            },
            data: {
              productStatus: ItemStatus.PRODUCT_INVOICED,
            },
          },
        },
        updatedAt: new Date(),
      },
    });

    if (order) {
      return new Response(
        JSON.stringify({
          message: "청구서 발급 됐습니다",
          success: true,
          invoiceNumber: generateProductInvoiceNumber(count),
        }),
        {
          status: 200,
        }
      );
    } else {
      return new Response(JSON.stringify({ message: "청구서 발급 실패" }), {
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
