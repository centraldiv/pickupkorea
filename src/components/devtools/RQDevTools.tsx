import { client } from "@/stores/admin";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const RQDevTools = () => {
  return <ReactQueryDevtools client={client} />;
};

export default RQDevTools;
