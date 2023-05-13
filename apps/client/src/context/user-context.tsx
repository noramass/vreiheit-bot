import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { http } from "src/util/client";
import { openWindow } from "src/util/window";

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
    const { data } = await http.get("/auth/me").catch(() => ({ data: {} }));
    setUser(data.user);
  }, []);

  const login = useCallback(async () => {
    await openWindow("/api/auth/authorize");
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await http.get("/auth/logout");
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
    refresh().then();
  }, [refresh]);

  return (
    <UserContext.Provider value={context}>{children}</UserContext.Provider>
  );
}
