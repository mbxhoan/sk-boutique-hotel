const STORAGE_KEY = "skbh_no_persist";

export function markSessionNotPersisted(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Storage unavailable (private mode, quota exceeded, etc.)
  }
}

export function markSessionPersisted(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}

// True when the user opted out of persistence AND this is a fresh browser session
// (localStorage survives browser restarts; sessionStorage does not)
export function shouldForceSignOut(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1" && !sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}
