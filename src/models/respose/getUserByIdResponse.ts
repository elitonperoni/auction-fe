export interface GetUserByIdResponse {
  id: string;
  email: string;
  userName: string;
  completeName: string;
  phone: string | null;
  country: string;
  state: string;
  city: string;
  languageId: number;
  timeZone: string;
  userNotifications: number[];
  memberSince: Date,
  telegramConfigured: boolean
}
