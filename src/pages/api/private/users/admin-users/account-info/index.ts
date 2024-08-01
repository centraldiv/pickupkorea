import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/sessions";
import { omitKey } from "@/lib/utils";

export async function GET(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const session = await verifySession(context.cookies);
    if (!session) {
      return new Response(
        JSON.stringify({ message: "You are not logged in!" }),
        {
          status: 401,
        }
      );
    }

    const searchParams = context.url.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), {
        status: 400,
      });
    }

    const completeUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        creditHistory: true,
        country: true,
        defaultAddress: true,
        buyOrders: true,
        pfOrder: true,
        shippingRequest: true,
        productInvoices: true,
        shippingInvoice: true,
      },
    });

    if (!completeUser) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(omitKey(completeUser, "password")), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
