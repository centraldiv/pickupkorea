import { defineMiddleware } from "astro:middleware";
import { verifySession } from "./lib/sessions";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith("/account")) {
    const session = await verifySession(context.cookies);
    if (!session) {
      return context.redirect(new URL("/login", context.url).toString());
    }
  }
  return next();
});
