import AdminBroadcastsView from "@/src/components/dashboard/admin/AdminBroadcastsView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Broadcast & Notifications | Admin Console",
};

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title text-left">
            Broadcast &amp; <span className="text-brand">Announcements</span>
          </h1>
          <p className="section-subtitle mt-1 text-left">
            Dispatch announcements, push notifications, and release updates to learner cohorts.
          </p>
        </div>
      </div>
      <AdminBroadcastsView />
    </div>
  );
}
