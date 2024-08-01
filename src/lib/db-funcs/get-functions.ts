import {
  BuyOrderStatus,
  ItemStatus,
  PFOrderStatus,
} from "@/definitions/statuses";
import prisma from "../prisma";
import type { InvoiceType } from "../react-query/config";
import { omitKey } from "../utils";

export const getCountries = async () => {
  return await prisma.country.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getShippingMethods = async () => {
  return await prisma.availableShippingMethods.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getShippableItems = async (userId: string) => {
  const [buyItems, pfItems] = await prisma.$transaction([
    prisma.item.findMany({
      where: {
        user: {
          id: userId,
        },
        receivedQuantity: {
          gt: 0,
        },
        productStatus: {
          notIn: [
            ItemStatus.SHIPPED,
            ItemStatus.AWAITING_PURCHASE,
            ItemStatus.CREDITED,
            ItemStatus.REMOVED,
            ItemStatus.PENDING,
          ],
        },
        buyOrder: {
          orderStatus: {
            notIn: [
              BuyOrderStatus.SHIPPED,
              BuyOrderStatus.AWAITING_PURCHASE,
              BuyOrderStatus.PENDING,
              BuyOrderStatus.CANCELLED,
            ],
          },
          shipRightAway: false,
        },
      },
      include: {
        buyOrder: {
          include: {
            productInvoice: {
              select: {
                invoiceNumber: true,
              },
            },
          },
        },
        pfOrder: true,
        shippingRequest: true,
        user: { omit: { password: true } },
      },
    }),
    prisma.item.findMany({
      where: {
        user: {
          id: userId,
        },
        receivedQuantity: {
          gt: 0,
        },
        productStatus: {
          notIn: [
            ItemStatus.SHIPPED,
            ItemStatus.AWAITING_PURCHASE,
            ItemStatus.CREDITED,
            ItemStatus.REMOVED,
            ItemStatus.PENDING,
          ],
        },
        pfOrder: {
          orderStatus: {
            notIn: [
              PFOrderStatus.SHIPPED,
              PFOrderStatus.PENDING,
              PFOrderStatus.CANCELLED,
            ],
          },
          shipRightAway: false,
        },
      },
      include: {
        buyOrder: {
          include: {
            productInvoice: {
              select: {
                invoiceNumber: true,
              },
            },
          },
        },
        pfOrder: true,
        shippingRequest: true,
        user: { omit: { password: true } },
      },
    }),
  ]);

  return [...buyItems, ...pfItems]
    .filter((item) => {
      return (
        item.receivedQuantity - item.shippedQuantity >= 0 &&
        item.receivedQuantity - item.shippedQuantity <= item.quantity &&
        item.shippedQuantity - item.creditedQuantity !==
          item.receivedQuantity - item.creditedQuantity &&
        item.quantity - item.creditedQuantity !==
          item.shippedQuantity - item.creditedQuantity
      );
    })
    .map((item) => ({
      ...item,
      availableQuantity:
        item.receivedQuantity - item.shippedQuantity - item.creditedQuantity,
      toShipQuantity: 0,
    }));
};

// get product and shipping invoices
export const getAdminProductInvoicesFromDB = async (take: number) => {
  return await prisma.productInvoice.findMany({
    take,
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
export const getAdminShippingInvoicesFromDB = async (take: number) => {
  return await prisma.shippingInvoice.findMany({
    take,
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getInvoiceNumber = async ({
  invoiceId,
  invoiceType,
}: {
  invoiceId: string;
  invoiceType: InvoiceType;
}) => {
  switch (invoiceType) {
    case "ProductInvoice":
      return await prisma.productInvoice.findUnique({
        where: {
          id: invoiceId,
        },
        select: {
          invoiceNumber: true,
        },
      });

    case "ShippingInvoice":
      return await prisma.shippingInvoice.findUnique({
        where: {
          id: invoiceId,
        },
        select: {
          invoiceNumber: true,
          shippingRequest: true,
          buyOrderId: true,
          pfOrderId: true,
        },
      });
  }
};

export const getClientProductInvoices = async ({
  userId,
  take,
}: {
  userId: string;
  take: number;
}) => {
  return await prisma.productInvoice.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        omit: { password: true },
      },
    },
    take,
    orderBy: {
      createdAt: "desc",
    },
  });
};
export const getClientShippingInvoices = async ({
  userId,
  take,
}: {
  userId: string;
  take: number;
}) => {
  return await prisma.shippingInvoice.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        omit: { password: true },
      },
    },
    take,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getClientSingleProductInvoice = async ({
  userId,
  invoiceId,
}: {
  userId: string;
  invoiceId: string;
}) => {
  return await prisma.productInvoice.findUnique({
    where: {
      id: invoiceId,
      userId,
    },
    include: {
      buyOrder: {
        select: {
          id: true,
        },
      },
      user: {
        omit: { password: true },
      },
    },
  });
};
export const getClientSingleShippingInvoice = async ({
  userId,
  invoiceId,
}: {
  userId: string;
  invoiceId: string;
}) => {
  return await prisma.shippingInvoice.findUnique({
    where: {
      id: invoiceId,
      userId,
    },
    include: {
      user: {
        omit: { password: true },
      },
      shippingRequest: {
        select: {
          id: true,
        },
      },
      buyOrder: {
        select: {
          id: true,
        },
      },
      pfOrder: {
        select: {
          id: true,
        },
      },
    },
  });
};

export const getDefaultAddress = async (userId: string) => {
  return await prisma.defaultAddress.findUnique({
    where: {
      userId,
    },
    include: {
      country: true,
      shippingMethod: true,
    },
  });
};

export const getAccountInfo = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      defaultAddress: {
        select: { id: true },
      },
      _count: {
        select: {
          items: true,
          productInvoices: true,
          shippingInvoice: true,
          shippingRequest: true,
          buyOrders: true,
          pfOrder: true,
        },
      },
    },
  });

  if (user) {
    return omitKey(user, "password");
  }
  return null;
};

export const getUserCreditInfo = async (userId: string) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      creditHistory: {
        orderBy: {
          createdAt: "desc",
        },
      },
      creditAmount: true,
    },
  });
};
