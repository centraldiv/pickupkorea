import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { CountrySchema } from "@/definitions/zod-definitions";
import { z } from "zod";

export const prerender = false;

export async function GET(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const countries = await prisma.country.findMany({
      where: {},
      orderBy: {
        name: "asc",
      },
    });
    return Response.json(countries);
  } catch (error) {
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(context: APIContext) {
  try {
    if (context.request.headers.get("Content-Type") !== "application/json") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const data = await context.request.json();

    const validated = CountrySchema.safeParse(data);

    if (!validated.success) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
      });
    }

    //check if dupe name or code
    const [existingCountryByName, existingCountryByCode] =
      await prisma.$transaction([
        prisma.country.findFirst({
          where: {
            name: validated.data.name,
          },
        }),
        prisma.country.findFirst({
          where: {
            code: validated.data.code,
          },
        }),
      ]);

    if (existingCountryByName) {
      return new Response(JSON.stringify({ message: "중복된 국가 입니다" }), {
        status: 400,
      });
    }

    if (existingCountryByCode) {
      return new Response(
        JSON.stringify({ message: "중복된 국가 코드입니다" }),
        { status: 400 },
      );
    }

    const newCountry = await prisma.$transaction(async (tx) => {
      const newCountry = await tx.country.create({
        data: validated.data,
      });

      await tx.pfCodeCount.create({
        data: {
          countryCode: newCountry.code,
        },
      });

      return newCountry;
    });

    return new Response(JSON.stringify(newCountry), { status: 200 });
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

    const validated = CountrySchema.safeParse(data);

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
    const [existingCountryByName, existingCountryByCode] =
      await prisma.$transaction([
        prisma.country.findFirst({
          where: {
            name: validated.data.name,
          },
        }),
        prisma.country.findFirst({
          where: {
            code: validated.data.code,
          },
        }),
      ]);

    if (
      existingCountryByName &&
      existingCountryByName.id !== validated.data.id
    ) {
      return new Response(JSON.stringify({ message: "중복된 국가 입니다" }), {
        status: 400,
      });
    }

    if (
      existingCountryByCode &&
      existingCountryByCode.id !== validated.data.id
    ) {
      return new Response(
        JSON.stringify({ message: "중복된 국가 코드입니다" }),
        { status: 400 },
      );
    }

    const updated = await prisma.country.update({
      where: {
        id: validated.data.id,
      },
      data: {
        name: validated.data.name,
        code: validated.data.code,
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

    const validated = CountrySchema.extend({ id: z.string() }).safeParse(data);

    if (!validated.success || !validated.data?.id) {
      return new Response(JSON.stringify({ message: "Invalid data" }), {
        status: 400,
      });
    }

    const [existingAddress, existingUser] = await prisma.$transaction([
      prisma.address.findFirst({
        where: {
          country: {
            id: validated.data.id,
          },
        },
      }),
      prisma.user.findFirst({
        where: {
          pfCode: {
            contains: validated.data.code,
          },
        },
      }),
    ]);

    if (existingAddress || existingUser) {
      return new Response(
        JSON.stringify({ message: "사용중인 국가는 삭제할 수 없습니다" }),
        {
          status: 400,
        },
      );
    }

    const deleted = await prisma.country.delete({
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
