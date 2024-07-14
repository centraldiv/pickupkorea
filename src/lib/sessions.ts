import type { AstroCookies } from "astro";
import { SignJWT, jwtVerify } from "jose";

const secretKey = import.meta.env.SECRET;
const key = new TextEncoder().encode(secretKey);

type Session = {
  userId: string;
  isAdmin?: boolean;

  expiresAt: Date;
};

export async function encrypt(payload: Session) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24hr")
    .sign(key);
}
export async function decrypt(
  session: string | undefined = ""
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload as Session;
  } catch (error) {
    return null;
  }
}

export async function createSession(
  { userId, isAdmin }: Omit<Session, "expiresAt">,
  cookieStore: AstroCookies
) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const session = await encrypt({
    userId,
    isAdmin,
    expiresAt,
  });

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession(cookieStore: AstroCookies) {
  const cookie = cookieStore.get("session")?.value;
  if (!cookie) {
    return null;
  }
  const session = await decrypt(cookie as unknown as string);
  if (!session || !session?.userId) {
    return null;
  }

  return session;
}

export async function deleteSession(cookieStore: AstroCookies) {
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: true,
    maxAge: 0,
    sameSite: "lax",
    path: "/",
  });
}
