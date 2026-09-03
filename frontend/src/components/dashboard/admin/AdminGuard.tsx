"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import GenericPageSkeleton from "../shared/GenericPageSkeleton";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.push("/");
      return;
    }

    const role = ((session.user as { role?: string }).role || "").toUpperCase();
    if (role !== "ADMIN") {
      router.push("/dashboard/learner");
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user || ((session.user as { role?: string }).role || "").toUpperCase() !== "ADMIN") {
    return <GenericPageSkeleton />;
  }

  return <>{children}</>;
}
