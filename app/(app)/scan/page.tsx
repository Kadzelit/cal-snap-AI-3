import { Suspense } from "react";
import { ScanPageClient } from "./ScanPageClient";

export const dynamic = "force-dynamic";

export default function ScanPage() {
  return (
    <Suspense fallback={null}>
      <ScanPageClient />
    </Suspense>
  );
}
