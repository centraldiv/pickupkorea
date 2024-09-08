import type { APIContext } from "astro";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/sessions";

export const prerender = false;

export const GET = async (context: APIContext) => {
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

    const url = new URL(context.url);
    const requestId = url.searchParams.get("requestId");

    if (!requestId) {
      return new Response(
        JSON.stringify({ message: "Invoice id is required" }),
        {
          status: 400,
        }
      );
    }

    const shippingRequest = await prisma.shippingRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
        buyOrders: {
          select: {
            id: true,
            productInvoice: {
              select: {
                invoiceNumber: true,
              },
            },
          },
        },
        pfOrders: {
          select: {
            id: true,
          },
        },
        shippingInvoice: true,
        address: {
          include: {
            country: true,
          },
        },
        shippingMethod: true,
        toShipItems: {
          include: {
            user: {
              select: {
                pfCode: true,
              },
            },
            item: {
              include: {
                buyOrder: {
                  select: {
                    id: true,
                    productInvoice: {
                      select: {
                        invoiceNumber: true,
                      },
                    },
                  },
                },
                pfOrder: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shippingRequest) {
      return new Response(
        JSON.stringify({ message: "Shipping request not found" }),
        {
          status: 404,
        }
      );
    }

    return new Response(JSON.stringify(shippingRequest), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};

export const DELETE = async (context: APIContext) => {
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

    const { requestId }: { requestId: string } = await context.request.json();

    if (!requestId) {
      return new Response(
        JSON.stringify({ message: "Shipping request id is required" }),
        {
          status: 400,
        }
      );
    }

    const deleted = await prisma.shippingRequest.delete({
      where: {
        id: requestId,
      },
    });

    if (!deleted) {
      return new Response(
        JSON.stringify({ message: "Shipping request not found" }),
        {
          status: 404,
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Shipping request deleted", success: true }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
