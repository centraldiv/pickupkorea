import AddCountry from "./AddCountry";
import CountryLists from "./CountryLists";

const CountryListContainer = () => {
  return (
    <section className="my-9 w-full px-4">
      <AddCountry />
      <CountryLists />
    </section>
  );
};

export default CountryListContainer;
