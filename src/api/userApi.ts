import { UpdateUserRequest } from "../models/request/updateUserRequest";
import api from "./api";

const baseRoute: string = "users";

export class UserApi { 
    async updateUser(userId: string, request: UpdateUserRequest): Promise<boolean> {    
      return await api.post(`${baseRoute}/update/${userId}`, request);      
  }
}