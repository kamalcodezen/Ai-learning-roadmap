"use client";

import { useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import { useDashboardSession } from "@/src/components/dashboard/shared/sessionGuard/SessionGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { User, Mail, Shield, Key, Calendar, Clock, Edit2, Check, X, Loader2, Lock } from "lucide-react";
import GenericPageSkeleton from "../../shared/GenericPageSkeleton";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, isPending: isSessionLoading } = useDashboardSession();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  if (isSessionLoading) {
    return <GenericPageSkeleton />;
  }

  const user = session?.user;

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === user?.name) {
      setIsEditingName(false);
      return;
    }
    
    setIsUpdatingName(true);
    await authClient.updateUser({
      name: newName
    });
    setIsUpdatingName(false);
    setIsEditingName(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordError("Both current and new passwords are required.");
      return;
    }
    
    setIsUpdatingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    const { error } = await authClient.changePassword({
      newPassword,
      currentPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      setPasswordError(error.message || "Failed to change password.");
    } else {
      setPasswordSuccess("Password successfully updated.");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setIsChangingPassword(false), 2000);
    }
    
    setIsUpdatingPassword(false);
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PERSONAL INFO CARD */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-background border border-border rounded-md px-2 py-1 text-sm w-full max-w-[200px] focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Your Name"
                      autoFocus
                    />
                    <button onClick={handleUpdateName} disabled={isUpdatingName} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                      {isUpdatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsEditingName(false)} disabled={isUpdatingName} className="p-1 text-muted-foreground hover:bg-muted rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1 group">
                    <p className="font-semibold text-lg truncate">{user?.name || "User"}</p>
                    <button onClick={() => { setNewName(user?.name || ""); setIsEditingName(true); }} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-opacity" title="Edit Name">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4"/> Email Status</span>
                {user?.emailVerified ? (
                  <span className="font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-xs">Verified</span>
                ) : (
                  <span className="font-medium text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs">Unverified</span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4"/> Role</span>
                <span className="font-medium capitalize">{((user as { role?: string })?.role) || "Member"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4"/> Member Since</span>
                <span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4"/> Last Login</span>
                <span className="text-muted-foreground text-xs italic">Not currently persisted</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECURITY CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" /> Account Security
            </CardTitle>
            <p className="text-sm text-muted-foreground">Manage your password and security settings.</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            
            {!isChangingPassword ? (
              <div className="space-y-3">
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-card-soft border border-border hover:border-primary/50 transition-colors"
                >
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Change Password</span>
                </button>
                
                <Link 
                  href="/forgot-password"
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-card-soft border border-border hover:border-primary/50 transition-colors"
                >
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Reset Password via Email</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4 bg-card-soft border border-border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Change Password</h4>
                
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
                {passwordSuccess && <p className="text-green-500 text-xs">{passwordSuccess}</p>}

                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    disabled={isUpdatingPassword}
                    className="flex-1 bg-primary text-primary-foreground py-1.5 rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Update Password
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsChangingPassword(false); setPasswordError(""); setPasswordSuccess(""); }}
                    disabled={isUpdatingPassword}
                    className="px-3 py-1.5 border border-border rounded-md font-medium text-sm hover:bg-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
