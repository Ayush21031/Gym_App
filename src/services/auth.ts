// import { api } from "./api";

// export type LoginResponse =
//   | { token: string }
//   | { key: string } // some backends return {key: "..."}
//   | { access: string; refresh?: string }; // JWT style

// export async function login(email: string, password: string) {
//   const res = await api.post<LoginResponse>("/login/", { email, password });
//   console.log("Login response data:", res.data);
//   return res.data;
// }

// export function extractToken(data: LoginResponse): string | null {
//   if ("token" in data && data.token) return data.token;
//   if ("key" in data && data.key) return data.key;
//   if ("access" in data && data.access) return data.access;
//   return null;
// }


import { api } from "./api";

export type ApiLoginResponse = {
  success: boolean;
  message: string;
  user?: {
    user_id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
    height_cm?: number;
    weight_kg?: number;
    created_at?: string;
  };
};

export async function login(email: string, password: string) {
  const res = await api.post<ApiLoginResponse>("/api/login/", { email, password });
  return res.data;
}
