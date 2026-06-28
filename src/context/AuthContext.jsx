import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  loginApi,
  registerApi,
  logoutApi,
  refreshAccessTokenApi,
  forgotPasswordApi,
  setAccessToken,
  getAccessToken,
  clearAccessToken,
} from "../services/authApi";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastActivityRef = useRef(Date.now());
  const refreshIntervalRef = useRef(null);

  const refreshToken = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const json = await refreshAccessTokenApi(controller.signal);
      clearTimeout(timeoutId);
      if (json.data?.accessToken) {
        setAccessToken(json.data.accessToken);
        return json.data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const token = getAccessToken();
      if (!token) {
        const newToken = await refreshToken();
        if (!newToken) {
          if (mounted) setLoading(false);
          return;
        }
      }
      try {
        const tokenData = JSON.parse(atob(getAccessToken().split('.')[1]));
        const storedUser = JSON.parse(localStorage.getItem('authUser') || 'null');
        const user = {
          id: tokenData.sub,
          userType: tokenData.userType,
          roleId: tokenData.roleId,
          name: storedUser?.name || null,
          email: storedUser?.email || null,
          role_name: storedUser?.role_name || null,
        };
        if (mounted) {
          setCurrentUser(user);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    };
    init();
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 10000);
    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    refreshIntervalRef.current = setInterval(async () => {
      try {
        const newToken = await refreshToken();
        if (!newToken) {
          setCurrentUser(null);
          clearAccessToken();
        }
      } catch {
      }
    }, 14 * 60 * 1000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    lastActivityRef.current = Date.now();
    const handleActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    const inactivityInterval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= 60 * 60 * 1000) {
        clearInterval(inactivityInterval);
        localStorage.removeItem("rememberedEmail");
        sessionStorage.clear();
        logout().then(() => {
          window.location.href = "/login?reason=timeout";
        }).catch(() => {
          window.location.href = "/login?reason=timeout";
        });
      }
    }, 10000);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearInterval(inactivityInterval);
    };
  }, [currentUser]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const json = await loginApi(email, password);
      const { user, accessToken: token } = json.data;
      setAccessToken(token);
      setCurrentUser(user);
      setLoading(false);
      return json;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (data) => {
    setError(null);
    return registerApi(data);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
    } finally {
      setCurrentUser(null);
      clearAccessToken();
      localStorage.removeItem('authUser');
    }
  };

  const resetPassword = async (email) => {
    return forgotPasswordApi(email);
  };

  const profile = currentUser ? {
    uid: currentUser.id,
    name: currentUser.name || currentUser.email?.split('@')[0] || "User",
    email: currentUser.email || "",
    role: currentUser.role_name || currentUser.userType || "employee",
    isAdmin: currentUser.userType === 'admin',
    isSuperAdmin: currentUser.role_name === 'super_admin',
    isEmployee: currentUser.userType === 'employee',
  } : null;

  const value = {
    currentUser,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
