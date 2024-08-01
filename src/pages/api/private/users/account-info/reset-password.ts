import bcrypt from "bcrypt";
import { ChangePasswordSchema } from "@/definitions/zod-definitions";
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
    if (!session) {
      return new Response(
        JSON.stringify({ message: "You are not logged in!" }),
        {
          status: 401,
        }
      );
    }

    const body = await context.request.json();
    const validated = ChangePasswordSchema.safeParse(body);

    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid request body" }), {
        status: 400,
      });
    }

    const foundUser = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        password: true,
      },
    });

    if (!foundUser) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const verifyPassword = await bcrypt.compare(
      validated.data.oldPassword,
      foundUser.password
    );

    if (!verifyPassword) {
      return new Response(JSON.stringify({ message: "Invalid old password" }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(validated.data.newPassword, 10);

    const updated = await prisma.user.update({
      where: {
        id: session.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (updated) {
      return new Response(JSON.stringify({ message: "Password Updated" }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ message: "Failed to update" }), {
      status: 500,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
