"use client";

import { authClient } from "@/src/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Monitor, User, Mail, Shield, Key } from "lucide-react";
import { AnimatedThemeToggler } from "@/src/registry/magicui/animated-theme-toggler";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  if (isSessionLoading) {
    return <GenericPageSkeleton />;
  }

  const user = session?.user;
  const userRole = ((user as { role?: string })?.role || "learner").toLowerCase();
  const profileLink = `/dashboard/${userRole}/profile`;

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PERSONAL INFO CARD */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your basic account details.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg truncate">{user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            
            <Link 
              href={profileLink}
              className="inline-block text-sm text-primary hover:underline"
            >
              Edit name on Profile page &rarr;
            </Link>
          </CardContent>
        </Card>

        {/* APPEARANCE CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" /> Appearance
            </CardTitle>
            <p className="text-sm text-muted-foreground">Customize the look and feel of the application.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg border border-border">
              <div>
                <p className="font-medium">Theme Toggle</p>
                <p className="text-xs text-muted-foreground">Switch between Light and Dark mode</p>
              </div>
              <div className="bg-background border border-border rounded-full flex items-center justify-center">
                <AnimatedThemeToggler />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECURITY CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" /> Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              <Link 
                href={profileLink}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-card-soft border border-border hover:border-primary/50 transition-colors"
              >
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Change Password on Profile</span>
              </Link>
              
              <Link 
                href="/forgot-password"
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-card-soft border border-border hover:border-primary/50 transition-colors"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Reset Password via Email</span>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
