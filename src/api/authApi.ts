import ToastError from "../components/Toast/toastNotificationError";
import { LoginRequest } from "../models/request/authRequest";
import { RecoveryPasswordRequest } from "../models/request/recoveryPasswordRequest";
import { RegisterRequest } from "../models/request/registerRequest";
import { ResetPasswordRequest } from "../models/request/resetPasswordRequest";
import api from "./api";
import Cookies from "js-cookie";

const baseRoute: string = "users";
export class AuthApi {
  async login(request: LoginRequest): Promise<boolean> {
    try {
      await api.post(`${baseRoute}/login`, request).then((resp) => {
        debugger
        const response = resp.data;

        if (response) {
          Cookies.set("auth-token", response.token, {
            expires: 1, 
            secure: process.env.NODE_ENV === "production", 
            path: "/",
          });

           Cookies.set("username", response.userName, {
            expires: 1, 
            secure: process.env.NODE_ENV === "production",
            path: "/",
          });

          return true;
        } else {
          ToastError("Falha ao realizar login");
          return false;
        }
      });
      return true;
    } catch (error) {
      console.error("Error fetching all stocks:", error);
      return false;
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
        } else {
          ToastError("Falha ao realizar login");
          return false;
        }
      });
      return true;
    } catch (error) {
      console.error("Error fetching all stocks:", error);
      return false;
    }
  }

  async resetPassword(request: ResetPasswordRequest): Promise<boolean> {
    try {
      await api.post(`${baseRoute}/reset-password`, request).then((resp) => {
        const response = resp.data;

        if (response) {
        } else {
          ToastError("Falha ao realizar login");
          return false;
        }
      });
      return true;
    } catch (error) {
      console.error("Error fetching all stocks:", error);
      return false;
    }
  }

  logout() {
    Cookies.remove("auth-token");
  }
}
