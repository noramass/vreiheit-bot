import "src/styles/globals.css";
import type { AppProps } from "next/app";
import { Footer } from "src/components/footer";
import { Navigation } from "src/components/navigation";
import { UserContextProvider } from "src/context/user-context";

export default function App({
  Component,
  pageProps,
  user,
}: AppProps & { user: any }) {
  return (
    <UserContextProvider>
      <Navigation />
      <Component {...pageProps} />
      <Footer />
    </UserContextProvider>
  );
}
