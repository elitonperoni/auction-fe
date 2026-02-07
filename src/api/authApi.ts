import ToastError from "../components/Toast/toastNotificationError";
import { LoginRequest } from "../models/request/authRequest";
import api from "./api";
import { store } from "../store/store";
import { setUser, updateExpiration, userSlice } from "../store/slices/userSlice";
import ToastSuccess from "../components/Toast/toastNotificationSuccess";
import { RegisterRequest } from "../models/request/registerRequest";
import { RecoveryPasswordRequest } from "../models/request/recoveryPasswordRequest";
import { ResetPasswordRequest } from "../models/request/resetPasswordRequest";

const baseRoute: string = "users";
export class AuthApi {
  async login(request: LoginRequest): Promise<boolean> {
    try {
      await api.post(`${baseRoute}/login`, request).then((resp) => {
        const response = resp.data;

        const expirationTime = Date.now() + (15 * 60 * 1000);

        if (response) {
          store.dispatch(
            setUser({
              id: response.id,
              name: response.name,
              expiresAt: expirationTime
            }),
          );

          return true;
        } else {
          ToastError("Falha ao realizar login");
          return false;
        }
      });
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

       const expirationTime = Date.now() + (15 * 60 * 1000);

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
      
      const newExpiration = Date.now() + (15 * 60 * 1000); 

      store.dispatch(updateExpiration(newExpiration));
            
    } catch {
      this.logout()
    }
  }
}

  async register(request: RegisterRequest): Promise<any> {
    return await api.post(`${baseRoute}/register`, request);
  }

  async recoveryPassword(request: RecoveryPasswordRequest): Promise<boolean> {
    try {
      const resp = await api.post(`${baseRoute}/recovery-password`, request);
      const response = resp.data;

      if (response) {
        ToastSuccess("Email de recuperação enviado com sucesso.");
        return true;
      } else {
        ToastError("Falha ao realizar login");
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
        ToastSuccess("Senha alterada com sucesso.");
        return true;
      } else {
        ToastError("Falha ao realizar login");
        return false;
      }
    } catch {
      return false;
    }
  }

  async sendLogout(): Promise<void> {
    await api.post(`${baseRoute}/logout`, {}, { withCredentials: true });
  }

  async logout(): Promise<void> {
    await this.sendLogout();
    store.dispatch(setUser({ id: "", name: "", expiresAt: 0 }));
    window.location.href = "/login";
  }
}
