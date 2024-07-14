import { createSession, deleteSession, verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { LoginSchema } from "@/definitions/zod-definitions";
import bcrypt from "bcrypt";

export const prerender = false;

export async function POST(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const session = await verifySession(context.cookies);
    if (session) {
      deleteSession(context.cookies);
    }
    const body = await context.request.json();

    const validated = await LoginSchema.safeParseAsync(body);

    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid request" }), {
        status: 400,
      });
    }

    const data = validated.data;

    const where = data.login.includes("@")
      ? { email: data.login }
      : { username: data.login };

    const user = await prisma.user.findUnique({
      where,
    });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: "Invalid password" }), {
        status: 401,
      });
    }

    await createSession(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      context.cookies
    );

    return new Response(JSON.stringify({ message: "Login successful" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
