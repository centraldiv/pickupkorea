import { verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { generateProductInvoiceNumber } from "@/lib/utils";
import {
  BuyOrderStatus,
  ItemStatus,
  PFOrderStatus,
  ShippingRequestStatus,
} from "@/definitions/statuses";
import type { OrderType } from "@/lib/react-query/config";

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
      orderType: OrderType;
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
    let created;

    const invoiceCountObj = await prisma.shippingInvoiceCount.findFirst({});

    const { count } = await prisma.shippingInvoiceCount.update({
      where: { id: invoiceCountObj?.id },
      data: {
        count: {
          increment: 1,
        },
      },
    });

    if (orderType !== "ShippingRequest") {
      created = await prisma.shippingInvoice.create({
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
            orderType === "BuyOrder" ? { connect: { id: orderId } } : undefined,
          pfOrder:
            orderType === "PFOrder" ? { connect: { id: orderId } } : undefined,
        },
      });
    }

    if (orderType === "ShippingRequest") {
      created = await prisma.shippingInvoice.create({
        data: {
          invoiceList,
          totalPrice,
          invoiceNumber: generateProductInvoiceNumber(count),
          user: {
            connect: {
              id: userId,
            },
          },
          shippingRequest: {
            connect: {
              id: orderId,
            },
          },
        },
      });
    }
    if (!created) {
      return new Response(
        JSON.stringify({ message: "Invoice not created", success: false }),
        {
          status: 500,
        }
      );
    }

    if (orderType === "BuyOrder" && shipRightAway) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.buyOrder.update({
          where: { id: orderId },
          data: {
            orderStatus: PFOrderStatus.SHIPPING_INVOICED,
            items: {
              updateMany: {
                where: {
                  productStatus: {
                    in: [ItemStatus.PREPARING_SHIPPING, ItemStatus.RECEIVED],
                  },
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

    if (orderType === "BuyOrder" && !shipRightAway) {
      await prisma.buyOrder.update({
        where: { id: orderId },
        data: {
          orderStatus: BuyOrderStatus.SHIPPING_INVOICED,
        },
      });
    }

    if (orderType === "PFOrder" && shipRightAway) {
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

    if (orderType === "PFOrder" && !shipRightAway) {
      await prisma.pfOrder.update({
        where: { id: orderId },
        data: {
          orderStatus: PFOrderStatus.SHIPPING_INVOICED,
        },
      });
    }

    if (orderType === "ShippingRequest" && created) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.shippingRequest.update({
          where: { id: orderId },
          data: {
            requestStatus: ShippingRequestStatus.PROCESSING,
          },
          include: {
            buyOrders: true,
            pfOrders: true,
          },
        });

        const buyOrdersIds = order.buyOrders.map((order) => order.id);
        const pfOrdersIds = order.pfOrders.map((order) => order.id);

        await tx.buyOrder.updateMany({
          where: { id: { in: buyOrdersIds }, shipRightAway: false },
          data: {
            orderStatus: BuyOrderStatus.SHIPPING_INVOICED,
          },
        });
        await tx.pfOrder.updateMany({
          where: { id: { in: pfOrdersIds }, shipRightAway: false },
          data: {
            orderStatus: PFOrderStatus.SHIPPING_INVOICED,
          },
        });
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
