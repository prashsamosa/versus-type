"use client";

import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!authClient.useSession().data?.user) {
    return null;
  }
  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
}
