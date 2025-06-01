import { Suspense } from "react";
import { StatsForm } from "./form";

export default function StatsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Stats</h1>
      <p className="text-gray-600">This is the stats page.</p>
      <Suspense fallback={<div>Loading stats...</div>}>
        <StatsForm />
      </Suspense>
    </div>
  );
}
