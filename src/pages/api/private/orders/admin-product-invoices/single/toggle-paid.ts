import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/sessions";
import { BuyOrderStatus, ItemStatus } from "@/definitions/statuses";

export const prerender = false;

export const PATCH = async (context: APIContext) => {
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

    const { invoiceId, paid }: { invoiceId: string; paid: boolean } =
      await context.request.json();

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ message: "Invoice id is required" }),
        {
          status: 400,
        }
      );
    }

    if (typeof paid !== "boolean") {
      return new Response(JSON.stringify({ message: "Paid is required" }), {
        status: 400,
      });
    }

    const updated = await prisma.productInvoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        paid,
        buyOrder: {
          update: {
            data: {
              orderStatus: paid
                ? BuyOrderStatus.AWAITING_PURCHASE
                : BuyOrderStatus.PRODUCT_INVOICED,
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
          },
        },
      },
    });

    if (!updated) {
      return new Response(JSON.stringify({ message: "Invoice not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Invoice updated", success: true }),
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
