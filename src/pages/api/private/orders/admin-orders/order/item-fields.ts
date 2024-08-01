import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import {
  BuyOrderStatus,
  ItemStatus,
  PFOrderStatus,
} from "@/definitions/statuses";
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
      itemId,
      field,
      value,
      orderType,
      previousValue,
    }: {
      orderId: string;
      itemId: string;
      field: string;
      value: string | number;
      orderType: OrderType;
      previousValue: any;
    } = await context.request.json();

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

    let order;
    if (orderType === "BuyOrder") {
      order = await prisma.buyOrder.update({
        where: { id: orderId },
        data: {
          items: { update: { where: { id: itemId }, data } },
          updatedAt: new Date(),
        },
        include: {
          items: true,
        },
      });

      const item = order.items.find((item) => item.id === itemId);

      if (item && field === "receivedQuantity" && value === 0) {
        const updated = await prisma.buyOrder.update({
          where: { id: orderId },
          data: {
            updatedAt: new Date(),
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.AWAITING_ARRIVAL,
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updated) {
          const nothingReceived = updated.items.every(
            (item) => item.receivedQuantity === 0
          );

          if (nothingReceived) {
            await prisma.buyOrder.update({
              where: { id: orderId },
              data: {
                orderStatus: BuyOrderStatus.AWAITING_ARRIVAL,
              },
            });
          }
        }
      }
      if (
        item &&
        field === "receivedQuantity" &&
        value &&
        typeof value === "number" &&
        value < item.quantity
      ) {
        await prisma.buyOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: BuyOrderStatus.PARTIAL_RECEIVED,
            updatedAt: new Date(),
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.PARTIAL_RECEIVED,
                  updatedAt: new Date(),
                },
              },
            },
          },
        });
      }

      if (
        item &&
        field === "receivedQuantity" &&
        value &&
        typeof value === "number" &&
        value < item.quantity &&
        item.productStatus === ItemStatus.AWAITING_ARRIVAL
      ) {
        const updated = await prisma.buyOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: BuyOrderStatus.PARTIAL_RECEIVED,
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.PARTIAL_RECEIVED,
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updated) {
          const isAllItemsReceived = updated.items.every(
            (item) => item.receivedQuantity === item.quantity
          );

          if (isAllItemsReceived) {
            await prisma.buyOrder.update({
              where: { id: orderId },
              data: {
                updatedAt: new Date(),
                orderStatus: updated.shipRightAway
                  ? BuyOrderStatus.PREPARING_SHIPPING
                  : BuyOrderStatus.AWAITING_SHIPPING,
              },
            });
          } else {
            await prisma.buyOrder.update({
              where: { id: orderId },
              data: {
                updatedAt: new Date(),
                orderStatus: BuyOrderStatus.PARTIAL_RECEIVED,
              },
            });
          }
        }
      }
      if (
        item &&
        field === "receivedQuantity" &&
        value &&
        typeof value === "number" &&
        value === item.quantity &&
        (item.productStatus === ItemStatus.AWAITING_ARRIVAL ||
          item.productStatus === ItemStatus.PARTIAL_RECEIVED)
      ) {
        const updated = await prisma.buyOrder.update({
          where: {
            id: orderId,
          },
          data: {
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.RECEIVED,
                  updatedAt: new Date(),
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updated) {
          const isAllItemsReceived = updated.items.every(
            (item) =>
              item.receivedQuantity - item.creditedQuantity ===
              item.quantity - item.creditedQuantity
          );
          if (isAllItemsReceived) {
            await prisma.buyOrder.update({
              where: { id: orderId },
              data: {
                updatedAt: new Date(),
                arrivalDate: new Date(),
                orderStatus: updated.shipRightAway
                  ? BuyOrderStatus.PREPARING_SHIPPING
                  : BuyOrderStatus.AWAITING_SHIPPING,
                items: {
                  updateMany: {
                    where: {
                      productStatus: ItemStatus.RECEIVED,
                    },
                    data: {
                      productStatus: ItemStatus.PREPARING_SHIPPING,
                    },
                  },
                },
              },
            });
          } else {
            await prisma.buyOrder.update({
              where: { id: orderId },
              data: {
                updatedAt: new Date(),
                orderStatus: BuyOrderStatus.PARTIAL_RECEIVED,
              },
            });
          }
        }
      }

      if (
        item &&
        field === "shippedQuantity" &&
        value &&
        typeof value === "number" &&
        value < item.receivedQuantity &&
        (item.productStatus === ItemStatus.PARTIAL_RECEIVED ||
          item.productStatus === ItemStatus.AWAITING_ARRIVAL ||
          item.productStatus === ItemStatus.PREPARING_SHIPPING)
      ) {
        const updated = await prisma.buyOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: BuyOrderStatus.PARTIALLY_SHIPPED,
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.PARTIALLY_SHIPPED,
                  updatedAt: new Date(),
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updated) {
          const isAllItemsShipped = updated.items.every(
            (item) =>
              item.shippedQuantity === item.receivedQuantity &&
              item.receivedQuantity === item.quantity
          );

          if (isAllItemsShipped) {
            await prisma.buyOrder.update({
              where: { id: orderId },
              data: {
                orderStatus: BuyOrderStatus.SHIPPED,
              },
            });
          }
        }
      }

      if (
        item &&
        field === "shippedQuantity" &&
        value &&
        typeof value === "number" &&
        value === item.receivedQuantity &&
        (item.productStatus === ItemStatus.PARTIAL_RECEIVED ||
          item.productStatus === ItemStatus.AWAITING_ARRIVAL ||
          item.productStatus === ItemStatus.PREPARING_SHIPPING ||
          item.productStatus === ItemStatus.PARTIALLY_SHIPPED)
      ) {
        const updated = await prisma.buyOrder.update({
          where: {
            id: orderId,
          },
          data: {
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.SHIPPED,
                  updatedAt: new Date(),
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updated) {
          const isAllItemsShipped = updated.items.every(
            (item) =>
              item.shippedQuantity === item.receivedQuantity &&
              item.receivedQuantity === item.quantity
          );

          if (isAllItemsShipped) {
            await prisma.buyOrder.update({
              where: { id: orderId },
              data: {
                orderStatus: BuyOrderStatus.SHIPPED,
              },
            });
          }
        }
      }
    } else if (orderType === "PFOrder") {
      order = await prisma.pfOrder.update({
        where: { id: orderId },
        data: {
          items: { update: { where: { id: itemId }, data } },
          updatedAt: new Date(),
        },
        include: {
          items: true,
        },
      });

      const item = order.items.find((item) => item.id === itemId);

      if (item && field === "receivedQuantity" && value === 0) {
        const updated = await prisma.pfOrder.update({
          where: { id: orderId },
          data: {
            updatedAt: new Date(),
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.AWAITING_ARRIVAL,
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updated) {
          const nothingReceived = updated.items.every(
            (item) => item.receivedQuantity === 0
          );

          if (nothingReceived) {
            await prisma.pfOrder.update({
              where: { id: orderId },
              data: {
                orderStatus: PFOrderStatus.AWAITING_ARRIVAL,
              },
            });
          }
        }
      }

      if (
        item &&
        field === "receivedQuantity" &&
        value &&
        typeof value === "number" &&
        value < item.quantity
      ) {
        await prisma.pfOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: PFOrderStatus.PARTIAL_RECEIVED,
            updatedAt: new Date(),
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.PARTIAL_RECEIVED,
                  updatedAt: new Date(),
                },
              },
            },
          },
          include: {
            items: true,
          },
        });
      }
      if (
        item &&
        field === "receivedQuantity" &&
        value &&
        typeof value === "number" &&
        value < item.quantity &&
        item.productStatus === ItemStatus.AWAITING_ARRIVAL
      ) {
        const updatedOrder = await prisma.pfOrder.update({
          where: {
            id: orderId,
          },
          data: {
            updatedAt: new Date(),
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.PARTIAL_RECEIVED,
                  updatedAt: new Date(),
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updatedOrder) {
          const isAllItemsReceived = updatedOrder.items.every(
            (item) => item.receivedQuantity === item.quantity
          );

          if (isAllItemsReceived) {
            await prisma.pfOrder.update({
              where: { id: orderId },
              data: {
                orderStatus: PFOrderStatus.RECEIVED,
                arrivalDate: new Date(),
                updatedAt: new Date(),
              },
            });
          }
        }
      }
      if (
        item &&
        field === "receivedQuantity" &&
        value &&
        typeof value === "number" &&
        value === item.quantity &&
        (item.productStatus === ItemStatus.AWAITING_ARRIVAL ||
          item.productStatus === ItemStatus.PARTIAL_RECEIVED)
      ) {
        const updatedOrder = await prisma.pfOrder.update({
          where: {
            id: orderId,
          },
          data: {
            updatedAt: new Date(),
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.RECEIVED,
                  updatedAt: new Date(),
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updatedOrder) {
          const isAllItemsReceived = updatedOrder.items.every(
            (item) => item.receivedQuantity === item.quantity
          );

          if (isAllItemsReceived) {
            await prisma.pfOrder.update({
              where: { id: orderId },
              data: {
                orderStatus: updatedOrder?.shipRightAway
                  ? PFOrderStatus.PREPARING_SHIPPING
                  : PFOrderStatus.AWAITING_SHIPPING,
                arrivalDate: new Date(),
                updatedAt: new Date(),
              },
            });
          }
        }
      }

      if (
        item &&
        field === "shippedQuantity" &&
        value &&
        typeof value === "number" &&
        value < item.receivedQuantity &&
        (item.productStatus === ItemStatus.PARTIAL_RECEIVED ||
          item.productStatus === ItemStatus.AWAITING_ARRIVAL ||
          item.productStatus === ItemStatus.PREPARING_SHIPPING)
      ) {
        const updated = await prisma.pfOrder.update({
          where: {
            id: orderId,
          },
          data: {
            updatedAt: new Date(),
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.PARTIALLY_SHIPPED,
                  updatedAt: new Date(),
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updated) {
          const isAllItemsShipped = updated.items.every(
            (item) =>
              item.shippedQuantity === item.receivedQuantity &&
              item.receivedQuantity === item.quantity
          );

          if (isAllItemsShipped) {
            await prisma.pfOrder.update({
              where: { id: orderId },
              data: {
                orderStatus: PFOrderStatus.SHIPPED,
                updatedAt: new Date(),
              },
            });
          }
        }
      }

      if (
        item &&
        field === "shippedQuantity" &&
        value &&
        typeof value === "number" &&
        value === item.receivedQuantity &&
        (item.productStatus === ItemStatus.PARTIAL_RECEIVED ||
          item.productStatus === ItemStatus.AWAITING_ARRIVAL ||
          item.productStatus === ItemStatus.PREPARING_SHIPPING ||
          item.productStatus === ItemStatus.PARTIALLY_SHIPPED)
      ) {
        const updated = await prisma.pfOrder.update({
          where: {
            id: orderId,
          },
          data: {
            updatedAt: new Date(),
            items: {
              update: {
                where: {
                  id: itemId,
                },
                data: {
                  productStatus: ItemStatus.SHIPPED,
                  updatedAt: new Date(),
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        if (updated) {
          const isAllItemsShipped = updated.items.every(
            (item) =>
              item.shippedQuantity === item.receivedQuantity &&
              item.receivedQuantity === item.quantity
          );

          if (isAllItemsShipped) {
            await prisma.pfOrder.update({
              where: { id: orderId },
              data: {
                orderStatus: PFOrderStatus.SHIPPED,
                updatedAt: new Date(),
              },
            });
          }
        }
      }
    } else if (orderType === "ShippingRequest") {
      if (field === "userMemo" || field === "staffMemo") {
        order = await prisma.item.update({
          where: {
            id: itemId,
          },
          data: {
            [field]: value,
          },
        });
      }
      if (
        field === "toShipQuantity" &&
        typeof previousValue === "number" &&
        typeof value === "number"
      ) {
        if (value < 0) {
          throw new Error("수량은 0 이상이어야 합니다");
        }
        const isIncrement = value > previousValue;
        let update;

        if (isIncrement) {
          update = {
            increment: value - previousValue,
          };
        } else {
          update = {
            decrement: previousValue - value,
          };
        }

        order = await prisma.$transaction(async (tx) => {
          const updated = await tx.toShipItem.update({
            where: {
              id: itemId,
            },
            data: {
              updatedAt: new Date(),
              toShipQuantity: +value,
              item: {
                update: {
                  data: {
                    shippedQuantity: update,
                  },
                },
              },
            },
            include: {
              item: true,
            },
          });

          if (updated) {
            if (
              updated.item.productStatus === ItemStatus.SHIPPED &&
              updated.item.shippedQuantity < updated.item.receivedQuantity &&
              updated.item.shippedQuantity > 0
            ) {
              await tx.item.update({
                where: {
                  id: updated.item.id,
                },
                data: {
                  productStatus: ItemStatus.PARTIALLY_SHIPPED,
                },
              });
            }

            if (
              updated.item.shippedQuantity === updated.item.receivedQuantity &&
              updated.item.receivedQuantity - updated.item.creditedQuantity ===
                updated.item.quantity - updated.item.creditedQuantity
            ) {
              await tx.item.update({
                where: {
                  id: updated.item.id,
                },
                data: {
                  productStatus: ItemStatus.SHIPPED,
                },
              });
            }

            if (
              updated.item.shippedQuantity === 0 &&
              updated.item.receivedQuantity - updated.item.creditedQuantity ===
                updated.item.quantity - updated.item.creditedQuantity
            ) {
              await tx.item.update({
                where: {
                  id: updated.item.id,
                },
                data: {
                  productStatus: ItemStatus.PREPARING_SHIPPING,
                },
              });
            }
          }
          if (updated.toShipQuantity > updated.availableQuantity) {
            throw new Error(
              "신청 당시 수량보다 많은 수량은 요청할 수 없습니다"
            );
          }
          return updated;
        });
      }
    }

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
