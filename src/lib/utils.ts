import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OrderType } from "./react-query/config";
import Big from "big.js";
import type { user } from "@prisma/client";

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

export function getWebsiteQuantities(websites: string[]) {
  const object: Record<string, number> = {};
  const hrefs = websites.map((website) => {
    try {
      const url = new URL(website);
      return url.hostname;
    } catch (error) {
      return "Invalid URL";
    }
  });

  hrefs.forEach((href) => {
    object[href] = (object[href] || 0) + 1;
  });

  const sitesWithQuantities = Object.entries(object).map(
    ([key, value]) => `${key}: ${value}`
  );
  return [
    `[사이트 갯수: ${Object.keys(object).length}]`,
    ...sitesWithQuantities,
  ].join(", ");
}

export const generatePFCode = (countryCode: string, count: number) => {
  return countryCode.trim() + generatePFCodeNumber(count).trim();
};

export const generatePFCodeNumber = (count: number) => {
  switch (count.toString().length) {
    case 1:
      return "000" + (count + 1);
    case 2:
      return "00" + (count + 1);
    case 3:
      return "0" + (count + 1);
    case 4:
      return (count + 1).toString();
    default:
      return (Number(count.toString().slice(-4)) + 1).toString();
  }
};

export const generateProductInvoiceNumber = (count: number) => {
  switch (count.toString().length) {
    case 1:
      return "000" + count;
    case 2:
      return "00" + count;
    case 3:
      return "0" + count;
    case 4:
      return count.toString();
    default:
      return Number(count.toString().slice(-4)).toString();
  }
};

export const parseOrderTypeURL = (orderType: OrderType) => {
  switch (orderType) {
    case "BuyOrder":
      return "buy-orders";
    case "PFOrder":
      return "pf-orders";
    case "ShippingRequest":
      return "shipping-requests";
  }
};

export const bigReduce = (array: { price: number; quantity: number }[]) => {
  return array.reduce((acc, curr) => {
    const accum = new Big(acc);
    const price = new Big(curr.price);
    const quantity = new Big(curr.quantity);

    return accum.add(price.times(quantity)).toNumber();
  }, 0);
};

export const omitKey = (object: Record<string, any>, key: string) => {
  const { [key]: omitted, ...rest } = object;
  return rest;
};

export const parseAccountInfo = (key: keyof user) => {};

export const baseUrl = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://www.pickupkorea.com:3000";

export const cmsUrl = (path: string, query: string) =>
  `https://cms.pickupkorea.co.kr/api/${path}${query}`;
