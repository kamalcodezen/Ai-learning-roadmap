"use client";

import { authClient } from "@/src/lib/auth-client";
import Button from "../../ui/button";
import ProfileDropdown from "./profileDropdown";

export default function AuthCheck() {

   const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="h-9 w-[120px] animate-pulse rounded-full bg-foreground/10" />;
  }

   const isAuthenticated = !!session?.user;

  const user = {
    name: session?.user?.name,
    email: session?.user?.email,
  };

  if (isAuthenticated) {
    return (
      <ProfileDropdown
        name={user.name ?? ""}
        email={user.email ?? ""}
      />
    );
  }

  return <Button text="Start for Free" href="/signup" className="font-poppins" />;
}