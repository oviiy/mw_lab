// localStorage can throw (Safari private mode, quota exceeded, disabled storage).
// Every read and write goes through here so a storage failure never takes the game down.

const mem = new Map<string, string>();

export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return mem.get(key) ?? null;
  }
}

export function setItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    mem.set(key, value);
  }
}

export function removeItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    mem.delete(key);
  }
}

export function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setJSON(key: string, value: unknown) {
  setItem(key, JSON.stringify(value));
}
