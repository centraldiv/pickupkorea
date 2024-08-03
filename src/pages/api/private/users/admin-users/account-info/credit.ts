import { AdminCreditSchema } from "@/definitions/zod-definitions";
import { verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";

export async function POST(context: APIContext) {
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

    const validated = AdminCreditSchema.safeParse(await context.request.json());

    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
      });
    }

    const updated = await prisma.user.update({
      where: {
        id: validated.data?.userId,
      },
      data: {
        creditAmount: {
          increment: validated.data?.creditAmount,
        },
        creditHistory: {
          create: {
            creditAmount: validated.data?.creditAmount,
            content: validated.data?.content,
          },
        },
      },
    });

    if (!updated) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Credit History Added",
        success: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
