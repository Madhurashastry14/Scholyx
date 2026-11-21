const STORAGE_KEY = "scholyx.auth.tokens";

function getStorage() {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function isTokenPair(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.access === "string" &&
    value.access.length > 0 &&
    typeof value.refresh === "string" &&
    value.refresh.length > 0
  );
}

export function readTokens() {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  let parsed;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    parsed = JSON.parse(raw);
  } catch {
    storage.removeItem(STORAGE_KEY);
    return null;
  }

  if (!isTokenPair(parsed)) {
    storage.removeItem(STORAGE_KEY);
    return null;
  }

  return { access: parsed.access, refresh: parsed.refresh };
}

export function writeTokens(tokens) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (!isTokenPair(tokens)) {
    storage.removeItem(STORAGE_KEY);
    return;
  }

  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({ access: tokens.access, refresh: tokens.refresh }),
  );
}

export function clearTokens() {
  const storage = getStorage();
  storage?.removeItem(STORAGE_KEY);
}

export { STORAGE_KEY };
