import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'analytics_token';

/**
 * The token lives in the device keystore rather than plain storage: it grants
 * access to visitor records, so it should not survive a stolen backup in clear.
 */
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function loadToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Nothing stored; signing out is still the right outcome.
  }
}
