import { getUserSettings } from "@/services/userService";

export async function SettingsForm() {
  const data = await getUserSettings();
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <pre className="bg-gray-100 p-4 rounded-lg w-full max-w-md">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
