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

export function getWebsiteNames(websites: string[]) {
  const hrefs = websites.map((website) => {
    try {
      const url = new URL(website);
      return url.hostname;
    } catch (error) {
      return "Invalid URL";
    }
  });

  const uniqueHrefs = [...new Set(hrefs)];
  return uniqueHrefs.join(", ");
}
