import { serverFetch, serverMutation } from "../../core/server";

export interface NotificationPreferences {
  emailWeeklySummary: boolean;
  emailAchievementAlerts: boolean;
  emailMilestoneReminders: boolean;
  browserAlerts: boolean;
}

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const res = await serverFetch("/api/settings/preferences");
  return res.data;
};

export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const res = await serverMutation("/api/settings/preferences", preferences, "POST");
  return res.data;
};

export const deleteUserAccount = async (confirmation: string): Promise<{ success: boolean; message: string }> => {
  return await serverMutation("/api/settings/account", { confirmation }, "DELETE");
};
