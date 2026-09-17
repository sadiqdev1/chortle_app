import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getUser,
    login as loginRequest,
    logout as logoutRequest,
    register as registerRequest,
} from "../services/authService";

import { storage } from "../lib/storage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);


  // ----------------------------------------------------------
  // Restore authentication state when the app starts.
  // ----------------------------------------------------------

  const restoreSession = useCallback(async () => {
    try {
      const token = await storage.getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      // Immediately unblock the UI with whatever we have locally.
      // The API refresh below happens in the background.
      const storedUser = await storage.getUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Done — render can proceed with the locally-cached user.
      setLoading(false);

      // Silently refresh from the API in the background.
      // A 401 is handled by api.js (clears token); other failures are ignored.
      try {
        const response = await getUser();

        const freshUser =
          response?.user ||
          response?.data ||
          response;

        if (freshUser && typeof freshUser === "object") {
          setUser(freshUser);
          await storage.setUser(freshUser);
        }
      } catch (error) {
        console.warn(
          "Background session refresh failed.",
          error?.message
        );
      }
    } catch (error) {
      console.error(
        "Failed to restore authentication session.",
        error
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------

  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials);

    const token =
      response?.token ||
      response?.access_token ||
      response?.data?.token ||
      response?.data?.access_token;

    const loggedInUser =
      response?.user ||
      response?.data?.user;

    if (!token) {
      throw new Error(
        "Login succeeded but no authentication token was returned."
      );
    }

    await storage.setToken(token);

    if (loggedInUser) {
      await storage.setUser(loggedInUser);
      setUser(loggedInUser);
    } else {
      const freshUserResponse = await getUser();

      const freshUser =
        freshUserResponse?.user ||
        freshUserResponse?.data ||
        freshUserResponse;

      if (freshUser) {
        await storage.setUser(freshUser);
        setUser(freshUser);
      }
    }

    return response;
  }, []);

  // ----------------------------------------------------------
  // Register
  // ----------------------------------------------------------

  const register = useCallback(async (data) => {
    const response = await registerRequest(data);

    const token =
      response?.token ||
      response?.access_token ||
      response?.data?.token ||
      response?.data?.access_token;

    const registeredUser =
      response?.user ||
      response?.data?.user;

    if (token) {
      await storage.setToken(token);
    }

    if (registeredUser) {
      await storage.setUser(registeredUser);
      setUser(registeredUser);
    }

    return response;
  }, []);

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      await storage.clearAuth();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      restoreSession,
    }),
    [
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      restoreSession,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
