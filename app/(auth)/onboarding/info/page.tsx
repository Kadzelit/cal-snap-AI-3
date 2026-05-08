import { Suspense } from "react";
import { InfoClient } from "./InfoClient";

export default function InfoPage() {
  return (
    <Suspense>
      <InfoClient />
    </Suspense>
  );
}
