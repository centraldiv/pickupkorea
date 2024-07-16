import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import type { country } from "@prisma/client";

const availableQueryTypes = ["name", "code"];

export async function GET(context: APIContext) {
  try {
    const searchParams = context.url.searchParams;
    const queryType = searchParams.get("type");
    const query = searchParams.get("query");

    if (!queryType || !availableQueryTypes.includes(queryType)) {
      return new Response(JSON.stringify({ message: "Invalid query type" }), {
        status: 400,
      });
    }

    if (!query || !query.trim()) {
      return new Response(JSON.stringify({ message: "Invalid query" }), {
        status: 400,
      });
    }
    let found: country | null = null;

    if (queryType === "name") {
      found = await prisma.country.findUnique({
        where: {
          name: query,
        },
      });
    }

    if (queryType === "code") {
      found = await prisma.country.findUnique({
        where: {
          code: query,
        },
      });
    }

    if (found) {
      return new Response(
        JSON.stringify({ found, message: "중복된 국가입니다." }),
        {
          status: 400,
        }
      );
    }
    return new Response(
      JSON.stringify({ message: "추가 가능한 국가입니다." }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
