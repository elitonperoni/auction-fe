import api from "./api";

const baseRoute: string = "notifications";

export class NotificationApi {
  async getNotifications(): Promise<NotificationItem[]> {
    const response = await api.get(`${baseRoute}`);
    return response.data;
  }

  async markNotificationsAsRead(
    notificationId?: string | null,
  ): Promise<boolean> {
    return await api.patch(
      `${baseRoute}/mark-as-read`,
      {},
      { params: { notificationId } },
    );
  }
}
