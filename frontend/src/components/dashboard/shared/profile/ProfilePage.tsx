"use client";

import { authClient } from "@/src/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { User, Mail, Shield, Key } from "lucide-react";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";

export default function ProfilePage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  if (isSessionLoading) {
    return <GenericPageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-lg">{session?.user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4"/> Email Status</span>
                <span className="font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded">Verified</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4"/> Role</span>
                <span className="font-medium capitalize">{((session?.user as { role?: string })?.role) || "Member"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" /> Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">Your account is secured via Better Auth.</p>
            <button className="w-full text-left px-4 py-2 rounded-lg bg-card-soft border border-border hover:bg-primary/5 transition-colors">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg bg-card-soft border border-border hover:bg-primary/5 transition-colors">
              Two-Factor Authentication
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
