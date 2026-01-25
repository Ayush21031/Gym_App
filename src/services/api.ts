import axios from "axios";

/**
 * IMPORTANT for local Django API:
 * - Android Emulator: http://10.0.2.2:8000
 * - iOS Simulator:    http://localhost:8000
 * - Physical device:  http://<YOUR_LAN_IP>:8000  (same WiFi)
 *
 * Pick ONE that matches your test environment.
 */
// const BASE_URL =
//   Platform.select({
//     android: "http://10.0.2.2:8000",
//     ios: "http://localhost:8000",
//     default: "http://localhost:8000",
//   }) ?? "http://localhost:8000";

const BASE_URL = "http://192.168.0.104:8000/"

import { Platform } from "react-native";
// import { getToken } from "./storage";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// api.interceptors.request.use(async (config) => {
//   const token = await getToken();
//   if (token) {
//     config.headers.Authorization = `Token ${token}`; // or `Bearer ${token}` (match your backend)
//   }
//   return config;
// });
