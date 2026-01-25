// import AsyncStorage from "@react-native-async-storage/async-storage";

// const TOKEN_KEY = "titanfit_token";

// export async function saveToken(token: string) {
//   await AsyncStorage.setItem(TOKEN_KEY, token);
// }

// export async function getToken() {
//   return AsyncStorage.getItem(TOKEN_KEY);
// }

// export async function clearToken() {
//   await AsyncStorage.removeItem(TOKEN_KEY);
// }


import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "titanfit_user";

export async function saveUser(user: any) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser<T = any>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function clearUser() {
  await AsyncStorage.removeItem(USER_KEY);
}
