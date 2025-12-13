import ToastError from "../components/Toast/toastNotificationError";
import { LoginRequest } from "../models/request/authRequest";
import { RecoveryPasswordRequest } from "../models/request/recoveryPasswordRequest";
import { ResetPasswordRequest } from "../models/request/resetPasswordRequest";
import api from "./api";
import Cookies from "js-cookie";

const baseRoute: string = "users";
export class AuthApi {
  async login(request: LoginRequest): Promise<boolean> {
    try {
      await api.post(`${baseRoute}/login`, request).then((resp) => {
        debugger;
        const token = resp.data;

        if (token) {
          Cookies.set("auth-token", token, {
            expires: 1, // Expira em 1 dia
            secure: process.env.NODE_ENV === "production", // Use 'secure' em produção
            path: "/",
          });

          sessionStorage.setItem("userToken", token);
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

   async recoveryPassword(request: RecoveryPasswordRequest): Promise<boolean> {
    try {
      await api.post(`${baseRoute}/recovery-password`, request).then((resp) => {
      debugger
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
        debugger
      
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
    // Remova o cookie e o token do storage
    Cookies.remove('auth-token');
    sessionStorage.removeItem('userToken');


    // Redireciona para o login
    //window.location.href = '/login';
  }
}
