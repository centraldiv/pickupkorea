import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/sessions";
import { PFOrderStatus } from "@/definitions/statuses";

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

    const {
      invoiceId,
      paid,
      pfOrderId,
      buyOrderId,
      shippingRequestId,
    }: {
      invoiceId: string;
      paid: boolean;
      pfOrderId?: string;
      buyOrderId?: string;
      shippingRequestId?: string;
    } = await context.request.json();

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

    let data;

    if (pfOrderId) {
      data = {
        paid,
        pfOrder: {
          update: {
            data: {
              orderStatus: paid
                ? PFOrderStatus.PENDING_SHIPMENT
                : PFOrderStatus.SHIPPING_INVOICED,
            },
          },
        },
      };
    }

    if (buyOrderId) {
      data = {
        paid,
        buyOrder: {
          update: {
            data: {
              orderStatus: paid
                ? PFOrderStatus.PENDING_SHIPMENT
                : PFOrderStatus.SHIPPING_INVOICED,
            },
          },
        },
      };
    }

    if (shippingRequestId) {
      data = {
        paid,
      };
    }

    if (!data) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
      });
    }

    const updated = await prisma.shippingInvoice.update({
      where: {
        id: invoiceId,
      },
      data,
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
