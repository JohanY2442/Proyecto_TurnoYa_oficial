import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Tokens guardados con SecureStore (Keychain en iOS, Keystore en Android).
 * En web (solo para pruebas) SecureStore no existe y se guardan en memoria.
 */
const ACCESS = 'turnoya.access';
const REFRESH = 'turnoya.refresh';
const esWeb = Platform.OS === 'web';
const memoria = new Map();

const get = (key) => (esWeb ? Promise.resolve(memoria.get(key) ?? null) : SecureStore.getItemAsync(key));
const set = (key, value) => (esWeb ? Promise.resolve(memoria.set(key, value)) : SecureStore.setItemAsync(key, value));
const remove = (key) => (esWeb ? Promise.resolve(memoria.delete(key)) : SecureStore.deleteItemAsync(key));

// Copia en memoria del access token para no leer el almacenamiento en cada request.
let accessCache = null;

export const tokenStorage = {
  getAccessToken: async () => {
    if (accessCache) return accessCache;
    accessCache = await get(ACCESS);
    return accessCache;
  },
  getRefreshToken: () => get(REFRESH),
  save: async ({ accessToken, refreshToken }) => {
    accessCache = accessToken;
    await set(ACCESS, accessToken);
    if (refreshToken) await set(REFRESH, refreshToken);
  },
  clear: async () => {
    accessCache = null;
    await Promise.all([remove(ACCESS), remove(REFRESH)]);
  },
};
