import ToastError from "../components/Toast/toastNotificationError";
import { LoginRequest } from "../models/request/authRequest";
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

  logout() {
    // Remova o cookie e o token do storage
    Cookies.remove('auth-token');
    sessionStorage.removeItem('userToken');


    // Redireciona para o login
    //window.location.href = '/login';
  }
}
