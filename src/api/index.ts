import { AuthApi } from "./authApi";
import { AuctionApi } from './auctionApi';
import { UserApi } from "./userApi";

export const authApi = new  AuthApi();
export const auctionApi = new  AuctionApi();
export const userApi = new  UserApi();