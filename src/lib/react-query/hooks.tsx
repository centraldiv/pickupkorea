import { client } from "@/stores/admin";
import { useQuery } from "@tanstack/react-query";
import { PublicQueryKeys, fetchCountries } from "./config";
import type { country } from "@prisma/client";

export const useCountries = () => {
  return useQuery<country[]>(
    {
      queryKey: PublicQueryKeys.countries,
      queryFn: fetchCountries,
    },
    client
  );
};
