import type { APIContext } from "astro";
import prisma from "@/lib/prisma";

export const prerender = false;

export const GET = async (context: APIContext) => {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(context.request.url);
    const searchParams = new URLSearchParams(url.search);
    const orderId = searchParams.get("orderId") as string;

    if (!orderId) {
      return new Response(JSON.stringify({ message: "Order id is required" }), {
        status: 400,
      });
    }

    const productInvoices = await prisma.productInvoice.findMany({
      where: {
        buyOrder: {
          id: orderId,
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        buyOrder: {
          include: {
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(productInvoices), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
