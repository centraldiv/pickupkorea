import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { CountrySchema } from "@/definitions/zod-definitions";

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
        { status: 400 }
      );
    }

    const newCountry = await prisma.country.create({
      data: validated.data,
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
    console.log(data);
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
        { status: 400 }
      );
    }

    const updatedCountry = await prisma.country.update({
      where: {
        id: validated.data.id,
      },
      data: {
        name: validated.data.name,
        code: validated.data.code,
      },
    });

    return new Response(JSON.stringify({ message: "수정되었습니다" }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
