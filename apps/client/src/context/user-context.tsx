import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface User {
  username: string;
  avatarUrl: string;
}

export interface UserContext {
  loggedIn: boolean;
  user?: User;
  login(): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
}

const throws = (message: string) => () => {
  throw new Error(message);
};

const UserContext = createContext<UserContext>({
  loggedIn: false,
  login: throws("Not Instatiated"),
  logout: throws("Not Instatiated"),
  refresh: throws("Not Instatiated"),
});

export function useUserContext() {
  return useContext<UserContext>(UserContext);
}

export function UserContextProvider({
  user: initialUser,
  children,
}: {
  user?: User;
  children?: any;
}) {
  const [user, setUser] = useState(initialUser);

  const refresh = useCallback(async () => {
    // todo: refresh logic
    const {
      data: { user },
    } = await axios.get("/api/auth/me");
    setUser(user);
  }, []);

  const login = useCallback(async () => {
    await new Promise<void>((resolve, reject) => {
      const w = window.open("/api/auth/authorize", "_blank")!;
      if (!w) reject("popup");
      const timeoutId = setTimeout(() => {
        reject("timeout");
        clearInterval(intervalId);
      }, 60000);
      const intervalId = setInterval(() => {
        if (!w.closed) return;
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        resolve();
      }, 200);
    });
    await refresh();
    // todo: login logic
  }, [refresh]);

  const logout = useCallback(async () => {
    // todo: logout logic
    await axios.get("/api/auth/logout");
    await refresh();
  }, [refresh]);

  const context = useMemo(
    () => ({
      user,
      login,
      logout,
      refresh,
      loggedIn: !!user,
    }),
    [user, login, logout, refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
}
