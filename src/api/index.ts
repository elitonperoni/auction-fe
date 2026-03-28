import { AuthApi } from "./authApi";
import { AuctionApi } from './auctionApi';
import { NotificationApi } from "./notificationApi";

export const authApi = new  AuthApi();
export const auctionApi = new  AuctionApi();
export const notificationApi = new  NotificationApi();