import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Bell, Monitor } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg border border-border">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">Select your preferred color theme</p>
              </div>
              <select className="bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option>System</option>
                <option>Dark</option>
                <option>Light</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg border border-border">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-xs text-muted-foreground">Receive weekly progress reports</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle1" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-primary" style={{ right: 0, borderColor: 'var(--primary)' }}/>
                <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-primary/20 cursor-pointer"></label>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg border border-border">
              <div>
                <p className="font-medium">Milestone Notifications</p>
                <p className="text-xs text-muted-foreground">When you complete a major path</p>
              </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle2" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-primary" style={{ right: 0, borderColor: 'var(--primary)' }}/>
                <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-5 rounded-full bg-primary/20 cursor-pointer"></label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
