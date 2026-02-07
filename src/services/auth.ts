import { api } from "./api";

export type AppUser = {
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

export type ApiLoginResponse = {
  success: boolean;
  message: string;
  user?: AppUser;
};

export async function login(email: string, password: string) {
  const response = await api.post<ApiLoginResponse>("/api/login/", { email, password });
  return response.data;
}
