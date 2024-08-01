import type { APIContext } from "astro";
import prisma from "@/lib/prisma";

import { verifySession } from "@/lib/sessions";

export const prerender = false;

export async function GET(context: APIContext) {
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
    const paid = url.searchParams.get("paid");
    const take = url.searchParams.get("take");
    const skip = url.searchParams.get("skip");

    if (!paid || !take || !skip) {
      return new Response(JSON.stringify({ message: "Bad Request" }), {
        status: 400,
      });
    }

    if (paid !== "true" && paid !== "false") {
      return new Response(JSON.stringify({ message: "Bad Request" }), {
        status: 400,
      });
    }

    const paidStatus = paid === "true" ? true : false;

    const productInvoices = await prisma.productInvoice.findMany({
      where: {
        paid: paidStatus,
      },
      include: {
        user: true,
        buyOrder: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: Number(take),
      skip: Number(skip),
    });

    return new Response(JSON.stringify(productInvoices), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
