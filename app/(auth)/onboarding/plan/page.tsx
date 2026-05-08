import { Suspense } from "react";
import { PlanClient } from "./PlanClient";

export default function PlanPage() {
  return (
    <Suspense>
      <PlanClient />
    </Suspense>
  );
}
