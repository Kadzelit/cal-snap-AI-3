import { Suspense } from "react";
import { ActivityClient } from "./ActivityClient";

export default function ActivityPage() {
  return (
    <Suspense>
      <ActivityClient />
    </Suspense>
  );
}
