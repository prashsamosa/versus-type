import { Suspense } from "react";
import { SettingsForm } from "./form";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600">This is the settings page.</p>
      <Suspense fallback={<div>Loading settings...</div>}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
