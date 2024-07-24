import { verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { generateProductInvoiceNumber } from "@/lib/utils";
import {
  BuyOrderStatus,
  ItemStatus,
  PFOrderStatus,
} from "@/definitions/statuses";

export const prerender = false;

export const POST = async (context: APIContext) => {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const session = await verifySession(context.cookies);

    if (!session || !session.isAdmin) {
      return new Response(JSON.stringify({ message: "Session not valid" }), {
        status: 401,
      });
    }

    const {
      orderId,
      invoiceList,
      totalPrice,
      userId,
      orderType,
      shipRightAway,
    }: {
      orderId: string;
      invoiceList: { quantity: number; price: number; name: string }[];
      totalPrice: number;
      userId: string;
      orderType: "buyOrder" | "pfOrder";
      shipRightAway?: boolean;
    } = await context.request.json();

    if (!orderId || !invoiceList || !totalPrice || !userId || !orderType) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    const invoiceCountObj = await prisma.shippingInvoiceCount.findFirst({});

    const { count } = await prisma.shippingInvoiceCount.update({
      where: { id: invoiceCountObj?.id },
      data: {
        count: {
          increment: 1,
        },
      },
    });

    const created = await prisma.shippingInvoice.create({
      data: {
        invoiceList,
        totalPrice,
        user: {
          connect: {
            id: userId,
          },
        },
        invoiceNumber: generateProductInvoiceNumber(count),
        buyOrder:
          orderType === "buyOrder" ? { connect: { id: orderId } } : undefined,
        pfOrder:
          orderType === "pfOrder" ? { connect: { id: orderId } } : undefined,
      },
    });

    if (!created) {
      return new Response(
        JSON.stringify({ message: "Invoice not created", success: false }),
        {
          status: 500,
        }
      );
    }

    if (orderType === "buyOrder" && shipRightAway) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.buyOrder.update({
          where: { id: orderId },
          data: {
            orderStatus: PFOrderStatus.SHIPPING_INVOICED,
            items: {
              updateMany: {
                where: {
                  productStatus: ItemStatus.PREPARING_SHIPPING,
                },
                data: {
                  productStatus: ItemStatus.SHIPPING_INVOICED,
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        const items = order.items;

        for (const item of items) {
          await tx.item.update({
            where: { id: item.id },
            data: {
              shippedQuantity: item.receivedQuantity,
            },
          });
        }
      });
    }

    if (orderType === "buyOrder" && !shipRightAway) {
      await prisma.buyOrder.update({
        where: { id: orderId },
        data: {
          orderStatus: BuyOrderStatus.SHIPPING_INVOICED,
        },
      });
    }

    if (orderType === "pfOrder" && shipRightAway) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.pfOrder.update({
          where: { id: orderId },
          data: {
            orderStatus: PFOrderStatus.SHIPPING_INVOICED,
            items: {
              updateMany: {
                where: {
                  productStatus: ItemStatus.PREPARING_SHIPPING,
                },
                data: {
                  productStatus: ItemStatus.SHIPPING_INVOICED,
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        const items = order.items;

        for (const item of items) {
          await tx.item.update({
            where: { id: item.id },
            data: {
              shippedQuantity: item.receivedQuantity,
            },
          });
        }
      });
    }

    if (orderType === "pfOrder" && !shipRightAway) {
      await prisma.pfOrder.update({
        where: { id: orderId },
        data: {
          orderStatus: PFOrderStatus.SHIPPING_INVOICED,
        },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Invoice issued",
        success: true,
        invoiceNumber: created.invoiceNumber,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
