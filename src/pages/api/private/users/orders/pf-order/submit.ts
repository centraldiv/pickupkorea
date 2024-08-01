import { ClientPFOrderSchema } from "@/definitions/zod-definitions";
import { verifySession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import type { APIContext } from "astro";
import type { address } from "@prisma/client";

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

    const parsed = ClientPFOrderSchema.safeParse(body);

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
    let address: address | null = null;
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
    const buyOrder = await prisma.pfOrder.create({
      data: {
        userId: session.userId,
        shipRightAway: data.shipRightAway,
        userMemo: data.userMemo,
        addressId: address?.id,
        shippingMethodId: data?.shippingMethodId || null,
        items: {
          createMany: {
            data: data.items.map((item) => ({
              href: item.href,
              quantity: item.quantity,
              unboxingVideoRequested: item.unboxingVideoRequested,
              unboxingPhotoRequested: item.unboxingPhotoRequested,
              isInclusion: item.isInclusion,
              memo: item.memo,
              option: item.option,
              price: item.price,
              userId: session.userId,
            })),
          },
        },
      },
    });

    if (!buyOrder) {
      return new Response(
        JSON.stringify({ message: "Failed to submit forwarding order" }),
        {
          status: 500,
        }
      );
    }
    return new Response(
      JSON.stringify({
        message: "Forwarding order submitted!",
        orderId: buyOrder.id,
      }),
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
}
