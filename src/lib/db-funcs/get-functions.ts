import prisma from "../prisma";

export const getCountries = async () => {
  return await prisma.country.findMany({
    orderBy: {
      name: "asc",
    },
  });
};
