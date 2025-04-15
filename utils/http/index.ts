import axios, { AxiosInstance } from "axios";
import { STORAGE_KEY } from "../constants/";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export class Http {
    public instance: AxiosInstance;
    constructor() {
        this.instance = axios.create({
            baseURL: STORAGE_KEY.BASE_URL,
            responseType: "json",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        this.instance.interceptors.request.use(
            async (config) => {
                const accessToken = await AsyncStorage.getItem(
                    STORAGE_KEY.ACCESS_TOKEN
                );
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error.response?.data)
        );

        this.instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Handle 401 Unauthorized errors
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        // Attempt to refresh token (if you implement refresh tokens later)
                        // const newToken = await refreshAccessToken();
                        // if (newToken) {
                        //   await AsyncStorage.setItem(STORAGE_KEY.ACCESS_TOKEN, newToken);
                        //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        //   return this.instance(originalRequest);
                        // }

                        // If no refresh token mechanism, just clear storage and redirect to auth
                        await AsyncStorage.clear();
                        router.navigate("/(auth)/login");
                        return Promise.reject(error);
                    } catch (refreshError) {
                        await AsyncStorage.clear();
                        router.navigate("/(auth)/login");
                        return Promise.reject(refreshError);
                    }
                }

                // Handle other errors
                if (error.response) {
                    // You can add specific error handling here if needed
                    return Promise.reject(error.response.data);
                }

                return Promise.reject(error);
            }
        );
    }
}

const http = new Http().instance;

export default http;