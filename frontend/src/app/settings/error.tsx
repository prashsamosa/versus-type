"use client";
export default function Error() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Error</h1>
      <p className="text-gray-600">An error occurred while loading the page.</p>
      <p className="text-red-500">Please try again later.</p>
    </div>
  );
}
