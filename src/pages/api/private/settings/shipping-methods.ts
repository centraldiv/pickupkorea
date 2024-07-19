import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { ShippingMethodSchema } from "@/definitions/zod-definitions";
import { z } from "zod";

export const prerender = false;

export async function POST(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const data = await context.request.json();

    const validated = ShippingMethodSchema.safeParse(data);

    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
      });
    }

    //check if dupe name or code
    const existingShippingMethodByName =
      await prisma.availableShippingMethods.findFirst({
        where: {
          name: validated.data.name,
        },
      });

    if (existingShippingMethodByName) {
      return new Response(
        JSON.stringify({ message: "중복된 배송방법 입니다" }),
        {
          status: 400,
        },
      );
    }

    const newShippingMethod = await prisma.availableShippingMethods.create({
      data: validated.data,
    });

    return new Response(JSON.stringify(newShippingMethod), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function PATCH(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const data = await context.request.json();

    const validated = ShippingMethodSchema.safeParse(data);

    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
      });
    }

    if (!validated.data.id) {
      return new Response(JSON.stringify({ message: "Invalid data id" }), {
        status: 400,
      });
    }

    //check if dupe name or code
    const existingShippingMethodByName =
      await prisma.availableShippingMethods.findFirst({
        where: {
          name: validated.data.name,
        },
      });

    if (
      existingShippingMethodByName &&
      existingShippingMethodByName.id !== validated.data.id
    ) {
      return new Response(
        JSON.stringify({ message: "중복된 배송방법 입니다" }),
        {
          status: 400,
        },
      );
    }

    const updated = await prisma.availableShippingMethods.update({
      where: {
        id: validated.data.id,
      },
      data: {
        name: validated.data.name,
        isActive: validated.data.isActive,
      },
    });
    if (updated) {
      return new Response(JSON.stringify({ message: "수정되었습니다" }), {
        status: 200,
      });
    } else
      return new Response(JSON.stringify({ message: "수정되지 않았습니다" }), {
        status: 400,
      });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export const DELETE = async (context: APIContext) => {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const data = await context.request.json();

    const validated = ShippingMethodSchema.extend({ id: z.string() }).safeParse(
      data,
    );

    if (!validated.success || !validated.data?.id) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
      });
    }

    const found = await prisma.availableShippingMethods.findFirst({
      where: {
        id: validated.data.id,
      },
      include: {
        _count: {
          select: {
            buyOrder: true,
            pfOrder: true,
          },
        },
      },
    });

    if (!found) {
      return new Response(JSON.stringify({ message: "Not found" }), {
        status: 404,
      });
    }

    if (found._count.buyOrder > 0 || found._count.pfOrder > 0) {
      return new Response(JSON.stringify({ message: "삭제할 수 없습니다" }), {
        status: 400,
      });
    }

    const deleted = await prisma.availableShippingMethods.delete({
      where: {
        id: validated.data.id,
      },
    });

    if (deleted) {
      return new Response(JSON.stringify({ message: "삭제되었습니다" }), {
        status: 200,
      });
    } else
      return new Response(JSON.stringify({ message: "삭제되지 않았습니다" }), {
        status: 400,
      });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
