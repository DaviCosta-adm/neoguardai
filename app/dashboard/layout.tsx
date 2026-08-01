import MobileNav from "@/app/components/dashboard/MobileNav";
import Sidebar from "@/app/components/dashboard/Sidebar";
import { requireAuth } from "@/app/lib/auth/dal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAuth();

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar role={auth.user.role} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
          {children}
        </div>
      </div>
      <MobileNav role={auth.user.role} />
    </div>
  );
}
