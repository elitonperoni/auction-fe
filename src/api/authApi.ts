import ToastError from "../components/Toast/toastNotificationError";
import { LoginRequest } from "../models/request/authRequest";
import { RecoveryPasswordRequest } from "../models/request/recoveryPasswordRequest";
import { RegisterRequest } from "../models/request/registerRequest";
import { ResetPasswordRequest } from "../models/request/resetPasswordRequest";
import api from "./api";
import Cookies from "js-cookie";
import { store } from "../store/store";
import { setUser } from "../store/slices/userSlice";
import ToastSuccess from "../components/Toast/toastNotificationSuccess";

const baseRoute: string = "users";
export class AuthApi {
  async login(request: LoginRequest): Promise<boolean> {
    try {
      await api.post(`${baseRoute}/login`, request).then((resp) => {
        const response = resp.data;

        if (response) {
          store.dispatch(
            setUser({
              id: response.id,
              name: response.name,
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

  async refreshToken(): Promise<string | null> {
    try {
      await api.post(
        `${baseRoute}/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      );

      return null;
    } catch {
      this.logout();
      return null;
    }
  }

  async register(request: RegisterRequest): Promise<any> {
    return await api.post(`${baseRoute}/register`, request);
  }

  async recoveryPassword(request: RecoveryPasswordRequest): Promise<boolean> {
    try {
      await api.post(`${baseRoute}/recovery-password`, request).then((resp) => {
        const response = resp.data;

        if (response) {
          ToastSuccess("Email de recuperação enviado com sucesso.");
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

  async resetPassword(request: ResetPasswordRequest): Promise<boolean> {
    try {
      await api.post(`${baseRoute}/reset-password`, request).then((resp) => {
        const response = resp.data;

        if (response) {
          ToastSuccess("Senha alterada com sucesso.");
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

  async sendLogout(): Promise<void> {
    await api.post(`${baseRoute}/logout`, {}, { withCredentials: true });
  }

  async logout(): Promise<void> {
    await this.sendLogout();
    store.dispatch(setUser({ id: "", name: "" }));
    window.location.href = "/login";
  }
}
