import AddShippingMethod from "./AddShippingMethod";
import ShippingMethodList from "./ShippingMethodList";

const ShippingMethodListContainer = () => {
  return (
    <section className="my-9 w-full px-4">
      <AddShippingMethod />
      <ShippingMethodList />
    </section>
  );
};

export default ShippingMethodListContainer;
