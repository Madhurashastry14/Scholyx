import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  fetchProfile,
  loginStudent,
  logoutStudent,
} from "../services/api.js";
import { clearTokens, readTokens } from "../services/authStorage.js";
import { AuthContext } from "./auth.js";

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(() =>
    readTokens() ? "loading" : "anonymous",
  );
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!readTokens()) {
      return undefined;
    }

    const controller = new AbortController();

    const restore = async () => {
      if (!readTokens()) {
        setStatus("anonymous");
        return;
      }

      try {
        const profile = await fetchProfile({ signal: controller.signal });
        if (controller.signal.aborted) {
          return;
        }
        setUser(profile);
        setStatus("authenticated");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (error instanceof ApiError && [401, 403].includes(error.status)) {
          clearTokens();
          setUser(null);
          setStatus("anonymous");
          return;
        }

        // Network trouble or a staff account without a student profile: the
        // tokens are still valid, so keep the session and omit the name.
        setUser(null);
        setStatus("authenticated");
      }
    };

    restore();

    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials) => {
    await loginStudent(credentials);

    let profile = null;
    try {
      profile = await fetchProfile();
    } catch {
      // Keep the session even if the profile call fails after a 200 login.
    }

    setUser(profile);
    setStatus("authenticated");
    setNotice(null);

    return profile;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutStudent();
    } catch {
      // Revoking is best effort; the local session is cleared below.
    } finally {
      clearTokens();
      setUser(null);
      setStatus("anonymous");
      setNotice("You have been logged out.");
    }
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo(
    () => ({ status, user, notice, login, logout, clearNotice }),
    [status, user, notice, login, logout, clearNotice],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
