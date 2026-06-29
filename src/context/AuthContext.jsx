import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
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

const MPIN_TIMEOUT_MS = 10 * 60 * 1000;

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMpin, setHasMpin] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const refreshIntervalRef = useRef(null);
  const mpinLastVerifiedAt = useRef(0);
  const [showMpinPopup, setShowMpinPopup] = useState(false);
  const [pendingMpinAction, setPendingMpinAction] = useState(null);

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
        const storedUser = localStorage.getItem('authUser');
        if (!storedUser) {
          if (mounted) setLoading(false);
          return;
        }
        const newToken = await refreshToken();
        if (!newToken) {
          localStorage.removeItem('authUser');
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
          phone: storedUser?.phone || null,
          status: storedUser?.status || "pending",
          is_email_verified: storedUser?.is_email_verified || false,
          role_name: storedUser?.role_name || null,
        };
        if (mounted) {
          setCurrentUser(user);
          setHasMpin(!!storedUser?.hasMpin);
          setLoading(false);
        }
      } catch {
        localStorage.removeItem('authUser');
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
      if (Date.now() - lastActivityRef.current >= 10 * 60 * 1000) {
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

  useEffect(() => {
    if (!currentUser || !hasMpin) return;
    const mpinTimer = setInterval(() => {
      if (Date.now() - mpinLastVerifiedAt.current >= MPIN_TIMEOUT_MS) {
        setShowMpinPopup(true);
      }
    }, 60000);
    return () => clearInterval(mpinTimer);
  }, [currentUser, hasMpin]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const json = await loginApi(email, password);
      const { user, accessToken: token, hasMpin: mpin } = json.data;
      setAccessToken(token);
      localStorage.setItem('authUser', JSON.stringify({ ...user, hasMpin: mpin }));
      setCurrentUser(user);
      setHasMpin(!!mpin);
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
      setHasMpin(false);
      clearAccessToken();
      localStorage.removeItem('authUser');
    }
  };

  const resetPassword = async (email) => {
    return forgotPasswordApi(email);
  };

  const requireMpinVerification = useCallback((action) => {
    if (!hasMpin) return true;
    const elapsed = Date.now() - mpinLastVerifiedAt.current;
    if (elapsed < MPIN_TIMEOUT_MS) return true;
    setPendingMpinAction(() => action);
    setShowMpinPopup(true);
    return false;
  }, [hasMpin]);

  const onMpinVerified = useCallback(() => {
    mpinLastVerifiedAt.current = Date.now();
    setShowMpinPopup(false);
    const action = pendingMpinAction;
    setPendingMpinAction(null);
    if (action) action();
  }, [pendingMpinAction]);

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
    hasMpin,
    setHasMpin,
    showMpinPopup,
    setShowMpinPopup,
    mpinLastVerifiedAt,
    requireMpinVerification,
    onMpinVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
