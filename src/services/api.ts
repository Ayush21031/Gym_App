import axios from "axios";
import { NativeModules, Platform } from "react-native";

/**
 * IMPORTANT for local Django API:
 * - Android Emulator: http://10.0.2.2:8000
 * - iOS Simulator:    http://localhost:8000
 * - Physical device:  http://<YOUR_LAN_IP>:8000  (same WiFi)
 *
 * Pick ONE that matches your test environment.
 */
const FALLBACK_BASE_URL =
  Platform.select({
    android: "http://192.168.0.104:8000",
    ios: "http://localhost:8000",
    default: "http://localhost:8000",
  }) ?? "http://localhost:8000";

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function getMetroHost() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.hostname;
  }

  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) return null;

  try {
    return new URL(scriptURL).hostname;
  } catch {
    const match = scriptURL.match(/:\/\/([^/:]+)/);
    return match?.[1] ?? null;
  }
}

function getInferredBaseUrl() {
  const apiPort = process.env.EXPO_PUBLIC_API_PORT || "8000";
  const metroHost = getMetroHost();

  if (metroHost && metroHost !== "localhost" && metroHost !== "127.0.0.1") {
    return `http://${metroHost}:${apiPort}`;
  }

  return FALLBACK_BASE_URL;
}

const BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL || getInferredBaseUrl());

if (__DEV__) {
  // Helps verify what URL is being used on web / emulator / physical device.
  // eslint-disable-next-line no-console
  console.log("[api] BASE_URL =", BASE_URL);
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
