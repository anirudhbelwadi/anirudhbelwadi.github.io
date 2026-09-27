import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'analytics_token';

/**
 * On a device the token lives in the OS keystore: it grants access to visitor
 * records, so it should not sit in clear text in a phone backup.
 *
 * The browser has no keystore and expo-secure-store has no web implementation,
 * so the web build falls back to localStorage. That is deliberately weaker —
 * the web target exists for quick checks during development, not for shipping,
 * and anything with access to the page can read the token there.
 */
const store =
  Platform.OS === 'web'
    ? {
        async set(key: string, value: string) {
          try {
            window.localStorage.setItem(key, value);
          } catch {
            // Private browsing or storage disabled; the session stays in memory.
          }
        },
        async get(key: string) {
          try {
            return window.localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        async remove(key: string) {
          try {
            window.localStorage.removeItem(key);
          } catch {
            // Nothing stored; signing out is still the right outcome.
          }
        },
      }
    : {
        set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        get: (key: string) => SecureStore.getItemAsync(key),
        remove: (key: string) => SecureStore.deleteItemAsync(key),
      };

export async function saveToken(token: string): Promise<void> {
  await store.set(TOKEN_KEY, token);
}

export async function loadToken(): Promise<string | null> {
  try {
    return await store.get(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await store.remove(TOKEN_KEY);
  } catch {
    // Already gone, or storage unavailable.
  }
}
