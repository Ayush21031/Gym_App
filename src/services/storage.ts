import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppUser, GymOwner } from "./auth";

const USER_KEY = "titanfit_user";
const SESSION_KEY = "titanfit_session";

export type MemberSession = {
  role: "member";
  user: AppUser;
};

export type OwnerSession = {
  role: "gym_owner";
  owner: GymOwner;
};

export type AuthSession = MemberSession | OwnerSession;

export async function saveUser(user: unknown) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser<T = unknown>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function clearUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function saveSession(session: AuthSession) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as AuthSession) : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function clearAuthStorage() {
  await Promise.all([clearUser(), clearSession()]);
}
