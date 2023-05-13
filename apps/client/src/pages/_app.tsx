import "src/styles/globals.css";
import type { AppProps } from "next/app";
import { UserContextProvider } from "src/context/user-context";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserContextProvider>
      <Component {...pageProps} />
    </UserContextProvider>
  );
}
