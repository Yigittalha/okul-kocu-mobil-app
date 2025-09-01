import React, { createContext, useEffect, useState } from "react";
import {
  getToken,
  getRefreshToken,
  getRole,
  getUser,
  getSchoolCode,
  setRole,
  setUser,
  setSchoolCode,
  setToken,
  setRefreshToken,
} from "../lib/storage";
import { setSessionClearCallback } from "../lib/api";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSessionState] = useState({
    isAuthenticated: false,
    role: null,
    user: null,
    schoolCode: null,
    loading: true,
  });

  const clearSession = async () => {
    await Promise.all([
      setToken(null),
      setRefreshToken(null),
      setRole(null),
      setUser(null),
      setSchoolCode(null), // Okul kodunu da temizle
    ]);
    setSessionState({
      isAuthenticated: false,
      role: null,
      user: null,
      schoolCode: null, // Okul kodunu state'te de null yap
      loading: false,
    });
  };

  useEffect(() => {
    // Register clear session callback with API interceptor
    setSessionClearCallback(clearSession);

    const restore = async () => {
      const [token, role, user, schoolCode] = await Promise.all([
        getToken(),
        getRole(),
        getUser(),
        getSchoolCode(),
      ]);
      if (token && role) {
        setSessionState({
          isAuthenticated: true,
          role,
          user,
          schoolCode,
          loading: false,
        });
      } else {
        setSessionState((prev) => ({
          ...prev,
          schoolCode, // Keep schoolCode even if not authenticated
          loading: false,
        }));
      }
    };
    restore();
  }, []);

  const setSession = async ({
    accessToken,
    refreshToken,
    role,
    user,
    schoolCode,
  }) => {
    if (accessToken) await setToken(accessToken);
    if (refreshToken) await setRefreshToken(refreshToken);
    if (role) await setRole(role);
    if (user) await setUser(user);
    if (schoolCode) await setSchoolCode(schoolCode);

    // Only set isAuthenticated to true if we have access token and role
    if (accessToken && role) {
      setSessionState({
        isAuthenticated: true,
        role,
        user,
        schoolCode,
        loading: false,
      });
    } else {
      // If only schoolCode is being set, don't change authentication state
      setSessionState((prev) => ({ ...prev, schoolCode }));
    }
  };

  const updateSchoolCode = async (schoolCode) => {
    await setSchoolCode(schoolCode);
    setSessionState((prev) => ({ ...prev, schoolCode }));
  };

  return (
    <SessionContext.Provider
      value={{ ...session, setSession, updateSchoolCode, clearSession }}
    >
      {children}
    </SessionContext.Provider>
  );
};
