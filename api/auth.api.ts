import { LogInDto, RegisterDto } from "../types/api/dto";
import { LoginResponse, RegisterResponse } from "../types/api/response";
import http from "../utils/http";

export const AUTH_URL = {
  REGISTER: "/signup",
  LOGIN: "/login",
  LOGOUT: "/logout",
};

export const authAPI = {
    register(registerDto: RegisterDto) {
        return http.post<RegisterResponse>(AUTH_URL.REGISTER, registerDto);
    },
    login(loginDto: LogInDto) {
        return http.post<LoginResponse>(AUTH_URL.LOGIN, loginDto);
    },
    logout() {
        return http.post<{ message: string }>(AUTH_URL.LOGOUT);
    }
};
