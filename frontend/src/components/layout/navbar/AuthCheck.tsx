"use client";

import { authClient } from "@/src/lib/auth-client";
import Button from "../../ui/button";
import ProfileDropdown from "./profileDropdown";

export default function AuthCheck() {
  
   const { data: session } = authClient.useSession();
  
   const isAuthenticated = !!session?.user;

   console.log(isAuthenticated);

  // const isAuthenticated = false;

  const mockUser = {
    name: "Jubair",
    email: "jubair@example.com",
  };

  if (isAuthenticated) {
    return (
      <ProfileDropdown
        name={mockUser.name}
        email={mockUser.email}
      />
    );
  }

  return <Button text="Start for Free" href="/signup" />;
}