import prisma from "../prisma";

export const getCountries = async () => {
  return await prisma.country.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const getShippingMethods = async () => {
  return await prisma.availableShippingMethods.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};
