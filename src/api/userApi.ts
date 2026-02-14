import api from "./api";

const baseRoute: string = "users";

export class UserApi {
  async getNotifications(): Promise<NotificationItem[]> {
    const response = await api.get(`${baseRoute}/notifications`);
    return response.data;
  }
}
