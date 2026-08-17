"use client";

import { authClient } from "@/src/lib/auth-client";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <p>Loading session...</p>;
  }

  if (!session) {
    return <p>You are not signed in.</p>;
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <p>Welcome, {session.user.name}</p>
      <p>Email: {session.user.email}</p>

      <button
        onClick={async () => {
          await authClient.signOut();
          window.location.href = "/signin";
        }}
      >
        Logout
      </button>
    </main>
  );
}
