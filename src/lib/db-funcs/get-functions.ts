import prisma from "../prisma";

export const getCountries = async () => {
  return await prisma.country.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const getShippingMethods = async () => {
  return await prisma.availableShippingMethods.findMany({
    orderBy: {
      name: "asc",
    },
  });
};
