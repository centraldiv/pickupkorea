import { deleteSession, verifySession } from "@/lib/sessions";
import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { SignUpSchema } from "@/definitions/zod-definitions";
import { generatePFCode } from "@/lib/utils";
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
      userWithKakao = await prisma.user.findFirst({
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
          status: 400,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

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
      include: {
        country: true,
      },
    });

    if (user) {
      console.log(user);
      const created = await prisma.$transaction(async (tx) => {
        const countriesCount = await tx.pfCodeCount.findUnique({
          where: {
            countryCode: user.country!.code,
          },
        });

        if (!countriesCount) {
          throw new Error("Country Code not found");
        }

        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            pfCode: generatePFCode(
              user.country!.code,
              countriesCount?.count || 0
            ),
          },
        });

        if (updatedUser.pfCode) {
          await tx.pfCodeCount.update({
            where: {
              countryCode: user.country!.code,
            },
            data: {
              count: {
                increment: 1,
              },
            },
          });
          return true;
        } else throw new Error("Unable to create PF CODE");
      });
      if (!created) {
        return new Response(
          JSON.stringify({
            message: "Something went wrong creating unique code",
          }),
          {
            status: 500,
          }
        );
      }
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
