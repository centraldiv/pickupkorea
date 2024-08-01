import { KakaoSchema } from "@/definitions/zod-definitions";
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
    const validated = KakaoSchema.safeParse(body);
    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid request body" }), {
        status: 400,
      });
    }

    const updated = await prisma.user.update({
      where: {
        id: session.userId,
      },
      data: {
        kakaoId: validated.data.kakaoId,
      },
    });

    if (updated) {
      return new Response(JSON.stringify({ message: "Kakao ID Updated" }), {
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
