import { PlatformSidebar } from "@/components/nav/platform-sidebar";
import { buildDashboardNav } from "@/lib/navigation";
import { requireSession } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata = { title: { default: "Dashboard", template: "%s · Divotz" } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const user = await requireSession(headerList.get("x-divotz-path") ?? "/dashboard");

  return (
    <div className="flex min-h-dvh">
      <PlatformSidebar
        sections={buildDashboardNav()}
        user={{ name: user.name, email: user.email }}
      />
      <main className="min-w-0 flex-1 px-5 py-7 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
