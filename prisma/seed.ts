import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const countries = [
  {
    name: "United States",
    code: "US",
  },
  {
    name: "United Kingdom",
    code: "GB",
  },
  {
    name: "Australia",
    code: "AU",
  },
  {
    name: "Canada",
    code: "CA",
  },
];

async function main() {
  await prisma.country.createMany({
    data: countries.map((country) => ({
      name: country.name.trim(),
      code: country.code.trim(),
    })),
  });

  await prisma.pfCodeCount.createMany({
    data: countries.map((country) => ({
      countryCode: country.code.trim(),
    })),
  });

  await prisma.availableShippingMethods.createMany({
    data: [
      { name: "K-Pakcet" },
      { name: "DHL" },
      { name: "EMS" },
      { name: "FedEx" },
    ],
  });

  await prisma.productInvoiceCount.create({
    data: {},
  });
  await prisma.shippingInvoiceCount.create({
    data: {},
  });
}

main()
  .then(async () => {
    console.log("Seeded database");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
