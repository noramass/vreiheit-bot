import Link from "next/link";
import { useMemo } from "react";
import { Footer } from "src/components/footer";
import { Navigation } from "src/components/navigation";
import { NavLogin } from "src/components/navigation/login";
import { Sidebar } from "src/components/sidebar";
import Logo from "src/components/icons/logo.svg";

export interface PageProps {
  children?: any;
}

export function Page({ children }: PageProps) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}

export interface DashboardPageProps {
  children?: any;
  menu?: any;
  menuBottom?: any;
}

export function DashboardPage({
  children,
  menu,
  menuBottom,
}: DashboardPageProps) {
  const sidebarContent = useMemo(
    () => (
      <div className="flex flex-col h-full w-full items-start">
        <Link
          href="/"
          className="transition text-green-500 saturate-50 hover:saturate-100">
          <Logo className="h-8  mx-5 my-4" />
        </Link>
        <div className="flex-1 w-full">{menu}</div>
        <div className="gap-2 w-full">
          {menuBottom}
          <div className="w-full px-4 py-2 border-t border-zinc-600 flex flex-row justify-between items-center gap-2">
            <NavLogin />
          </div>
        </div>
      </div>
    ),
    [menu, menuBottom],
  );

  return <Sidebar content={sidebarContent}>{children}</Sidebar>;
}
