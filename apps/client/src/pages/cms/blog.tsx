import Link from "next/link";
import { DashboardPage } from "src/components/page/page";

export default function CmsBlog() {
  const menuEntries = (
    <div className="flex flex-col gap-5 px-5 py-5 text-lg">
      <Link href="/cms">Dashboard</Link>
      <Link href="/cms/blog">Blog Posts</Link>
      <Link href="/cms/users">Users</Link>
      <Link href="/cms/events">Events</Link>
      <Link href="/cms/messages">Messages</Link>
      <Link href="/cms/audit">Audit Log</Link>
    </div>
  );

  return (
    <DashboardPage menu={menuEntries} menuBottom="hiii">
      Hello World
    </DashboardPage>
  );
}
