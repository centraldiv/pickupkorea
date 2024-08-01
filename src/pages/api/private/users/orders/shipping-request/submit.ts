import { ShippingRequestSchema } from "@/definitions/zod-definitions";
import { verifySession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import type { APIContext } from "astro";
import type { address } from "@prisma/client";
import { generateProductInvoiceNumber } from "@/lib/utils";

export const prerender = false;

export async function POST(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const session = await verifySession(context.cookies);

    if (!session || !session.userId) {
      return new Response(
        JSON.stringify({ message: "You are not logged in!" }),
        {
          status: 401,
        }
      );
    }

    const body = await context.request.json();

    const parsed = ShippingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          message: "Invalid Input was found. Please try again",
        }),
        {
          status: 400,
        }
      );
    }

    const { data } = parsed;

    if (
      data.items.some(
        (item) =>
          item.toShipQuantity > item.availableQuantity || !item.toShipQuantity
      )
    ) {
      return new Response(
        JSON.stringify({
          message: "Invalid Items were found. Please try again.",
        }),
        {
          status: 400,
        }
      );
    }

    let address: address | null = null;
    const items = data.items.map((item) => ({
      availableQuantity: item.availableQuantity,
      toShipQuantity: item.toShipQuantity,
      itemId: item.id,
    }));
    let itemsObj: Record<string, (typeof items)[number]> = {};
    items.forEach((item) => {
      itemsObj[item.itemId] = item;
    });

    const initialCheckItems = await prisma.item.findMany({
      where: {
        id: { in: items.map((item) => item.itemId) },
      },
    });

    const passed = initialCheckItems.every((item) => {
      const itemObj = itemsObj[item.id];
      return (
        item.shippedQuantity + itemObj.toShipQuantity <=
          item.receivedQuantity &&
        item.receivedQuantity - item.shippedQuantity >=
          itemObj.toShipQuantity &&
        item.receivedQuantity - item.shippedQuantity > 0
      );
    });

    if (!passed) {
      return new Response(
        JSON.stringify({
          message: "Invalid Items were found. Please try again.",
        }),
        {
          status: 400,
        }
      );
    }
    const buyOrderIds = new Set(
      data.items
        .filter(
          (item) =>
            item.buyOrderId?.trim() && typeof item.buyOrderId === "string"
        )
        .map((item) => item.buyOrderId)
    );

    const pfOrderIds = new Set(
      data.items
        .filter(
          (item) => item.pfOrderId?.trim() && typeof item.pfOrderId === "string"
        )
        .map((item) => item.pfOrderId)
    );

    if (data.address) {
      address = await prisma.address.create({
        data: {
          ...data.address,
          country: {
            connect: {
              id: data.address.country,
            },
          },
          user: {
            connect: {
              id: session.userId,
            },
          },
        },
      });
    }

    const shippingRequestCount = await prisma.shippingRequestCount.findFirst();
    if (!shippingRequestCount) {
      return new Response(
        JSON.stringify({ message: "Failed to find shipping request count" }),
        {
          status: 500,
        }
      );
    }

    const shippingRequest = await prisma.shippingRequest.create({
      data: {
        requestNumber: generateProductInvoiceNumber(shippingRequestCount.count),
        userId: session.userId,
        userMemo: data.userMemo,
        addressId: address!.id,
        shippingMethodId: data?.shippingMethodId || null,
        toShipItems: {
          createMany: {
            data: items.map((item) => ({
              ...item,
              userId: session.userId,
            })),
          },
        },
        items: {
          connect: items.map((item) => ({
            id: item.itemId,
          })),
        },
        buyOrders: {
          connect: Array.from(buyOrderIds).map((id) => ({ id })) as {
            id: string;
          }[],
        },
        pfOrders: {
          connect: Array.from(pfOrderIds).map((id) => ({ id })) as {
            id: string;
          }[],
        },
      },
      include: {
        items: true,
      },
    });

    if (!shippingRequest) {
      return new Response(
        JSON.stringify({ message: "Failed to submit shipping request" }),
        {
          status: 500,
        }
      );
    }
    await prisma.shippingRequestCount.update({
      where: { id: shippingRequestCount.id },
      data: {
        count: { increment: 1 },
      },
    });

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        return prisma.item.update({
          where: { id: item.itemId },
          data: { shippedQuantity: { increment: item.toShipQuantity } },
        });
      })
    );

    if (updatedItems.length !== items.length) {
      return new Response(
        JSON.stringify({ message: "Failed to update items" }),
        {
          status: 500,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Shipping request submitted!",
          shippingRequestId: shippingRequest.id,
        }),
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
