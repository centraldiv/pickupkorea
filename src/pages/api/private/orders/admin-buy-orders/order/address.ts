import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { OrderAddressSchema } from "@/definitions/zod-definitions";

export const prerender = false;

export async function PATCH(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const address = await context.request.json();

    const validated = OrderAddressSchema.safeParse(address);

    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid address" }), {
        status: 400,
      });
    }

    const order = await prisma.buyOrder.update({
      where: { id: validated.data.orderId },
      data: {
        updatedAt: new Date(),
        address: {
          update: {
            receiverName: validated.data.receiverName,
            phone: validated.data.phone,
            email: validated.data.email,
            street: validated.data.street,
            city: validated.data.city,
            state: validated.data.state,
            zipcode: validated.data.zipcode,
            country: {
              connect: {
                name: validated.data.country,
              },
            },
          },
        },
      },
    });

    if (order) {
      return new Response(JSON.stringify({ message: "주소 수정 성공" }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ message: "Order Update Failed" }), {
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
