import { defineMiddleware } from "astro:middleware";
import { verifySession } from "./lib/sessions";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith("/account")) {
    // Session check on all account routes
    const session = await verifySession(context.cookies);
    if (!session) {
      return context.redirect(new URL("/login", context.url).toString());
    }
    // Admin check on admin routes
    if (context.url.pathname.startsWith("/account/admin")) {
      if (!session?.isAdmin) {
        return context.redirect(new URL("/login", context.url).toString());
      }
    }
  }
  if (context.url.pathname.startsWith("/api/private")) {
    const session = await verifySession(context.cookies);
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    if (context.url.pathname.startsWith("/api/private/settings")) {
      if (!session?.isAdmin) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
        });
      }
    }
  }

  return next();
});
