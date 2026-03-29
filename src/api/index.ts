import { AuthApi } from "./authApi";
import { AuctionApi } from './auctionApi';
import { NotificationApi } from "./notificationApi";
import { UserApi } from "./userApi";

export const authApi = new  AuthApi();
export const auctionApi = new  AuctionApi();
export const notificationApi = new  NotificationApi();
export const userApi = new  UserApi();