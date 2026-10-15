import { SAVE_KEY } from '../config.js';

// Persistent progress lives in localStorage as plain JSON. Systems contribute
// via `serialize()` / `restore(data)` so the save format stays decoupled.
export const Save = {
  read() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (_) { return null; } },
  write(data) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); return true; } catch (_) { return false; } },
  clear() { try { localStorage.removeItem(SAVE_KEY); } catch (_) { /* ignore */ } },
  has() { return !!Save.read(); },
};
