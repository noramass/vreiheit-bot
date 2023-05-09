import { Inter } from "next/font/google";
import { Page } from "src/components/page/page";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <Page>
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}></main>
    </Page>
  );
}
