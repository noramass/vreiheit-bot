import { useUserContext } from "src/context/user-context";

export function NavLogin() {
  const { user, login, logout } = useUserContext();

  if (user)
    return (
      <div className="h-8 flex flex-row gap-2 select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
        <div className="flex flex-col items-center">
          <span className="text-sm -mt-0.5">Logged in as {user.username}</span>
          <a
            className="text-sm text-teal-600 -mt-1 cursor-pointer"
            tabIndex={0}
            onClick={logout}>
            Logout
          </a>
        </div>
      </div>
    );
  else
    return (
      <button
        className="block rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
        onClick={login}>
        Login
      </button>
    );
}
