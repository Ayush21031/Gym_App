import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "titanfit_user";

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
