import { Suspense } from "react";
import OrdersPage from "./orders-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrdersPage />
    </Suspense>
  );
}
