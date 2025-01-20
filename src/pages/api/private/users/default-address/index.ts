import { DefaultAddressSchema } from "@/definitions/zod-definitions";
import { verifySession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import type { APIContext } from "astro";

export const GET = async (context: APIContext) => {
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

    const defaultAddress = await prisma?.defaultAddress.findUnique({
      where: {
        userId: session.userId,
      },
      include: {
        country: true,
        shippingMethod: true,
      },
    });

    if (!defaultAddress) {
      return new Response(JSON.stringify({ message: "Address not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(defaultAddress), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};

export async function POST(context: APIContext) {
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

    const requestJson = await context.request.json();

    const validated = await DefaultAddressSchema.safeParseAsync(requestJson);

    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
      });
    }

    const findDefaultAddress = await prisma?.defaultAddress.upsert({
      where: {
        userId: session.userId,
      },
      update: {
        receiverName: validated.data.receiverName,
        email: validated.data.email,
        phone: validated.data.phone,
        street: validated.data.street,
        city: validated.data.city,
        state: validated.data.state,
        zipcode: validated.data.zipcode,
        country: {
          connect: {
            id: validated.data.country,
          },
        },
        shippingMethod: {
          connect: {
            id: validated.data.shippingMethodId as string,
          },
        },
      },
      create: {
        receiverName: validated.data.receiverName,
        email: validated.data.email,
        phone: validated.data.phone,
        street: validated.data.street,
        city: validated.data.city,
        state: validated.data.state,
        zipcode: validated.data.zipcode,
        country: {
          connect: {
            id: validated.data.country,
          },
        },
        shippingMethod: {
          connect: {
            id: validated.data.shippingMethodId as string,
          },
        },
        user: {
          connect: {
            id: session.userId,
          },
        },
      },
    });

    if (!findDefaultAddress) {
      return new Response(
        JSON.stringify({ message: "Internal server error" }),
        {
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Address updated", success: true }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
