import { deleteSession, verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { SignUpSchema } from "@/definitions/zod-definitions";
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

    const validated = await SignUpSchema.safeParseAsync(body);

    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid request" }), {
        status: 400,
      });
    }

    const { data } = validated;

    let userWithKakao = null;

    const [userWithUsername, userWithEmail] = await prisma.$transaction([
      prisma.user.findUnique({
        where: {
          username: data.username,
        },
      }),
      prisma.user.findUnique({
        where: {
          email: data.email,
        },
      }),
    ]);

    if (data.kakaoId) {
      userWithKakao = await prisma.user.findUnique({
        where: {
          kakaoId: data.kakaoId,
        },
      });
    }

    if (userWithUsername) {
      return new Response(
        JSON.stringify({ message: "Username already exists" }),
        {
          status: 400,
        }
      );
    }

    if (userWithEmail) {
      return new Response(JSON.stringify({ message: "Email already exists" }), {
        status: 400,
      });
    }

    if (userWithKakao) {
      return new Response(
        JSON.stringify({ message: "Kakao ID already exists" }),
        {
          status: 4000,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log(hashedPassword, data.password);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        country: {
          connect: {
            id: data.country,
          },
        },
        kakaoId: typeof data.kakaoId === "string" ? data.kakaoId : null,
      },
    });

    if (user) {
      return new Response(
        JSON.stringify({ message: "Thank you for signing up!" })
      );
    } else
      throw new Error(
        "Something went wrong during sign up. Please contact staff."
      );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
