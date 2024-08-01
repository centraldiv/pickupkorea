import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/sessions";

export const prerender = false;

export const GET = async (context: APIContext) => {
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

    const url = new URL(context.url);
    const invoiceId = url.searchParams.get("invoiceId");

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ message: "Invoice id is required" }),
        {
          status: 400,
        }
      );
    }

    const shippingInvoice = await prisma.shippingInvoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        user: true,
        buyOrder: true,
        pfOrder: true,
        shippingRequest: true,
      },
    });

    if (!shippingInvoice) {
      return new Response(JSON.stringify({ message: "Invoice not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(shippingInvoice), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};

export const DELETE = async (context: APIContext) => {
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

    const { invoiceId }: { invoiceId: string } = await context.request.json();

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ message: "Invoice id is required" }),
        {
          status: 400,
        }
      );
    }

    const deleted = await prisma.shippingInvoice.delete({
      where: {
        id: invoiceId,
      },
    });

    if (!deleted) {
      return new Response(JSON.stringify({ message: "Invoice not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Invoice deleted", success: true }),
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
