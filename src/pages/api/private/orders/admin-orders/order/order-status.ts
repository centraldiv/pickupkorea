import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import {
  BuyOrderStatus,
  ItemStatus,
  PFOrderStatus,
  ShippingRequestStatus,
} from "@/definitions/statuses";

import type { OrderType } from "@/lib/react-query/config";
import { verifySession } from "@/lib/sessions";

const possibleOrderStatus = Object.values(BuyOrderStatus);
const possiblePFOrderStatus = Object.values(PFOrderStatus);
const possibleShippingRequestStatus = Object.values(ShippingRequestStatus);

export const prerender = false;

export async function PATCH(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const session = await verifySession(context.cookies);
    if (!session || !session.isAdmin) {
      return new Response(
        JSON.stringify({ message: "You are not logged in!" }),
        {
          status: 401,
        }
      );
    }

    const {
      orderStatus,
      orderId,
      orderType,
    }: {
      orderStatus: BuyOrderStatus | PFOrderStatus | ShippingRequestStatus;
      orderId: string;
      orderType: OrderType;
    } = await context.request.json();

    if (
      !possibleOrderStatus.includes(orderStatus as BuyOrderStatus) &&
      !possiblePFOrderStatus.includes(orderStatus as PFOrderStatus) &&
      !possibleShippingRequestStatus.includes(
        orderStatus as ShippingRequestStatus
      )
    ) {
      return new Response(JSON.stringify({ message: "Invalid order status" }), {
        status: 400,
      });
    }

    if (!orderId || typeof orderId !== "string") {
      return new Response(JSON.stringify({ message: "Order ID is required" }), {
        status: 400,
      });
    }

    if (!orderType || typeof orderType !== "string") {
      return new Response(
        JSON.stringify({ message: "Order type is required" }),
        {
          status: 400,
        }
      );
    }
    let order;

    if (orderType === "BuyOrder") {
      const initialOrder = await prisma.buyOrder.findUnique({
        where: {
          id: orderId,
        },
      });

      //When order is product invoiced, change the order status to awaiting purchase and change the product status to awaiting purchase
      if (
        initialOrder?.orderStatus === BuyOrderStatus.PRODUCT_INVOICED &&
        orderStatus === BuyOrderStatus.AWAITING_PURCHASE
      ) {
        order = await prisma.buyOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: orderStatus,
            items: {
              updateMany: {
                where: {
                  productStatus: ItemStatus.PRODUCT_INVOICED,
                },
                data: {
                  productStatus: ItemStatus.AWAITING_PURCHASE,
                },
              },
            },
          },
        });
      } else if (
        initialOrder?.orderStatus === BuyOrderStatus.AWAITING_PURCHASE &&
        orderStatus === BuyOrderStatus.AWAITING_ARRIVAL
      ) {
        order = await prisma.buyOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: orderStatus,
            purchaseDate:
              !initialOrder?.purchaseDate &&
              orderStatus === BuyOrderStatus.AWAITING_ARRIVAL
                ? new Date()
                : initialOrder?.purchaseDate || null,
            items: {
              updateMany: {
                where: {
                  productStatus: ItemStatus.AWAITING_PURCHASE,
                },
                data: {
                  productStatus: ItemStatus.AWAITING_ARRIVAL,
                },
              },
            },
          },
        });
      } else {
        order = await prisma.buyOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: orderStatus,
            purchaseDate:
              !initialOrder?.purchaseDate &&
              orderStatus === BuyOrderStatus.AWAITING_ARRIVAL
                ? new Date()
                : initialOrder?.purchaseDate || null,
          },
        });
      }

      return new Response(JSON.stringify({ message: "주문 상태 변경 성공" }), {
        status: 200,
      });
    } else if (orderType === "PFOrder") {
      const initialOrder = await prisma.pfOrder.findUnique({
        where: {
          id: orderId,
        },
      });

      //When order is product invoiced, change the order status to awaiting purchase and change the product status to awaiting purchase
      if (
        initialOrder?.orderStatus === BuyOrderStatus.PENDING &&
        orderStatus === BuyOrderStatus.AWAITING_ARRIVAL
      ) {
        order = await prisma.pfOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: orderStatus,
            items: {
              updateMany: {
                where: {
                  productStatus: ItemStatus.PENDING,
                },
                data: {
                  productStatus: ItemStatus.AWAITING_ARRIVAL,
                },
              },
            },
          },
        });
      } else if (
        initialOrder?.orderStatus === BuyOrderStatus.AWAITING_PURCHASE &&
        orderStatus === BuyOrderStatus.AWAITING_ARRIVAL
      ) {
      } else {
        order = await prisma.pfOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: orderStatus,
          },
        });
      }
      return new Response(JSON.stringify({ message: "주문 상태 변경 성공" }), {
        status: 200,
      });
    } else if (orderType === "ShippingRequest") {
      order = await prisma.shippingRequest.update({
        where: {
          id: orderId,
        },
        data: {
          requestStatus: orderStatus,
        },
      });
      return new Response(JSON.stringify({ message: "주문 상태 변경 성공" }), {
        status: 200,
      });
    }

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
