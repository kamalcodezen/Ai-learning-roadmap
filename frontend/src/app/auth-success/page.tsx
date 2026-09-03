"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { Spinner } from "@heroui/react";

export default function AuthSuccessPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        // Check role if it exists, otherwise default to learner
        const userRole = (session.user as { role?: string }).role || "learner";

        if (userRole === "admin") {
          // Admins bypass the diagnostic/onboarding entirely
          router.push("/dashboard/admin");
          return;
        }

        // If the user was created within the last 15 seconds, they are new
        const isNewUser = new Date().getTime() - new Date(session.user.createdAt).getTime() < 15000;
        
        if (isNewUser) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard/learner");
        }
      } else {
        // If no session, go back to sign in
        router.push("/signin");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground animate-pulse">Completing sign in...</p>
      </div>
    </div>
  );
}
