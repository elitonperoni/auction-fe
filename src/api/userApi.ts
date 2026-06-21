import { UpdateUserRequest } from "../models/request/updateUserRequest";
import api from "./api";
import { KeyValuePair } from './../models/respose/keyValue';

const baseRoute: string = "users";

export class UserApi {
  async updateUser(
    userId: string,
    request: UpdateUserRequest,
  ): Promise<boolean> {
    return await api.post(`${baseRoute}/update/${userId}`, request);
  }

  async generateLinkTelegram(): Promise<string> {    
      const response = await api.get(`${baseRoute}/generate-link-telegram-bot`);      
      return response.data;
  }

   async saveNotificationsConfig(notifications: { key: number; value: boolean }[]): Promise<string> {    
      const response = await api.put(`${baseRoute}/save-notifications`, notifications );      
      return response.data;
  }
}
