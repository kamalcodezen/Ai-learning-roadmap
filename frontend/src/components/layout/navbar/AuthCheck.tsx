"use client";

import Button from "../../ui/button";
import ProfileDropdown from "./profileDropdown";

export default function AuthCheck() {
  /*
   * MOCK AUTH
   *
   * Later this value will come from Better Auth.
   *
   * Example:
   * const { data: session } = authClient.useSession();
   *
   * const isAuthenticated = !!session?.user;
   */

  const isAuthenticated = false;

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

  return <Button text="Start for Free" href="/signup" className="!font-poppins" />;
}