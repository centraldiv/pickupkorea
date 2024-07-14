import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function logoutFn() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });
  if (response.ok) {
    const { message } = await response.json();
    alert(message);
    window.location.href = "/login";
  }
}
