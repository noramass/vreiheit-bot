export interface SidebarProps {
  children?: any;
  content?: any;
}

export function Sidebar({ content, children }: SidebarProps) {
  return (
    <div className="flex flex-row items-stretch w-full h-screen">
      <aside className="bg-zinc-700 max-w-sm w-screen shadow-lg text-zinc-400">
        {content}
      </aside>
      <main>{children}</main>
    </div>
  );
}
