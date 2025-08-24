import { Suspense } from "react";
import { StatsView } from "./stats";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <StatsView />
    </Suspense>
  );
}
