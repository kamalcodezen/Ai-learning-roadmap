"use client";

import SidebarHeader from "./SidebarHeader";
import ProfileCard from "./ProfileCard";
import SidebarNav from "./SidebarNav";
import SignOutButton from "./SignOutButton";

interface SidebarContentProps {
  userName?: string | null;
  userEmail?: string | null;
  indicatorId: string;
  onClose?: () => void;
  onNavigate?: () => void;
}

export default function SidebarContent({
  userName,
  userEmail,
  indicatorId,
  onClose,
  onNavigate,
}: SidebarContentProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <SidebarHeader onClose={onClose} />

      <div className="px-4 pt-2 pb-2">
        <ProfileCard name={userName} email={userEmail} />
      </div>

      <div className="mt-1 flex min-h-0 flex-1 flex-col">
        <SidebarNav indicatorId={indicatorId} onItemClick={onNavigate} />
      </div>

      <SignOutButton onSignOut={onNavigate} />
    </div>
  );
}
