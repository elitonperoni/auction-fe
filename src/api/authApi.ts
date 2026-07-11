import ToastError from "../components/Toast/toastNotificationError";
import { LoginRequest } from "../models/request/authRequest";
import api from "./api";
import { store } from "../store/store";
import { setUser, updateExpiration } from "../store/slices/userSlice";
import { RegisterRequest } from "../models/request/registerRequest";
import { SendEmailRecoveryPasswordRequest, RecoveryPasswordRequest, ResetPasswordRequest } from "../models/request/resetPasswordRequest";
import { GetUserByIdResponse } from "../models/respose/getUserByIdResponse";

const baseRoute: string = "users";
const timeToExpireToken = (1 * 60 * 1000);
export class AuthApi { 
  async login(request: LoginRequest): Promise<boolean> {
    try {
      const resp = await api.post(`${baseRoute}/login`, request);
      const response = resp.data;

      if (!response) {
        ToastError("Falha ao realizar login");
        return false;
      }

      const expirationTime = Date.now() + timeToExpireToken;

      store.dispatch(
        setUser({
          id: response.id,
          name: response.name,
          expiresAt: expirationTime,
          isAuthenticated: true,
        }),
      );

      return true;
    } catch {
      return false;
    }
  }

  async refreshToken(): Promise<void> {
    try {
      await api.post(
        `${baseRoute}/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      );

       const expirationTime = Date.now() + (timeToExpireToken);

        store.dispatch(
            updateExpiration(expirationTime),);                  
    } catch {
      this.logout();
    }
  }

 async ensureValidToken(): Promise<void> {
  const state = store.getState();
  const user = state.user; 

  const now = Date.now();
  const buffer = 30 * 1000;   

  if (user.expiresAt && (now + buffer) > user.expiresAt) {
    try {
      this.refreshToken()
      
      const newExpiration = Date.now() + (timeToExpireToken); 

      store.dispatch(updateExpiration(newExpiration));    
            
    } catch {
      this.logout()
    }
  }
}

  async register(request: RegisterRequest): Promise<any> {
    return await api.post(`${baseRoute}/register`, request);
  }

  async sendRecoveryPasswordEmail(request: SendEmailRecoveryPasswordRequest): Promise<boolean> {
    try {
      const resp = await api.post(`${baseRoute}/send-recovery-password-email`, request);
      const response = resp.data;

      if (response) {        
        return true;
      } else {        
        return false;
      }
    } catch {
      return false;
    }
  }

  async recoveryPassword(request: RecoveryPasswordRequest): Promise<boolean> {
    try {
      const resp = await api.post(`${baseRoute}/recovery-password`, request);
      const response = resp.data;

      if (response) {        
        return true;
      } else {        
        return false;
      }
    } catch {
      return false;
    }
  }

   async resetPassword(request: ResetPasswordRequest): Promise<boolean> {
    try {
      const resp = await api.post(`${baseRoute}/reset-password`, request);
       const response = resp.data;

      if (response) {        
        return true;
      } else {        
        return false;
      }
    } catch {
      return false;
    }
  }

  async getById(id: string): Promise<GetUserByIdResponse> {
    const response = await api.get(`${baseRoute}/${id}`);
    return response.data;
  }

  async sendLogout(): Promise<void> {
    await api.post(`${baseRoute}/logout`, {}, { withCredentials: true });
  }

  async logout(): Promise<void> {
    await this.sendLogout();
    store.dispatch(setUser({ id: "", name: "", expiresAt: 0, isAuthenticated: false }));
    window.location.href = "/login";
  }
}
